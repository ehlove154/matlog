import '../common.js';

{
    const $menu = document.querySelector('[data-mt-name="menu"]');
    if ($menu) {
        const $items = $menu.querySelectorAll('li.item[data-mt-reference="router"]');

        const $contentContainer = document.querySelector('.content-container');
        const $sections = $contentContainer
            ? $contentContainer.querySelectorAll('[data-mt-name]')
            : [];

        $items.forEach(item => {
            item.addEventListener('click', () => {
                $items.forEach(li => li.classList.remove('active'));
                item.classList.add('active');

                $sections.forEach(sec => {
                    sec.removeAttribute('data-mt-visible');
                });

                const targetName = item.getAttribute('data-mt-name');
                if (targetName) {
                    const target = Array.from($sections).find(
                        sec => sec.getAttribute('data-mt-name') === targetName
                    );
                    if (target) {
                        target.setAttribute('data-mt-visible', '');
                    }
                }
            });
        });
    }
}