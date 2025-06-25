import {Dialog} from "./object/dialog.js";

window.Dialog = Dialog;

HTMLElement.INVALID_ATTR_NAME = 'data-mt-invalid';
HTMLElement.VALID_ATTR_NAME = 'data-mt-valid';
HTMLElement.VISIBLE_ATTR_NAME = 'data-mt-visible';

/** @return {boolean} */
HTMLElement.prototype.isVisible = function() {
    return this.hasAttribute(HTMLElement.VISIBLE_ATTR_NAME);
}

/** @return {boolean} */
HTMLElement.prototype.isInvalid = function() {
    return this.hasAttribute(HTMLElement.INVALID_ATTR_NAME);
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