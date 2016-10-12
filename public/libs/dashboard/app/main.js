"use strict";
var $ = require('jquery');
require('bootstrap');
var App;
(function (App) {
    if (typeof ($) !== "function")
        console.error('Load JQuery');
})(App || (App = {}));
