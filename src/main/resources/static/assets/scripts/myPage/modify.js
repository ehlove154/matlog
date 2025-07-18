import '../common.js'
import {
    isValidContact,
    isValidContactCode,
    isValidPassword
} from "../common.js";

{
    if (document.querySelector('[data-mt-name="userModify"][data-mt-visible]')) {
        const $myPageForm = document.getElementById('myPageForm');

        let verificationStartTime = null;
        let verificationTimeout = 180;
        let verificationTimer = null;
        let resendCooldown = false;
        let isContactVerified = false;

        // 핸드폰 인증번호 타이머 기능 (3분 내 인증 유효)
        function startVerificationTimer() {
            verificationStartTime = Date.now();
            clearInterval(verificationTimer);

            verificationTimer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - verificationStartTime) / 1000);
                const remaining = verificationTimeout - elapsed;

                if (remaining <= 0) {
                    clearInterval(verificationTimer);
                    dialog.showSimpleOk('인증시간 만료', '인증시간 3분이 초과되어 인증을 다시 진행해주세요.');

                    // 유효성 실패로 처리
                    $labelMap['contact'].showInvalid('contact', '인증 시간이 초과되었습니다.');

                    $contactCheckButton.setDisabled(false);
                    $contactCodeCheck.setDisabled(true);
                    $contactCode.setDisabled(true);
                }
            }, 1000)
        }


        window.$labelMap = Array.from($myPageForm.querySelectorAll('[data-mt-object="label"]')).reduce((map, $label) => {
            map[$label.getAttribute('data-mt-name')] = $label;
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

        $myPageForm['password'].value = '';
        $myPageForm['password'].focus();
        $myPageForm['newPassword'].value = '';
        $myPageForm['newPasswordCheck'].value = '';
        $myPageForm['newContact'].value = '';
        $myPageForm['newContactCode'].value = '';

        const $contactCheckButton = $labelMap['newContact'].querySelector('[data-mt-object="button"][data-mt-name="contactCheck"]');
        const $contactCodeCheck = $labelMap['newContact'].querySelector('[data-mt-object="button"][data-mt-name="contactCodeCheck"]');
        const $contactCode = $labelMap['newContact'].querySelector('[name="newContactCode"]');

        $contactCheckButton.addEventListener('click', () => {
            if (resendCooldown) { // 재전송 제한 (30초 쿨타임)
                dialog.showSimpleOk('주의', '잠시후 다시 시도해 주세요.')
                return;
            }

            const contact = $myPageForm['newContact'].value.trim();

            if (contact === '') {
                $labelMap['newContact'].showInvalid('newContact', '연락처를 입력해 주세요.');
                return;
            }

            if (!isValidContact(contact)) {
                $labelMap['newContact'].showInvalid('newContact', '올바르지 않은 연락처 형식입니다.');
                return;
            }

            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('contact', contact);

            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (xhr.status < 200 || xhr.status >= 300) {
                    dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                    return;
                }

                const response = JSON.parse(xhr.responseText);

                switch (response.result) {
                    case 'success':
                        $labelMap['newContact'].showValid('newContact', '입력하신 연락처로 본인인증코드를 전송했습니다.\n인증번호는 3분동안 유효합니다.');
                        $labelMap['newContact'].setValid(true);
                        $labelMap['newContact'].setInvalid(true);
                        $contactCheckButton.setDisabled(true);
                        $contactCodeCheck.setDisabled(false);
                        $contactCode.setDisabled(false);
                        $myPageForm['newContactCode'].focus();

                        resendCooldown = true;
                        startVerificationTimer();
                        setTimeout(() => resendCooldown = false, 30000);

                        const smsXhr = new XMLHttpRequest();
                        smsXhr.open('POST', '/sms/send');
                        smsXhr.setRequestHeader('Content-Type', 'application/json');

                        smsXhr.onreadystatechange = () => {
                            if (smsXhr.readyState !== XMLHttpRequest.DONE) return;

                            if (smsXhr.status >= 200 && smsXhr.status < 300) {
                                // 서버로부터 성공 응답
                                console.log('[SMS 전송 성공]', smsXhr.responseText);
                            } else {
                                // 서버 에러 발생
                                let errorMessage = 'SMS 전송 중 오류가 발생했습니다. 다시 시도해 주세요.';
                                try {
                                    const response = JSON.parse(smsXhr.responseText);
                                    if (response && response.message) {
                                        errorMessage = response.message;
                                    }
                                } catch (e) {
                                    // 파싱 실패 (HTML 반환되었거나 JSON 아님)
                                }
                                dialog.showSimpleOk('문자 전송 실패', '문자 전송에 실패하였습니다. 잠시 후 다시 시도해 주세요.');
                                console.error('[SMS 전송 실패]', smsXhr.responseText);
                            }
                        };

                        smsXhr.send(JSON.stringify({phoneNum: contact}));

                        break;

                    case 'failure':
                        $labelMap['newContact'].showInvalid('newContact', '사용 할 수 없는 연락처입니다.');
                        $labelMap['newContact'].setValid(false);
                        break;
                    default:
                        $labelMap['newContact'].showInvalid('newContact', '알 수 없는 오류가 발생했습니다.');
                        $labelMap['newContact'].setValid(false);
                        break;
                }
            };

            xhr.open('POST', '/user/check-contact');
            xhr.send(formData);

            $myPageForm['newContact'].addEventListener('input', () => {
                if ($contactCheckButton.disabled) {
                    $contactCheckButton.setDisabled(false);
                    $labelMap['newContact'].setInvalid(false);
                    $labelMap['newContact'].setValid(false);

                    // 색상 초기화
                    const $warning = $labelMap['newContact'].getWarning();
                    $warning.style.color = ''; // 기본으로

                    const $input = $labelMap['newContact'].querySelector('[data-mt-component="label.field"]');
                    if ($input) {
                        $input.style.borderColor = ''; // 기본값
                    }

                    $contactCodeCheck.setDisabled(true);
                    $contactCode.setDisabled(true);
                }
            });
        })


        // 핸드폰 인증 번호 전송
        $contactCodeCheck.addEventListener('click', () => {
            const contact = $myPageForm['newContact'].value.trim();
            const code = $myPageForm['newContactCode'].value.trim();

            if (code === '') {
                $labelMap['newContact'].showInvalid('newContact', '인증번호를 입력해 주세요.');
                $myPageForm['newContactCode'].focus();
            }

            if (code.length !== 6) {
                $labelMap['newContact'].showInvalid('newContact', '6자리 인증번호를 정확히 입력해 주세요.');
                $myPageForm['newContactCode'].focus();
                $labelMap['newContact'].setInvalid(true);
                $labelMap['newContact'].setValid(false);
                return;
            }

            if (!isValidContactCode(code)) {
                $labelMap['newContact'].showInvalid('newContact', '올바르지 않은 인증번호 형식입니다.');
                $myPageForm['newContactCode'].focus();
                $myPageForm['newContactCode'].select();
                return;
            }

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/sms/verify');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) return;

                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.result === 'success') {
                        isContactVerified = true; // 인증 성공 여부 변수 true 설정
                        clearInterval(verificationTimer); // 타이머 정지
                        $labelMap['newContact'].showValid('newContact', '인증에 성공했습니다.');
                        $contactCodeCheck.setDisabled(true);
                        $contactCode.setDisabled(true);
                    } else {
                        $labelMap['newContact'].showInvalid('newContact', '인증번호가 올바르지 않습니다.');
                        $labelMap['newContact'].setInvalid(true);
                        $labelMap['newContact'].setValid(false);
                        $contactCodeCheck.setDisabled(false);
                        $contactCode.setDisabled(false);
                        $myPageForm['newContactCode'].focus();

                    }
                } else {
                    $labelMap['newContact'].showValid('newContact', '서버 오류가 발생했습니다. 다시 시도해 주세요.');
                }
            };

            xhr.send(JSON.stringify({phoneNum: contact, code: code}));
        });


        // 주소찾기
        const $addressFindButton = $labelMap['address'].querySelector('[data-mt-object="button"][name="addressFindButton"]');

        $addressFindButton.addEventListener('click', () => {
            const $addressFindDialog = document.getElementById('addressFindDialog');
            const $modal = $addressFindDialog.querySelector(':scope > .modal');
            $addressFindDialog.onclick = (e) => {
                if (e.target === $addressFindDialog) {
                    $addressFindDialog.hide();
                }
            }
            new daum.Postcode({
                width: '100%',
                height: '100%',
                oncomplete: (data) => {
                    const $postal = document.querySelector('input[name="addressPostal"]');
                    const $primary = document.querySelector('input[name="addressPrimary"]');
                    const $secondary = document.querySelector('input[name="addressSecondary"]');

                    // console.log('zonecode:', data.zonecode);

                    if ($postal) $postal.value = data.zonecode;
                    if ($primary) $primary.value = data.roadAddress;

                    if ($secondary) {
                        $secondary.focus();
                        $secondary.select();
                    }

                    $myPageForm.querySelector('input[name="addressPostal"]').value = data.zonecode;
                    $myPageForm.querySelector('input[name="addressPrimary"]').value = data.roadAddress;

                    $addressFindDialog.hide();

                    // console.log("addressPostal (by form):", $myPageForm.querySelector('input[name="addressPostal"]').value);
                }
            }).embed($modal);
            $addressFindDialog.show();
        })


        $myPageForm.onsubmit = (e) => {
            e.preventDefault();

            if ($myPageForm['password'].value === '') {
                $labelMap['password'].showInvalid('password', '현재 사용 중인 비밀번호를 입력해 주세요.');
                return;
            }

            if (!isValidPassword($myPageForm['password'].value)) {
                $labelMap['password'].showInvalid('password', '올바르지 않은 비밀번호 형식입니다.');
                return;
            }

            if ($myPageForm['newPassword'].value || $myPageForm['newPasswordCheck'].value) {
                if ($myPageForm['newPassword'].value === '') {
                    $labelMap['newPassword'].showInvalid('newPassword', '새로운 비밀번호를 입력해 주세요.');
                    return;
                }

                if (!isValidPassword($myPageForm['newPassword'].value)) {
                    $labelMap['newPassword'].showInvalid('newPassword', '올바르지 않은 비밀번호 형식입니다.');
                    return;
                }

                if ($myPageForm['newPasswordCheck'].value === '') {
                    $labelMap['newPasswordCheck'].showInvalid('newPasswordCheck', '비밀번호를 한 번 더 입력해 주세요.');
                    return;
                }

                if (!isValidPassword($myPageForm['newPasswordCheck'].value.trim()) || $myPageForm['newPasswordCheck'].value !== $myPageForm['newPasswordCheck'].value) {
                    $labelMap['newPasswordCheck'].showInvalid('newPasswordCheck', '비밀번호가 일치하지 않습니다.');
                    return;
                }

                if ($myPageForm['password'].value === $myPageForm['newPassword'].value) {
                    $labelMap['newPassword'].showInvalid('newPassword', '현재 사용 중인 비밀번호는 사용 할 수 없습니다.');
                    return;
                }
            }

            if ($myPageForm['newContact'].value.trim() !== '' && !isContactVerified) {
                $labelMap['newContact'].showInvalid('newContact', '본인인증을 완료해 주세요.');
                $labelMap['newContact'].setValid(false);
                return;
            }


            if ($myPageForm['addressPostal'].value.trim() !== '' || $myPageForm['addressPrimary'].value.trim() !== '' || $myPageForm['addressSecondary'].value.trim() !== '') {
                if ($myPageForm['addressPostal'].value.trim() === '' || $myPageForm['addressPrimary'].value.trim() === '') {
                    $labelMap['address'].showInvalid('address', '주소를 모두 입력해 주세요.');
                    return;
                }
                if ($myPageForm['addressSecondary'].value.trim() === '') {
                    $labelMap['address'].showInvalid('address', '상세주소를 입력해 주세요.');
                    return;
                }
            }

            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('password', $myPageForm['password'].value)
            if ($myPageForm['newPassword'].value.length >= 0) {
                formData.append('newPassword', $myPageForm['newPassword'].value);
            }

            formData.append('contact', $myPageForm['contact'].value);
            if ($myPageForm['newContact'].value.length >= 0) {
                formData.append('newContact', $myPageForm['newContact'].value);
            }

            formData.append('addressPostal', $myPageForm['addressPostal'].value);
            formData.append('addressPrimary', $myPageForm['addressPrimary'].value);
            formData.append('addressSecondary', $myPageForm['addressSecondary'].value);

            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (xhr.status < 200 || xhr.status >= 300) {
                    dialog.showSimpleOk('개인정보 수정', `개인정보를 수정하는 도중 오류가 발생하였습니다.\n잠시 후 다시 시도해 주세요.`);
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                switch (response['result']) {
                    case 'failure_password_same':
                        dialog.showSimpleOk(
                            '개인정보 수정', '수정하고자 하는 신규 비밀번호와 현재 비밀번호가 같습니다.', () => $myPageForm['newPassword'].focus());
                        break;
                    case 'failure_session_expired':
                        dialog.showSimpleOk('개인정보 수정', `세션이 만료되었습니다. 다시 로그인해 주세요.`, () => location.href = '/user/login');
                        break;
                    case 'success' :
                        dialog.showSimpleOk('개인정보 수정', `개인정보를 성공적으로 수정하였습니다.`, () => location.reload());
                        break;
                    default:
                        dialog.showSimpleOk('개인정보 수정', '알 수 없는 이유로 개인정보를 수정하지 못하였습니다.\n잠시 후 다시 시도해 주세요.')
                }
            };
            xhr.open('PATCH', '/user/myPage/modify');
            xhr.send(formData);
        }
    }
}