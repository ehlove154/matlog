// TODO 1. 체육관 이름 db에 저장 (수정한다면 수정 된 이름 저장)
//  2. 운영 여부 저장
//  3. 체육관 주소 db에 저장
//  4. 전부 저장 후 다시 불러 왔을 때 저장된 정보 그대로 출력
import {isValidGymName} from "../common.js";

{
    if (document.querySelector('[data-mt-name="gymInfo"][data-mt-visible]')) {
        const $myPageForm = document.getElementById('myPageForm');

        window.$labelMap = Array.from($myPageForm.querySelectorAll('[data-mt-object="label"]')).reduce((map, $label) => {
            map[$label.getAttribute('data-mt-name')] = $label;
            return map;
        }, {});

        window.dialog = new Dialog({
            $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
        });
        window.$loading = document.getElementById('loading');

        // 입력 초기화
        Object.values($labelMap).forEach(($label) => {
            $label.setInvalid(false);
            $label.setValid(false);
        });

        Object.entries($labelMap).forEach(([key, $label]) => {
            const $input = $label.querySelector('[data-mt-component="label.field"]');
            if ($input) {
                $input.addEventListener('input', () => {
                    // 유효성 경고 메시지 제거
                    const $warning = $label.getWarning?.();
                    if ($warning) {
                        $warning.innerText = '';
                        $warning.style.color = ''; // 색 초기화
                    }

                    // 스타일 클래스 제거
                    $label.setInvalid?.(false);
                    $label.setValid?.(false);

                    // 직접 스타일 초기화 (필요한 경우)
                    $input.style.borderColor = '';
                    $input.style.color = '';
                });
            }
        });


        const $addressFindButton = $labelMap['gymAddress'].querySelector('[data-mt-object="button"][name="addressFindButton"]');

        $addressFindButton.addEventListener('click', () => {
            const $addressFindDialog = document.getElementById('addressFindDialog');
            const $modal = $addressFindDialog.querySelector(':scope > .modal');
            $addressFindDialog.onclick = (e) => {
                if (e.target === $addressFindDialog) {
                    $addressFindDialog.hide();
                }
            }
            new daum.Postcode({
                width: '100%',
                height: '100%',
                oncomplete: (data) => {
                    const $postal = document.querySelector('input[name="gymAddressPostal"][data-mt-name="gymAddressPostal"]');
                    const $primary = document.querySelector('input[name="gymAddressPrimary"][data-mt-name="gymAddressPrimary"]');
                    const $secondary = document.querySelector('input[name="gymAddressSecondary"][data-mt-name="gymAddressSecondary"]');

                    console.log('zonecode:', data.zonecode);

                    if ($postal) $postal.value = data.zonecode;
                    if ($primary) $primary.value = data.roadAddress;

                    if ($secondary) {
                        $secondary.focus();
                        $secondary.select();
                    }

                    $myPageForm.querySelector('input[name="gymAddressPostal"]').value = data.zonecode;
                    $myPageForm.querySelector('input[name="gymAddressPrimary"]').value = data.roadAddress;

                    $addressFindDialog.hide();

                    console.log("addressPostal (by form):", $myPageForm.querySelector('input[name="gymAddressPostal"]').value);
                }
            }).embed($modal);
            $addressFindDialog.show();
        })

        $myPageForm.onsubmit = (e) => {
            e.preventDefault();

            const $postal = document.querySelector('input[name="gymAddressPostal"]');
            const $primary = document.querySelector('input[name="gymAddressPrimary"]');
            const $secondary = document.querySelector('input[name="gymAddressSecondary"]');

            if ($postal.value === '') {
                $labelMap['gymAddress'].showInvalid('gymAddress', '주소를 입력해 주세요.');
                return;
            }

            if ($secondary.value === '') {
                $labelMap['gymAddress'].showInvalid('gymAddress', '상세주소를 입력해 주세요.');
                return;
            }

            const $gymNameInput = $myPageForm.querySelector('input[name="gymName"]');
            if (!$gymNameInput || $gymNameInput.value.trim() === '') {
                $labelMap['nameAndActive'].showInvalid('nameAndActive', '체육관 상호명을 입력해 주세요.');
                return;
            }

            if (!isValidGymName($gymNameInput.value.trim())) {
                $labelMap['nameAndActive'].showInvalid('nameAndActive', '올바르지 않은 형식입니다. 30자 이하로 입력해 주세요.');
                return;
            }

            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('gymName', $gymNameInput.value);
            formData.append('isActive', $myPageForm['active'].value);
            formData.append('addressPostal', $myPageForm['gymAddressPostal'].value);
            formData.append('addressPrimary', $myPageForm['gymAddressPrimary'].value);
            formData.append('addressSecondary', $myPageForm['gymAddressSecondary'].value);

            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (xhr.status < 200 || xhr.status >= 300) {
                    dialog.showSimpleOk('회원가입', '요청을 처리하는 도중 오류가 발생하였습니다.\n잠시후 다시 시도해 주세요.');
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                console.log("서버 응답:", response);
                console.log("response.result =", response.result);
                switch (response.result.toLowerCase()) {
                    case 'failure' :
                        dialog.showSimpleOk('체육관 정보', `체육관 정보 등록에 실패하였습니다.\n잠시 후 다시 시도해 주세요.`);
                        break;
                    case 'success' :
                        dialog.showSimpleOk('체육관 정보', '체육관 정보 등록이 완료되었습니다.');
                        break;
                    default:
                        dialog.showSimpleOk('체육관 정보', `알 수 없는 이유로 체육관 정보 등록에 실패하였습니다.\n잠시 후 다시 시도해 주세요.`);
                }
            }
            xhr.open('PATCH', '/user/myPage/gymInfo');
            xhr.send(formData);
            $loading.show();
        }
    }
}