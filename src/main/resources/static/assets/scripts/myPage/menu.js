import '../common.js';

{
    const menu = document.querySelector('[data-mt-name="menu"]');
    if (menu) {
        const items = menu.querySelectorAll('li.item[data-mt-reference="router"]');
        const contentContainer = document.querySelector('.content-container');
        const sections = contentContainer
            ? Array.from(contentContainer.children).filter(el => el.hasAttribute('data-mt-name'))
            : [];

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

                    // 세션 예약 섹션이면 데이터 로드
                    if (targetName === 'reservation' && window.loadSessionReservation) {
                        window.loadSessionReservation();
                    }
                    // 월별 통계 섹션이면 데이터 로드
                    if (targetName === 'monthly' && window.loadSessionMonthly) {
                        window.loadSessionMonthly();
                    }
                }
            });
        });
    }
}


// import '../common.js';
//
// {
//     const menu = document.querySelector('[data-mt-name="menu"]');
//     if (menu) {
//         const items = menu.querySelectorAll('li.item[data-mt-reference="router"]');
//         const contentContainer = document.querySelector('.content-container');
//         // 최상위 섹션만 관리: .content-container의 직계 자식 중 data-mt-name 속성이 있는 요소
//         const sections = contentContainer
//             ? Array.from(contentContainer.children).filter(el => el.hasAttribute('data-mt-name'))
//             : [];
//
//         // 페이지의 사용자 권한: data-master 속성이 true면 관리자, 그렇지 않으면 일반 회원
//         const isMaster = (document.body.dataset.master || '').toLowerCase() === 'true';
//         const restricted = ['gymInfo', 'userSearch', 'registration'];
//
//         items.forEach(item => {
//             item.addEventListener('click', () => {
//                 const targetName = item.getAttribute('data-mt-name');
//
//                 // member 권한으로 접근 불가한 메뉴 처리
//                 if (!isMaster && restricted.includes(targetName)) {
//                     dialog.showSimpleOk('안내', '해당 메뉴는 접근 권한이 없습니다.');
//                     return;
//                 }
//
//                 // 기존 메뉴의 active 클래스 제거 후 현재 클릭한 메뉴에만 추가
//                 items.forEach(li => li.classList.remove('active'));
//                 item.classList.add('active');
//
//                 // 모든 섹션에서 data-mt-visible 제거
//                 sections.forEach(sec => sec.removeAttribute('data-mt-visible'));
//
//                 // 클릭한 메뉴 이름과 동일한 섹션을 찾아 data-mt-visible 추가
//                 if (targetName) {
//                     const target = sections.find(
//                         sec => sec.getAttribute('data-mt-name') === targetName
//                     );
//                     if (target) {
//                         target.setAttribute('data-mt-visible', '');
//                         // 예약 세션 섹션을 클릭했을 때 최초 로드를 보장
//                         if (targetName === 'reservation' && window.ensureReservationLoaded) {
//                             window.ensureReservationLoaded();
//                         }
//                     }
//                 }
//             });
//         });
//     }
// }


// import '../common.js';
//
// {
//     const $menu = document.querySelector('[data-mt-name="menu"]');
//     if ($menu) {
//         const $items = $menu.querySelectorAll('li.item[data-mt-reference="router"]');
//         const $contentContainer = document.querySelector('.content-container');
//
//         const $sections = $contentContainer
//             ? Array.from($contentContainer.children).filter(el => el.hasAttribute('data-mt-name'))
//             : [];
//
//         const isMaster = (document.body.dataset.master || '').toLowerCase() === 'true';
//         const restricted = ['gymInfo', 'userSearch', 'registration'];
//
//         $items.forEach(item => {
//             item.addEventListener('click', () => {
//                 const targetName = item.getAttribute('data-mt-name');
//
//                 if (!isMaster && restricted.includes(targetName)) {
//                     dialog.showSimpleOk('안내', '해당 메뉴는 접근 권한이 없습니다.');
//                     return;
//                 }
//
//                 $items.forEach(li => li.classList.remove('active'));
//                 item.classList.add('active');
//
//                 $sections.forEach(sec => {
//                     sec.removeAttribute('data-mt-visible');
//                 });
//
//                 if (targetName) {
//                     const target = $sections.find(
//                         sec => sec.getAttribute('data-mt-name') === targetName
//                     );
//                     if (target) {
//                         target.setAttribute('data-mt-visible', '');
//                     }
//                 }
//             });
//         });
//     }
// }
