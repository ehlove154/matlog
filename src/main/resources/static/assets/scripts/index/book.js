import '../common.js';

{
    document.addEventListener('DOMContentLoaded', () => {
        const $bookForm = document.getElementById('bookForm');
        if (!$bookForm) {
            return;
        }

        const params = new URLSearchParams(location.search);
        const classId = params.get('classId');
        const $list = document.querySelector('.list');
        const $bookList = document.querySelector('.bookList');
        if (!$bookList) {
            return;
        }

        window.dialog = new Dialog({
            $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
        });
        window.$loading = document.getElementById('loading');

        const $buttons = $bookList.querySelectorAll('button[data-mt-visible]');
        const isMaster = document.body.dataset.master === 'true';

        const appendAttendee = (att) => {
            const li = document.createElement('li');
            li.classList.add('item');
            li.textContent = att.name ?? att.email;
            $list.appendChild(li);

            const bookLi = document.createElement('li');
            bookLi.classList.add('item');

            if (att.belt) {
                const img = document.createElement('img');
                const stripe = att.stripeCount ? att.stripeCount : '';
                img.src = `/assets/images/user/belt/${att.belt.toLowerCase()}${stripe}.png`;
                img.alt = '';
                img.classList.add('icon');
                bookLi.appendChild(img);
            }

            const span = document.createElement('span');
            span.classList.add('caption');
            span.textContent = att.name ?? att.email;

            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('data-mt-object', 'button');

            const attended = att.isAttended === true;
            button.setAttribute('data-mt-color', attended ? 'green' : 'gray');
            button.textContent = attended ? '출석' : '미출석';
            if (isMaster) {
                button.setAttribute('data-mt-visible', '');
                button.addEventListener('click', () => {
                    const newState = button.getAttribute('data-mt-color') !== 'green';
                    fetch('/book/attendance', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        body: new URLSearchParams({
                            reservationId: att.reservationId,
                            attended: newState
                        }).toString()
                    }).then(res => res.ok ? res.json() : Promise.reject())
                        .then(result => {
                            if (result && result.result === 'success') {
                                button.setAttribute('data-mt-color', newState ? 'green' : 'gray');
                                button.textContent = newState ? '출석' : '미출석';
                                att.isAttended = newState;
                            }
                        });
                });
            }

            bookLi.appendChild(span);
            bookLi.appendChild(button);
            $bookList.appendChild(bookLi);
        };

        if (classId) {
            fetch(`/book/reservations?classId=${classId}`)
                .then(res => res.ok ? res.json() : {})
                .then(data => {
                    if (data.result !== 'success' || !Array.isArray(data.reservations)) return;
                    data.reservations.forEach(r => {
                        const li = document.createElement('li');
                        li.classList.add('item');
                        li.textContent = r.name;
                        $list.appendChild(li);

                        const bookLi = document.createElement('li');
                        bookLi.classList.add('item');
                        const img = document.createElement('img');
                        const stripe = r.stripeCount ? r.stripeCount : '';
                        img.src = `/assets/images/user/belt/${r.belt.toLowerCase()}${stripe}.png`;
                        img.alt = '';
                        img.classList.add('icon');

                        const span = document.createElement('span');
                        span.classList.add('caption');
                        span.textContent = r.name;

                        const button = document.createElement('button');
                        button.type = 'button';
                        button.setAttribute('data-mt-object', 'button');
                        const attended = r.isAttended;
                        button.setAttribute('data-mt-color', attended ? 'green' : 'gray');
                        button.textContent = attended ? '출석' : '미출석';
                        if (isMaster) {
                            button.setAttribute('data-mt-visible', '');
                            button.addEventListener('click', () => {
                                const color = button.getAttribute('data-mt-color');
                                if (color === 'gray') {
                                    button.setAttribute('data-mt-color', 'green');
                                    button.textContent = '출석';
                                } else {
                                    button.setAttribute('data-mt-color', 'gray');
                                    button.textContent = '미출석';
                                }
                            });
                        }

                        bookLi.appendChild(img);
                        bookLi.appendChild(span);
                        bookLi.appendChild(button);
                        $bookList.appendChild(bookLi);
                    });
                });
        }
        $bookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!classId) {
                dialog.showSimpleOk('예약', '세션 정보가 올바르지 않습니다.');
                return;
            }
            fetch('/book/reserve', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({classId}).toString()
            }).then(res => res.ok ? res.json() : Promise.reject())
                .then(data => {
                    if (!data || data.result !== 'success') {
                        dialog.showSimpleOk('예약', '예약에 실패하였습니다.');
                        return;
                    }
                    const attendee = data.attendee;
                    if (!attendee) return;

                    const li = document.createElement('li');
                    li.classList.add('item');
                    li.textContent = attendee.name;
                    $list.appendChild(li);

                    const bookLi = document.createElement('li');
                    bookLi.classList.add('item');
                    const img = document.createElement('img');
                    const stripe = attendee.stripeCount ? attendee.stripeCount : '';
                    img.src = `/assets/images/user/belt/${attendee.belt.toLowerCase()}${stripe}.png`;
                    img.alt = '';
                    img.classList.add('icon');
                    const span = document.createElement('span');
                    span.classList.add('caption');
                    span.textContent = attendee.name;

                    const button = document.createElement('button');
                    button.type = 'button';
                    button.setAttribute('data-mt-object', 'button');
                    const attended = false;
                    button.setAttribute('data-mt-color', attended ? 'green' : 'gray');
                    button.textContent = attended ? '출석' : '미출석';
                    if (isMaster) {
                        button.setAttribute('data-mt-visible', '');
                        button.addEventListener('click', () => {
                            const color = button.getAttribute('data-mt-color');
                            if (color === 'gray') {
                                button.setAttribute('data-mt-color', 'green');
                                button.textContent = '출석';
                            } else {
                                button.setAttribute('data-mt-color', 'gray');
                                button.textContent = '미출석';
                            }
                        });
                    }

                    bookLi.appendChild(img);
                    bookLi.appendChild(span);
                    bookLi.appendChild(button);
                    $bookList.appendChild(bookLi);
                })
                .catch(() => {
                    dialog.showSimpleOk('예약', '요청을 처리하는 도중 오류가 발생하였습니다.');
                });
        });
    });
}