import {Dialog} from "./object/dialog.js";

window.Dialog = Dialog;

HTMLElement.INVALID_ATTR_NAME = 'data-mt-invalid';
HTMLElement.VALID_ATTR_NAME = 'data-mt-valid';
HTMLElement.VISIBLE_ATTR_NAME = 'data-mt-visible';
HTMLElement.VISIBLE_CLASS = '-visible';

/** @return {boolean} */
HTMLElement.prototype.isVisible = function() {
    return this.hasAttribute(HTMLElement.VISIBLE_ATTR_NAME);
}

/** @return {boolean} */
HTMLElement.prototype.isInvalid = function() {
    return this.hasAttribute(HTMLElement.INVALID_ATTR_NAME);
}

/**
 * 요소에 -visible 클래스를 추가하여 보이게 함
 * @returns {HTMLElement}*/
HTMLElement.prototype.show = function () {
    this.classList.add(HTMLElement.VISIBLE_CLASS);
    return this;
}

/**
 * 요소에서 -visible 클래스를 제거하여 숨김
 * @returns {HTMLElement} */
HTMLElement.prototype.hide = function () {
    this.classList.remove(HTMLElement.VISIBLE_CLASS);
    return this;
}

/**
 * @param {boolean} b
 * @returns {HTMLElement} */
HTMLElement.prototype.setInvalid = function (b) {
    if (b === true) {
        this.setAttribute(HTMLElement.INVALID_ATTR_NAME, '');
    } else if (b === false) {
        this.removeAttribute(HTMLElement.INVALID_ATTR_NAME);
    }
    return this;
}

/**
 * @param {boolean} b
 * @returns {HTMLElement} */
HTMLElement.prototype.setValid = function (b) {
    if (b === true) {
        this.setAttribute(HTMLElement.VALID_ATTR_NAME, '');
    } else if (b === false) {
        this.removeAttribute(HTMLElement.VALID_ATTR_NAME);
    }
    return this;
}

/**
 * @param {boolean} b
 * @return {HTMLElement} */
HTMLElement.prototype.setVisible = function(b) {
    if (b === true) {
        this.setAttribute(HTMLElement.VISIBLE_ATTR_NAME, '');
    } else if (b === false) {
        this.removeAttribute(HTMLElement.VISIBLE_ATTR_NAME);
    }
    return this;
}

/** @returns {HTMLElement} */
HTMLElement.prototype.getWarning = function () {
    return this.querySelector('[data-mt-component="label.warning"]');
}

/**
 * @param {boolean} b
 * @returns {HTMLElement} */
HTMLElement.prototype.setDisabled = function (b) {
    if (b === true) {
        this.setAttribute('disabled', '');
    } else if (b === false) {
        this.removeAttribute('disabled')
    }
    return this;
}

/**
 * 입력 유효성 오류 표시 함수
 * @param {string} labelName - data-mt-name 값
 * @param {string} message - 경고 메시지
 */
HTMLElement.prototype.showInvalid = function (labelName, message) {
    const $label = $labelMap[labelName];
    $label.setInvalid(true).getWarning().innerText = message;
    const $input = $label.querySelector('[data-mt-component="label.field"]');
    if ($input) {
        $input.focus();
        $input.select?.();
        $input.addEventListener('input', () => {
            $label.setInvalid(false);
            $label.setValid(false);
        }, { once: true });
    }
}

/**
 * 입력 유효성 오류 표시 함수
 * @param {string} labelName - data-mt-name 값
 * @param {string} message - 성공 메시지
 */
HTMLElement.prototype.showValid = function (labelName, message) {
    const $label = $labelMap[labelName];
    $label.setValid(true).getWarning().innerText = message;
    const $input = $label.querySelector('[data-mt-component="label.field"]');
    if ($input) {
        $input.addEventListener('input', () => {
            $label.setValid(false);
            $label.getWarning().innerText = '';
        }, { once: true });
    }
}


/**
 * @param {string} email
 * @returns {boolean}
 */

export function isValidEmail(email) {
    const pattern = /^(?=.{8,100}$)([\da-z\-_.]{4,})@([\da-z][\da-z\-]*[\da-z]\.)?([\da-z][\da-z\-]*[\da-z])\.([a-z]{2,15})(\.[a-z]{2,3})?$/;
    return pattern.test(email);
}

/**
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
    const pattern = /^([\da-zA-Z`~!@#$%^&*()\-=+[\]{}\\|;:'",<.>/?]{8,127})$/;
    return pattern.test(password);
}

/**
 * @param {string} name
 * @returns {boolean}
 */
export function isValidName(name) {
    const pattern = /^([\da-zA-Z가-힣]{2,5})$/;
    return pattern.test(name);
}

/**
 * @param {string} contact
 * @returns {boolean}
 */
export function isValidContact(contact) {
    const pattern = /^\d{10,11}$/;
    return pattern.test(contact);
}

/**
 * @param {string} contactCode
 * @returns {boolean}
 */
export function isValidContactCode(contactCode) {
    const pattern = /^\d{6}$/;
    return pattern.test(contactCode);
}

/**
 * @param {string} gymName
 * @returns {boolean}
 */
export function isValidGymName(gymName) {
    const pattern = /^[\da-zA-Z가-힣\s]{2,30}$/;
    return pattern.test(gymName);
}