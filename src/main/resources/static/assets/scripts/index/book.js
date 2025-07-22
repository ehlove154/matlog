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

        $buttons.forEach(($btn) => {
            $btn.addEventListener('click', () => {
                const color = $btn.getAttribute('data-mt-color');
                if (color === 'gray') {
                    $btn.setAttribute('data-mt-color', 'green');
                    $btn.textContent = '출석';
                } else {
                    $btn.setAttribute('data-mt-color', 'gray');
                    $btn.textContent = '미출석';
                }
            });
        });
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
                    bookLi.appendChild(img);
                    bookLi.appendChild(span);
                    $bookList.appendChild(bookLi);
                })
                .catch(() => {
                    dialog.showSimpleOk('예약', '요청을 처리하는 도중 오류가 발생하였습니다.');
                });
        });
    });
}