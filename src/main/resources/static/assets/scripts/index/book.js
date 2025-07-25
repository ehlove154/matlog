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
        const $pageContainer = document.querySelector('.page-container');
        if (!$bookList) {
            return;
        }

        const $submitButton = $bookForm.querySelector('button[type="submit"]');
        let signedEmail = document.body.dataset.email?.toLowerCase();
        let membership = document.body.dataset.membership?.toUpperCase();
        let reservationId = null;
        let currentPage = 1;
        let maxPage = 1;

        const renderPageContainer = () => {
            if (!$pageContainer) return;
            $pageContainer.innerHTML = '';
            const $prev = document.createElement('a');
            $prev.href = '#';
            $prev.classList.add('previous');
            if (currentPage === 1) $prev.classList.add('disabled');
            $prev.innerHTML = '<img src="/assets/images/previous.png" alt="" class="icon">';
            $pageContainer.appendChild($prev);

            for (let i = 1; i <= maxPage; i++) {
                const $p = document.createElement('a');
                $p.href = '#';
                $p.classList.add('page');
                if (i === currentPage) $p.classList.add('-selected');
                $p.dataset.page = String(i);
                $p.textContent = String(i);
                $pageContainer.appendChild($p);
            }

            const $next = document.createElement('a');
            $next.href = '#';
            $next.classList.add('next');
            if (currentPage === maxPage) $next.classList.add('disabled');
            $next.innerHTML = '<img src="/assets/images/next.png" alt="" class="icon">';
            $pageContainer.appendChild($next);
        };

        const renderReservations = (list) => {
            $list.innerHTML = '';
            $bookList.innerHTML = '';
            list.forEach(r => {
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
                        const prevColor = button.getAttribute('data-mt-color');
                        const newAttended = prevColor === 'gray';

                        // 미리 버튼 상태를 변경한다.
                        button.setAttribute('data-mt-color', newAttended ? 'green' : 'gray');
                        button.textContent = newAttended ? '출석' : '미출석';

                        fetch('/book/attendance', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            body: new URLSearchParams({
                                reservationId: bookLi.dataset.reservationId,
                                attended: String(newAttended)
                            }).toString()
                        }).then(res => res.ok ? res.json() : Promise.reject())
                            .then(data => {
                                if (!data || data.result !== 'success') {
                                    throw new Error();
                                }
                            })
                            .catch(() => {
                                // 실패 시 원래 상태로 되돌림
                                button.setAttribute('data-mt-color', prevColor);
                                button.textContent = prevColor === 'gray' ? '미출석' : '출석';
                                dialog.showSimpleOk('출석 관리', '출석 상태 변경에 실패하였습니다.');
                            });
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
        };

        const loadPage = (page = 1) => {
            fetch(`/book/reservations?classId=${classId}&page=${page}`)
                .then(res => res.ok ? res.json() : {})
                .then(data => {
                    if (data.result !== 'success' || !Array.isArray(data.reservations)) return;
                    currentPage = data.page || 1;
                    maxPage = data.maxPage || 1;
                    renderReservations(data.reservations);
                    renderPageContainer();
                });
        };

        if ($pageContainer) {
            $pageContainer.addEventListener('click', (e) => {
                const prev = e.target.closest('a.previous');
                const next = e.target.closest('a.next');
                const pageEl = e.target.closest('a.page');
                if (prev) {
                    e.preventDefault();
                    if (currentPage > 1) loadPage(currentPage - 1);
                } else if (next) {
                    e.preventDefault();
                    if (currentPage < maxPage) loadPage(currentPage + 1);
                } else if (pageEl) {
                    e.preventDefault();
                    const p = parseInt(pageEl.dataset.page);
                    if (!isNaN(p)) loadPage(p);
                }
            });
        }

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
            const membershipPrices = {};

            $payBtn?.addEventListener('click', () => {
                const selected = $select?.value;
                if (!selected || selected === '-1') {
                    dialog.showSimpleOk('멤버십 결제', '멤버십을 선택해 주세요.');
                    return;
                }

                if (!window.IMP) {
                    dialog.showSimpleOk('멤버십 결제', '결제 모듈이 로드되지 않았습니다.');
                    return;
                }

                const amount = membershipPrices[selected] ?? 0;
                IMP.init('imp36544176');
                IMP.request_pay({
                    pg: 'kakaopay.TC0ONETIME',
                    pay_method: 'card',
                    name: 'Matlog 멤버십 결제',
                    amount
                }, (rsp) => {
                    if (rsp.success) {
                        fetch('/api/membership/update', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                membership: selected,
                                impUid: rsp.imp_uid,
                                merchantUid: rsp.merchant_uid,
                                amount: rsp.paid_amount
                            })
                        }).then(res => res.ok ? res.json() : null)
                            .then(data => {
                                if (data && data.result === 'success') {

                                    const xhr = new XMLHttpRequest();
                                    const formData = new FormData();

                                    formData.append('email', signedEmail);
                                    formData.append('membershipCode', selected);
                                    formData.append('amount', String(rsp.paid_amount));


                                    xhr.onreadystatechange = () => {
                                        if (xhr.readyState !== XMLHttpRequest.DONE) {
                                            return;
                                        }
                                        if (xhr.status < 200 || xhr.status >= 300) {
                                            let res;
                                            try {
                                                res = JSON.parse(xhr.responseText);
                                            } catch (_) {
                                                dialog.showSimpleOk('멤버십 결제', '결제 요청 처리에 실패했습니다.');
                                                return;
                                            }
                                            if (res && res.result === 'success') {
                                                dialog.showSimpleOk('멤버십 결제', '결제가 완료되었습니다.');
                                                $membershipDialog.setVisible(false);
                                                $modal.setVisible(false);
                                            } else {
                                                dialog.showSimpleOk('멤버십 결제', '결제 요청 처리에 실패했습니다.');
                                            }
                                        } else {
                                            dialog.showSimpleOk('멤버십 결제', '결제 요청 처리에 실패했습니다.');
                                        }

                                    };
                                    xhr.open('POST', '/membership/payment');
                                    xhr.send(formData);

                                } else {
                                    dialog.showSimpleOk('멤버십 결제', '결제 정보 전송에 실패하였습니다.');
                                }
                            })
                            .catch(() => {
                                dialog.showSimpleOk('멤버십 결제', '결제 정보 전송 중 오류가 발생하였습니다.');
                            });
                    } else {
                        dialog.showSimpleOk('멤버십 결제', '결제가 취소되었습니다.');
                    }
                });
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
                            membershipPrices[m.membershipCode] = m.price;
                            $select.appendChild(opt);
                        });
                    });
            }
        }

        let isMaster = (document.body.dataset.master || '').toLowerCase() === 'true';

        console.log('isMaster =', document.body.dataset.master);
        if (classId) {
            loadPage(1);
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

                        reservationId = attendee.reservationId;
                        $submitButton.setAttribute('data-mt-color', 'red');
                        $submitButton.textContent = '예약 취소 하기';
                        loadPage(currentPage);
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
                        reservationId = null;
                        $submitButton.setAttribute('data-mt-color', 'green');
                        $submitButton.textContent = '예약하기';
                        loadPage(currentPage);
                    })
                    .catch(() => {
                        dialog.showSimpleOk('예약 취소', '요청을 처리하는 도중 오류가 발생하였습니다.');
                    });
            }
        });
    });
}