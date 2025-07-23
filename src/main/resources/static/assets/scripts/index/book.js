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

        const $submitButton = $bookForm.querySelector('button[type="submit"]');
        let signedEmail = document.body.dataset.email?.toLowerCase();
        let membership = document.body.dataset.membership?.toUpperCase();
        let reservationId = null;

        const updateReservationStatus = () => {
            signedEmail = document.body.dataset.email?.toLowerCase();
            membership = document.body.dataset.membership?.toUpperCase();
            if (!classId || !signedEmail) return;
            fetch(`/book/reservation?classId=${classId}`)
                .then(res => res.ok ? res.json() : {})
                .then(data => {
                    if (data.result === 'success') {
                        reservationId = data.reservationId;
                        $submitButton.setAttribute('data-mt-color', 'red');
                        $submitButton.textContent = '예약 취소 하기';
                    } else {
                        reservationId = null;
                        $submitButton.setAttribute('data-mt-color', 'green');
                        $submitButton.textContent = '예약하기';
                    }
                });
        };

        updateReservationStatus();

        window.addEventListener('message', (e) => {
            const data = e.data;
            if (!data) return;
            if (data === 'loginComplete' || data.type === 'loginComplete' || data.type === 'loginSuccess') {
                if (data.email) {
                    document.body.dataset.email = data.email;
                }
                if (data.membership) {
                    document.body.dataset.membership = data.membership;
                    membership = data.membership.toUpperCase();
                }

                if (data.role) {
                    document.body.dataset.master = String(data.role.toLowerCase() === 'master');
                    isMaster = (document.body.dataset.master || '').toLowerCase() === 'true';
                } else {
                    fetch('/user/role')
                        .then(res => res.ok ? res.json() : null)
                        .then(roleData => {
                            const role = roleData && (roleData.role || roleData.userRole);
                            if (role) {
                                document.body.dataset.master = String(role.toLowerCase() === 'master');
                                isMaster = (document.body.dataset.master || '').toLowerCase() === 'true';
                            }
                        });
                }

                updateReservationStatus();
            }
        });

        window.dialog = new Dialog({
            $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
        });
        window.$loading = document.getElementById('loading');

        const $membershipDialog = document.getElementById('membershipPaymentDialog');
        const $modal = $membershipDialog.querySelector('[data-mt-component="dialog.modal"]');
        if ($membershipDialog) {
            const $closeBtn = $membershipDialog.querySelector('button[name="close"]');
            const $payBtn = $membershipDialog.querySelector('button[name="pay"]');
            const $select = $membershipDialog.querySelector('#membership');


            $membershipDialog.onclick = (e) => {
                if (e.target === $membershipDialog) {
                    $membershipDialog.setVisible(false);
                    $modal.setVisible(false);
                }
            };
            $closeBtn?.addEventListener('click', () => {
                $membershipDialog.setVisible(false);
                $modal.setVisible(false);
            });
            $payBtn?.addEventListener('click', () => {
                location.href = '/user/myPage';
            });

            if ($select) {
                fetch('/memberships')
                    .then(res => res.ok ? res.json() : [])
                    .then(list => {
                        if (!Array.isArray(list)) return;
                        list.forEach(m => {
                            if (m.membershipCode && m.membershipCode.toUpperCase() === 'NONE') {
                                return;
                            }
                            const opt = document.createElement('option');
                            opt.value = m.membershipCode;
                            const text = m.displayText ? `${m.displayText} | ${Number(m.price).toLocaleString()}원` : `${m.durationMonth}개월 | ${Number(m.price).toLocaleString()}원`;
                            opt.textContent = text;
                            $select.appendChild(opt);
                        });
                    });
            }
        }

        let isMaster = (document.body.dataset.master || '').toLowerCase() === 'true';

        console.log('isMaster =', document.body.dataset.master);
        if (classId) {
            fetch(`/book/reservations?classId=${classId}`)
                .then(res => res.ok ? res.json() : {})
                .then(data => {
                    if (data.result !== 'success' || !Array.isArray(data.reservations)) return;
                    data.reservations.forEach(r => {
                        const li = document.createElement('li');
                        li.classList.add('item');
                        li.textContent = r.name;
                        li.dataset.reservationId = r.reservationId;
                        $list.appendChild(li);

                        const bookLi = document.createElement('li');
                        bookLi.classList.add('item');
                        bookLi.dataset.reservationId = r.reservationId;
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

                        if (signedEmail && r.email && r.email.toLowerCase() === signedEmail) {
                            reservationId = r.reservationId;
                        }
                    });
                });
        }
        $bookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!classId) {
                dialog.showSimpleOk('예약', '세션 정보가 올바르지 않습니다.');
                return;
            }
            if (!reservationId) {
                membership = document.body.dataset.membership?.toUpperCase();
                if (membership === 'NONE') {
                    $membershipDialog?.setVisible(true);
                    $modal?.setVisible(true);
                    return;
                }
                fetch('/book/reserve', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: new URLSearchParams({classId}).toString()
                }).then(res => res.ok ? res.json() : Promise.reject())
                    .then(data => {
                        if (!data) {
                            dialog.showSimpleOk('예약', '예약에 실패하였습니다.');
                            return;
                        }
                        if (data.result === 'membership_required') {
                            $membershipDialog?.setVisible(true);
                            $modal?.setVisible(true);
                            return;
                        }
                        if (data.result !== 'success') {
                            dialog.showSimpleOk('예약', '예약에 실패하였습니다.');
                            return;
                        }
                        const attendee = data.attendee;
                        if (!attendee) return;

                        const li = document.createElement('li');
                        li.classList.add('item');
                        li.textContent = attendee.name;
                        li.dataset.reservationId = attendee.reservationId;
                        $list.appendChild(li);

                        const bookLi = document.createElement('li');
                        bookLi.classList.add('item');
                        bookLi.dataset.reservationId = attendee.reservationId;
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

                        reservationId = attendee.reservationId;
                        $submitButton.setAttribute('data-mt-color', 'red');
                        $submitButton.textContent = '예약 취소 하기';
                    })
                    .catch(() => {
                        dialog.showSimpleOk('예약', '요청을 처리하는 도중 오류가 발생하였습니다.');
                    });
            } else {
                fetch('/book/cancel', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: new URLSearchParams({reservationId}).toString()
                }).then(res => res.ok ? res.json() : Promise.reject())
                    .then(data => {
                        if (!data || data.result !== 'success') {
                            dialog.showSimpleOk('예약 취소', '예약 취소에 실패하였습니다.');
                            return;
                        }
                        $list.querySelector(`[data-reservation-id="${reservationId}"]`)?.remove();
                        $bookList.querySelector(`[data-reservation-id="${reservationId}"]`)?.remove();
                        reservationId = null;
                        $submitButton.setAttribute('data-mt-color', 'green');
                        $submitButton.textContent = '예약하기';
                    })
                    .catch(() => {
                        dialog.showSimpleOk('예약 취소', '요청을 처리하는 도중 오류가 발생하였습니다.');
                    });
            }
        });
    });
}