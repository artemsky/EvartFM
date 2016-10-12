"use strict";
var $ = require('jquery');
var AJAX = (function () {
    function AJAX(url, type) {
        if (type === void 0) { type = "POST"; }
        this.requestOptions = {
            type: type,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: url
        };
    }
    AJAX.prototype.setData = function (json) {
        this.requestOptions.data = json;
        return this;
    };
    AJAX.prototype.start = function () {
        return $.when($.ajax(this.requestOptions));
    };
    return AJAX;
}());
exports.AJAX = AJAX;
