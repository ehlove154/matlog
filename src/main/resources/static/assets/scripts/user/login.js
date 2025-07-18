import '../common.js'
import {isValidEmail, isValidPassword} from "../common.js";

{
    const $loginForm = document.getElementById("loginForm");

    window.$labelMap = Array.from($loginForm.querySelectorAll('[data-mt-object="label"]')).reduce((map, $label) => {map[$label.getAttribute('data-mt-name')] = $label;
        return map;
    }, {});

    window.dialog = new Dialog({
        $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
    });
    window.$loading = document.getElementById('loading');

    // 입력 초기화
    Object.values($labelMap).forEach(($label) => {
        $label.setInvalid(false);
        $label.setValid(false);
    });

    Object.entries($labelMap).forEach(([key, $label]) => {
        const $input = $label.querySelector('[data-mt-component="label.field"]');
        if ($input) {
            $input.addEventListener('input', () => {
                // 유효성 경고 메시지 제거
                const $warning = $label.getWarning?.();
                if ($warning) {
                    $warning.innerText = '';
                    $warning.style.color = ''; // 색 초기화
                }

                // 스타일 클래스 제거
                $label.setInvalid?.(false);
                $label.setValid?.(false);

                // 직접 스타일 초기화 (필요한 경우)
                $input.style.borderColor = '';
                $input.style.color = '';
            });
        }
    });

    $loginForm['email'].value = '';
    $loginForm['email'].focus();
    $loginForm['password'].value = '';
    
    $loginForm.onsubmit = (e) => {
        e.preventDefault();
        
        if ($loginForm['email'].value === '') {
            $labelMap['email'].showInvalid('email', '이메일을 입력해 주세요.');
            return;
        }
        if (!isValidEmail($loginForm['email'].value.trim())) {
            $labelMap['email'].showInvalid('email', '올바르지 않은 이메일 형식입니다.');
            return;
        }
        if ($loginForm['password'].value === '') {
            $labelMap['password'].showInvalid('password', '비밀번호를 입력해 주세요.');
            return;
        }
        if (!isValidPassword($loginForm['password'].value.trim())) {
            $labelMap['password'].showInvalid('password', '올바르지 않은 비밀번호 형식입니다.');
            return;
        }
        if (Object.values($labelMap).some(($label) => $label.isInvalid())) {
            return;
        }

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $loginForm['email'].value);
        formData.append('password', $loginForm['password'].value);

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다.\n잠시 후 다시 시도해 주세요.');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure_suspended':
                    dialog.showSimpleOk('경고', '해당 계정은 이용이 정지된 상태입니다.\n고객센터를 통해 문의해 주세요.');
                    break;
                case 'success':
                    if ($loginForm['remember'].checked) {
                        localStorage.setItem('loginEmail', $loginForm['email'].value);
                    } else {
                        localStorage.removeItem('loginEmail');
                    }

                    if (response.redirect) {
                        window.location.href = response.redirect;
                    } else {
                        window.location.href = '/'; // fallback
                    }
                    break;
                    break;
                default:
                    dialog.showSimpleOk('경고', '이메일 혹은 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.', {
                        onClickCallback: () => $loginForm['email'].focus()
                    });
            }
        };
        xhr.open('POST', '/user/login');
        xhr.send(formData);
    }
}