{
    const $registration = document.querySelector('[data-mt-name="registration"][data-mt-visible]');
    if ($registration) {
        const $wrapper = $registration.querySelector('.common-wrapper');
        const $addButton = $registration.querySelector('.button-container button[data-mt-color="simple"]');

        const $template = $wrapper.querySelector('.session-wrapper');

        const daySessions = {};
        let currentDay = null;
        const $dayRadios = $registration.querySelectorAll('.week-container input[name="week.day"]');
        const $initial = Array.from($dayRadios).find(r => r.checked);

        if ($initial) {
            currentDay = $initial.value;
            daySessions[currentDay] = Array.from($wrapper.children);
        }

        function switchDay(day) {
            if (currentDay !== null) {
                daySessions[currentDay] = Array.from($wrapper.children);
            }
            currentDay = day;
            const saved = daySessions[day] ?? [];
            $wrapper.innerHTML = '';
            if (saved.length === 0 && $template) {
                const $clone = $template.cloneNode(true);
                $clone.querySelectorAll('input').forEach($input => {
                    if ($input.type === 'radio') {
                        $input.checked = false;
                    } else {
                        $input.value = '';
                    }
                });
                $wrapper.appendChild($clone);
                daySessions[day] = Array.from($wrapper.children);
            } else {
                saved.forEach($el => $wrapper.appendChild($el));
            }
        }

        $dayRadios.forEach($input => {
            $input.addEventListener('change', () => {
                if ($input.checked) {
                    switchDay($input.value);
                }
            });
        });

        if ($addButton && $template) {
            $addButton.addEventListener('click', () => {
                const $clone = $template.cloneNode(true);
                $clone.querySelectorAll('input').forEach($input => {
                    if ($input.type === 'radio') {
                        $input.checked = false;
                    } else {
                        $input.value = '';
                    }
                });
                $wrapper.appendChild($clone);
                if (currentDay) {
                    daySessions[currentDay] = Array.from($wrapper.children);
                }
            });
        }
    }
}