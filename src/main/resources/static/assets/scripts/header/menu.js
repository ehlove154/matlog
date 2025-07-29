import '../common.js';
{
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('headerMenu');
    if (toggle && menu) {
        menu.querySelectorAll('a').forEach(el =>
            el.addEventListener('click', () => toggle.checked = false));
    }
}