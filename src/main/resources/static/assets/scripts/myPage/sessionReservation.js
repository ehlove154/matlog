import '../common.js';

{
    // 필터 요소는 페이지 내에서 유일하므로 초기화 시에만 선택합니다.
    const $dateInput = document.querySelector('[data-mt-name="sessionReservation"] input[name="datePiker"]');
    const $tabInputs = Array.from(document.querySelectorAll('[data-mt-name="sessionReservation"] input[name="tabs"]'));

    // 서버에서 받아온 예약 목록과 페이지 정보
    let allReservations = [];
    let currentPage = 1;
    let maxPage = 1;

    /**
     * sessionReservation 섹션이 표시되고 있을 때 해당 섹션의 루트 요소를 반환합니다.
     */
    function getWrapper() {
        return document.querySelector('[data-mt-name="sessionReservation"][data-mt-visible]');
    }

    /**
     * 현재 표시된 sessionReservation 섹션의 목록 컨테이너를 반환합니다.
     * 섹션이 표시되지 않았거나 컨테이너가 존재하지 않으면 null을 반환합니다.
     */
    function getListContainer() {
        const wrapper = getWrapper();
        return wrapper ? wrapper.querySelector('[data-mt-name="listContainer"]') : null;
    }

    /**
     * 현재 표시된 sessionReservation 섹션의 페이지네이션 컨테이너를 반환합니다.
     */
    function getPageContainer() {
        const wrapper = getWrapper();
        return wrapper ? wrapper.querySelector('[data-mt-name="pagination"]') : null;
    }

    /**
     * 세션 상태를 계산하여 버튼의 name, 표시 텍스트, 색상(data-mt-color)을 결정합니다.
     */
    function getStatus(item) {
        if (!item.startTime || !item.endTime || !item.reservedAt) {
            return { name: 'cancel', text: '예약 취소', color: 'red' };
        }
        const dateStr = item.reservedAt.split('T')[0];
        const start = new Date(`${dateStr}T${item.startTime}`);
        const end = new Date(`${dateStr}T${item.endTime}`);
        const now = new Date();
        if (now >= end) {
            return { name: 'done', text: '수강완료', color: 'simple' };
        } else if (now >= start) {
            return { name: 'pending', text: '수강중', color: 'green' };
        }
        return { name: 'cancel', text: '예약 취소', color: 'red' };
    }

    /**
     * 예약 취소 요청을 서버에 전송하고 성공 시 목록에서 제거합니다.
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
                    $session?.remove();
                    applyFilterAndRender();
                    if (window.loadSessionMonthly) window.loadSessionMonthly();
                } else {
                    dialog.showSimpleOk('예약', '예약 취소에 실패했습니다.');
                }
            })
            .catch(() => {
                dialog.showSimpleOk('예약', '요청 처리 중 오류가 발생했습니다.');
            });
    }

    /**
     * 세션 목록을 렌더링합니다. 현재 표시 중인 섹션이 없으면 아무 것도 하지 않습니다.
     */
    function renderSessions(items) {
        const listContainer = getListContainer();
        if (!listContainer) return;
        listContainer.innerHTML = '';
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
            <span role="none" data-mt-stretch></span>
            <button type="button" name="${status.name}" data-mt-object="button" data-mt-color="${status.color}">${status.text}</button>
        </div>
      `;
            listContainer.appendChild($session);

            // 취소 버튼이 있는 경우에만 이벤트 등록
            const $button = $session.querySelector('button[name="cancel"]');
            if ($button) {
                $button.addEventListener('click', () => {
                    cancelReservation(item.reservationId, $session);
                });
            }
        });
    }

    /**
     * 페이지네이션을 렌더링합니다. 섹션이 표시되지 않았으면 동작하지 않습니다.
     */
    function renderPagination(page, max) {
        const pageContainer = getPageContainer();
        if (!pageContainer) return;
        pageContainer.innerHTML = '';
        const $prev = document.createElement('a');
        $prev.href = '#';
        $prev.className = 'previous';
        $prev.innerHTML = ' ';
        pageContainer.appendChild($prev);
        for (let i = 1; i <= max; i++) {
            const $p = document.createElement('a');
            $p.href = '#';
            $p.className = 'page' + (i === page ? ' -selected' : '');
            $p.textContent = String(i);
            pageContainer.appendChild($p);
        }
        const $next = document.createElement('a');
        $next.href = '#';
        $next.className = 'next';
        $next.innerHTML = ' ';
        pageContainer.appendChild($next);

        $prev.addEventListener('click', e => { e.preventDefault(); if (page > 1) load(page - 1); });
        $next.addEventListener('click', e => { e.preventDefault(); if (page < max) load(page + 1); });
        pageContainer.querySelectorAll('a.page').forEach($el => {
            $el.addEventListener('click', e => {
                e.preventDefault();
                load(Number($el.textContent));
            });
        });
    }

    /**
     * 지정한 페이지의 예약 목록을 서버에서 가져옵니다.
     */
    function load(page = 1) {
        fetch(`/user/myPage/reservations?page=${page}`)
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

    /**
     * 날짜 및 탭 필터를 적용하여 목록을 다시 렌더링합니다.
     */
    function applyFilterAndRender() {
        let filtered = [...allReservations];
        // 날짜 필터
        const selectedDate = $dateInput?.value;
        if (selectedDate) {
            filtered = filtered.filter(item => {
                if (!item.reservedAt) return false;
                return item.reservedAt.startsWith(selectedDate);
            });
        }
        // 탭 필터
        const selectedTab = $tabInputs.find(tab => tab.checked)?.value;
        if (selectedTab === 'THISWEEK' || selectedTab === 'NEXTWEEK') {
            const today = new Date();
            const dayNum = today.getDay() || 7;
            const monday = new Date(today);
            monday.setDate(monday.getDate() - (dayNum - 1));
            let startOfWeek = monday;
            if (selectedTab === 'NEXTWEEK') {
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

    // 날짜와 탭 변경 시 필터 적용
    $dateInput?.addEventListener('change', () => applyFilterAndRender());
    $tabInputs.forEach(tab => {
        tab.addEventListener('change', () => applyFilterAndRender());
    });

    /**
     * 섹션이 표시될 때 데이터를 한 번 불러오도록 하는 함수입니다.
     */
    function ensureLoaded() {
        if (getWrapper()) {
            load(1);
        }
    }

    document.addEventListener('DOMContentLoaded', ensureLoaded);
    window.loadSessionReservation = () => {
        load(1);
    };
}