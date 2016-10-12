"use strict";
var $ = require('jquery');
var requestOptions_service_1 = require('../services/requestOptions.service');
var notie = require('notie');
var Users;
(function (Users) {
    var UserAddComponent = (function () {
        function UserAddComponent() {
            this.initEvents();
        }
        UserAddComponent.parseUser = function () {
            var userObject = new Map();
            return userObject.set('login', $("#user-login").val().trim())
                .set('role', $("#user-role").val())
                .set('name', $("#user-name").val().trim())
                .set('email', $("#user-email").val().trim())
                .set('password', $("#user-password").val())
                .set('password_confirmation', $("#user-passwordConfirmation").val());
        };
        UserAddComponent.prototype.toJSON = function (map) {
            var obj = Object.create(null);
            map.forEach(function (value, key) {
                obj[key] = value;
            });
            return obj;
        };
        UserAddComponent.prototype.initEvents = function () {
            var _this = this;
            $("#user-add").on("click", function (e) {
                new requestOptions_service_1.AJAX($(e.target).attr('data-url'))
                    .setData(_this.toJSON(UserAddComponent.parseUser()))
                    .start()
                    .then(function (success) {
                    notie.alert("success", success.msg, 2);
                    UserAddComponent.form.reset();
                }, function (error) {
                    if (error.msg)
                        notie.force("error", error.msg, 'OK');
                    else if (error.responseJSON) {
                        var message = '';
                        for (var key in error.responseJSON) {
                            message += key + " : " + error.responseJSON[key] + "<br>";
                        }
                    }
                    UserAddComponent.form.reset();
                });
            });
        };
        UserAddComponent.form = $('form').get(0);
        return UserAddComponent;
    }());
    new UserAddComponent();
})(Users || (Users = {}));
