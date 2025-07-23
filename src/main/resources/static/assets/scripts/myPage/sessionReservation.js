import '../common.js'

{
    const $wrapper = document.querySelector('[data-mt-name="sessionReservation"][data-mt-visible]');
    if ($wrapper) {
        const $listContainer = $wrapper.querySelector('[data-mt-name="listContainer"]');
        const $pageContainer = $wrapper.querySelector('[data-mt-name="pagination"]');

        function renderSessions(items) {
            $listContainer.innerHTML = '';
            items.forEach(item => {
                const $session = document.createElement('div');
                $session.className = 'session-container';
                $session.setAttribute('data-mt-component', 'column');
                $session.innerHTML = `
                    <div class="content">
                        <div class="class">${item.className}</div>
                        <div class="date">${item.reservedAt ? item.reservedAt.split('T')[0] : ''}</div>
                        <div class="time">${item.startTime} - ${item.endTime}</div>
                        <div class="coach">코치 : ${item.coach}</div>
                    </div>
                    <div class="button-container" data-mt-component="row">
                        <div data-mt-stretch></div>
                        <button name="cancel" type="button" data-mt-object="button" data-mt-color="red">예약 취소</button>
                    </div>`;
                $listContainer.appendChild($session);
            });
        }

        function renderPagination(page, maxPage) {
            $pageContainer.innerHTML = '';
            const $prev = document.createElement('a');
            $prev.href = '#';
            $prev.className = 'previous';
            $prev.innerHTML = '<img src="/assets/images/previous.png" alt="" class="icon">';
            $pageContainer.appendChild($prev);
            for (let i = 1; i <= maxPage; i++) {
                const $p = document.createElement('a');
                $p.href = '#';
                $p.className = 'page' + (i === page ? ' -selected' : '');
                $p.textContent = String(i);
                $pageContainer.appendChild($p);
            }
            const $next = document.createElement('a');
            $next.href = '#';
            $next.className = 'next';
            $next.innerHTML = '<img src="/assets/images/next.png" alt="" class="icon">';
            $pageContainer.appendChild($next);

            $prev.addEventListener('click', e => { e.preventDefault(); if (page > 1) load(page - 1); });
            $next.addEventListener('click', e => { e.preventDefault(); if (page < maxPage) load(page + 1); });
            $pageContainer.querySelectorAll('a.page').forEach($el => {
                $el.addEventListener('click', e => { e.preventDefault(); load(Number($el.textContent)); });
            });
        }

        function load(p = 1) {
            fetch(`/user/myPage/reservations?page=${p}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (!data || data.result !== 'success') return;
                    renderSessions(data.reservations);
                    renderPagination(data.page, data.maxPage);
                });
        }

        load(1);
    }
}