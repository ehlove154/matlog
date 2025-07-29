import '../common.js';

{
    document.addEventListener('DOMContentLoaded', () => {
        const $timetableForm = document.getElementById('timetableForm');
        if (!$timetableForm) {
            return;
        }

        window.dialog = new Dialog({
            $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
        });
        window.$loading = document.getElementById('loading');

        function formatDateLocal(d) {
            const pad = (n) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        }


        const $title = $timetableForm.querySelector('.title-container > .title');
        const $dayButtons = Array.from($timetableForm.querySelectorAll('.title-container .day > button'));
        const $timeColumns = Array.from($timetableForm.querySelectorAll('.timetable [data-mt-day]'));

        let isMaster = (document.body.dataset.master || '').toLowerCase() === 'true';

        const today = new Date();
        let activeDay = (today.getDay() + 6) % 7;
        const $sessionTemplate = document.getElementById('sessionTemplate');

        const now = new Date();
        $title.textContent = `${now.getFullYear()} ${now.getMonth() + 1}월`;

        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

        $dayButtons.forEach((btn, idx) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + idx);
            const daySpan = btn.querySelector('.day');
            if (daySpan) {
                btn.dataset.date = formatDateLocal(date);
            }
            btn.dataset.date = date.toISOString().split('T')[0];
        });

        const dayCodeMap = {MON: 'mon', TUE: 'tue', WED: 'wed', THU: 'thu', FRI: 'fri'};
        const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일'];
        if ($sessionTemplate) {
            fetch('/classes').then(r => r.json()).then(data => {
                Object.entries(data).forEach(([day, sessions]) => {
                    const column = $timetableForm.querySelector(`[data-mt-day="${dayCodeMap[day] || day.toLowerCase()}"]`);
                    if (!column) return;
                    column.innerHTML = '';
                    let prevStart = null;
                    const dayIndex = Object.keys(dayCodeMap).indexOf(day);
                    const date = new Date(monday);
                    if (dayIndex >= 0) {
                        date.setDate(monday.getDate() + dayIndex);
                    }
                    sessions.forEach(session => {
                        const $clone = $sessionTemplate.content.firstElementChild.cloneNode(true);
                        const start = (session.startTime || '').substring(0,5);
                        $clone.dataset.start = start;
                        $clone.dataset.end = (session.endTime || '').substring(0,5);
                        $clone.dataset.classId = session.classId || '';
                        $clone.dataset.className = session.className || '';
                        $clone.dataset.coach = session.coach || '';
                        $clone.dataset.date = formatDateLocal(date);
                        $clone.dataset.dayName = dayNames[dayIndex] || day;
                        if (start === prevStart) {
                            const startTimeEl = $clone.querySelector('.start-time');
                            startTimeEl?.remove();
                        } else {
                            $clone.querySelector('.start-time .caption').textContent = start;
                            prevStart = start;
                        }
                        const $content = $clone.querySelector('.content');
                        $content.querySelector('.class').textContent = session.className || '';
                        $content.querySelector('.time').textContent = `${session.startTime} - ${session.endTime}`;
                        $content.querySelector('.coach').textContent = `코치 : ${session.coach}`;
                        $clone.addEventListener('click', () => {
                            if ($content.hasAttribute('disabled')) return;
                            if (!document.body.dataset.email) {
                                dialog.showSimpleOk(
                                    '경고',
                                    '로그인 후 사용할 수 있습니다. 확인을 누르시면 로그인 창으로 이동합니다.',
                                    { onClickCallback: () => location.href = '/user/login' }
                                );
                                return;
                            }
                            const params = new URLSearchParams({
                                classId: $clone.dataset.classId,
                                className: $clone.dataset.className,
                                date: $clone.dataset.date,
                                day: $clone.dataset.dayName,
                                start: $clone.dataset.start,
                                end: $clone.dataset.end,
                                coach: $clone.dataset.coach
                            });
                            location.href = `/book?${params.toString()}`;
                        });
                        column.appendChild($clone);
                    });
                });
                updateDisabled();
            }).catch(() => {
                dialog.showSimpleOk('시간표 불러오기 실패', '네트워크 오류가 발생했습니다.');
            });
        }

        const updateLayout = () => {
            let count = 5;
            if (window.matchMedia('(max-width: 40rem)').matches) count = 1;
            else if (window.matchMedia('(max-width: 60rem)').matches) count = 2;
            else if (window.matchMedia('(max-width: 80rem)').matches) count = 3;
            else if (window.matchMedia('(max-width: 100rem)').matches) count = 4;

            const totalDays = $timeColumns.length; // 예: 5 (월~금)
            let start;

            if (count >= totalDays) {
                // 전체를 표시할 경우
                start = 0;
            } else {
                if (count === 4) {
                    // 4개 표시: 선택된 요일을 맨 오른쪽에 두고 앞의 3일을 포함
                    start = activeDay - 3;
                } else if (count === 3) {
                    // 3개 표시: 선택된 요일을 가운데에 두도록 앞뒤 한 칸씩
                    start = activeDay - 1;
                } else {
                    // 2개 이하: 선택된 요일부터 표시
                    start = activeDay;
                }
                // 범위 보정: 인덱스가 음수이거나 끝을 넘지 않도록 조정
                if (start < 0) start = 0;
                if (start > totalDays - count) start = totalDays - count;
            }

            const visible = [];
            for (let i = 0; i < count; i++) {
                visible.push(start + i);
            }
            $timeColumns.forEach((col, i) => {
                col.style.display = visible.includes(i) ? 'flex' : 'none';
                col.classList.toggle('active', i === activeDay);
            });
            $dayButtons.forEach((btn, i) => {
                btn.classList.toggle('active', i === activeDay);
            });
        };

        const updateDisabled = () => {
            const now = new Date();
            $timeColumns.forEach((column, idx) => {
                const date = new Date(monday);
                date.setDate(monday.getDate() + idx);

                column.querySelectorAll('.session-container').forEach(container => {
                    const start = container.dataset.start;
                    if (!start) return;
                    const [h, m] = start.split(':').map(Number);
                    const sessionTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
                    const past = sessionTime <= now;
                    container.querySelectorAll('.content').forEach(content => {
                        content.setDisabled?.(past && !isMaster);
                    });
                });
            });
        };
        updateLayout();
        updateDisabled();
        setInterval(updateDisabled, 60000);
        window.addEventListener('resize', updateLayout);
        $dayButtons.forEach((btn, idx) => {
            btn.addEventListener('click', () => {
                activeDay = idx;
                updateLayout();
            });
        });
    });
}