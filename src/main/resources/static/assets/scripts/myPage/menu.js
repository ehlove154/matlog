import '../common.js';

{
    const menu = document.querySelector('[data-mt-name="menu"]');
    if (menu) {
        const items = menu.querySelectorAll('li.item[data-mt-reference="router"]');
        const contentContainer = document.querySelector('.content-container');
        const sections = contentContainer ? Array.from(contentContainer.children).filter(el => el.hasAttribute('data-mt-name')) : [];
        const isMaster = (document.body.dataset.master || '').toLowerCase() === 'true';
        const restricted = ['gymInfo', 'userSearch', 'registration'];

        items.forEach(item => {
            item.addEventListener('click', () => {
                const targetName = item.getAttribute('data-mt-name');

                if (!isMaster && restricted.includes(targetName)) {
                    dialog.showSimpleOk('안내', '해당 메뉴는 접근 권한이 없습니다.');
                    return;
                }

                items.forEach(li => li.classList.remove('active'));
                item.classList.add('active');

                sections.forEach(sec => sec.removeAttribute('data-mt-visible'));
                const target = sections.find(sec => sec.getAttribute('data-mt-name') === targetName);
                if (target) {
                    target.setAttribute('data-mt-visible', '');

                    // 섹션별 초기화 함수 호출
                    if (targetName === 'sessionReservation' && window.loadSessionReservation) {
                        window.loadSessionReservation();
                    }
                    if (targetName === 'sessionMonthly' && window.loadSessionMonthly) {
                        window.loadSessionMonthly();
                    }
                    if (targetName === 'gymInfo' && window.initGymInfo) {
                        window.initGymInfo();
                    }
                    if (targetName === 'userModify' && window.initUserModify) {
                        window.initUserModify();
                    }
                    if (targetName === 'userSearch' && window.initUserSearch) {
                        window.initUserSearch();
                    }
                    if (targetName === 'sessionRegistration' && window.initSessionRegistration) {
                        window.initSessionRegistration();
                    }
                }
            });
        });

        // 페이지 로드 시 URL 파라미터를 확인하여 회원 조회 섹션을 자동으로 표시합니다.
        function activateUserSearchIfMaster() {
            // 마스터 권한 여부에 따라 동작합니다.
            // 검색어(name) 또는 페이지(page)가 지정된 경우에만 처리합니다.
            const params = new URLSearchParams(window.location.search);
            // 페이지 파라미터가 1이 아닐 때도 userSearch로 이동시킵니다.
            const hasSearch = params.get('name');
            const hasPage = params.get('page') && params.get('page') !== '1';
            // 마스터 권한 여부에 따라 동작합니다.
            if (isMaster) {
                const targetName = 'userSearch';
                // 기존 활성화된 메뉴 클래스를 모두 제거하고
                items.forEach(li => li.classList.remove('active'));
                // userSearch 메뉴 항목을 찾아 active 클래스를 추가합니다.
                const targetMenuItem = menu.querySelector(`li.item[data-mt-name="${targetName}"]`);
                if (targetMenuItem) {
                    targetMenuItem.classList.add('active');
                }
                // 모든 섹션을 숨기고 userSearch 섹션만 보이게 합니다.
                sections.forEach(sec => sec.removeAttribute('data-mt-visible'));
                const targetSection = sections.find(sec => sec.getAttribute('data-mt-name') === targetName);
                if (targetSection) {
                    targetSection.setAttribute('data-mt-visible', '');
                }
                // 회원 조회 초기화 함수를 호출합니다.
                if (window.initUserSearch) {
                    window.initUserSearch();
                }
            }
        }
        document.addEventListener('DOMContentLoaded', activateUserSearchIfMaster);
        if (document.readyState !== 'loading') {
            activateUserSearchIfMaster();
        }
    }
}


// import '../common.js';
//
// {
//     const menu = document.querySelector('[data-mt-name="menu"]');
//     if (menu) {
//         const items = menu.querySelectorAll('li.item[data-mt-reference="router"]');
//         const contentContainer = document.querySelector('.content-container');
//         const sections = contentContainer ? Array.from(contentContainer.children).filter(el => el.hasAttribute('data-mt-name')) : [];
//         const isMaster = (document.body.dataset.master || '').toLowerCase() === 'true';
//         const restricted = ['gymInfo', 'userSearch', 'registration'];
//
//         items.forEach(item => {
//             item.addEventListener('click', () => {
//                 const targetName = item.getAttribute('data-mt-name');
//
//                 if (!isMaster && restricted.includes(targetName)) {
//                     dialog.showSimpleOk('안내', '해당 메뉴는 접근 권한이 없습니다.');
//                     return;
//                 }
//
//                 items.forEach(li => li.classList.remove('active'));
//                 item.classList.add('active');
//
//                 sections.forEach(sec => sec.removeAttribute('data-mt-visible'));
//                 const target = sections.find(sec => sec.getAttribute('data-mt-name') === targetName);
//                 if (target) {
//                     target.setAttribute('data-mt-visible', '');
//
//                     // 섹션별 초기화 함수 호출
//                     if (targetName === 'sessionReservation' && window.loadSessionReservation) {
//                         window.loadSessionReservation();
//                     }
//                     if (targetName === 'sessionMonthly' && window.loadSessionMonthly) {
//                         window.loadSessionMonthly();
//                     }
//                     if (targetName === 'gymInfo' && window.initGymInfo) {
//                         window.initGymInfo();
//                     }
//                     if (targetName === 'userModify' && window.initUserModify) {
//                         window.initUserModify();
//                     }
//                     if (targetName === 'userSearch' && window.initUserSearch) {
//                         window.initUserSearch();
//                     }
//                     if (targetName === 'sessionRegistration' && window.initSessionRegistration) {
//                         window.initSessionRegistration();
//                     }
//                 }
//             });
//         });
//     }
// }
