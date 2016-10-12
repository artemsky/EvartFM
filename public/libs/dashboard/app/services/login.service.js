"use strict";
var $ = require('jquery');
var Login;
(function (Login) {
    var LoginService = (function () {
        function LoginService() {
            this.button = $('button:submit');
        }
        LoginService.prototype.submit = function () {
            this.button.click(function (e) {
                e.preventDefault();
                requestOptions.data = form.serialize();
                $.ajax(url, requestOptions);
            });
        };
        return LoginService;
    }());
})(Login || (Login = {}));
