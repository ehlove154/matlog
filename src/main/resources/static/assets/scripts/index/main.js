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

        const $title = $timetableForm.querySelector('.title-container > .title');
        const $dayButtons = Array.from($timetableForm.querySelectorAll('.title-container .day > button'));
        const $timeColumns = Array.from($timetableForm.querySelectorAll('.timetable [data-mt-day]'));

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
                daySpan.textContent = date.getDate();
            }
            btn.dataset.date = date.toISOString().split('T')[0];
        });

        const dayCodeMap = {MON: 'mon', TUE: 'tue', WED: 'wed', THU: 'thu', FRI: 'fri'};
        if ($sessionTemplate) {
            fetch('/classes').then(r => r.json()).then(data => {
                Object.entries(data).forEach(([day, sessions]) => {
                    const column = $timetableForm.querySelector(`[data-mt-day="${dayCodeMap[day] || day.toLowerCase()}"]`);
                    if (!column) return;
                    column.innerHTML = '';
                    sessions.forEach(session => {
                        const $clone = $sessionTemplate.content.firstElementChild.cloneNode(true);
                        $clone.querySelector('.start-time .caption').textContent = (session.startTime || '').substring(0,5);
                        const $content = $clone.querySelector('.content');
                        $content.querySelector('.class').textContent = session.className || '';
                        $content.querySelector('.time').textContent = `${session.startTime} - ${session.endTime}`;
                        $content.querySelector('.coach').textContent = `코치 : ${session.coach}`;
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

            const visible = [];
            if (count === 1) {
                visible.push(activeDay);
            } else {
                const today = new Date();
                let start = (today.getDay() + 6) % 7;
                if (start >= $timeColumns.length) start = 0;

                for (let offset = 0; offset < $timeColumns.length && visible.length < count; offset++) {
                    visible.push((start + offset) % $timeColumns.length);
                }
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
                    const caption = container.querySelector('.start-time .caption');
                    if (!caption) return;
                    const [h, m] = caption.textContent.split(':').map(Number);
                    const sessionTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
                    const past = sessionTime <= now;
                    container.querySelectorAll('.content').forEach(content => {
                        content.setDisabled?.(past);
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