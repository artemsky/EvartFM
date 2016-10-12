"use strict";
var DomHelper;
(function (DomHelper) {
    var DOM = (function () {
        function DOM(selectorOrElement) {
            if (typeof selectorOrElement !== "undefined") {
                if (selectorOrElement instanceof Element) {
                    this.elements = [selectorOrElement];
                }
                else if (typeof selectorOrElement === 'string') {
                    this.elements = this.toArray(document.querySelectorAll(selectorOrElement));
                }
                else if (typeof selectorOrElement === "object") {
                    this.elements = [this.createElement(selectorOrElement)];
                }
            }
            else {
                this.elements = [];
            }
        }
        DOM.prototype.toArray = function (elementList) {
            return Array.prototype.slice.call(elementList);
        };
        DOM.prototype.createElement = function (element) {
            return document.createElement(element);
        };
        DOM.prototype.forEach = function (callback) {
            this.elements.forEach(function (value, index) {
                callback(value, index);
            });
            return this;
        };
        DOM.prototype.append = function (html) {
            if (this.elements.length === 1) {
                this.elements[0].insertAdjacentHTML("beforeend", html);
            }
            else {
                this.elements.forEach(function (e) {
                    e.insertAdjacentHTML("beforeend", html);
                });
            }
            return this;
        };
        DOM.prototype.first = function () {
            if (this.elements.length === 1)
                return this;
            return new DOM(this.elements[0]);
        };
        DOM.prototype.html = function (html) {
            this.elements.forEach(function (element) {
                element.innerHTML = html;
            });
            return this;
        };
        DOM.prototype.attr = function (name, value) {
            if (typeof value !== "undefined") {
                this.elements.forEach(function (element) {
                    element.setAttribute(name, value.toString());
                });
            }
            else {
                return this.elements[0].getAttribute(name);
            }
            return this;
        };
        return DOM;
    }());
    DomHelper.DOM = DOM;
})(DomHelper = exports.DomHelper || (exports.DomHelper = {}));
exports.d = function (selector) {
    return new DomHelper.DOM(selector);
};
