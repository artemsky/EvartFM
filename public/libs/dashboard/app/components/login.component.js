"use strict";
var $ = require('jquery');
var requestOptions_service_1 = require('../services/requestOptions.service');
var notie = require('notie');
var Login;
(function (Login) {
    var LoginComponent = (function () {
        function LoginComponent() {
            this.form = $("form");
            this.button = this.form.find('button:submit');
            this.loginURL = this.form.attr('action');
            this.initEvents();
        }
        LoginComponent.prototype.initEvents = function () {
            var _this = this;
            this.form.on("submit", function (e) {
                _this.submit(e);
            });
        };
        LoginComponent.prototype.success = function (response) {
            notie.alert("success", response.message, 3);
            setTimeout(function () {
                window.location.href = response.redirectURL;
            }, 1000);
        };
        LoginComponent.prototype.fail = function (response) {
            switch (response.status) {
                case 422:
                    notie.alert("error", response.responseJSON.message, 3);
                    break;
                case 429:
                    notie.alert("error", response.responseText, 3);
            }
        };
        LoginComponent.prototype.submit = function (e) {
            e.preventDefault();
            new requestOptions_service_1.AJAX(this.loginURL)
                .setData(this.form.serialize())
                .start()
                .then(this.success, this.fail);
        };
        return LoginComponent;
    }());
    new LoginComponent();
})(Login || (Login = {}));
