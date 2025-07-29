import '../common.js';

function initSessionRegistration() {
    const $registration = document.querySelector('.content-container [data-mt-name="registration"]');
    if (!$registration) {
        return;
    }

    window.dialog = new Dialog({
        $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
    });
    window.$loading = document.getElementById('loading');

    fetch('/user/myPage/classes/all')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data && !data.result) {
                window.sessionsByDay = data;
            }
            init();
        })
        .catch(() => init());

    function init() {
        const $wrapper = $registration.querySelector('.common-wrapper');
        if (!$wrapper) {
            return;
        }
        const $addButton = $registration.querySelector('.button-container button[data-mt-color="simple"]');

        let $template = $wrapper.querySelector('.session-wrapper');

        const daySessions = {};
        // const deletedIds = new Set();
        let currentDay = null;

        function attachDelete($el) {
            const btn = $el.querySelector('.delete-session');
            if (!btn) return;
            btn.addEventListener('click', () => {
                dialog.show({
                    title: '세션 삭제',
                    content: '정말로 세션을 삭제하시겠습니까?',
                    buttons: [
                        {caption: '아니요', onClickCallback: ($modal) => dialog.hide($modal)},
                        {
                            caption: '네',
                            color: 'green',
                            onClickCallback: ($modal) => {
                                dialog.hide($modal);
                                const idInput = $el.querySelector('input[name="classId"]');
                                // if (idInput && idInput.value && Number(idInput.value) > 0) {
                                //     deletedIds.add(Number(idInput.value));
                                // }
                                // $el.remove();
                                // if (currentDay) {
                                //     daySessions[currentDay] = Array.from($wrapper.children);
                                const classId = idInput ? Number(idInput.value) : 0;
                                if (classId > 0) {
                                    const xhr = new XMLHttpRequest();
                                    xhr.onreadystatechange = () => {
                                        if (xhr.readyState !== XMLHttpRequest.DONE) return;

                                        if (xhr.status >= 200 && xhr.status < 300) {
                                            const response = JSON.parse(xhr.responseText);
                                            if (response.result === 'success') {
                                                $el.remove();
                                                if (currentDay) {
                                                    daySessions[currentDay] = Array.from($wrapper.children);
                                                }
                                            } else if (response.result === 'failure_session_expired') {
                                                dialog.showSimpleOk('세션 삭제', '세션이 만료되었습니다. 다시 로그인해 주세요.', () => location.href = '/user/login');
                                            } else {
                                                dialog.showSimpleOk('세션 삭제', '세션 삭제에 실패하였습니다.');
                                            }
                                        } else {
                                            dialog.showSimpleOk('세션 삭제', '요청을 처리하는 도중 오류가 발생하였습니다.');
                                        }
                                    };
                                    xhr.open('DELETE', `/user/myPage/sessionRegistration/${classId}`);
                                    xhr.send();
                                } else {
                                    $el.remove();
                                    if (currentDay) {
                                        daySessions[currentDay] = Array.from($wrapper.children);
                                    }
                                }
                            }
                        }
                    ]
                });
            });
        }

        if (window.sessionsByDay) {
            Object.entries(window.sessionsByDay).forEach(([day, sessions]) => {
                daySessions[day] = sessions.map(data => {
                    const $clone = $template.cloneNode(true);
                    $clone.querySelector('input[name="sessionName"]').value = data.className ?? '';
                    $clone.querySelector('input[name="startTime"]').value = data.startTime ?? '';
                    $clone.querySelector('input[name="endTime"]').value = data.endTime ?? '';
                    $clone.querySelector('input[name="coach"]').value = data.coach ?? '';
                    const idInput = $clone.querySelector('input[name="classId"]');
                    if (idInput) idInput.value = data.classId ?? 0;
                    attachDelete($clone);

                    return $clone;
                });
            });
            $wrapper.innerHTML = '';
        } else {
            const $sessions = $wrapper.querySelectorAll('.session-wrapper');
            $sessions.forEach($el => {
                const day = $el.getAttribute('data-day');
                if (!daySessions[day]) {
                    daySessions[day] = [];
                }
                attachDelete($el);
                daySessions[day].push($el.cloneNode(true));
            });
            if ($template) {
                $template = $template.cloneNode(true);
            }
            $wrapper.innerHTML = '';
        }

        const $dayRadios = $registration.querySelectorAll('.week-container input[name="week.day"]');
        const $initial = Array.from($dayRadios).find(r => r.checked);

        if ($initial) {
            if (!daySessions[$initial.value]) {
                daySessions[$initial.value] = [];
            }
        }

        if ($initial) {
            currentDay = null;
            switchDay($initial.value);
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
                attachDelete($clone);
                $wrapper.appendChild($clone);
                daySessions[day] = Array.from($wrapper.children);
            } else {
                saved.forEach($el => {
                    const $cloned = $el.cloneNode(true);
                    attachDelete($cloned);
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
                const idInput = $clone.querySelector('input[name="classId"]');
                if (idInput) idInput.value = 0;
                attachDelete($clone);
                $wrapper.appendChild($clone);
                if (currentDay) {
                    daySessions[currentDay] = Array.from($wrapper.children);
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
                        const idInput = $el.querySelector('input[name="classId"]');
                        const classId = idInput ? Number(idInput.value) : 0;

                        if (sessionName && startTime && endTime && coach) {
                            payload.push({classId, className: sessionName, startTime, endTime, coach, day});
                        }
                    });
                });

                // deletedIds.forEach(id => {
                //     payload.push({classId: id, isDeleted: true});
                // });

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
                            // deletedIds.clear();
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

window.initSessionRegistration = initSessionRegistration;

document.addEventListener('DOMContentLoaded', initSessionRegistration);
if (document.readyState !== 'loading') {
    initSessionRegistration();
}