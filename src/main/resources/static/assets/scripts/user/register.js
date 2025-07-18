import '../common.js'
import {
    isValidContact,
    isValidContactCode,
    isValidEmail,
    isValidGymName,
    isValidName,
    isValidPassword
} from "../common.js";

{
    const $registerForm = document.getElementById('registerForm');
    const $roleRadios = document.querySelectorAll('input[name="role"]');
    const gymSelect = document.getElementById('gymSelect');
    const gymInput = document.getElementById('gymInput');

    let verificationStartTime = null;
    let verificationTimeout = 180;
    let verificationTimer = null;
    let resendCooldown = false;
    let isContactVerified = false;

    // role(관장, 관원) 선택시 보여질 input
    const toggleGymFields = () => {
        const selectedRole = document.querySelector('input[name="role"]:checked')?.value;

        if (selectedRole === 'master') {
            gymSelect.setVisible(false);
            gymInput.setVisible(true);
            gymSelect.disabled = true;
            gymInput.disabled = false;

        } else if (selectedRole === 'member') {
            gymSelect.setVisible(true);
            gymInput.setVisible(false);
            gymSelect.disabled = false;
            gymInput.disabled = true;
        }
    }

    toggleGymFields();

    $roleRadios.forEach(radio => {
        radio.addEventListener('change', toggleGymFields);
    })

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

    // data-mt-name 기반으로 label 요소 맵핑
    window.$labelMap = Array.from($registerForm.querySelectorAll('[data-mt-object="label"]')).reduce((map, $label) => {
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

    $registerForm.querySelectorAll('input[name="gender"]').forEach((input) => {
        input.addEventListener('change', () => {
            $labelMap['gender'].setInvalid(false);
            $labelMap['gender'].setValid(false);
        });
    });


    ['addressPostal', 'addressPrimary', 'gymInput'].forEach(name => {
        const input = $registerForm[name];
        if (input) {
            input.addEventListener('input', () => {
                const label = $labelMap[name === 'gymInput' ? 'gymId' : 'address'];
                label.setInvalid(false);
                label.setValid(false);
            });
        }
    });

    const $beltInputs = $registerForm.querySelectorAll('input[name="belt"]');
    $beltInputs.forEach((input) => {
        input.addEventListener('change', () => {
            $labelMap['belt'].setInvalid(false);
            $labelMap['belt'].setValid(false);
        });
    });


    $registerForm['email'].value = '';
    $registerForm['email'].focus();
    $registerForm['password'].value = '';
    $registerForm['passwordCheck'].value = '';
    $registerForm['name'].value = '';
    $registerForm['birth'].value = '';
    $registerForm['gender'].value = '';
    $registerForm['contact'].value = '';
    $registerForm['contactCode'].value = '';
    $registerForm['addressPostal'].value = '';
    $registerForm['addressPrimary'].value = '';
    $registerForm['addressSecondary'].value = '';

    const $roleInputs = $registerForm.querySelectorAll('input[name="role"]');
    $roleInputs.forEach(input => input.checked = false);

    const $gymSelect = $registerForm.querySelector('select[data-mt-name="gym"]');
    if ($gymSelect) $gymSelect.value = '-1';
    $registerForm['gymInput'].value = '';

    $registerForm['lastPromotionAt'].value = '';

    // 이메일 중복확인 버튼 이벤트
    const $emailCheckButton = $labelMap['email'].querySelector('[data-mt-object="button"]');

    $emailCheckButton.addEventListener('click', () => {
        const email = $registerForm['email'].value.trim();

        if (email === '') {
            $labelMap['email'].showInvalid('email', '이메일을 입력해 주세요.');
            return;
        }

        if (!isValidEmail(email)) {
            $labelMap['email'].showInvalid('email', '올바르지 않은 이메일 형식입니다.');
            return;
        }

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', email);

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
                    $labelMap['email'].showValid('email', '사용할 수 있는 이메일입니다.');
                    $registerForm['password'].focus();
                    $emailCheckButton.setDisabled(true);
                    $registerForm['email'].addEventListener('input', () => {
                        if ($emailCheckButton.disabled) {
                            $emailCheckButton.setDisabled(false);
                            $labelMap['email'].setInvalid(false);
                            $labelMap['email'].setValid(false);

                            // 색상 초기화
                            const $warning = $labelMap['email'].getWarning();
                            $warning.style.color = ''; // 기본으로

                            const $input = $labelMap['email'].querySelector('[data-mt-component="label.field"]');
                            if ($input) {
                                $input.style.borderColor = ''; // 기본값
                            }

                            $emailCheckButton.setDisabled(false);
                        }
                    });
                    break;
                case 'failure':
                    $labelMap['email'].showInvalid('email', '이미 사용 중인 이메일입니다.');
                    break;
                default:
                    $labelMap['email'].showInvalid('email', '알 수 없는 오류가 발생했습니다.');
                    break;
            }
        };

        xhr.open('POST', '/user/check-email');
        xhr.send(formData);
    });


    // 연락처 본인인증 버튼 이벤트
    const $contactCheckButton = $labelMap['contact'].querySelector('[data-mt-object="button"][data-mt-name="contactCheck"]');
    const $contactCodeCheck = $labelMap['contact'].querySelector('[data-mt-object="button"][data-mt-name="contactCodeCheck"]');
    const $contactCode = $labelMap['contact'].querySelector('[name="contactCode"]');

    $contactCheckButton.addEventListener('click', () => {
        if (resendCooldown) { // 재전송 제한 (30초 쿨타임)
            dialog.showSimpleOk('주의', '잠시후 다시 시도해 주세요.')
            return;
        }

        const contact = $registerForm['contact'].value.trim();

        if (contact === '') {
            $labelMap['contact'].showInvalid('contact', '연락처를 입력해 주세요.');
            return;
        }

        if (!isValidContact(contact)) {
            $labelMap['contact'].showInvalid('contact', '올바르지 않은 연락처 형식입니다.');
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
                    $labelMap['contact'].showValid('contact', '입력하신 연락처로 본인인증코드를 전송했습니다.\n인증번호는 3분동안 유효합니다.');
                    $contactCheckButton.setDisabled(true);
                    $contactCodeCheck.setDisabled(false);
                    $contactCode.setDisabled(false)
                    $registerForm['contactCode'].focus();

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
                    $labelMap['contact'].showInvalid('contact', '사용 할 수 없는 연락처입니다.');
                    $labelMap['contact'].setValid(false);
                    break;
                default:
                    $labelMap['contact'].showInvalid('contact', '알 수 없는 오류가 발생했습니다.');
                    $labelMap['contact'].setValid(false);
                    break;
            }
        };

        xhr.open('POST', '/user/check-contact');
        xhr.send(formData);

        $registerForm['contact'].addEventListener('input', () => {
            if ($contactCheckButton.disabled) {
                $contactCheckButton.setDisabled(false);
                $labelMap['contact'].setInvalid(false);
                $labelMap['contact'].setValid(false);

                // 색상 초기화
                const $warning = $labelMap['contact'].getWarning();
                $warning.style.color = ''; // 기본으로

                const $input = $labelMap['contact'].querySelector('[data-mt-component="label.field"]');
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
        const contact = $registerForm['contact'].value.trim();
        const code = $registerForm['contactCode'].value.trim();

        if (code === '') {
            $labelMap['contact'].showInvalid('contact', '인증번호를 입력해 주세요.');
            $registerForm['contactCode'].focus();
        }

        if (code.length !== 6) {
            $labelMap['contact'].showInvalid('contact', '6자리 인증번호를 정확히 입력해 주세요.');
            $registerForm['contactCode'].focus();
            $labelMap['contact'].setInvalid(true);
            $labelMap['contact'].setValid(false);
            return;
        }

        if (!isValidContactCode(code)) {
            $labelMap['contact'].showInvalid('contact', '올바르지 않은 인증번호 형식입니다.');
            $registerForm['contactCode'].focus();
            $registerForm['contactCode'].select();
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
                    $labelMap['contact'].showValid('contact', '인증에 성공했습니다.');
                    $contactCodeCheck.setDisabled(true);
                    $contactCode.setDisabled(true);
                } else {
                    $labelMap['contact'].showValid('contact', '인증번호가 올바르지 않습니다.');
                    $contactCodeCheck.setDisabled(true);
                    $contactCode.setDisabled(true);
                    $registerForm['contactCode'].focus();

                }
            } else {
                $labelMap['contact'].showValid('contact', '서버 오류가 발생했습니다. 다시 시도해 주세요.');
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
            oncomplete: (date) => {
                $addressFindDialog.hide();
                $registerForm['addressPostal'].value = date['zonecode'];
                $registerForm['addressPrimary'].value = date['roadAddress'];
                $registerForm['addressSecondary'].focus();
                $registerForm['addressSecondary'].select();
            }
        }).embed($modal);
        $addressFindDialog.show();
    })

    // 돌아가기 버튼
    $registerForm['back'].addEventListener('click', () => {
        dialog.show({
            title: '경고',
            content: '정말로 회원가입을 취소 하시겠습니까?\n회원가입을 취소하실 경우 입력한 모든 내용이 유실됩니다.',
            buttons: [
                {
                    caption: '회원가입 취소',
                    onClickCallback: ($modal) => {
                        dialog.hide($modal);
                    }
                },
                {
                    caption: '계속하기',
                    color: "green",
                    onClickCallback: ($modal) => {
                        dialog.hide($modal);
                        if (history.length > 1) {
                            history.back();
                        } else {
                            location.href = '/';
                        }
                    }
                }
            ]
        })
    })

    // 회원가입 submit 이벤트
    $registerForm.onsubmit = (e) => {
        e.preventDefault();

        if (!$registerForm['emailCheck'].hasAttribute('disabled')) {
            $labelMap['email'].showInvalid('email', '이메일 중복확인을 완료해 주세요.');
            return;
        }

        if ($registerForm['password'].value === '') {
            $labelMap['password'].showInvalid('password', '비밀번호를 입력해 주세요.');
            return;
        }

        const passwordValue = $registerForm['password'].value.trim();

        if (!isValidPassword(passwordValue)) {
            $labelMap['password'].showInvalid('password', '올바르지 않은 비밀번호 형식입니다.');
            return;
        }

        if ($registerForm['passwordCheck'].value === '') {
            $labelMap['passwordCheck'].showInvalid('passwordCheck', '비밀번호를 한 번 더 입력해 주세요.');
            return;
        }

        const passwordCheckValue = $registerForm['passwordCheck'].value.trim();

        if (!isValidPassword(passwordCheckValue) || $registerForm['password'].value !== $registerForm['passwordCheck'].value) {
            $labelMap['passwordCheck'].showInvalid('passwordCheck', '비밀번호가 일치하지 않습니다.');
            return;
        }

        if ($registerForm['name'].value === '') {
            $labelMap['name'].showInvalid('name', '이름을 입력해 주세요.');
            return;
        }

        if (!isValidName($registerForm['name'].value.trim())) {
            $labelMap['name'].showInvalid('name', '올바르지 않은 이름 형식입니다.');
            return;
        }

        if ($registerForm['birth'].value === '') {
            $labelMap['birth'].showInvalid('birth', '생년월일을 입력해 주세요.');
            return;
        }

        const birthDate = new Date($registerForm['birth'].value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (birthDate > today) {
            $labelMap['birth'].showInvalid('birth', '유효하지 않은 날짜입니다.');
            return;
        }

        if ($registerForm['gender'].value === '') {
            $labelMap['birth'].showInvalid('birth', '성별을 선택해 주세요.');
            return;
        }

        if (!$contactCheckButton.hasAttribute('disabled') || !$contactCodeCheck.hasAttribute('disabled')) {
            $labelMap['contact'].showInvalid('contact', '본인인증을 완료해 주세요.');
            $labelMap['contact'].setValid(false);
            return;
        }

        if ($registerForm['addressPostal'].value === '') {
            $labelMap['address'].showInvalid('address', '주소를 입력해 주세요.');
            return;
        }

        if ($registerForm['addressSecondary'].value === '') {
            $labelMap['address'].showInvalid('address', '상세주소를 입력해 주세요.');
            return;
        }

        if ($registerForm['role'].value === '') {
            $labelMap['user_role'].showInvalid('user_role', '체육관가입을 위한 포지션을 선택해 주세요.');
            return;
        }

        if ($registerForm['role'].value.toLowerCase() === 'master') {
            if ($registerForm['gymInput'].value === '') {
                $labelMap['gymId'].showInvalid('gymId', '체육관 상호명을 입력해 주세요.');
                return;
            }

            if (!isValidGymName($registerForm['gymInput'].value.trim())) {
                $labelMap['gymId'].showInvalid('gymId', '올바르지 않은 형식입니다. 30자 이하로 입력해 주세요.');
                return;
            }
        }

        if ($registerForm['role'].value.toLowerCase() === 'member') {
            if ($registerForm['gymSelect'].value === '') {
                $labelMap['gymId'].showInvalid('gymId', '등록하려는 체육관을 선택해주세요.');
                return;
            }
        }


        if ($registerForm['belt'].value === '') {
            $labelMap['belts'].showInvalid('belts', '현재 본인의 벨트를 선택해 주세요.');
            return;
        }

        if ($registerForm['stripe'].value === '') {
            $labelMap['belts'].showInvalid('belts', '현재 본인의 그랄을 선택해 주세요.');
            return;
        }

        const promotionDate = new Date($registerForm['lastPromotionAt'].value);

        if (promotionDate > today) {
            $labelMap['belts'].showInvalid('belts', '유효하지 않은 날짜입니다.');
            return;
        }

        // 실제 제출 로직은 여기에 작성
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        formData.append('email', $registerForm['email'].value);
        formData.append('password', $registerForm['password'].value);
        formData.append('name', $registerForm['name'].value);
        formData.append('birth', $registerForm['birth'].value);
        formData.append('gender', $registerForm['gender'].value);
        formData.append('contact', $registerForm['contact'].value);
        formData.append('addressPostal', $registerForm['addressPostal'].value);
        formData.append('addressPrimary', $registerForm['addressPrimary'].value);
        formData.append('addressSecondary', $registerForm['addressSecondary'].value);
        formData.append('userRole', $registerForm['role'].value.toUpperCase());
        const selectedRole = $registerForm['role'].value;
        if (selectedRole === 'master') {
            formData.append('gymName', $registerForm['gymInput'].value);
        } else if (selectedRole === 'member') {
            formData.append('gymId', $registerForm['gymSelect'].value);
        }
        formData.append('belt', $registerForm['belt'].value);
        formData.append('stripe', $registerForm['stripe'].value);
        formData.append('lastPromotionAt', $registerForm['lastPromotionAt'].value);

        console.log("역할:", selectedRole, "전송할 gymId:", formData.get('gymId'));


        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            $loading.hide();

            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('회원가입', '요청을 처리하는 도중 오류가 발생하였습니다.\n잠시후 다시 시도해 주세요.');
                return;
            }

            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure' :
                    dialog.showSimpleOk('회원가입', `회원가입에 실패하였습니다.\n잠시 후 다시 시도해 주세요.`);
                    break;
                case 'success' :
                    dialog.showSimpleOk('회원가입', '회원가입이 완료되었습니다.\n확인을 누르시면 로그인페이지로 이동합니다.', {
                        onClickCallback: () => {
                            window.location.href = '/user/login';
                        }
                    })
                    break;
                default:
                    dialog.showSimpleOk('회원가입', `알 수 없는 이유로 회원가입에 실패하였습니다.\n잠시 후 다시 시도해 주세요.`);
            }
        };
        xhr.open('POST', '/user/register');
        xhr.send(formData);
        $loading.show();
    };
}