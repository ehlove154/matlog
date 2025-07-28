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
    }
}
