import '../common.js';

{
    document.addEventListener('DOMContentLoaded', () => {
        const $timetableForm = document.getElementById('timetableForm');
        if (!$timetableForm) {
            return;
        }

        const $title = $timetableForm.querySelector('.title-container > .title');
        const $dayButtons = $timetableForm.querySelectorAll('.title-container .day > button');
        const $timeColumns = $timetableForm.querySelectorAll('.timetable [data-mt-day]');
        const $sessionTemplate = document.getElementById('sessionTemplate');

        const now = new Date();
        $title.textContent = `${now.getFullYear()} ${now.getMonth() + 1}월`;

        // Calculate Monday of the current week (Monday = first day)
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
            }).catch(() => {});
        }

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

        updateDisabled();
        setInterval(updateDisabled, 60000);
    });
}