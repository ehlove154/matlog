import '../common.js';
import { isValidGymName } from "../common.js";

function initGymInfo() {
    const $myPageForm = document.getElementById('myPageForm');
    // 다른 섹션에서 설정한 폼 제출 핸들러 초기화
    $myPageForm.onsubmit = null;

    // Dialog와 loading 요소 초기화
    window.dialog = new Dialog({
        $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
    });
    window.$loading = document.getElementById('loading');

    // 각 필드에 대한 유효성 제거
    window.$labelMap = Array.from($myPageForm.querySelectorAll('[data-mt-object="label"]')).reduce((map, $label) => {
        map[$label.getAttribute('data-mt-name')] = $label;
        return map;
    }, {});
    Object.values($labelMap).forEach(($label) => {
        $label.setInvalid(false);
        $label.setValid(false);
    });

    // 주소 찾기 버튼 로직은 그대로 유지 (필요 시 별도 함수로 분리)
    const $addressFindButton = $labelMap['gymAddress'].querySelector('[data-mt-object="button"][name="addressFindButton"]');
    $addressFindButton.addEventListener('click', () => {
        const $addressFindDialog = document.getElementById('addressFindDialog');
        const $modal = $addressFindDialog.querySelector(':scope > .modal');
        $addressFindDialog.onclick = (e) => {
            if (e.target === $addressFindDialog) {
                $addressFindDialog.hide();
            }
        };
        new daum.Postcode({
            width: '100%',
            height: '100%',
            oncomplete: (data) => {
                const $postal   = document.querySelector('input[name="gymAddressPostal"][data-mt-name="gymAddressPostal"]');
                const $primary  = document.querySelector('input[name="gymAddressPrimary"][data-mt-name="gymAddressPrimary"]');
                const $secondary= document.querySelector('input[name="gymAddressSecondary"][data-mt-name="gymAddressSecondary"]');

                if ($postal)   $postal.value   = data.zonecode;
                if ($primary)  $primary.value  = data.roadAddress;
                if ($secondary){
                    $secondary.focus();
                    $secondary.select();
                }

                $myPageForm.querySelector('input[name="gymAddressPostal"]').value  = data.zonecode;
                $myPageForm.querySelector('input[name="gymAddressPrimary"]').value = data.roadAddress;
                $addressFindDialog.hide();
            }
        }).embed($modal);
        $addressFindDialog.show();
    });

    // 멤버십 관리 초기화
    const $membershipContainer = $myPageForm.querySelector('.membership-container');
    const $addMembershipBtn = $membershipContainer?.querySelector('.button-container button[data-mt-color="simple"]');
    const $priceTemplate = $membershipContainer?.querySelector('.price-wrapper');

    function attachDelete($wrapper) {
        const $btn = $wrapper.querySelector('.delete-price');
        if ($btn) {
            $btn.addEventListener('click', () => {
                dialog.show({
                    title: '회원권 삭제',
                    content: '정말로 삭제하시겠습니까?',
                    buttons: [
                        { caption: '아니요', onClickCallback: ($m) => dialog.hide($m) },
                        {
                            caption: '네',
                            color: 'green',
                            onClickCallback: ($m) => {
                                dialog.hide($m);
                                $wrapper.remove();
                            }
                        }
                    ]
                });
            });
        }
    }

    if ($membershipContainer && $priceTemplate) {
        $membershipContainer.querySelectorAll('.price-wrapper').forEach(($el, idx) => {
            if (idx > 0) $el.remove();
        });
        attachDelete($priceTemplate);

        fetch('/memberships')
            .then(res => res.ok ? res.json() : [])
            .then(list => {
                if (!Array.isArray(list)) return;
                let first = true;
                list.forEach(m => {
                    if (m.membershipCode && m.membershipCode.toUpperCase() === 'NONE') return;
                    let $wrapper = first ? $priceTemplate : $priceTemplate.cloneNode(true);
                    const $name = $wrapper.querySelector('input[name="membershipName"]');
                    const $price = $wrapper.querySelector('input[name="coach"]');
                    if ($name) $name.value = m.displayText ?? '';
                    if ($price) $price.value = m.price ?? '';
                    if (!first && $addMembershipBtn) {
                        attachDelete($wrapper);
                        $addMembershipBtn.parentElement.before($wrapper);
                    }
                    first = false;
                });
            });

        $addMembershipBtn?.addEventListener('click', () => {
            const $clone = $priceTemplate.cloneNode(true);
            $clone.querySelectorAll('input').forEach($input => $input.value = '');
            attachDelete($clone);
            $addMembershipBtn.parentElement.before($clone);
        });
    }

    // 저장 버튼 클릭 핸들러
    const $saveButton = document.querySelector('[data-mt-name="gymInfoSave"][data-mt-object="button"]');
    $saveButton.addEventListener('click', (e) => {
        e.preventDefault();

        const $postal   = $myPageForm.querySelector('input[name="gymAddressPostal"]');
        const $primary  = $myPageForm.querySelector('input[name="gymAddressPrimary"]');
        const $secondary= $myPageForm.querySelector('input[name="gymAddressSecondary"]');
        const $gymName  = $myPageForm.querySelector('input[name="gymName"]');
        const activeVal = $myPageForm['active'].value;

        // 기본 유효성 검사
        if ($postal.value.trim() === '') {
            $labelMap['gymAddress'].showInvalid('gymAddress', '주소를 입력해 주세요.');
            return;
        }
        if ($secondary.value.trim() === '') {
            $labelMap['gymAddress'].showInvalid('gymAddress', '상세주소를 입력해 주세요.');
            return;
        }
        if (!$gymName || $gymName.value.trim() === '') {
            $labelMap['nameAndActive'].showInvalid('nameAndActive', '체육관 상호명을 입력해 주세요.');
            return;
        }
        if (!isValidGymName($gymName.value.trim())) {
            $labelMap['nameAndActive'].showInvalid('nameAndActive', '올바르지 않은 형식입니다. 30자 이하로 입력해 주세요.');
            return;
        }

        // 서버로 보낼 데이터 구성
        const formData = new FormData();
        formData.append('gymName', $gymName.value.trim());
        formData.append('isActive', activeVal);
        formData.append('addressPostal', $postal.value.trim());
        formData.append('addressPrimary', $primary.value.trim());
        formData.append('addressSecondary', $secondary.value.trim());

        if ($membershipContainer) {
            const memberships = [];
            $membershipContainer.querySelectorAll('.price-wrapper').forEach($el => {
                const name = $el.querySelector('input[name="membershipName"]')?.value.trim();
                const price = $el.querySelector('input[name="coach"]')?.value.trim();
                if (name && price) {
                    memberships.push({name, price});
                }
            });
            formData.append('memberships', JSON.stringify(memberships));
        }

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('체육관 정보', '요청을 처리하는 도중 오류가 발생하였습니다.\n잠시 후 다시 시도해 주세요.');
                return;
            }
            // 결과 파싱
            const response = JSON.parse(xhr.responseText);
            const result = (response.result || '').toLowerCase();
            if (result === 'success') {
                dialog.showSimpleOk('체육관 정보', '체육관 정보 등록이 완료되었습니다.');
            } else {
                dialog.showSimpleOk('체육관 정보', '체육관 정보 등록에 실패하였습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('PATCH', '/user/myPage/memberships');
        xhr.send(formData);
        $loading.show();
    });
}

// 전역 초기화 함수로 내보내기
window.initGymInfo = initGymInfo;
