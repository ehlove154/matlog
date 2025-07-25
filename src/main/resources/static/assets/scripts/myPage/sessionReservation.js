import '../common.js'

{
    const $wrapper = document.querySelector('[data-mt-name="sessionReservation"][data-mt-visible]');
    if ($wrapper) {
        const $listContainer = $wrapper.querySelector('[data-mt-name="listContainer"]');
        const $pageContainer = $wrapper.querySelector('[data-mt-name="pagination"]');

        // 필터 요소들
        const $dateInput = $wrapper.querySelector('input[name="datePiker"]');
        const $tabInputs = Array.from($wrapper.querySelectorAll('input[name="tabs"]'));

        let allReservations = [];     // 서버에서 가져온 전체 예약 목록을 저장
        let currentPage = 1;
        let maxPage = 1;

        function renderSessions(items) {
            $listContainer.innerHTML = '';
            items.forEach(item => {
                const $session = document.createElement('div');
                $session.className = 'session-container';
                $session.setAttribute('data-mt-component', 'column');
                const reservedDate = item.reservedAt ? item.reservedAt.split('T')[0] : '';

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
                    allReservations = data.reservations;
                    currentPage = data.page;
                    maxPage = data.maxPage;
                    applyFilterAndRender();
                    renderPagination(currentPage, maxPage);
                });
        }

        // 날짜 및 탭 필터를 적용하여 렌더링
        function applyFilterAndRender() {
            let filtered = [...allReservations];

            // 1. 날짜 필터: datePiker 입력이 존재할 때 그 날짜에 예약된 세션만 선택
            const selectedDate = $dateInput.value; // 형식: YYYY-MM-DD
            if (selectedDate) {
                filtered = filtered.filter(item => {
                    if (!item.reservedAt) return false;
                    return item.reservedAt.startsWith(selectedDate);
                });
            }

            // 2. 탭 필터: ALL, THISWEEK, NEXTWEEK
            const selectedTab = $tabInputs.find(tab => tab.checked).value;
            if (selectedTab === 'THISWEEK' || selectedTab === 'NEXTWEEK') {
                // 이번주(또는 다음주)의 시작일과 종료일 계산
                const today = new Date();
                // 월요일을 주 시작으로 계산 (일요일=0이므로 1~7 → 1은 월요일)
                const day = today.getDay() || 7;
                const monday = new Date(today);
                monday.setDate(monday.getDate() - (day - 1));
                let startOfWeek;
                if (selectedTab === 'THISWEEK') {
                    startOfWeek = monday;
                } else {
                    startOfWeek = new Date(monday);
                    startOfWeek.setDate(startOfWeek.getDate() + 7);
                }
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);

                filtered = filtered.filter(item => {
                    if (!item.reservedAt) return false;
                    const d = new Date(item.reservedAt.split('T')[0]);
                    return d >= startOfWeek && d <= endOfWeek;
                });
            }
            renderSessions(filtered);
        }

        // 필터 입력 이벤트 등록
        $dateInput.addEventListener('change', () => {
            applyFilterAndRender();
        });
        $tabInputs.forEach(tab => {
            tab.addEventListener('change', () => {
                // 탭을 변경하면 날짜 입력을 초기화할 수도 있음
                applyFilterAndRender();
            });
        });

        load(1);
    }
}