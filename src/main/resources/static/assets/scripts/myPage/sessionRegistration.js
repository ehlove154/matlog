import '../common.js';

{
    const $registration = document.querySelector('[data-mt-name="registration"][data-mt-visible]');
    if ($registration) {
        window.dialog = new Dialog({
            $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
        });
        window.$loading = document.getElementById('loading');

        const $wrapper = $registration.querySelector('.common-wrapper');
        const $addButton = $registration.querySelector('.button-container button[data-mt-color="simple"]');

        const $template = $wrapper.querySelector('.session-wrapper');

        const daySessions = {};
        let currentDay = null;

        const stored = localStorage.getItem('sessionRegistration');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                Object.entries(parsed).forEach(([day, sessions]) => {
                    daySessions[day] = sessions.map(data => {
                        const $clone = $template.cloneNode(true);
                        $clone.querySelectorAll('input').forEach($input => {
                            if ($input.type === 'radio') {
                                $input.checked = !!data[$input.name];
                            } else {
                                $input.value = data[$input.name] ?? '';
                            }
                        });
                        return $clone;
                    });
                });
            } catch (err) {
                console.error('failed to restore sessions', err);
            }
        }

        function persistSessions() {
            const data = {};
            Object.entries(daySessions).forEach(([day, nodes]) => {
                data[day] = nodes.map($el => {
                    const obj = {};
                    $el.querySelectorAll('input').forEach($input => {
                        if ($input.type === 'radio') {
                            obj[$input.name] = $input.checked;
                        } else {
                            obj[$input.name] = $input.value;
                        }
                    });
                    return obj;
                });
            });
            localStorage.setItem('sessionRegistration', JSON.stringify(data));
        }

        const $dayRadios = $registration.querySelectorAll('.week-container input[name="week.day"]');
        const $initial = Array.from($dayRadios).find(r => r.checked);

        if ($initial) {
            currentDay = $initial.value;
            if (!daySessions[currentDay]) {
                daySessions[currentDay] = Array.from($wrapper.children);
            }
            switchDay(currentDay);
        }

        function switchDay(day) {
            if (currentDay !== null) {
                daySessions[currentDay] = Array.from($wrapper.children);
                persistSessions();
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
                saved.forEach($el => {
                    const $cloned = $el.cloneNode(true);
                    $wrapper.appendChild($cloned);
                });
                daySessions[day] = Array.from($wrapper.children);
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
                    persistSessions();
                }
            });
        }
        const $form = document.getElementById('myPageForm');
        if ($form) {
            $form.addEventListener('submit', (e) => {
                e.preventDefault();

                if (currentDay !== null) {
                    daySessions[currentDay] = Array.from($wrapper.children);
                }

                const payload = [];
                Object.entries(daySessions).forEach(([day, elements]) => {
                    elements.forEach($el => {
                        const sessionName = $el.querySelector('input[name="sessionName"]').value.trim();
                        const startTime = $el.querySelector('input[name="startTime"]').value;
                        const endTime = $el.querySelector('input[name="endTime"]').value;
                        const coach = $el.querySelector('input[name="coach"]').value.trim();
                        if (sessionName && startTime && endTime && coach) {
                            payload.push({className: sessionName, startTime, endTime, coach, day});
                        }
                    });
                });

                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState !== XMLHttpRequest.DONE) return;

                    if (xhr.status < 200 || xhr.status >= 300) {
                        dialog.showSimpleOk('세션 등록', '요청을 처리하는 도중 오류가 발생하였습니다.');
                        return;
                    }

                    const response = JSON.parse(xhr.responseText);
                    switch (response.result) {
                        case 'success':
                            dialog.showSimpleOk('세션 등록', '세션 등록이 완료되었습니다.');
                            break;
                        case 'failure_session_expired':
                            dialog.showSimpleOk('세션 등록', '세션이 만료되었습니다. 다시 로그인해 주세요.', () => location.href = '/user/login');
                            break;
                        default:
                            dialog.showSimpleOk('세션 등록', '세션 등록에 실패하였습니다.');
                    }
                };
                xhr.open('PATCH', '/user/myPage/sessionRegistration');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(payload));
            });
        }
    }
}