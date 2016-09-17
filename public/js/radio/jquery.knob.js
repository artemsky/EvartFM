/*!jQuery Knob*/
/**
 * Downward compatible, touchable dial
 *
 * Version: 1.2.0 (15/07/2012)
 * Requires: jQuery v1.7+
 *
 * Copyright (c) 2012 Anthony Terrien
 * Under MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to vor, eskimoblood, spiffistan, FabrizioC
 */
(function($) {

    /**
     * Kontrol library
     */
    "use strict";

    /**
     * Definition of globals and core
     */
    var k = {}, // kontrol
        max = Math.max,
        min = Math.min;

    k.c = {};
    k.c.d = $(document);
    k.c.t = function (e) {
        return e.originalEvent.touches.length - 1;
    };

    /**
     * Kontrol Object
     *
     * Definition of an abstract UI control
     *
     * Each concrete component must call this one.
     * <code>
     * k.o.call(this);
     * </code>
     */
    k.o = function () {
        var s = this;

        this.o = null; // array of options
        this.$ = null; // jQuery wrapped element
        this.i = null; // mixed HTMLInputElement or array of HTMLInputElement
        this.g = null; // 2D graphics context for 'pre-rendering'
        this.v = null; // value ; mixed array or integer
        this.cv = null; // change value ; not commited value
        this.x = 0; // canvas x position
        this.y = 0; // canvas y position
        this.$c = null; // jQuery canvas element
        this.c = null; // rendered canvas context
        this.t = 0; // touches index
        this.isInit = false;
        this.fgColor = null; // main color
        this.pColor = null; // previous color
        this.dH = null; // draw hook
        this.cH = null; // change hook
        this.eH = null; // cancel hook
        this.rH = null; // release hook

        this.run = function () {
            var cf = function (e, conf) {
                var k;
                for (k in conf) {
                    s.o[k] = conf[k];
                }
                s.init();
                s._configure()
                 ._draw();
            };

            if(this.$.data('kontroled')) return;
            this.$.data('kontroled', true);

            this.extend();
            this.o = $.extend(
                {
                    // Config
                    min : this.$.data('min') || 0,
                    max : this.$.data('max') || 100,
                    stopper : true,
                    readOnly : this.$.data('readonly'),

                    // UI
                    cursor : (this.$.data('cursor') === true && 30)
                                || this.$.data('cursor')
                                || 0,
                    thickness : this.$.data('thickness') || 0.35,
                    lineCap : this.$.data('linecap') || 'butt',
                    width : this.$.data('width') || 200,
                    height : this.$.data('height') || 200,
                    displayInput : this.$.data('displayinput') == null || this.$.data('displayinput'),
                    displayPrevious : this.$.data('displayprevious'),
                    fgColor : this.$.data('fgcolor') || '#87CEEB',
                    inputColor: this.$.data('inputcolor') || this.$.data('fgcolor') || '#87CEEB',
                    inline : false,
                    step : this.$.data('step') || 1,

                    // Hooks
                    draw : null, // function () {}
                    change : null, // function (value) {}
                    cancel : null, // function () {}
                    release : null // function (value) {}
                }, this.o
            );

            // routing value
            if(this.$.is('fieldset')) {

                // fieldset = array of integer
                this.v = {};
                this.i = this.$.find('input')
                this.i.each(function(k) {
                    var $this = $(this);
                    s.i[k] = $this;
                    s.v[k] = $this.val();

                    $this.bind(
                        'change'
                        , function () {
                            var val = {};
                            val[k] = $this.val();
                            s.val(val);
                        }
                    );
                });
                this.$.find('legend').remove();

            } else {
                // input = integer
                this.i = this.$;
                this.v = this.$.val();
                (this.v == '') && (this.v = this.o.min);

                this.$.bind(
                    'change'
                    , function () {
                        s.val(s._validate(s.$.val()));
                    }
                );
            }

            (!this.o.displayInput) && this.$.hide();

            this.$c = $('<canvas width="' +
                            this.o.width + 'px" height="' +
                            this.o.height + 'px"></canvas>');
            this.c = this.$c[0].getContext("2d");

            this.$
                .wrap($('<div style="' + (this.o.inline ? 'display:inline;' : '') +
                        'width:' + this.o.width + 'px;height:' +
                        this.o.height + 'px;"></div>'))
                .before(this.$c);

            if (this.v instanceof Object) {
                this.cv = {};
                this.copy(this.v, this.cv);
            } else {
                this.cv = this.v;
            }

            this.$
                .bind("configure", cf)
                .parent()
                .bind("configure", cf);

            this._listen()
                ._configure()
                ._xy()
                .init();

            this.isInit = true;

            this._draw();

            return this;
        };

        this._draw = function () {

            // canvas pre-rendering
            var d = true,
                c = document.createElement('canvas');

            c.width = s.o.width;
            c.height = s.o.height;
            s.g = c.getContext('2d');

            s.clear();

            s.dH
            && (d = s.dH());

            (d !== false) && s.draw();

            s.c.drawImage(c, 0, 0);
            c = null;
        };

        this._touch = function (e) {

            var touchMove = function (e) {

                var v = s.xy2val(
                            e.originalEvent.touches[s.t].pageX,
                            e.originalEvent.touches[s.t].pageY
                            );

                if (v == s.cv) return;

                if (
                    s.cH
                    && (s.cH(v) === false)
                ) return;


                s.change(s._validate(v));
                s._draw();
            };

            // get touches index
            this.t = k.c.t(e);

            // First touch
            touchMove(e);

            // Touch events listeners
            k.c.d
                .bind("touchmove.k", touchMove)
                .bind(
                    "touchend.k"
                    , function () {
                        k.c.d.unbind('touchmove.k touchend.k');

                        if (
                            s.rH
                            && (s.rH(s.cv) === false)
                        ) return;

                        s.val(s.cv);
                    }
                );

            return this;
        };

        this._mouse = function (e) {

            var mouseMove = function (e) {
                var v = s.xy2val(e.pageX, e.pageY);
                if (v == s.cv) return;

                if (
                    s.cH
                    && (s.cH(v) === false)
                ) return;

                s.change(s._validate(v));
                s._draw();
            };

            // First click
            mouseMove(e);

            // Mouse events listeners
            k.c.d
                .bind("mousemove.k", mouseMove)
                .bind(
                    // Escape key cancel current change
                    "keyup.k"
                    , function (e) {
                        if (e.keyCode === 27) {
                            k.c.d.unbind("mouseup.k mousemove.k keyup.k");

                            if (
                                s.eH
                                && (s.eH() === false)
                            ) return;

                            s.cancel();
                        }
                    }
                )
                .bind(
                    "mouseup.k"
                    , function (e) {
                        k.c.d.unbind('mousemove.k mouseup.k keyup.k');

                        if (
                            s.rH
                            && (s.rH(s.cv) === false)
                        ) return;

                        s.val(s.cv);
                    }
                );

            return this;
        };

        this._xy = function () {
            var o = this.$c.offset();
            this.x = o.left;
            this.y = o.top;
            return this;
        };

        this._listen = function () {

            if (!this.o.readOnly) {
                this.$c
                    .bind(
                        "mousedown"
                        , function (e) {
                            e.preventDefault();
                            s._xy()._mouse(e);
                         }
                    )
                    .bind(
                        "touchstart"
                        , function (e) {
                            e.preventDefault();
                            s._xy()._touch(e);
                         }
                    );
                this.listen();
            } else {
                this.$.attr('readonly', 'readonly');
            }

            return this;
        };

        this._configure = function () {

            // Hooks
            if (this.o.draw) this.dH = this.o.draw;
            if (this.o.change) this.cH = this.o.change;
            if (this.o.cancel) this.eH = this.o.cancel;
            if (this.o.release) this.rH = this.o.release;

            if (this.o.displayPrevious) {
                this.pColor = this.h2rgba(this.o.fgColor, "0.4");
                this.fgColor = this.h2rgba(this.o.fgColor, "0.6");
            } else {
                this.fgColor = this.o.fgColor;
            }

            return this;
        };

        this._clear = function () {
            this.$c[0].width = this.$c[0].width;
        };

        this._validate = function(v) {
            return (~~ (((v < 0) ? -0.5 : 0.5) + (v/this.o.step))) * this.o.step;
        };

        // Abstract methods
        this.listen = function () {}; // on start, one time
        this.extend = function () {}; // each time configure triggered
        this.init = function () {}; // each time configure triggered
        this.change = function (v) {}; // on change
        this.val = function (v) {}; // on release
        this.xy2val = function (x, y) {}; //
        this.draw = function () {}; // on change / on release
        this.clear = function () { this._clear(); };

        // Utils
        this.h2rgba = function (h, a) {
            var rgb;
            h = h.substring(1,7)
            rgb = [parseInt(h.substring(0,2),16)
                   ,parseInt(h.substring(2,4),16)
                   ,parseInt(h.substring(4,6),16)];
            return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
        };

        this.copy = function (f, t) {
            for (var i in f) { t[i] = f[i]; }
        };
    };


    /**
     * k.Dial
     */
    k.Dial = function () {
        k.o.call(this);

        this.startAngle = null;
        this.xy = null;
        this.radius = null;
        this.lineWidth = null;
        this.cursorExt = null;
        this.w2 = null;
        this.PI2 = 2*Math.PI;

        this.extend = function () {
            this.o = $.extend(
                {
                    bgColor : this.$.data('bgcolor') || '#EEEEEE',
                    angleOffset : this.$.data('angleoffset') || 0,
                    angleArc : this.$.data('anglearc') || 360,
                    inline : true
                }, this.o
            );
        };

        this.val = function (v) {
            if (null != v) {
                this.cv = this.o.stopper ? max(min(v, this.o.max), this.o.min) : v;
                this.v = this.cv;
                this.$.val(this.v);
                this._draw();
            } else {
                return this.v;
            }
        };

        this.xy2val = function (x, y) {
            var a, ret;

            a = Math.atan2(
                        x - (this.x + this.w2)
                        , - (y - this.y - this.w2)
                    ) - this.angleOffset;

            if(this.angleArc != this.PI2 && (a < 0) && (a > -0.5)) {
                // if isset angleArc option, set to min if .5 under min
                a = 0;
            } else if (a < 0) {
                a += this.PI2;
            }

            ret = ~~ (0.5 + (a * (this.o.max - this.o.min) / this.angleArc))
                    + this.o.min;

            this.o.stopper
            && (ret = max(min(ret, this.o.max), this.o.min));

            return ret;
        };

        this.listen = function () {
            // bind MouseWheel
            var s = this,
                mw = function (e) {
                            e.preventDefault();
                            var ori = e.originalEvent
                                ,deltaX = ori.detail || ori.wheelDeltaX
                                ,deltaY = ori.detail || ori.wheelDeltaY
                                ,v = parseInt(s.$.val()) + (deltaX>0 || deltaY>0 ? s.o.step : deltaX<0 || deltaY<0 ? -s.o.step : 0);

                            if (
                                s.cH
                                && (s.cH(v) === false)
                            ) return;

                            s.val(v);
                        }
                , kval, to, m = 1, kv = {37:-s.o.step, 38:s.o.step, 39:s.o.step, 40:-s.o.step};

            this.$
                .bind(
                    "keydown"
                    ,function (e) {
                        var kc = e.keyCode;

                        // numpad support
                        if(kc >= 96 && kc <= 105) {
                            kc = e.keyCode = kc - 48;
                        }

                        kval = parseInt(String.fromCharCode(kc));

                        if (isNaN(kval)) {

                            (kc !== 13)         // enter
                            && (kc !== 8)       // bs
                            && (kc !== 9)       // tab
                            && (kc !== 189)     // -
                            && e.preventDefault();

                            // arrows
                            if ($.inArray(kc,[37,38,39,40]) > -1) {
                                e.preventDefault();

                                var v = parseInt(s.$.val()) + kv[kc] * m;

                                s.o.stopper
                                && (v = max(min(v, s.o.max), s.o.min));

                                s.change(v);
                                s._draw();

                                // long time keydown speed-up
                                to = window.setTimeout(
                                    function () { m*=2; }
                                    ,30
                                );
                            }
                        }
                    }
                )
                .bind(
                    "keyup"
                    ,function (e) {
                        if (isNaN(kval)) {
                            if (to) {
                                window.clearTimeout(to);
                                to = null;
                                m = 1;
                                s.val(s.$.val());
                            }
                        } else {
                            // kval postcond
                            (s.$.val() > s.o.max && s.$.val(s.o.max))
                            || (s.$.val() < s.o.min && s.$.val(s.o.min));
                        }

                    }
                );

            this.$c.bind("mousewheel DOMMouseScroll", mw);
            this.$.bind("mousewheel DOMMouseScroll", mw)
        };

        this.init = function () {

            if (
                this.v < this.o.min
                || this.v > this.o.max
            ) this.v = this.o.min;

            this.$.val(this.v);
            this.w2 = this.o.width / 2;
            this.cursorExt = this.o.cursor / 100;
            this.xy = this.w2;
            this.lineWidth = this.xy * this.o.thickness;
            this.lineCap = this.o.lineCap;
            this.radius = this.xy - this.lineWidth / 2;

            this.o.angleOffset
            && (this.o.angleOffset = isNaN(this.o.angleOffset) ? 0 : this.o.angleOffset);

            this.o.angleArc
            && (this.o.angleArc = isNaN(this.o.angleArc) ? this.PI2 : this.o.angleArc);

            // deg to rad
            this.angleOffset = this.o.angleOffset * Math.PI / 180;
            this.angleArc = this.o.angleArc * Math.PI / 180;

            // compute start and end angles
            this.startAngle = 1.5 * Math.PI + this.angleOffset;
            this.endAngle = 1.5 * Math.PI + this.angleOffset + this.angleArc;

            var s = max(
                            String(Math.abs(this.o.max)).length
                            , String(Math.abs(this.o.min)).length
                            , 2
                            ) + 2;

            this.o.displayInput
                && this.i.css({
                        'width' : ((this.o.width / 2 + 4) >> 0) + 'px'
                        ,'height' : ((this.o.width / 3) >> 0) + 'px'
                        ,'position' : 'absolute'
                        ,'vertical-align' : 'middle'
                        ,'margin-top' : ((this.o.width / 3) >> 0) + 'px'
                        ,'margin-left' : '-' + ((this.o.width * 3 / 4 + 2) >> 0) + 'px'
                        ,'border' : 0
                        ,'background' : 'none'
                        ,'font' : 'bold ' + ((this.o.width / s) >> 0) + 'px Arial'
                        ,'text-align' : 'center'
                        ,'color' : this.o.inputColor || this.o.fgColor
                        ,'padding' : '0px'
                        ,'-webkit-appearance': 'none'
                        })
                || this.i.css({
                        'width' : '0px'
                        ,'visibility' : 'hidden'
                        });
        };

        this.change = function (v) {
            this.cv = v;
            this.$.val(v);
        };

        this.angle = function (v) {
            return (v - this.o.min) * this.angleArc / (this.o.max - this.o.min);
        };

        this.draw = function () {

            var c = this.g,                 // context
                a = this.angle(this.cv)    // Angle
                , sat = this.startAngle     // Start angle
                , eat = sat + a             // End angle
                , sa, ea                    // Previous angles
                , r = 1;

            c.lineWidth = this.lineWidth;

            c.lineCap = this.lineCap;

            this.o.cursor
                && (sat = eat - this.cursorExt)
                && (eat = eat + this.cursorExt);

            c.beginPath();
                c.strokeStyle = this.o.bgColor;
                c.arc(this.xy, this.xy, this.radius, this.endAngle, this.startAngle, true);
            c.stroke();

            if (this.o.displayPrevious) {
                ea = this.startAngle + this.angle(this.v);
                sa = this.startAngle;
                this.o.cursor
                    && (sa = ea - this.cursorExt)
                    && (ea = ea + this.cursorExt);

                c.beginPath();
                    c.strokeStyle = this.pColor;
                    c.arc(this.xy, this.xy, this.radius, sa, ea, false);
                c.stroke();
                r = (this.cv == this.v);
            }

            c.beginPath();
                c.strokeStyle = r ? this.o.fgColor : this.fgColor ;
                c.arc(this.xy, this.xy, this.radius, sat, eat, false);
            c.stroke();
        };

        this.cancel = function () {
            this.val(this.v);
        };
    };

    $.fn.dial = $.fn.knob = function (o) {
        return this.each(
            function () {
                var d = new k.Dial();
                d.o = o;
                d.$ = $(this);
                d.run();
            }
        ).parent();
    };

})(jQuery);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby9qcXVlcnkua25vYi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFqUXVlcnkgS25vYiovXG4vKipcbiAqIERvd253YXJkIGNvbXBhdGlibGUsIHRvdWNoYWJsZSBkaWFsXG4gKlxuICogVmVyc2lvbjogMS4yLjAgKDE1LzA3LzIwMTIpXG4gKiBSZXF1aXJlczogalF1ZXJ5IHYxLjcrXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyIEFudGhvbnkgVGVycmllblxuICogVW5kZXIgTUlUIGFuZCBHUEwgbGljZW5zZXM6XG4gKiAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqICBodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvZ3BsLmh0bWxcbiAqXG4gKiBUaGFua3MgdG8gdm9yLCBlc2tpbW9ibG9vZCwgc3BpZmZpc3RhbiwgRmFicml6aW9DXG4gKi9cbihmdW5jdGlvbigkKSB7XG5cbiAgICAvKipcbiAgICAgKiBLb250cm9sIGxpYnJhcnlcbiAgICAgKi9cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8qKlxuICAgICAqIERlZmluaXRpb24gb2YgZ2xvYmFscyBhbmQgY29yZVxuICAgICAqL1xuICAgIHZhciBrID0ge30sIC8vIGtvbnRyb2xcbiAgICAgICAgbWF4ID0gTWF0aC5tYXgsXG4gICAgICAgIG1pbiA9IE1hdGgubWluO1xuXG4gICAgay5jID0ge307XG4gICAgay5jLmQgPSAkKGRvY3VtZW50KTtcbiAgICBrLmMudCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBlLm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGggLSAxO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBLb250cm9sIE9iamVjdFxuICAgICAqXG4gICAgICogRGVmaW5pdGlvbiBvZiBhbiBhYnN0cmFjdCBVSSBjb250cm9sXG4gICAgICpcbiAgICAgKiBFYWNoIGNvbmNyZXRlIGNvbXBvbmVudCBtdXN0IGNhbGwgdGhpcyBvbmUuXG4gICAgICogPGNvZGU+XG4gICAgICogay5vLmNhbGwodGhpcyk7XG4gICAgICogPC9jb2RlPlxuICAgICAqL1xuICAgIGsubyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMubyA9IG51bGw7IC8vIGFycmF5IG9mIG9wdGlvbnNcbiAgICAgICAgdGhpcy4kID0gbnVsbDsgLy8galF1ZXJ5IHdyYXBwZWQgZWxlbWVudFxuICAgICAgICB0aGlzLmkgPSBudWxsOyAvLyBtaXhlZCBIVE1MSW5wdXRFbGVtZW50IG9yIGFycmF5IG9mIEhUTUxJbnB1dEVsZW1lbnRcbiAgICAgICAgdGhpcy5nID0gbnVsbDsgLy8gMkQgZ3JhcGhpY3MgY29udGV4dCBmb3IgJ3ByZS1yZW5kZXJpbmcnXG4gICAgICAgIHRoaXMudiA9IG51bGw7IC8vIHZhbHVlIDsgbWl4ZWQgYXJyYXkgb3IgaW50ZWdlclxuICAgICAgICB0aGlzLmN2ID0gbnVsbDsgLy8gY2hhbmdlIHZhbHVlIDsgbm90IGNvbW1pdGVkIHZhbHVlXG4gICAgICAgIHRoaXMueCA9IDA7IC8vIGNhbnZhcyB4IHBvc2l0aW9uXG4gICAgICAgIHRoaXMueSA9IDA7IC8vIGNhbnZhcyB5IHBvc2l0aW9uXG4gICAgICAgIHRoaXMuJGMgPSBudWxsOyAvLyBqUXVlcnkgY2FudmFzIGVsZW1lbnRcbiAgICAgICAgdGhpcy5jID0gbnVsbDsgLy8gcmVuZGVyZWQgY2FudmFzIGNvbnRleHRcbiAgICAgICAgdGhpcy50ID0gMDsgLy8gdG91Y2hlcyBpbmRleFxuICAgICAgICB0aGlzLmlzSW5pdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmZnQ29sb3IgPSBudWxsOyAvLyBtYWluIGNvbG9yXG4gICAgICAgIHRoaXMucENvbG9yID0gbnVsbDsgLy8gcHJldmlvdXMgY29sb3JcbiAgICAgICAgdGhpcy5kSCA9IG51bGw7IC8vIGRyYXcgaG9va1xuICAgICAgICB0aGlzLmNIID0gbnVsbDsgLy8gY2hhbmdlIGhvb2tcbiAgICAgICAgdGhpcy5lSCA9IG51bGw7IC8vIGNhbmNlbCBob29rXG4gICAgICAgIHRoaXMuckggPSBudWxsOyAvLyByZWxlYXNlIGhvb2tcblxuICAgICAgICB0aGlzLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjZiA9IGZ1bmN0aW9uIChlLCBjb25mKSB7XG4gICAgICAgICAgICAgICAgdmFyIGs7XG4gICAgICAgICAgICAgICAgZm9yIChrIGluIGNvbmYpIHtcbiAgICAgICAgICAgICAgICAgICAgcy5vW2tdID0gY29uZltrXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcy5pbml0KCk7XG4gICAgICAgICAgICAgICAgcy5fY29uZmlndXJlKClcbiAgICAgICAgICAgICAgICAgLl9kcmF3KCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZih0aGlzLiQuZGF0YSgna29udHJvbGVkJykpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuJC5kYXRhKCdrb250cm9sZWQnLCB0cnVlKTtcblxuICAgICAgICAgICAgdGhpcy5leHRlbmQoKTtcbiAgICAgICAgICAgIHRoaXMubyA9ICQuZXh0ZW5kKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29uZmlnXG4gICAgICAgICAgICAgICAgICAgIG1pbiA6IHRoaXMuJC5kYXRhKCdtaW4nKSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBtYXggOiB0aGlzLiQuZGF0YSgnbWF4JykgfHwgMTAwLFxuICAgICAgICAgICAgICAgICAgICBzdG9wcGVyIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHkgOiB0aGlzLiQuZGF0YSgncmVhZG9ubHknKSxcblxuICAgICAgICAgICAgICAgICAgICAvLyBVSVxuICAgICAgICAgICAgICAgICAgICBjdXJzb3IgOiAodGhpcy4kLmRhdGEoJ2N1cnNvcicpID09PSB0cnVlICYmIDMwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB0aGlzLiQuZGF0YSgnY3Vyc29yJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgdGhpY2tuZXNzIDogdGhpcy4kLmRhdGEoJ3RoaWNrbmVzcycpIHx8IDAuMzUsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVDYXAgOiB0aGlzLiQuZGF0YSgnbGluZWNhcCcpIHx8ICdidXR0JyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggOiB0aGlzLiQuZGF0YSgnd2lkdGgnKSB8fCAyMDAsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuJC5kYXRhKCdoZWlnaHQnKSB8fCAyMDAsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlJbnB1dCA6IHRoaXMuJC5kYXRhKCdkaXNwbGF5aW5wdXQnKSA9PSBudWxsIHx8IHRoaXMuJC5kYXRhKCdkaXNwbGF5aW5wdXQnKSxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheVByZXZpb3VzIDogdGhpcy4kLmRhdGEoJ2Rpc3BsYXlwcmV2aW91cycpLFxuICAgICAgICAgICAgICAgICAgICBmZ0NvbG9yIDogdGhpcy4kLmRhdGEoJ2ZnY29sb3InKSB8fCAnIzg3Q0VFQicsXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Q29sb3I6IHRoaXMuJC5kYXRhKCdpbnB1dGNvbG9yJykgfHwgdGhpcy4kLmRhdGEoJ2ZnY29sb3InKSB8fCAnIzg3Q0VFQicsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZSA6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzdGVwIDogdGhpcy4kLmRhdGEoJ3N0ZXAnKSB8fCAxLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEhvb2tzXG4gICAgICAgICAgICAgICAgICAgIGRyYXcgOiBudWxsLCAvLyBmdW5jdGlvbiAoKSB7fVxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2UgOiBudWxsLCAvLyBmdW5jdGlvbiAodmFsdWUpIHt9XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbCA6IG51bGwsIC8vIGZ1bmN0aW9uICgpIHt9XG4gICAgICAgICAgICAgICAgICAgIHJlbGVhc2UgOiBudWxsIC8vIGZ1bmN0aW9uICh2YWx1ZSkge31cbiAgICAgICAgICAgICAgICB9LCB0aGlzLm9cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIHJvdXRpbmcgdmFsdWVcbiAgICAgICAgICAgIGlmKHRoaXMuJC5pcygnZmllbGRzZXQnKSkge1xuXG4gICAgICAgICAgICAgICAgLy8gZmllbGRzZXQgPSBhcnJheSBvZiBpbnRlZ2VyXG4gICAgICAgICAgICAgICAgdGhpcy52ID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5pID0gdGhpcy4kLmZpbmQoJ2lucHV0JylcbiAgICAgICAgICAgICAgICB0aGlzLmkuZWFjaChmdW5jdGlvbihrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHMuaVtrXSA9ICR0aGlzO1xuICAgICAgICAgICAgICAgICAgICBzLnZba10gPSAkdGhpcy52YWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5iaW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2NoYW5nZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWwgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxba10gPSAkdGhpcy52YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLnZhbCh2YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuJC5maW5kKCdsZWdlbmQnKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpbnB1dCA9IGludGVnZXJcbiAgICAgICAgICAgICAgICB0aGlzLmkgPSB0aGlzLiQ7XG4gICAgICAgICAgICAgICAgdGhpcy52ID0gdGhpcy4kLnZhbCgpO1xuICAgICAgICAgICAgICAgICh0aGlzLnYgPT0gJycpICYmICh0aGlzLnYgPSB0aGlzLm8ubWluKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuJC5iaW5kKFxuICAgICAgICAgICAgICAgICAgICAnY2hhbmdlJ1xuICAgICAgICAgICAgICAgICAgICAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMudmFsKHMuX3ZhbGlkYXRlKHMuJC52YWwoKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgKCF0aGlzLm8uZGlzcGxheUlucHV0KSAmJiB0aGlzLiQuaGlkZSgpO1xuXG4gICAgICAgICAgICB0aGlzLiRjID0gJCgnPGNhbnZhcyB3aWR0aD1cIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuby53aWR0aCArICdweFwiIGhlaWdodD1cIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuby5oZWlnaHQgKyAncHhcIj48L2NhbnZhcz4nKTtcbiAgICAgICAgICAgIHRoaXMuYyA9IHRoaXMuJGNbMF0uZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gICAgICAgICAgICB0aGlzLiRcbiAgICAgICAgICAgICAgICAud3JhcCgkKCc8ZGl2IHN0eWxlPVwiJyArICh0aGlzLm8uaW5saW5lID8gJ2Rpc3BsYXk6aW5saW5lOycgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3dpZHRoOicgKyB0aGlzLm8ud2lkdGggKyAncHg7aGVpZ2h0OicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vLmhlaWdodCArICdweDtcIj48L2Rpdj4nKSlcbiAgICAgICAgICAgICAgICAuYmVmb3JlKHRoaXMuJGMpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy52IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdiA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuY29weSh0aGlzLnYsIHRoaXMuY3YpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN2ID0gdGhpcy52O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRcbiAgICAgICAgICAgICAgICAuYmluZChcImNvbmZpZ3VyZVwiLCBjZilcbiAgICAgICAgICAgICAgICAucGFyZW50KClcbiAgICAgICAgICAgICAgICAuYmluZChcImNvbmZpZ3VyZVwiLCBjZik7XG5cbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbigpXG4gICAgICAgICAgICAgICAgLl9jb25maWd1cmUoKVxuICAgICAgICAgICAgICAgIC5feHkoKVxuICAgICAgICAgICAgICAgIC5pbml0KCk7XG5cbiAgICAgICAgICAgIHRoaXMuaXNJbml0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9kcmF3ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvLyBjYW52YXMgcHJlLXJlbmRlcmluZ1xuICAgICAgICAgICAgdmFyIGQgPSB0cnVlLFxuICAgICAgICAgICAgICAgIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblxuICAgICAgICAgICAgYy53aWR0aCA9IHMuby53aWR0aDtcbiAgICAgICAgICAgIGMuaGVpZ2h0ID0gcy5vLmhlaWdodDtcbiAgICAgICAgICAgIHMuZyA9IGMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgcy5jbGVhcigpO1xuXG4gICAgICAgICAgICBzLmRIXG4gICAgICAgICAgICAmJiAoZCA9IHMuZEgoKSk7XG5cbiAgICAgICAgICAgIChkICE9PSBmYWxzZSkgJiYgcy5kcmF3KCk7XG5cbiAgICAgICAgICAgIHMuYy5kcmF3SW1hZ2UoYywgMCwgMCk7XG4gICAgICAgICAgICBjID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl90b3VjaCA9IGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICAgIHZhciB0b3VjaE1vdmUgPSBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHYgPSBzLnh5MnZhbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLm9yaWdpbmFsRXZlbnQudG91Y2hlc1tzLnRdLnBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUub3JpZ2luYWxFdmVudC50b3VjaGVzW3MudF0ucGFnZVlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgaWYgKHYgPT0gcy5jdikgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBzLmNIXG4gICAgICAgICAgICAgICAgICAgICYmIChzLmNIKHYpID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICApIHJldHVybjtcblxuXG4gICAgICAgICAgICAgICAgcy5jaGFuZ2Uocy5fdmFsaWRhdGUodikpO1xuICAgICAgICAgICAgICAgIHMuX2RyYXcoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGdldCB0b3VjaGVzIGluZGV4XG4gICAgICAgICAgICB0aGlzLnQgPSBrLmMudChlKTtcblxuICAgICAgICAgICAgLy8gRmlyc3QgdG91Y2hcbiAgICAgICAgICAgIHRvdWNoTW92ZShlKTtcblxuICAgICAgICAgICAgLy8gVG91Y2ggZXZlbnRzIGxpc3RlbmVyc1xuICAgICAgICAgICAgay5jLmRcbiAgICAgICAgICAgICAgICAuYmluZChcInRvdWNobW92ZS5rXCIsIHRvdWNoTW92ZSlcbiAgICAgICAgICAgICAgICAuYmluZChcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaGVuZC5rXCJcbiAgICAgICAgICAgICAgICAgICAgLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrLmMuZC51bmJpbmQoJ3RvdWNobW92ZS5rIHRvdWNoZW5kLmsnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMuckhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAocy5ySChzLmN2KSA9PT0gZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICApIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcy52YWwocy5jdik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9tb3VzZSA9IGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICAgIHZhciBtb3VzZU1vdmUgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciB2ID0gcy54eTJ2YWwoZS5wYWdlWCwgZS5wYWdlWSk7XG4gICAgICAgICAgICAgICAgaWYgKHYgPT0gcy5jdikgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBzLmNIXG4gICAgICAgICAgICAgICAgICAgICYmIChzLmNIKHYpID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICApIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHMuY2hhbmdlKHMuX3ZhbGlkYXRlKHYpKTtcbiAgICAgICAgICAgICAgICBzLl9kcmF3KCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBGaXJzdCBjbGlja1xuICAgICAgICAgICAgbW91c2VNb3ZlKGUpO1xuXG4gICAgICAgICAgICAvLyBNb3VzZSBldmVudHMgbGlzdGVuZXJzXG4gICAgICAgICAgICBrLmMuZFxuICAgICAgICAgICAgICAgIC5iaW5kKFwibW91c2Vtb3ZlLmtcIiwgbW91c2VNb3ZlKVxuICAgICAgICAgICAgICAgIC5iaW5kKFxuICAgICAgICAgICAgICAgICAgICAvLyBFc2NhcGUga2V5IGNhbmNlbCBjdXJyZW50IGNoYW5nZVxuICAgICAgICAgICAgICAgICAgICBcImtleXVwLmtcIlxuICAgICAgICAgICAgICAgICAgICAsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAyNykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGsuYy5kLnVuYmluZChcIm1vdXNldXAuayBtb3VzZW1vdmUuayBrZXl1cC5rXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLmVIXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIChzLmVIKCkgPT09IGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuYmluZChcbiAgICAgICAgICAgICAgICAgICAgXCJtb3VzZXVwLmtcIlxuICAgICAgICAgICAgICAgICAgICAsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrLmMuZC51bmJpbmQoJ21vdXNlbW92ZS5rIG1vdXNldXAuayBrZXl1cC5rJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLnJIXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKHMuckgocy5jdikgPT09IGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHMudmFsKHMuY3YpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5feHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbyA9IHRoaXMuJGMub2Zmc2V0KCk7XG4gICAgICAgICAgICB0aGlzLnggPSBvLmxlZnQ7XG4gICAgICAgICAgICB0aGlzLnkgPSBvLnRvcDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbiA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLm8ucmVhZE9ubHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRjXG4gICAgICAgICAgICAgICAgICAgIC5iaW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJtb3VzZWRvd25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLl94eSgpLl9tb3VzZShlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLmJpbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvdWNoc3RhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLl94eSgpLl90b3VjaChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5saXN0ZW4oKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kLmF0dHIoJ3JlYWRvbmx5JywgJ3JlYWRvbmx5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2NvbmZpZ3VyZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgLy8gSG9va3NcbiAgICAgICAgICAgIGlmICh0aGlzLm8uZHJhdykgdGhpcy5kSCA9IHRoaXMuby5kcmF3O1xuICAgICAgICAgICAgaWYgKHRoaXMuby5jaGFuZ2UpIHRoaXMuY0ggPSB0aGlzLm8uY2hhbmdlO1xuICAgICAgICAgICAgaWYgKHRoaXMuby5jYW5jZWwpIHRoaXMuZUggPSB0aGlzLm8uY2FuY2VsO1xuICAgICAgICAgICAgaWYgKHRoaXMuby5yZWxlYXNlKSB0aGlzLnJIID0gdGhpcy5vLnJlbGVhc2U7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm8uZGlzcGxheVByZXZpb3VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wQ29sb3IgPSB0aGlzLmgycmdiYSh0aGlzLm8uZmdDb2xvciwgXCIwLjRcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5mZ0NvbG9yID0gdGhpcy5oMnJnYmEodGhpcy5vLmZnQ29sb3IsIFwiMC42XCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZnQ29sb3IgPSB0aGlzLm8uZmdDb2xvcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRjWzBdLndpZHRoID0gdGhpcy4kY1swXS53aWR0aDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl92YWxpZGF0ZSA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgIHJldHVybiAofn4gKCgodiA8IDApID8gLTAuNSA6IDAuNSkgKyAodi90aGlzLm8uc3RlcCkpKSAqIHRoaXMuby5zdGVwO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFic3RyYWN0IG1ldGhvZHNcbiAgICAgICAgdGhpcy5saXN0ZW4gPSBmdW5jdGlvbiAoKSB7fTsgLy8gb24gc3RhcnQsIG9uZSB0aW1lXG4gICAgICAgIHRoaXMuZXh0ZW5kID0gZnVuY3Rpb24gKCkge307IC8vIGVhY2ggdGltZSBjb25maWd1cmUgdHJpZ2dlcmVkXG4gICAgICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uICgpIHt9OyAvLyBlYWNoIHRpbWUgY29uZmlndXJlIHRyaWdnZXJlZFxuICAgICAgICB0aGlzLmNoYW5nZSA9IGZ1bmN0aW9uICh2KSB7fTsgLy8gb24gY2hhbmdlXG4gICAgICAgIHRoaXMudmFsID0gZnVuY3Rpb24gKHYpIHt9OyAvLyBvbiByZWxlYXNlXG4gICAgICAgIHRoaXMueHkydmFsID0gZnVuY3Rpb24gKHgsIHkpIHt9OyAvL1xuICAgICAgICB0aGlzLmRyYXcgPSBmdW5jdGlvbiAoKSB7fTsgLy8gb24gY2hhbmdlIC8gb24gcmVsZWFzZVxuICAgICAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24gKCkgeyB0aGlzLl9jbGVhcigpOyB9O1xuXG4gICAgICAgIC8vIFV0aWxzXG4gICAgICAgIHRoaXMuaDJyZ2JhID0gZnVuY3Rpb24gKGgsIGEpIHtcbiAgICAgICAgICAgIHZhciByZ2I7XG4gICAgICAgICAgICBoID0gaC5zdWJzdHJpbmcoMSw3KVxuICAgICAgICAgICAgcmdiID0gW3BhcnNlSW50KGguc3Vic3RyaW5nKDAsMiksMTYpXG4gICAgICAgICAgICAgICAgICAgLHBhcnNlSW50KGguc3Vic3RyaW5nKDIsNCksMTYpXG4gICAgICAgICAgICAgICAgICAgLHBhcnNlSW50KGguc3Vic3RyaW5nKDQsNiksMTYpXTtcbiAgICAgICAgICAgIHJldHVybiBcInJnYmEoXCIgKyByZ2JbMF0gKyBcIixcIiArIHJnYlsxXSArIFwiLFwiICsgcmdiWzJdICsgXCIsXCIgKyBhICsgXCIpXCI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb3B5ID0gZnVuY3Rpb24gKGYsIHQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZikgeyB0W2ldID0gZltpXTsgfVxuICAgICAgICB9O1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIGsuRGlhbFxuICAgICAqL1xuICAgIGsuRGlhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgay5vLmNhbGwodGhpcyk7XG5cbiAgICAgICAgdGhpcy5zdGFydEFuZ2xlID0gbnVsbDtcbiAgICAgICAgdGhpcy54eSA9IG51bGw7XG4gICAgICAgIHRoaXMucmFkaXVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5saW5lV2lkdGggPSBudWxsO1xuICAgICAgICB0aGlzLmN1cnNvckV4dCA9IG51bGw7XG4gICAgICAgIHRoaXMudzIgPSBudWxsO1xuICAgICAgICB0aGlzLlBJMiA9IDIqTWF0aC5QSTtcblxuICAgICAgICB0aGlzLmV4dGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubyA9ICQuZXh0ZW5kKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYmdDb2xvciA6IHRoaXMuJC5kYXRhKCdiZ2NvbG9yJykgfHwgJyNFRUVFRUUnLFxuICAgICAgICAgICAgICAgICAgICBhbmdsZU9mZnNldCA6IHRoaXMuJC5kYXRhKCdhbmdsZW9mZnNldCcpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlQXJjIDogdGhpcy4kLmRhdGEoJ2FuZ2xlYXJjJykgfHwgMzYwLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmUgOiB0cnVlXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5vXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudmFsID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN2ID0gdGhpcy5vLnN0b3BwZXIgPyBtYXgobWluKHYsIHRoaXMuby5tYXgpLCB0aGlzLm8ubWluKSA6IHY7XG4gICAgICAgICAgICAgICAgdGhpcy52ID0gdGhpcy5jdjtcbiAgICAgICAgICAgICAgICB0aGlzLiQudmFsKHRoaXMudik7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMueHkydmFsID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgICAgIHZhciBhLCByZXQ7XG5cbiAgICAgICAgICAgIGEgPSBNYXRoLmF0YW4yKFxuICAgICAgICAgICAgICAgICAgICAgICAgeCAtICh0aGlzLnggKyB0aGlzLncyKVxuICAgICAgICAgICAgICAgICAgICAgICAgLCAtICh5IC0gdGhpcy55IC0gdGhpcy53MilcbiAgICAgICAgICAgICAgICAgICAgKSAtIHRoaXMuYW5nbGVPZmZzZXQ7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuYW5nbGVBcmMgIT0gdGhpcy5QSTIgJiYgKGEgPCAwKSAmJiAoYSA+IC0wLjUpKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgaXNzZXQgYW5nbGVBcmMgb3B0aW9uLCBzZXQgdG8gbWluIGlmIC41IHVuZGVyIG1pblxuICAgICAgICAgICAgICAgIGEgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhIDwgMCkge1xuICAgICAgICAgICAgICAgIGEgKz0gdGhpcy5QSTI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldCA9IH5+ICgwLjUgKyAoYSAqICh0aGlzLm8ubWF4IC0gdGhpcy5vLm1pbikgLyB0aGlzLmFuZ2xlQXJjKSlcbiAgICAgICAgICAgICAgICAgICAgKyB0aGlzLm8ubWluO1xuXG4gICAgICAgICAgICB0aGlzLm8uc3RvcHBlclxuICAgICAgICAgICAgJiYgKHJldCA9IG1heChtaW4ocmV0LCB0aGlzLm8ubWF4KSwgdGhpcy5vLm1pbikpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubGlzdGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gYmluZCBNb3VzZVdoZWVsXG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbXcgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JpID0gZS5vcmlnaW5hbEV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICxkZWx0YVggPSBvcmkuZGV0YWlsIHx8IG9yaS53aGVlbERlbHRhWFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsZGVsdGFZID0gb3JpLmRldGFpbCB8fCBvcmkud2hlZWxEZWx0YVlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLHYgPSBwYXJzZUludChzLiQudmFsKCkpICsgKGRlbHRhWD4wIHx8IGRlbHRhWT4wID8gcy5vLnN0ZXAgOiBkZWx0YVg8MCB8fCBkZWx0YVk8MCA/IC1zLm8uc3RlcCA6IDApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLmNIXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIChzLmNIKHYpID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMudmFsKHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICwga3ZhbCwgdG8sIG0gPSAxLCBrdiA9IHszNzotcy5vLnN0ZXAsIDM4OnMuby5zdGVwLCAzOTpzLm8uc3RlcCwgNDA6LXMuby5zdGVwfTtcblxuICAgICAgICAgICAgdGhpcy4kXG4gICAgICAgICAgICAgICAgLmJpbmQoXG4gICAgICAgICAgICAgICAgICAgIFwia2V5ZG93blwiXG4gICAgICAgICAgICAgICAgICAgICxmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtjID0gZS5rZXlDb2RlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBudW1wYWQgc3VwcG9ydFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoa2MgPj0gOTYgJiYga2MgPD0gMTA1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2MgPSBlLmtleUNvZGUgPSBrYyAtIDQ4O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBrdmFsID0gcGFyc2VJbnQoU3RyaW5nLmZyb21DaGFyQ29kZShrYykpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNOYU4oa3ZhbCkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChrYyAhPT0gMTMpICAgICAgICAgLy8gZW50ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoa2MgIT09IDgpICAgICAgIC8vIGJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGtjICE9PSA5KSAgICAgICAvLyB0YWJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoa2MgIT09IDE4OSkgICAgIC8vIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcnJvd3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJC5pbkFycmF5KGtjLFszNywzOCwzOSw0MF0pID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2ID0gcGFyc2VJbnQocy4kLnZhbCgpKSArIGt2W2tjXSAqIG07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5vLnN0b3BwZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKHYgPSBtYXgobWluKHYsIHMuby5tYXgpLCBzLm8ubWluKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5jaGFuZ2Uodik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMuX2RyYXcoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb25nIHRpbWUga2V5ZG93biBzcGVlZC11cFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byA9IHdpbmRvdy5zZXRUaW1lb3V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyBtKj0yOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsMzBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLmJpbmQoXG4gICAgICAgICAgICAgICAgICAgIFwia2V5dXBcIlxuICAgICAgICAgICAgICAgICAgICAsZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc05hTihrdmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0bykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcy52YWwocy4kLnZhbCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGt2YWwgcG9zdGNvbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocy4kLnZhbCgpID4gcy5vLm1heCAmJiBzLiQudmFsKHMuby5tYXgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IChzLiQudmFsKCkgPCBzLm8ubWluICYmIHMuJC52YWwocy5vLm1pbikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB0aGlzLiRjLmJpbmQoXCJtb3VzZXdoZWVsIERPTU1vdXNlU2Nyb2xsXCIsIG13KTtcbiAgICAgICAgICAgIHRoaXMuJC5iaW5kKFwibW91c2V3aGVlbCBET01Nb3VzZVNjcm9sbFwiLCBtdylcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICB0aGlzLnYgPCB0aGlzLm8ubWluXG4gICAgICAgICAgICAgICAgfHwgdGhpcy52ID4gdGhpcy5vLm1heFxuICAgICAgICAgICAgKSB0aGlzLnYgPSB0aGlzLm8ubWluO1xuXG4gICAgICAgICAgICB0aGlzLiQudmFsKHRoaXMudik7XG4gICAgICAgICAgICB0aGlzLncyID0gdGhpcy5vLndpZHRoIC8gMjtcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yRXh0ID0gdGhpcy5vLmN1cnNvciAvIDEwMDtcbiAgICAgICAgICAgIHRoaXMueHkgPSB0aGlzLncyO1xuICAgICAgICAgICAgdGhpcy5saW5lV2lkdGggPSB0aGlzLnh5ICogdGhpcy5vLnRoaWNrbmVzcztcbiAgICAgICAgICAgIHRoaXMubGluZUNhcCA9IHRoaXMuby5saW5lQ2FwO1xuICAgICAgICAgICAgdGhpcy5yYWRpdXMgPSB0aGlzLnh5IC0gdGhpcy5saW5lV2lkdGggLyAyO1xuXG4gICAgICAgICAgICB0aGlzLm8uYW5nbGVPZmZzZXRcbiAgICAgICAgICAgICYmICh0aGlzLm8uYW5nbGVPZmZzZXQgPSBpc05hTih0aGlzLm8uYW5nbGVPZmZzZXQpID8gMCA6IHRoaXMuby5hbmdsZU9mZnNldCk7XG5cbiAgICAgICAgICAgIHRoaXMuby5hbmdsZUFyY1xuICAgICAgICAgICAgJiYgKHRoaXMuby5hbmdsZUFyYyA9IGlzTmFOKHRoaXMuby5hbmdsZUFyYykgPyB0aGlzLlBJMiA6IHRoaXMuby5hbmdsZUFyYyk7XG5cbiAgICAgICAgICAgIC8vIGRlZyB0byByYWRcbiAgICAgICAgICAgIHRoaXMuYW5nbGVPZmZzZXQgPSB0aGlzLm8uYW5nbGVPZmZzZXQgKiBNYXRoLlBJIC8gMTgwO1xuICAgICAgICAgICAgdGhpcy5hbmdsZUFyYyA9IHRoaXMuby5hbmdsZUFyYyAqIE1hdGguUEkgLyAxODA7XG5cbiAgICAgICAgICAgIC8vIGNvbXB1dGUgc3RhcnQgYW5kIGVuZCBhbmdsZXNcbiAgICAgICAgICAgIHRoaXMuc3RhcnRBbmdsZSA9IDEuNSAqIE1hdGguUEkgKyB0aGlzLmFuZ2xlT2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5lbmRBbmdsZSA9IDEuNSAqIE1hdGguUEkgKyB0aGlzLmFuZ2xlT2Zmc2V0ICsgdGhpcy5hbmdsZUFyYztcblxuICAgICAgICAgICAgdmFyIHMgPSBtYXgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nKE1hdGguYWJzKHRoaXMuby5tYXgpKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIFN0cmluZyhNYXRoLmFicyh0aGlzLm8ubWluKSkubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLCAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArIDI7XG5cbiAgICAgICAgICAgIHRoaXMuby5kaXNwbGF5SW5wdXRcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmkuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd3aWR0aCcgOiAoKHRoaXMuby53aWR0aCAvIDIgKyA0KSA+PiAwKSArICdweCdcbiAgICAgICAgICAgICAgICAgICAgICAgICwnaGVpZ2h0JyA6ICgodGhpcy5vLndpZHRoIC8gMykgPj4gMCkgKyAncHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ3Bvc2l0aW9uJyA6ICdhYnNvbHV0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICwndmVydGljYWwtYWxpZ24nIDogJ21pZGRsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICwnbWFyZ2luLXRvcCcgOiAoKHRoaXMuby53aWR0aCAvIDMpID4+IDApICsgJ3B4J1xuICAgICAgICAgICAgICAgICAgICAgICAgLCdtYXJnaW4tbGVmdCcgOiAnLScgKyAoKHRoaXMuby53aWR0aCAqIDMgLyA0ICsgMikgPj4gMCkgKyAncHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ2JvcmRlcicgOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ2JhY2tncm91bmQnIDogJ25vbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ2ZvbnQnIDogJ2JvbGQgJyArICgodGhpcy5vLndpZHRoIC8gcykgPj4gMCkgKyAncHggQXJpYWwnXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ3RleHQtYWxpZ24nIDogJ2NlbnRlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICwnY29sb3InIDogdGhpcy5vLmlucHV0Q29sb3IgfHwgdGhpcy5vLmZnQ29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICwncGFkZGluZycgOiAnMHB4J1xuICAgICAgICAgICAgICAgICAgICAgICAgLCctd2Via2l0LWFwcGVhcmFuY2UnOiAnbm9uZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfHwgdGhpcy5pLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnd2lkdGgnIDogJzBweCdcbiAgICAgICAgICAgICAgICAgICAgICAgICwndmlzaWJpbGl0eScgOiAnaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jaGFuZ2UgPSBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdGhpcy5jdiA9IHY7XG4gICAgICAgICAgICB0aGlzLiQudmFsKHYpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYW5nbGUgPSBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgcmV0dXJuICh2IC0gdGhpcy5vLm1pbikgKiB0aGlzLmFuZ2xlQXJjIC8gKHRoaXMuby5tYXggLSB0aGlzLm8ubWluKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRyYXcgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBjID0gdGhpcy5nLCAgICAgICAgICAgICAgICAgLy8gY29udGV4dFxuICAgICAgICAgICAgICAgIGEgPSB0aGlzLmFuZ2xlKHRoaXMuY3YpICAgIC8vIEFuZ2xlXG4gICAgICAgICAgICAgICAgLCBzYXQgPSB0aGlzLnN0YXJ0QW5nbGUgICAgIC8vIFN0YXJ0IGFuZ2xlXG4gICAgICAgICAgICAgICAgLCBlYXQgPSBzYXQgKyBhICAgICAgICAgICAgIC8vIEVuZCBhbmdsZVxuICAgICAgICAgICAgICAgICwgc2EsIGVhICAgICAgICAgICAgICAgICAgICAvLyBQcmV2aW91cyBhbmdsZXNcbiAgICAgICAgICAgICAgICAsIHIgPSAxO1xuXG4gICAgICAgICAgICBjLmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoO1xuXG4gICAgICAgICAgICBjLmxpbmVDYXAgPSB0aGlzLmxpbmVDYXA7XG5cbiAgICAgICAgICAgIHRoaXMuby5jdXJzb3JcbiAgICAgICAgICAgICAgICAmJiAoc2F0ID0gZWF0IC0gdGhpcy5jdXJzb3JFeHQpXG4gICAgICAgICAgICAgICAgJiYgKGVhdCA9IGVhdCArIHRoaXMuY3Vyc29yRXh0KTtcblxuICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gdGhpcy5vLmJnQ29sb3I7XG4gICAgICAgICAgICAgICAgYy5hcmModGhpcy54eSwgdGhpcy54eSwgdGhpcy5yYWRpdXMsIHRoaXMuZW5kQW5nbGUsIHRoaXMuc3RhcnRBbmdsZSwgdHJ1ZSk7XG4gICAgICAgICAgICBjLnN0cm9rZSgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vLmRpc3BsYXlQcmV2aW91cykge1xuICAgICAgICAgICAgICAgIGVhID0gdGhpcy5zdGFydEFuZ2xlICsgdGhpcy5hbmdsZSh0aGlzLnYpO1xuICAgICAgICAgICAgICAgIHNhID0gdGhpcy5zdGFydEFuZ2xlO1xuICAgICAgICAgICAgICAgIHRoaXMuby5jdXJzb3JcbiAgICAgICAgICAgICAgICAgICAgJiYgKHNhID0gZWEgLSB0aGlzLmN1cnNvckV4dClcbiAgICAgICAgICAgICAgICAgICAgJiYgKGVhID0gZWEgKyB0aGlzLmN1cnNvckV4dCk7XG5cbiAgICAgICAgICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gdGhpcy5wQ29sb3I7XG4gICAgICAgICAgICAgICAgICAgIGMuYXJjKHRoaXMueHksIHRoaXMueHksIHRoaXMucmFkaXVzLCBzYSwgZWEsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBjLnN0cm9rZSgpO1xuICAgICAgICAgICAgICAgIHIgPSAodGhpcy5jdiA9PSB0aGlzLnYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSByID8gdGhpcy5vLmZnQ29sb3IgOiB0aGlzLmZnQ29sb3IgO1xuICAgICAgICAgICAgICAgIGMuYXJjKHRoaXMueHksIHRoaXMueHksIHRoaXMucmFkaXVzLCBzYXQsIGVhdCwgZmFsc2UpO1xuICAgICAgICAgICAgYy5zdHJva2UoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudmFsKHRoaXMudik7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgICQuZm4uZGlhbCA9ICQuZm4ua25vYiA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGQgPSBuZXcgay5EaWFsKCk7XG4gICAgICAgICAgICAgICAgZC5vID0gbztcbiAgICAgICAgICAgICAgICBkLiQgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIGQucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICkucGFyZW50KCk7XG4gICAgfTtcblxufSkoalF1ZXJ5KTsiXSwiZmlsZSI6InJhZGlvL2pxdWVyeS5rbm9iLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
