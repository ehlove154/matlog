import '../common.js';

{
    // 메뉴 컨테이너를 찾습니다.
    const $menu = document.querySelector('[data-mt-name="menu"]');
    if ($menu) {
        // 모든 메뉴 항목(li.item[data-mt-reference="router"])을 수집합니다.
        const $items = $menu.querySelectorAll('li.item[data-mt-reference="router"]');

        $items.forEach(item => {
            item.addEventListener('click', () => {
                // 1. 기존에 활성화된 메뉴에서 active 클래스 제거
                $items.forEach(li => li.classList.remove('active'));
                // 클릭한 메뉴 항목에 active 클래스 추가
                item.classList.add('active');

                // 2. 모든 콘텐츠 영역에서 data-mt-visible 속성 제거
                const contentWrapper = document.querySelector('[data-mt-reference="content"]');
                if (contentWrapper) {
                    contentWrapper.querySelectorAll('[data-mt-visible]').forEach(el => {
                        el.removeAttribute('data-mt-visible');
                    });
                }

                // 클릭한 메뉴의 data-mt-name을 통해 대상 콘텐츠 선택
                const targetName = item.getAttribute('data-mt-name');
                if (targetName && contentWrapper) {
                    const targetEl = contentWrapper.querySelector(`[data-mt-name="${targetName}"]`);
                    // 해당 콘텐츠에 data-mt-visible 속성 부여
                    if (targetEl) {
                        targetEl.setAttribute('data-mt-visible', '');
                    }
                }
            });
        });
    }
}
