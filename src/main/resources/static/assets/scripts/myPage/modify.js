import '../common.js';
import {
    isValidContact,
    isValidContactCode,
    isValidPassword
} from "../common.js";

/**
 * 초기화 함수. 마이페이지의 개인정보 수정 섹션이 활성화될 때 호출해야 합니다.
 * 기존 modify.js의 코드를 함수로 감쌌으며, 두 번 이상 호출되어도 이벤트
 * 바인딩을 중복해서 수행하지 않도록 상태 플래그를 사용합니다.
 */
export function initUserModify() {
    const $myPageForm = document.getElementById('myPageForm');
    if (!$myPageForm) {
        return;
    }
    // 사용자별 라벨 맵을 갱신합니다. 각 라벨은 data‑mt-name 속성으로 조회합니다.
    window.$labelMap = Array.from($myPageForm.querySelectorAll('[data-mt-object="label"]')).reduce((map, $label) => {
        map[$label.getAttribute('data-mt-name')] = $label;
        return map;
    }, {});
    // 전역 대화상자 및 로딩 엘리먼트를 준비합니다.
    window.dialog = new Dialog({
        $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
    });
    window.$loading = document.getElementById('loading');
    // 사용자 수정 관련 상태를 유지합니다.
    if (!window.userModifyState) {
        window.userModifyState = {
            verificationStartTime: null,
            verificationTimeout: 180,
            verificationTimer: null,
            resendCooldown: false,
            isContactVerified: false
        };
    } else {
        // 이전 타이머가 존재하면 정지시키고 상태를 초기화합니다.
        clearInterval(window.userModifyState.verificationTimer);
        window.userModifyState.verificationStartTime = null;
        window.userModifyState.resendCooldown = false;
        window.userModifyState.isContactVerified = false;
    }
    /**
     * 본인인증 3분 타이머를 시작합니다. 인증 시간이 만료되면 안내를 띄우고
     * 재전송 버튼과 입력 요소 상태를 초기화합니다.
     */
    function startVerificationTimer() {
        const state = window.userModifyState;
        state.verificationStartTime = Date.now();
        clearInterval(state.verificationTimer);
        state.verificationTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - state.verificationStartTime) / 1000);
            const remaining = state.verificationTimeout - elapsed;
            if (remaining <= 0) {
                clearInterval(state.verificationTimer);
                dialog.showSimpleOk('인증시간 만료', '인증시간 3분이 초과되어 인증을 다시 진행해주세요.');
                // 유효성 실패로 처리
                $labelMap['contact']?.showInvalid('contact', '인증 시간이 초과되었습니다.');
                // 버튼 상태 초기화
                const $contactCheckButton = $labelMap['newContact']?.querySelector('[data-mt-object="button"][data-mt-name="contactCheck"]');
                const $contactCodeCheck = $labelMap['newContact']?.querySelector('[data-mt-object="button"][data-mt-name="contactCodeCheck"]');
                const $contactCode = $labelMap['newContact']?.querySelector('[name="newContactCode"]');
                $contactCheckButton?.setDisabled(false);
                $contactCodeCheck?.setDisabled(true);
                $contactCode?.setDisabled(true);
            }
        }, 1000);
    }
    // 모든 라벨의 유효성 표시를 초기화합니다.
    Object.values($labelMap).forEach(($label) => {
        $label.setInvalid?.(false);
        $label.setValid?.(false);
    });
    // 입력 필드가 변경되면 경고 메시지를 제거하고 스타일을 초기화합니다.
    Object.entries($labelMap).forEach(([key, $label]) => {
        const $input = $label.querySelector('[data-mt-component="label.field"]');
        if ($input && !$input.dataset.modifyInitialized) {
            $input.oninput = () => {
                const $warning = $label.getWarning?.();
                if ($warning) {
                    $warning.innerText = '';
                    $warning.style.color = '';
                }
                $label.setInvalid?.(false);
                $label.setValid?.(false);
                $input.style.borderColor = '';
                $input.style.color = '';
            };
            // 마커를 두어 이벤트 중복 바인딩을 막습니다.
            $input.dataset.modifyInitialized = 'true';
        }
    });
    // 폼의 입력값을 초기화합니다.
    $myPageForm['password'].value = '';
    $myPageForm['newPassword'].value = '';
    $myPageForm['newPasswordCheck'].value = '';
    $myPageForm['newContact'].value = '';
    $myPageForm['newContactCode'].value = '';
    // 각 버튼과 입력 요소를 가져옵니다.
    const $contactCheckButton = $labelMap['newContact']?.querySelector('[data-mt-object="button"][data-mt-name="contactCheck"]');
    const $contactCodeCheck = $labelMap['newContact']?.querySelector('[data-mt-object="button"][data-mt-name="contactCodeCheck"]');
    const $contactCode = $labelMap['newContact']?.querySelector('[name="newContactCode"]');
    const $addressFindButton = $labelMap['address']?.querySelector('[data-mt-object="button"][name="addressFindButton"]');
    // 버튼 기본 상태를 초기화합니다.
    $contactCheckButton?.setDisabled(false);
    $contactCodeCheck?.setDisabled(true);
    $contactCode?.setDisabled(true);
    // 이벤트 바인딩을 한 번만 수행합니다.
    if (!window.userModifyInitialized) {
        // 연락처 인증 요청
        if ($contactCheckButton) {
            $contactCheckButton.onclick = () => {
                const state = window.userModifyState;
                if (state.resendCooldown) {
                    dialog.showSimpleOk('주의', '잠시후 다시 시도해 주세요.');
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
                            // 쿨타임 및 타이머 초기화
                            state.resendCooldown = true;
                            startVerificationTimer();
                            setTimeout(() => state.resendCooldown = false, 30000);
                            // SMS 발송
                            const smsXhr = new XMLHttpRequest();
                            smsXhr.open('POST', '/sms/send');
                            smsXhr.setRequestHeader('Content-Type', 'application/json');
                            smsXhr.onreadystatechange = () => {
                                if (smsXhr.readyState !== XMLHttpRequest.DONE) return;
                                if (smsXhr.status >= 200 && smsXhr.status < 300) {
                                    console.log('[SMS 전송 성공]', smsXhr.responseText);
                                } else {
                                    let errorMessage = 'SMS 전송 중 오류가 발생했습니다. 다시 시도해 주세요.';
                                    try {
                                        const smsResponse = JSON.parse(smsXhr.responseText);
                                        if (smsResponse && smsResponse.message) {
                                            errorMessage = smsResponse.message;
                                        }
                                    } catch (e) {
                                        // 파싱 실패 시 기본 메시지 유지
                                    }
                                    dialog.showSimpleOk('문자 전송 실패', '문자 전송에 실패하였습니다. 잠시 후 다시 시도해 주세요.');
                                    console.error('[SMS 전송 실패]', smsXhr.responseText);
                                }
                            };
                            smsXhr.send(JSON.stringify({ phoneNum: contact }));
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
                // 연락처 입력시 재설정 처리
                $myPageForm['newContact'].oninput = () => {
                    if ($contactCheckButton.disabled) {
                        $contactCheckButton.setDisabled(false);
                        $labelMap['newContact'].setInvalid(false);
                        $labelMap['newContact'].setValid(false);
                        // 색상 초기화
                        const $warning = $labelMap['newContact'].getWarning();
                        $warning.style.color = '';
                        const $input = $labelMap['newContact'].querySelector('[data-mt-component="label.field"]');
                        if ($input) {
                            $input.style.borderColor = '';
                        }
                        $contactCodeCheck.setDisabled(true);
                        $contactCode.setDisabled(true);
                    }
                };
            };
        }
        // 핸드폰 인증 코드 전송 버튼
        if ($contactCodeCheck) {
            $contactCodeCheck.onclick = () => {
                const contact = $myPageForm['newContact'].value.trim();
                const code = $myPageForm['newContactCode'].value.trim();
                if (code === '') {
                    $labelMap['newContact'].showInvalid('newContact', '인증번호를 입력해 주세요.');
                    $myPageForm['newContactCode'].focus();
                    return;
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
                            window.userModifyState.isContactVerified = true;
                            clearInterval(window.userModifyState.verificationTimer);
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
                xhr.send(JSON.stringify({ phoneNum: contact, code: code }));
            };
        }
        // 주소찾기 버튼 이벤트
        if ($addressFindButton) {
            $addressFindButton.onclick = () => {
                const $addressFindDialog = document.getElementById('addressFindDialog');
                const $modal = $addressFindDialog.querySelector(':scope > .modal');
                $addressFindDialog.onclick = (e) => {
                    if (e.target === $addressFindDialog) {
                        $addressFindDialog.hide();
                    }
                };
                new daum.Postcode({
                    width: '100%',
                    height: '100%',
                    oncomplete: (data) => {
                        const $postal = document.querySelector('input[name="addressPostal"]');
                        const $primary = document.querySelector('input[name="addressPrimary"]');
                        const $secondary = document.querySelector('input[name="addressSecondary"]');
                        if ($postal) $postal.value = data.zonecode;
                        if ($primary) $primary.value = data.roadAddress;
                        if ($secondary) {
                            $secondary.focus();
                            $secondary.select();
                        }
                        $myPageForm.querySelector('input[name="addressPostal"]').value = data.zonecode;
                        $myPageForm.querySelector('input[name="addressPrimary"]').value = data.roadAddress;
                        $addressFindDialog.hide();
                    }
                }).embed($modal);
                $addressFindDialog.show();
            };
        }
        // 폼 제출 이벤트
        $myPageForm.onsubmit = (e) => {
            e.preventDefault();
            // 현재 비밀번호
            if ($myPageForm['password'].value === '') {
                $labelMap['password'].showInvalid('password', '현재 사용 중인 비밀번호를 입력해 주세요.');
                return;
            }
            if (!isValidPassword($myPageForm['password'].value)) {
                $labelMap['password'].showInvalid('password', '올바르지 않은 비밀번호 형식입니다.');
                return;
            }
            // 새 비밀번호 관련 검사
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
                if (!isValidPassword($myPageForm['newPasswordCheck'].value.trim()) ||
                    $myPageForm['newPasswordCheck'].value !== $myPageForm['newPassword'].value) {
                    $labelMap['newPasswordCheck'].showInvalid('newPasswordCheck', '비밀번호가 일치하지 않습니다.');
                    return;
                }
                if ($myPageForm['password'].value === $myPageForm['newPassword'].value) {
                    $labelMap['newPassword'].showInvalid('newPassword', '현재 사용 중인 비밀번호는 사용 할 수 없습니다.');
                    return;
                }
            }
            // 연락처 인증 여부 검사
            if ($myPageForm['newContact'].value.trim() !== '' && !window.userModifyState.isContactVerified) {
                $labelMap['newContact'].showInvalid('newContact', '본인인증을 완료해 주세요.');
                $labelMap['newContact'].setValid(false);
                return;
            }
            // 주소 입력 검증
            if ($myPageForm['addressPostal'].value.trim() !== '' ||
                $myPageForm['addressPrimary'].value.trim() !== '' ||
                $myPageForm['addressSecondary'].value.trim() !== '') {
                if ($myPageForm['addressPostal'].value.trim() === '' ||
                    $myPageForm['addressPrimary'].value.trim() === '') {
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
            formData.append('password', $myPageForm['password'].value);
            // 새 비밀번호는 빈 문자열이어도 서버에서 판단하므로 length >= 0 체크
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
                            '개인정보 수정',
                            '수정하고자 하는 신규 비밀번호와 현재 비밀번호가 같습니다.',
                            () => $myPageForm['newPassword'].focus()
                        );
                        break;
                    case 'failure_session_expired':
                        dialog.showSimpleOk(
                            '개인정보 수정',
                            `세션이 만료되었습니다. 다시 로그인해 주세요.`,
                            () => location.href = '/user/login'
                        );
                        break;
                    case 'success' :
                        dialog.showSimpleOk(
                            '개인정보 수정',
                            `개인정보를 성공적으로 수정하였습니다.`,
                            () => location.reload()
                        );
                        break;
                    default:
                        dialog.showSimpleOk(
                            '개인정보 수정',
                            '알 수 없는 이유로 개인정보를 수정하지 못하였습니다.\n잠시 후 다시 시도해 주세요.'
                        );
                }
            };
            xhr.open('PATCH', '/user/myPage/modify');
            xhr.send(formData);
        };
        // 최초 한 번만 초기화되었음을 기록합니다.
        window.userModifyInitialized = true;
    }
}

// 페이지 로드 직후 userModify 섹션이 보이는 경우 자동으로 초기화를 수행합니다.
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-mt-name="userModify"][data-mt-visible]')) {
        initUserModify();
    }
});