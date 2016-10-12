"use strict";
require('bootstrap');
var Modal = (function () {
    function Modal(modal) {
        this.target = modal;
    }
    Modal.prototype.show = function (light) {
        if (light === void 0) { light = false; }
        if (light)
            this.target.show(200);
        else
            this.target.modal('show');
    };
    Modal.prototype.hide = function (light) {
        if (light === void 0) { light = false; }
        if (light)
            this.target.hide(200);
        else
            this.target.modal('hide');
    };
    Modal.prototype.fill = function (element, value) {
        return this.target.find(element).val(value);
    };
    Modal.prototype.reset = function () {
        this.target.find("form").get(0).reset();
    };
    Modal.prototype.on = function (event, callback) {
        this.target.on(event, callback);
    };
    return Modal;
}());
exports.Modal = Modal;
