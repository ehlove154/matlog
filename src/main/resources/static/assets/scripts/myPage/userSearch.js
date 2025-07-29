// TODO 1. 회원리스트 띄우기 --- 완료
//  2. 벨트, 승급일 수정 가능하게 --- 완료
//  3. 회원정보 삭제 시 db에는 남아있지만 화면에는 미출력 --- 완료
//  4. 회원권 만료 기간에 따른 버튼 색 변화 (회원권 1주일 남을 시 만료 임박) --- 완료
//  5. 한페이지 당 최대 10명
//  6. 회원 이름으로 검색

function initUserSearch() {
    const userSearch = document.querySelector('[data-mt-name="userSearch"]');
    if (!userSearch) {
        return;
    }
    // 이미 초기화된 경우 다시 초기화하지 않음
    if (window.userSearchInitialized) {
        return;
    }
    window.userSearchInitialized = true;

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

    document.querySelectorAll('.userList .table tbody tr:not(.info)').forEach(($row) => {
        $row.addEventListener('click', () => {
            const $infoRow = $row.nextElementSibling;
            if (!$infoRow || !$infoRow.classList.contains('info')) return;

            // 열려있으면 접기
            if ($infoRow.hasAttribute('data-mt-visible')) {
                $infoRow.removeAttribute('data-mt-visible');
                return;
            }

            // 모든 다른 info 접기
            document.querySelectorAll('.userList .info[data-mt-visible]').forEach($el => {
                $el.removeAttribute('data-mt-visible');
            });

            // 열기
            $infoRow.setAttribute('data-mt-visible', '');

            const data = $row.dataset;

            // 텍스트 설정용 매핑
            const textMap = {
                email: 'email',
                name: 'name',
                contact: 'contact',
                address: 'address',
                membershipname: 'membershipName',
                createdat: 'createdAt',
                expire: 'expire',
                promotion: 'promotion',
                'attend-month': 'attend-month',
                'attend-total': 'attend-total',
                'attend-recent': 'attend-recent'
            };

            for (const [key, mtName] of Object.entries(textMap)) {
                const $target = $infoRow.querySelector(`.description[data-mt-name="${mtName}"]`);
                if ($target) $target.innerText = data[key] ?? '';
            }

            // 벨트 디버깅
            const $belt = $infoRow.querySelector('select[data-mt-name="belt"]');
            if ($belt) {
                $belt.value = data.belt ?? '-1';
            }

            // 스트라이프 디버깅
            const $stripe = $infoRow.querySelector('select[data-mt-name="stripe"]');
            if ($stripe) {
                $stripe.value = data.stripe ?? '-1';
            }

            // 승급일 date input 설정
            const $promotion = $infoRow.querySelector('input[data-mt-name="promotion"]');
            if ($promotion) $promotion.value = data.promotion ?? '';

            // 회원 상태 버튼 처리
            const $status = $infoRow.querySelector('[data-mt-name="status"]');
            if ($status) {
                const status = data.status ?? '';
                $status.innerText = status;

                let color = 'gray';
                if (status === '수강 중') color = 'green';
                else if (status === '만료임박') color = 'red';

                $status.setAttribute('data-mt-color', color);
            }
        });
    });

    const $modifyButtons = document.querySelectorAll('[data-mt-name="userInfoModify"]');

    $modifyButtons.forEach(($btn) => {
        $btn.addEventListener('click', (e) => {
            e.preventDefault();

            // 버튼이 있는 <tr class="info"> 기준으로
            // const $infoRow = e.target.closest('tr');
            // if (!$infoRow) return;
            //
            // // 상단의 요약 정보 tr (data-* 속성 보유)
            // const $buttonRow = $infoRow.previousElementSibling;
            // if (!$buttonRow) return;
            //
            // const email = $buttonRow.dataset.email?.trim();
            // const index = $buttonRow.dataset.index;
            // if (!email || index === undefined) {
            //     dialog.showSimpleOk('회원 정보 수정', '이메일 또는 인덱스 정보가 없습니다.');
            //     return;
            // }

            const $infoRow = e.target.closest('tr.info');
            if (!$infoRow) return;

            // info 행의 data-index를 이용해 상단 요약 행을 찾음
            const index = $infoRow.dataset.index;
            const $buttonRow = document.querySelector(`.userList tr[data-index="${index}"]:not(.info)`);
            if (!$buttonRow) {
                dialog.showSimpleOk('회원 정보 수정', '상단 회원 정보 행을 찾을 수 없습니다.');
                return;
            }

            const email = $buttonRow.dataset.email?.trim();
            if (!email) {
                dialog.showSimpleOk('회원 정보 수정', '이메일 정보가 없습니다.');
                return;
            }

            // infoRow 내부의 수정 가능한 필드
            const $belt = $infoRow.querySelector('[data-mt-name="belt"]');
            const $stripe = $infoRow.querySelector('[data-mt-name="stripe"]');
            const $promotion = $infoRow.querySelector('[data-mt-name="promotion"]');

            const belt = $belt?.value?.trim();
            const stripe = $stripe?.value?.trim();
            const promotion = $promotion?.value?.trim();

            // 콘솔 디버깅
            console.log('email:', email);
            console.log('belt:', belt);
            console.log('stripe:', stripe);
            console.log('promotion:', promotion);

            // 유효성 검사
            if (!belt || stripe === '' || !promotion) {
                dialog.showSimpleOk('회원 정보 수정', '모든 필드를 입력해주세요.');
                return;
            }

            // 요청 전송
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('target', email);
            formData.append('belt', belt);
            formData.append('stripe', stripe);
            formData.append('promotion', promotion);

            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) return;

                if (xhr.status < 200 || xhr.status >= 300) {
                    dialog.showSimpleOk('회원 정보 수정', '요청 처리 중 오류 발생. 잠시 후 시도해 주세요.');
                    return;
                }

                const response = JSON.parse(xhr.responseText);
                switch (response.result) {
                    case 'success':
                        dialog.showSimpleOk('회원 정보 수정', '회원 정보 수정이 완료되었습니다.');
                        break;
                    case 'failure':
                        dialog.showSimpleOk('회원 정보 수정', '회원 정보 수정에 실패하였습니다.');
                        break;
                    default:
                        dialog.showSimpleOk('회원 정보 수정', '알 수 없는 이유로 실패하였습니다.');
                }
            };

            xhr.open('PATCH', '/user/myPage/userSearch/modify');
            xhr.send(formData);
        });
    });

    // 삭제 버튼 이벤트
    const $userList = document.querySelector('.userList');

    $userList.addEventListener('click', (e) => {
        const $btn = e.target.closest('[data-mt-name="userInfoDelete"]');
        if (!$btn) return;

        const $infoRow = $btn.closest('tr.info');
        if (!$infoRow) return;

        const index = $infoRow.dataset.index;
        const $mainRow = document.querySelector(`.userList tr[data-index="${index}"]:not(.info)`);

        if (!$mainRow) return;

        // 확인창
        dialog.show({
            title: '회원 정보 삭제',
            content: '정말로 회원 정보를 삭제하시겠습니까?',
            buttons: [
                {caption: '아니요', onClickCallback: ($modal) => dialog.hide($modal)},
                {
                    caption: '네',
                    color: 'green',
                    onClickCallback: ($modal) => {
                        dialog.hide($modal);

                        const $infoRow = e.target.closest('tr');
                        const $buttonRow = $infoRow.previousElementSibling;
                        const email = $buttonRow.dataset.email?.trim();

                        const xhr = new XMLHttpRequest();
                        const formData = new FormData();
                        formData.append('target', email); // ✅ 삭제할 유저의 email 필요

                        xhr.onreadystatechange = () => {
                            if (xhr.readyState !== XMLHttpRequest.DONE) return;

                            if (xhr.status >= 200 && xhr.status < 300) {
                                const response = JSON.parse(xhr.responseText);
                                if (response.result === 'success') {
                                    $infoRow.remove();
                                    $mainRow.remove();
                                    dialog.showSimpleOk('회원 정보 삭제', '회원 정보가 삭제되었습니다.');
                                } else {
                                    dialog.showSimpleOk('회원 정보 삭제', '삭제에 실패했습니다.');
                                }
                            } else {
                                dialog.showSimpleOk('회원 정보 삭제', '서버 오류로 삭제에 실패했습니다.');
                            }
                        };

                        xhr.open('DELETE', '/user/myPage/userSearch/delete');
                        xhr.send(formData);
                    }
                }
            ]
        });
    });

    const $pageContainer = document.querySelector('.page-container');
    if ($pageContainer) {
        $pageContainer.addEventListener('click', (e) => {
            const $page = e.target.closest('a.page');
            if ($page) {
                e.preventDefault();
                const page = $page.getAttribute('data-page');
                if (page) {
                    const nameInput = document.querySelector('input[name="name"]');
                    const params = new URLSearchParams();
                    if (nameInput && nameInput.value.trim()) {
                        params.set('name', nameInput.value.trim());
                    }
                    params.set('page', page);
                    window.location.search = `?${params.toString()}`;
                }
            }
        });
    }
    const $searchContainer = document.querySelector('[data-mt-name="search-container"]');
    if ($searchContainer) {
        const $input = $searchContainer.querySelector('input[name="name"]');
        const $button = $searchContainer.querySelector('button');
        const doSearch = () => {
            const keyword = $input ? $input.value.trim() : '';
            const params = new URLSearchParams();
            if (keyword) params.set('name', keyword);
            window.location.href = `/user/myPage?${params.toString()}`;
        };
        $button?.addEventListener('click', (e) => {
            e.preventDefault();
            doSearch();
        });
        $input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                doSearch();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initUserSearch();
});

window.initUserSearch = initUserSearch;