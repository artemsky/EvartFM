"use strict";
var $ = require('jquery');
require('bootstrap');
var requestOptions_service_1 = require('../services/requestOptions.service');
var modal_service_1 = require('../services/modal.service');
var notie = require('notie');
var Users;
(function (Users) {
    var UserListComponent = (function () {
        function UserListComponent() {
            this.initEvents();
        }
        UserListComponent.parseUser = function (user) {
            var userObject = new Map();
            userObject.set('id', parseInt(user.attr('data-id')));
            userObject.set('login', user.attr('data-login'));
            userObject.set('role', user.attr('data-role'));
            userObject.set('name', user.attr('data-name'));
            userObject.set('email', user.attr('data-email'));
            return userObject;
        };
        UserListComponent.prototype.updateUser = function () {
            this.user.set('name', $("#user-name").val().trim());
            this.user.set('email', $("#user-email").val().trim());
            this.user.set('role', $("#user-role").val());
        };
        UserListComponent.prototype.changePassword = function (value) {
            var _this = this;
            if (value) {
                if (value.length >= 6 || value.length <= 32) {
                    notie.input({
                        type: 'password',
                        autocorrect: "off",
                        spellcheck: false,
                        autofocus: true,
                        placeholder: "6-32 symbols length"
                    }, 'Please repeat password:', 'Change', 'Cancel', function (valueEntered) {
                        if (value !== valueEntered) {
                            notie.force("error", 'Values does not match', 'Try again', function () {
                                _this.changePassword();
                            });
                        }
                        else {
                            _this.user.set('password', valueEntered);
                            UserListComponent.modal.show(true);
                            notie.alert("success", 'Successfully changed', 1);
                        }
                    }, function () {
                        UserListComponent.modal.show(true);
                        notie.alert("info", 'Nothing changed', 1);
                    });
                }
                else {
                    notie.force("error", 'Password should be 6-32 symbols length', 'Try again', function () {
                        _this.changePassword();
                    });
                }
            }
            else {
                notie.input({
                    type: 'password',
                    autocorrect: "off",
                    spellcheck: false,
                    autofocus: true,
                    placeholder: "6-32 symbols length"
                }, 'Please enter new password:', 'Confirm', 'Cancel', function (valueEntered) {
                    _this.changePassword(valueEntered);
                }, function () {
                    UserListComponent.modal.show(true);
                    notie.alert("info", 'Nothing changed', 1);
                });
            }
        };
        UserListComponent.prototype.updateUserView = function () {
            var _this = this;
            if (!this.user)
                return;
            this.user.forEach(function (value, key) {
                _this.currentEditableElement.attr("data-" + key, value);
                _this.currentEditableElement.find(".user-" + key).text(value);
            });
            this.currentEditableElement.attr("aria-editable", 'false');
        };
        UserListComponent.prototype.toJSON = function (map) {
            var obj = Object.create(null);
            map.forEach(function (value, key) {
                obj[key] = value;
            });
            return obj;
        };
        UserListComponent.prototype.initEvents = function () {
            var _this = this;
            UserListComponent.modal.on('hide.bs.modal', function () {
                _this.updateUserView();
                _this.user = null;
            });
            UserListComponent.tableUserList.on('click', function (e) {
                _this.currentEditableElement = $(e.target).parent();
                _this.currentEditableElement.attr("aria-editable", 'true');
                _this.user = UserListComponent.parseUser(_this.currentEditableElement);
                UserListComponent.modal.reset();
                _this.user.forEach(function (value, key) {
                    UserListComponent.modal.fill("#user-" + key, value);
                });
                UserListComponent.modal.show();
            });
            $("#user-password").on("click", function () {
                UserListComponent.modal.hide(true);
                _this.changePassword();
            });
            $("#user-save").on("click", function (e) {
                _this.updateUser();
                new requestOptions_service_1.AJAX($(e.target).attr('data-url'))
                    .setData(_this.toJSON(_this.user))
                    .start()
                    .then(function (success) {
                    notie.alert("success", success.message, 2);
                    UserListComponent.modal.hide();
                }, function (error) {
                    notie.alert("error", error.message, 2);
                    UserListComponent.modal.hide();
                });
                UserListComponent.modal.hide();
            });
            $("#user-delete").on("click", function (e) {
                new requestOptions_service_1.AJAX($(e.target).attr('data-url'), "DELETE")
                    .setData({ id: _this.user.get("id") })
                    .start()
                    .then(function (success) {
                    notie.alert("warning", success.message, 2);
                    _this.currentEditableElement.remove();
                    UserListComponent.modal.hide();
                }, function (error) {
                    notie.alert("error", error.message, 2);
                    UserListComponent.modal.hide();
                });
            });
        };
        UserListComponent.tableUserList = $('.table-striped tbody tr');
        UserListComponent.modal = new modal_service_1.Modal($('#edit'));
        return UserListComponent;
    }());
    new UserListComponent();
})(Users || (Users = {}));
