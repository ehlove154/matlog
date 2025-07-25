import '../common.js'

{
    const $wrapper = document.querySelector('[data-mt-name="sessionReservation"]');
    if ($wrapper) {
        const $listContainer = $wrapper.querySelector('[data-mt-name="listContainer"]');
        const $pageContainer = $wrapper.querySelector('[data-mt-name="pagination"]');

        // 필터 요소들
        const $dateInput = $wrapper.querySelector('input[name="datePiker"]');
        const $tabInputs = Array.from($wrapper.querySelectorAll('input[name="tabs"]'));

        let allReservations = [];     // 서버에서 가져온 전체 예약 목록을 저장
        let currentPage = 1;
        let maxPage = 1;

        /**
         * 세션 상태를 계산한다.
         * reservedAt의 날짜 + startTime, endTime을 조합해 세션 진행 여부를 판단한다.
         * startTime/endTime 또는 reservedAt이 없으면 기본적으로 취소 가능 상태로 둔다.
         */
        function getStatus(item) {
            if (!item.startTime || !item.endTime || !item.reservedAt) {
                return { name: 'cancel', text: '예약 취소', color: 'red' };
            }
            const dateStr = item.reservedAt.split('T')[0];
            const startDateTime = new Date(`${dateStr}T${item.startTime}`);
            const endDateTime = new Date(`${dateStr}T${item.endTime}`);
            const now = new Date();

            if (now >= endDateTime) {
                return { name: 'done', text: '수강완료', color: 'simple' };
            } else if (now >= startDateTime) {
                return { name: 'pending', text: '수강중', color: 'green' };
            }
            return { name: 'cancel', text: '예약 취소', color: 'red' };
        }

        /**
         * 예약 취소 요청을 서버에 전송한다.
         * 성공 시 allReservations에서 제거하고 화면을 갱신한다.
         */
        function cancelReservation(reservationId, $session) {
            fetch('/book/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ reservationId }).toString()
            })
                .then(res => (res.ok ? res.json() : null))
                .then(data => {
                    if (data && data.result === 'success') {
                        allReservations = allReservations.filter(r => r.reservationId !== reservationId);
                        $session.remove();
                        applyFilterAndRender();
                    } else {
                        dialog.showSimpleOk('예약', '예약 취소에 실패했습니다.');
                    }
                })
                .catch(() => {
                    dialog.showSimpleOk('예약', '요청 처리 중 오류가 발생했습니다.');
                });
        }

        /**
         * 세션 목록을 렌더링한다.
         * 상태에 따라 버튼의 이름(name), 색상(data-mt-color), 텍스트를 지정한다.
         * 취소 가능한 경우에만 클릭 이벤트를 바인딩한다.
         */
        function renderSessions(items) {
            $listContainer.innerHTML = '';
            items.forEach(item => {
                const $session = document.createElement('div');
                $session.className = 'session-container';
                $session.setAttribute('data-mt-component', 'column');
                const reservedDate = item.reservedAt ? item.reservedAt.split('T')[0] : '';
                const status = getStatus(item);

                $session.innerHTML = `
                    <div class="content">
                        <div class="class">${item.className}</div>
                        <div class="date">${reservedDate}</div>
                        <div class="time">${item.startTime} - ${item.endTime}</div>
                        <div class="coach">코치 : ${item.coach}</div>
                    </div>
                    <div class="button-container" data-mt-component="row">
                        <div data-mt-stretch></div>
                        <button type="button" name="${status.name}"
                    data-mt-object="button"
                    data-mt-color="${status.color}">
              ${status.text}
            </button>
                    </div>`;
                $listContainer.appendChild($session);

                // 예약 취소 버튼은 'cancel' 상태일 때만 동작
                const $button = $session.querySelector('button[name="cancel"]');
                if ($button) {
                    $button.addEventListener('click', () => {
                        cancelReservation(item.reservationId, $session);
                    });
                }
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
            const selectedDate = $dateInput ? $dateInput.value : '';
            if (selectedDate) {
                filtered = filtered.filter(item => {
                    if (!item.reservedAt) return false;
                    return item.reservedAt.startsWith(selectedDate);
                });
            }

            // 2. 탭 필터: ALL, THISWEEK, NEXTWEEK
            const checkedTab = $tabInputs.find(tab => tab.checked);
            const selectedTab = checkedTab ? checkedTab.value : 'ALL';
            if (selectedTab === 'THISWEEK' || selectedTab === 'NEXTWEEK') {
                const today = new Date();
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
        if ($dateInput) {
            $dateInput.addEventListener('change', () => {
                applyFilterAndRender();
            });
        }
        if ($tabInputs && $tabInputs.length > 0) {
            $tabInputs.forEach(tab => {
                tab.addEventListener('change', () => {
                    // 탭을 변경하면 날짜 입력을 초기화할 수도 있음
                    applyFilterAndRender();
                });
            });
        }

        load(1);
    }
}