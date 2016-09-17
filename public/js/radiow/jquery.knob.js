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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpb3cvanF1ZXJ5Lmtub2IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohalF1ZXJ5IEtub2IqL1xuLyoqXG4gKiBEb3dud2FyZCBjb21wYXRpYmxlLCB0b3VjaGFibGUgZGlhbFxuICpcbiAqIFZlcnNpb246IDEuMi4wICgxNS8wNy8yMDEyKVxuICogUmVxdWlyZXM6IGpRdWVyeSB2MS43K1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBBbnRob255IFRlcnJpZW5cbiAqIFVuZGVyIE1JVCBhbmQgR1BMIGxpY2Vuc2VzOlxuICogIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKiAgaHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2dwbC5odG1sXG4gKlxuICogVGhhbmtzIHRvIHZvciwgZXNraW1vYmxvb2QsIHNwaWZmaXN0YW4sIEZhYnJpemlvQ1xuICovXG4oZnVuY3Rpb24oJCkge1xuXG4gICAgLyoqXG4gICAgICogS29udHJvbCBsaWJyYXJ5XG4gICAgICovXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvKipcbiAgICAgKiBEZWZpbml0aW9uIG9mIGdsb2JhbHMgYW5kIGNvcmVcbiAgICAgKi9cbiAgICB2YXIgayA9IHt9LCAvLyBrb250cm9sXG4gICAgICAgIG1heCA9IE1hdGgubWF4LFxuICAgICAgICBtaW4gPSBNYXRoLm1pbjtcblxuICAgIGsuYyA9IHt9O1xuICAgIGsuYy5kID0gJChkb2N1bWVudCk7XG4gICAgay5jLnQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoIC0gMTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogS29udHJvbCBPYmplY3RcbiAgICAgKlxuICAgICAqIERlZmluaXRpb24gb2YgYW4gYWJzdHJhY3QgVUkgY29udHJvbFxuICAgICAqXG4gICAgICogRWFjaCBjb25jcmV0ZSBjb21wb25lbnQgbXVzdCBjYWxsIHRoaXMgb25lLlxuICAgICAqIDxjb2RlPlxuICAgICAqIGsuby5jYWxsKHRoaXMpO1xuICAgICAqIDwvY29kZT5cbiAgICAgKi9cbiAgICBrLm8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzID0gdGhpcztcblxuICAgICAgICB0aGlzLm8gPSBudWxsOyAvLyBhcnJheSBvZiBvcHRpb25zXG4gICAgICAgIHRoaXMuJCA9IG51bGw7IC8vIGpRdWVyeSB3cmFwcGVkIGVsZW1lbnRcbiAgICAgICAgdGhpcy5pID0gbnVsbDsgLy8gbWl4ZWQgSFRNTElucHV0RWxlbWVudCBvciBhcnJheSBvZiBIVE1MSW5wdXRFbGVtZW50XG4gICAgICAgIHRoaXMuZyA9IG51bGw7IC8vIDJEIGdyYXBoaWNzIGNvbnRleHQgZm9yICdwcmUtcmVuZGVyaW5nJ1xuICAgICAgICB0aGlzLnYgPSBudWxsOyAvLyB2YWx1ZSA7IG1peGVkIGFycmF5IG9yIGludGVnZXJcbiAgICAgICAgdGhpcy5jdiA9IG51bGw7IC8vIGNoYW5nZSB2YWx1ZSA7IG5vdCBjb21taXRlZCB2YWx1ZVxuICAgICAgICB0aGlzLnggPSAwOyAvLyBjYW52YXMgeCBwb3NpdGlvblxuICAgICAgICB0aGlzLnkgPSAwOyAvLyBjYW52YXMgeSBwb3NpdGlvblxuICAgICAgICB0aGlzLiRjID0gbnVsbDsgLy8galF1ZXJ5IGNhbnZhcyBlbGVtZW50XG4gICAgICAgIHRoaXMuYyA9IG51bGw7IC8vIHJlbmRlcmVkIGNhbnZhcyBjb250ZXh0XG4gICAgICAgIHRoaXMudCA9IDA7IC8vIHRvdWNoZXMgaW5kZXhcbiAgICAgICAgdGhpcy5pc0luaXQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5mZ0NvbG9yID0gbnVsbDsgLy8gbWFpbiBjb2xvclxuICAgICAgICB0aGlzLnBDb2xvciA9IG51bGw7IC8vIHByZXZpb3VzIGNvbG9yXG4gICAgICAgIHRoaXMuZEggPSBudWxsOyAvLyBkcmF3IGhvb2tcbiAgICAgICAgdGhpcy5jSCA9IG51bGw7IC8vIGNoYW5nZSBob29rXG4gICAgICAgIHRoaXMuZUggPSBudWxsOyAvLyBjYW5jZWwgaG9va1xuICAgICAgICB0aGlzLnJIID0gbnVsbDsgLy8gcmVsZWFzZSBob29rXG5cbiAgICAgICAgdGhpcy5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY2YgPSBmdW5jdGlvbiAoZSwgY29uZikge1xuICAgICAgICAgICAgICAgIHZhciBrO1xuICAgICAgICAgICAgICAgIGZvciAoayBpbiBjb25mKSB7XG4gICAgICAgICAgICAgICAgICAgIHMub1trXSA9IGNvbmZba107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHMuaW5pdCgpO1xuICAgICAgICAgICAgICAgIHMuX2NvbmZpZ3VyZSgpXG4gICAgICAgICAgICAgICAgIC5fZHJhdygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYodGhpcy4kLmRhdGEoJ2tvbnRyb2xlZCcpKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLiQuZGF0YSgna29udHJvbGVkJywgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMuZXh0ZW5kKCk7XG4gICAgICAgICAgICB0aGlzLm8gPSAkLmV4dGVuZChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbmZpZ1xuICAgICAgICAgICAgICAgICAgICBtaW4gOiB0aGlzLiQuZGF0YSgnbWluJykgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgbWF4IDogdGhpcy4kLmRhdGEoJ21heCcpIHx8IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgc3RvcHBlciA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlYWRPbmx5IDogdGhpcy4kLmRhdGEoJ3JlYWRvbmx5JyksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVUlcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yIDogKHRoaXMuJC5kYXRhKCdjdXJzb3InKSA9PT0gdHJ1ZSAmJiAzMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgdGhpcy4kLmRhdGEoJ2N1cnNvcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIHRoaWNrbmVzcyA6IHRoaXMuJC5kYXRhKCd0aGlja25lc3MnKSB8fCAwLjM1LFxuICAgICAgICAgICAgICAgICAgICBsaW5lQ2FwIDogdGhpcy4kLmRhdGEoJ2xpbmVjYXAnKSB8fCAnYnV0dCcsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoIDogdGhpcy4kLmRhdGEoJ3dpZHRoJykgfHwgMjAwLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgOiB0aGlzLiQuZGF0YSgnaGVpZ2h0JykgfHwgMjAwLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5SW5wdXQgOiB0aGlzLiQuZGF0YSgnZGlzcGxheWlucHV0JykgPT0gbnVsbCB8fCB0aGlzLiQuZGF0YSgnZGlzcGxheWlucHV0JyksXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlQcmV2aW91cyA6IHRoaXMuJC5kYXRhKCdkaXNwbGF5cHJldmlvdXMnKSxcbiAgICAgICAgICAgICAgICAgICAgZmdDb2xvciA6IHRoaXMuJC5kYXRhKCdmZ2NvbG9yJykgfHwgJyM4N0NFRUInLFxuICAgICAgICAgICAgICAgICAgICBpbnB1dENvbG9yOiB0aGlzLiQuZGF0YSgnaW5wdXRjb2xvcicpIHx8IHRoaXMuJC5kYXRhKCdmZ2NvbG9yJykgfHwgJyM4N0NFRUInLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgc3RlcCA6IHRoaXMuJC5kYXRhKCdzdGVwJykgfHwgMSxcblxuICAgICAgICAgICAgICAgICAgICAvLyBIb29rc1xuICAgICAgICAgICAgICAgICAgICBkcmF3IDogbnVsbCwgLy8gZnVuY3Rpb24gKCkge31cbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlIDogbnVsbCwgLy8gZnVuY3Rpb24gKHZhbHVlKSB7fVxuICAgICAgICAgICAgICAgICAgICBjYW5jZWwgOiBudWxsLCAvLyBmdW5jdGlvbiAoKSB7fVxuICAgICAgICAgICAgICAgICAgICByZWxlYXNlIDogbnVsbCAvLyBmdW5jdGlvbiAodmFsdWUpIHt9XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5vXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyByb3V0aW5nIHZhbHVlXG4gICAgICAgICAgICBpZih0aGlzLiQuaXMoJ2ZpZWxkc2V0JykpIHtcblxuICAgICAgICAgICAgICAgIC8vIGZpZWxkc2V0ID0gYXJyYXkgb2YgaW50ZWdlclxuICAgICAgICAgICAgICAgIHRoaXMudiA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuaSA9IHRoaXMuJC5maW5kKCdpbnB1dCcpXG4gICAgICAgICAgICAgICAgdGhpcy5pLmVhY2goZnVuY3Rpb24oaykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBzLmlba10gPSAkdGhpcztcbiAgICAgICAgICAgICAgICAgICAgcy52W2tdID0gJHRoaXMudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuYmluZChcbiAgICAgICAgICAgICAgICAgICAgICAgICdjaGFuZ2UnXG4gICAgICAgICAgICAgICAgICAgICAgICAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsW2tdID0gJHRoaXMudmFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcy52YWwodmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLiQuZmluZCgnbGVnZW5kJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW5wdXQgPSBpbnRlZ2VyXG4gICAgICAgICAgICAgICAgdGhpcy5pID0gdGhpcy4kO1xuICAgICAgICAgICAgICAgIHRoaXMudiA9IHRoaXMuJC52YWwoKTtcbiAgICAgICAgICAgICAgICAodGhpcy52ID09ICcnKSAmJiAodGhpcy52ID0gdGhpcy5vLm1pbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLiQuYmluZChcbiAgICAgICAgICAgICAgICAgICAgJ2NoYW5nZSdcbiAgICAgICAgICAgICAgICAgICAgLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzLnZhbChzLl92YWxpZGF0ZShzLiQudmFsKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICghdGhpcy5vLmRpc3BsYXlJbnB1dCkgJiYgdGhpcy4kLmhpZGUoKTtcblxuICAgICAgICAgICAgdGhpcy4kYyA9ICQoJzxjYW52YXMgd2lkdGg9XCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm8ud2lkdGggKyAncHhcIiBoZWlnaHQ9XCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm8uaGVpZ2h0ICsgJ3B4XCI+PC9jYW52YXM+Jyk7XG4gICAgICAgICAgICB0aGlzLmMgPSB0aGlzLiRjWzBdLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgICAgICAgICAgdGhpcy4kXG4gICAgICAgICAgICAgICAgLndyYXAoJCgnPGRpdiBzdHlsZT1cIicgKyAodGhpcy5vLmlubGluZSA/ICdkaXNwbGF5OmlubGluZTsnIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICd3aWR0aDonICsgdGhpcy5vLndpZHRoICsgJ3B4O2hlaWdodDonICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuby5oZWlnaHQgKyAncHg7XCI+PC9kaXY+JykpXG4gICAgICAgICAgICAgICAgLmJlZm9yZSh0aGlzLiRjKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudiBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3YgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvcHkodGhpcy52LCB0aGlzLmN2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdiA9IHRoaXMudjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kXG4gICAgICAgICAgICAgICAgLmJpbmQoXCJjb25maWd1cmVcIiwgY2YpXG4gICAgICAgICAgICAgICAgLnBhcmVudCgpXG4gICAgICAgICAgICAgICAgLmJpbmQoXCJjb25maWd1cmVcIiwgY2YpO1xuXG4gICAgICAgICAgICB0aGlzLl9saXN0ZW4oKVxuICAgICAgICAgICAgICAgIC5fY29uZmlndXJlKClcbiAgICAgICAgICAgICAgICAuX3h5KClcbiAgICAgICAgICAgICAgICAuaW5pdCgpO1xuXG4gICAgICAgICAgICB0aGlzLmlzSW5pdCA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fZHJhdyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgLy8gY2FudmFzIHByZS1yZW5kZXJpbmdcbiAgICAgICAgICAgIHZhciBkID0gdHJ1ZSxcbiAgICAgICAgICAgICAgICBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbiAgICAgICAgICAgIGMud2lkdGggPSBzLm8ud2lkdGg7XG4gICAgICAgICAgICBjLmhlaWdodCA9IHMuby5oZWlnaHQ7XG4gICAgICAgICAgICBzLmcgPSBjLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgIHMuY2xlYXIoKTtcblxuICAgICAgICAgICAgcy5kSFxuICAgICAgICAgICAgJiYgKGQgPSBzLmRIKCkpO1xuXG4gICAgICAgICAgICAoZCAhPT0gZmFsc2UpICYmIHMuZHJhdygpO1xuXG4gICAgICAgICAgICBzLmMuZHJhd0ltYWdlKGMsIDAsIDApO1xuICAgICAgICAgICAgYyA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fdG91Y2ggPSBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICB2YXIgdG91Y2hNb3ZlID0gZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAgICAgICAgIHZhciB2ID0gcy54eTJ2YWwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbcy50XS5wYWdlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLm9yaWdpbmFsRXZlbnQudG91Y2hlc1tzLnRdLnBhZ2VZXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGlmICh2ID09IHMuY3YpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcy5jSFxuICAgICAgICAgICAgICAgICAgICAmJiAocy5jSCh2KSA9PT0gZmFsc2UpXG4gICAgICAgICAgICAgICAgKSByZXR1cm47XG5cblxuICAgICAgICAgICAgICAgIHMuY2hhbmdlKHMuX3ZhbGlkYXRlKHYpKTtcbiAgICAgICAgICAgICAgICBzLl9kcmF3KCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBnZXQgdG91Y2hlcyBpbmRleFxuICAgICAgICAgICAgdGhpcy50ID0gay5jLnQoZSk7XG5cbiAgICAgICAgICAgIC8vIEZpcnN0IHRvdWNoXG4gICAgICAgICAgICB0b3VjaE1vdmUoZSk7XG5cbiAgICAgICAgICAgIC8vIFRvdWNoIGV2ZW50cyBsaXN0ZW5lcnNcbiAgICAgICAgICAgIGsuYy5kXG4gICAgICAgICAgICAgICAgLmJpbmQoXCJ0b3VjaG1vdmUua1wiLCB0b3VjaE1vdmUpXG4gICAgICAgICAgICAgICAgLmJpbmQoXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2hlbmQua1wiXG4gICAgICAgICAgICAgICAgICAgICwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgay5jLmQudW5iaW5kKCd0b3VjaG1vdmUuayB0b3VjaGVuZC5rJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLnJIXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKHMuckgocy5jdikgPT09IGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHMudmFsKHMuY3YpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fbW91c2UgPSBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICB2YXIgbW91c2VNb3ZlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgdiA9IHMueHkydmFsKGUucGFnZVgsIGUucGFnZVkpO1xuICAgICAgICAgICAgICAgIGlmICh2ID09IHMuY3YpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcy5jSFxuICAgICAgICAgICAgICAgICAgICAmJiAocy5jSCh2KSA9PT0gZmFsc2UpXG4gICAgICAgICAgICAgICAgKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBzLmNoYW5nZShzLl92YWxpZGF0ZSh2KSk7XG4gICAgICAgICAgICAgICAgcy5fZHJhdygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gRmlyc3QgY2xpY2tcbiAgICAgICAgICAgIG1vdXNlTW92ZShlKTtcblxuICAgICAgICAgICAgLy8gTW91c2UgZXZlbnRzIGxpc3RlbmVyc1xuICAgICAgICAgICAgay5jLmRcbiAgICAgICAgICAgICAgICAuYmluZChcIm1vdXNlbW92ZS5rXCIsIG1vdXNlTW92ZSlcbiAgICAgICAgICAgICAgICAuYmluZChcbiAgICAgICAgICAgICAgICAgICAgLy8gRXNjYXBlIGtleSBjYW5jZWwgY3VycmVudCBjaGFuZ2VcbiAgICAgICAgICAgICAgICAgICAgXCJrZXl1cC5rXCJcbiAgICAgICAgICAgICAgICAgICAgLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMjcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrLmMuZC51bmJpbmQoXCJtb3VzZXVwLmsgbW91c2Vtb3ZlLmsga2V5dXAua1wiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5lSFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAocy5lSCgpID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLmJpbmQoXG4gICAgICAgICAgICAgICAgICAgIFwibW91c2V1cC5rXCJcbiAgICAgICAgICAgICAgICAgICAgLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgay5jLmQudW5iaW5kKCdtb3VzZW1vdmUuayBtb3VzZXVwLmsga2V5dXAuaycpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5ySFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIChzLnJIKHMuY3YpID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzLnZhbChzLmN2KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX3h5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG8gPSB0aGlzLiRjLm9mZnNldCgpO1xuICAgICAgICAgICAgdGhpcy54ID0gby5sZWZ0O1xuICAgICAgICAgICAgdGhpcy55ID0gby50b3A7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9saXN0ZW4gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5vLnJlYWRPbmx5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kY1xuICAgICAgICAgICAgICAgICAgICAuYmluZChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibW91c2Vkb3duXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5feHkoKS5fbW91c2UoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5iaW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaHN0YXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5feHkoKS5fdG91Y2goZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJC5hdHRyKCdyZWFkb25seScsICdyZWFkb25seScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9jb25maWd1cmUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIC8vIEhvb2tzXG4gICAgICAgICAgICBpZiAodGhpcy5vLmRyYXcpIHRoaXMuZEggPSB0aGlzLm8uZHJhdztcbiAgICAgICAgICAgIGlmICh0aGlzLm8uY2hhbmdlKSB0aGlzLmNIID0gdGhpcy5vLmNoYW5nZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm8uY2FuY2VsKSB0aGlzLmVIID0gdGhpcy5vLmNhbmNlbDtcbiAgICAgICAgICAgIGlmICh0aGlzLm8ucmVsZWFzZSkgdGhpcy5ySCA9IHRoaXMuby5yZWxlYXNlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vLmRpc3BsYXlQcmV2aW91cykge1xuICAgICAgICAgICAgICAgIHRoaXMucENvbG9yID0gdGhpcy5oMnJnYmEodGhpcy5vLmZnQ29sb3IsIFwiMC40XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmdDb2xvciA9IHRoaXMuaDJyZ2JhKHRoaXMuby5mZ0NvbG9yLCBcIjAuNlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mZ0NvbG9yID0gdGhpcy5vLmZnQ29sb3I7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2NsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kY1swXS53aWR0aCA9IHRoaXMuJGNbMF0ud2lkdGg7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fdmFsaWRhdGUgPSBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICByZXR1cm4gKH5+ICgoKHYgPCAwKSA/IC0wLjUgOiAwLjUpICsgKHYvdGhpcy5vLnN0ZXApKSkgKiB0aGlzLm8uc3RlcDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBYnN0cmFjdCBtZXRob2RzXG4gICAgICAgIHRoaXMubGlzdGVuID0gZnVuY3Rpb24gKCkge307IC8vIG9uIHN0YXJ0LCBvbmUgdGltZVxuICAgICAgICB0aGlzLmV4dGVuZCA9IGZ1bmN0aW9uICgpIHt9OyAvLyBlYWNoIHRpbWUgY29uZmlndXJlIHRyaWdnZXJlZFxuICAgICAgICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoKSB7fTsgLy8gZWFjaCB0aW1lIGNvbmZpZ3VyZSB0cmlnZ2VyZWRcbiAgICAgICAgdGhpcy5jaGFuZ2UgPSBmdW5jdGlvbiAodikge307IC8vIG9uIGNoYW5nZVxuICAgICAgICB0aGlzLnZhbCA9IGZ1bmN0aW9uICh2KSB7fTsgLy8gb24gcmVsZWFzZVxuICAgICAgICB0aGlzLnh5MnZhbCA9IGZ1bmN0aW9uICh4LCB5KSB7fTsgLy9cbiAgICAgICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24gKCkge307IC8vIG9uIGNoYW5nZSAvIG9uIHJlbGVhc2VcbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uICgpIHsgdGhpcy5fY2xlYXIoKTsgfTtcblxuICAgICAgICAvLyBVdGlsc1xuICAgICAgICB0aGlzLmgycmdiYSA9IGZ1bmN0aW9uIChoLCBhKSB7XG4gICAgICAgICAgICB2YXIgcmdiO1xuICAgICAgICAgICAgaCA9IGguc3Vic3RyaW5nKDEsNylcbiAgICAgICAgICAgIHJnYiA9IFtwYXJzZUludChoLnN1YnN0cmluZygwLDIpLDE2KVxuICAgICAgICAgICAgICAgICAgICxwYXJzZUludChoLnN1YnN0cmluZygyLDQpLDE2KVxuICAgICAgICAgICAgICAgICAgICxwYXJzZUludChoLnN1YnN0cmluZyg0LDYpLDE2KV07XG4gICAgICAgICAgICByZXR1cm4gXCJyZ2JhKFwiICsgcmdiWzBdICsgXCIsXCIgKyByZ2JbMV0gKyBcIixcIiArIHJnYlsyXSArIFwiLFwiICsgYSArIFwiKVwiO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY29weSA9IGZ1bmN0aW9uIChmLCB0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGYpIHsgdFtpXSA9IGZbaV07IH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBrLkRpYWxcbiAgICAgKi9cbiAgICBrLkRpYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGsuby5jYWxsKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuc3RhcnRBbmdsZSA9IG51bGw7XG4gICAgICAgIHRoaXMueHkgPSBudWxsO1xuICAgICAgICB0aGlzLnJhZGl1cyA9IG51bGw7XG4gICAgICAgIHRoaXMubGluZVdpZHRoID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdXJzb3JFeHQgPSBudWxsO1xuICAgICAgICB0aGlzLncyID0gbnVsbDtcbiAgICAgICAgdGhpcy5QSTIgPSAyKk1hdGguUEk7XG5cbiAgICAgICAgdGhpcy5leHRlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm8gPSAkLmV4dGVuZChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGJnQ29sb3IgOiB0aGlzLiQuZGF0YSgnYmdjb2xvcicpIHx8ICcjRUVFRUVFJyxcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVPZmZzZXQgOiB0aGlzLiQuZGF0YSgnYW5nbGVvZmZzZXQnKSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBhbmdsZUFyYyA6IHRoaXMuJC5kYXRhKCdhbmdsZWFyYycpIHx8IDM2MCxcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lIDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sIHRoaXMub1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnZhbCA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSB2KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdiA9IHRoaXMuby5zdG9wcGVyID8gbWF4KG1pbih2LCB0aGlzLm8ubWF4KSwgdGhpcy5vLm1pbikgOiB2O1xuICAgICAgICAgICAgICAgIHRoaXMudiA9IHRoaXMuY3Y7XG4gICAgICAgICAgICAgICAgdGhpcy4kLnZhbCh0aGlzLnYpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnh5MnZhbCA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgICAgICB2YXIgYSwgcmV0O1xuXG4gICAgICAgICAgICBhID0gTWF0aC5hdGFuMihcbiAgICAgICAgICAgICAgICAgICAgICAgIHggLSAodGhpcy54ICsgdGhpcy53MilcbiAgICAgICAgICAgICAgICAgICAgICAgICwgLSAoeSAtIHRoaXMueSAtIHRoaXMudzIpXG4gICAgICAgICAgICAgICAgICAgICkgLSB0aGlzLmFuZ2xlT2Zmc2V0O1xuXG4gICAgICAgICAgICBpZih0aGlzLmFuZ2xlQXJjICE9IHRoaXMuUEkyICYmIChhIDwgMCkgJiYgKGEgPiAtMC41KSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIGlzc2V0IGFuZ2xlQXJjIG9wdGlvbiwgc2V0IHRvIG1pbiBpZiAuNSB1bmRlciBtaW5cbiAgICAgICAgICAgICAgICBhID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYSA8IDApIHtcbiAgICAgICAgICAgICAgICBhICs9IHRoaXMuUEkyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXQgPSB+fiAoMC41ICsgKGEgKiAodGhpcy5vLm1heCAtIHRoaXMuby5taW4pIC8gdGhpcy5hbmdsZUFyYykpXG4gICAgICAgICAgICAgICAgICAgICsgdGhpcy5vLm1pbjtcblxuICAgICAgICAgICAgdGhpcy5vLnN0b3BwZXJcbiAgICAgICAgICAgICYmIChyZXQgPSBtYXgobWluKHJldCwgdGhpcy5vLm1heCksIHRoaXMuby5taW4pKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxpc3RlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGJpbmQgTW91c2VXaGVlbFxuICAgICAgICAgICAgdmFyIHMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG13ID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9yaSA9IGUub3JpZ2luYWxFdmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsZGVsdGFYID0gb3JpLmRldGFpbCB8fCBvcmkud2hlZWxEZWx0YVhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLGRlbHRhWSA9IG9yaS5kZXRhaWwgfHwgb3JpLndoZWVsRGVsdGFZXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICx2ID0gcGFyc2VJbnQocy4kLnZhbCgpKSArIChkZWx0YVg+MCB8fCBkZWx0YVk+MCA/IHMuby5zdGVwIDogZGVsdGFYPDAgfHwgZGVsdGFZPDAgPyAtcy5vLnN0ZXAgOiAwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5jSFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAocy5jSCh2KSA9PT0gZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLnZhbCh2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAsIGt2YWwsIHRvLCBtID0gMSwga3YgPSB7Mzc6LXMuby5zdGVwLCAzODpzLm8uc3RlcCwgMzk6cy5vLnN0ZXAsIDQwOi1zLm8uc3RlcH07XG5cbiAgICAgICAgICAgIHRoaXMuJFxuICAgICAgICAgICAgICAgIC5iaW5kKFxuICAgICAgICAgICAgICAgICAgICBcImtleWRvd25cIlxuICAgICAgICAgICAgICAgICAgICAsZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrYyA9IGUua2V5Q29kZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbnVtcGFkIHN1cHBvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGtjID49IDk2ICYmIGtjIDw9IDEwNSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtjID0gZS5rZXlDb2RlID0ga2MgLSA0ODtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAga3ZhbCA9IHBhcnNlSW50KFN0cmluZy5mcm9tQ2hhckNvZGUoa2MpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKGt2YWwpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoa2MgIT09IDEzKSAgICAgICAgIC8vIGVudGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGtjICE9PSA4KSAgICAgICAvLyBic1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIChrYyAhPT0gOSkgICAgICAgLy8gdGFiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGtjICE9PSAxODkpICAgICAvLyAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXJyb3dzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheShrYyxbMzcsMzgsMzksNDBdKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdiA9IHBhcnNlSW50KHMuJC52YWwoKSkgKyBrdltrY10gKiBtO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMuby5zdG9wcGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICh2ID0gbWF4KG1pbih2LCBzLm8ubWF4KSwgcy5vLm1pbikpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMuY2hhbmdlKHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLl9kcmF3KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9uZyB0aW1lIGtleWRvd24gc3BlZWQtdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gPSB3aW5kb3cuc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgbSo9MjsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLDMwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5iaW5kKFxuICAgICAgICAgICAgICAgICAgICBcImtleXVwXCJcbiAgICAgICAgICAgICAgICAgICAgLGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNOYU4oa3ZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodG8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0byk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMudmFsKHMuJC52YWwoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBrdmFsIHBvc3Rjb25kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHMuJC52YWwoKSA+IHMuby5tYXggJiYgcy4kLnZhbChzLm8ubWF4KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCAocy4kLnZhbCgpIDwgcy5vLm1pbiAmJiBzLiQudmFsKHMuby5taW4pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdGhpcy4kYy5iaW5kKFwibW91c2V3aGVlbCBET01Nb3VzZVNjcm9sbFwiLCBtdyk7XG4gICAgICAgICAgICB0aGlzLiQuYmluZChcIm1vdXNld2hlZWwgRE9NTW91c2VTY3JvbGxcIiwgbXcpXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbml0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgdGhpcy52IDwgdGhpcy5vLm1pblxuICAgICAgICAgICAgICAgIHx8IHRoaXMudiA+IHRoaXMuby5tYXhcbiAgICAgICAgICAgICkgdGhpcy52ID0gdGhpcy5vLm1pbjtcblxuICAgICAgICAgICAgdGhpcy4kLnZhbCh0aGlzLnYpO1xuICAgICAgICAgICAgdGhpcy53MiA9IHRoaXMuby53aWR0aCAvIDI7XG4gICAgICAgICAgICB0aGlzLmN1cnNvckV4dCA9IHRoaXMuby5jdXJzb3IgLyAxMDA7XG4gICAgICAgICAgICB0aGlzLnh5ID0gdGhpcy53MjtcbiAgICAgICAgICAgIHRoaXMubGluZVdpZHRoID0gdGhpcy54eSAqIHRoaXMuby50aGlja25lc3M7XG4gICAgICAgICAgICB0aGlzLmxpbmVDYXAgPSB0aGlzLm8ubGluZUNhcDtcbiAgICAgICAgICAgIHRoaXMucmFkaXVzID0gdGhpcy54eSAtIHRoaXMubGluZVdpZHRoIC8gMjtcblxuICAgICAgICAgICAgdGhpcy5vLmFuZ2xlT2Zmc2V0XG4gICAgICAgICAgICAmJiAodGhpcy5vLmFuZ2xlT2Zmc2V0ID0gaXNOYU4odGhpcy5vLmFuZ2xlT2Zmc2V0KSA/IDAgOiB0aGlzLm8uYW5nbGVPZmZzZXQpO1xuXG4gICAgICAgICAgICB0aGlzLm8uYW5nbGVBcmNcbiAgICAgICAgICAgICYmICh0aGlzLm8uYW5nbGVBcmMgPSBpc05hTih0aGlzLm8uYW5nbGVBcmMpID8gdGhpcy5QSTIgOiB0aGlzLm8uYW5nbGVBcmMpO1xuXG4gICAgICAgICAgICAvLyBkZWcgdG8gcmFkXG4gICAgICAgICAgICB0aGlzLmFuZ2xlT2Zmc2V0ID0gdGhpcy5vLmFuZ2xlT2Zmc2V0ICogTWF0aC5QSSAvIDE4MDtcbiAgICAgICAgICAgIHRoaXMuYW5nbGVBcmMgPSB0aGlzLm8uYW5nbGVBcmMgKiBNYXRoLlBJIC8gMTgwO1xuXG4gICAgICAgICAgICAvLyBjb21wdXRlIHN0YXJ0IGFuZCBlbmQgYW5nbGVzXG4gICAgICAgICAgICB0aGlzLnN0YXJ0QW5nbGUgPSAxLjUgKiBNYXRoLlBJICsgdGhpcy5hbmdsZU9mZnNldDtcbiAgICAgICAgICAgIHRoaXMuZW5kQW5nbGUgPSAxLjUgKiBNYXRoLlBJICsgdGhpcy5hbmdsZU9mZnNldCArIHRoaXMuYW5nbGVBcmM7XG5cbiAgICAgICAgICAgIHZhciBzID0gbWF4KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZyhNYXRoLmFicyh0aGlzLm8ubWF4KSkubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBTdHJpbmcoTWF0aC5hYnModGhpcy5vLm1pbikpLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAyO1xuXG4gICAgICAgICAgICB0aGlzLm8uZGlzcGxheUlucHV0XG4gICAgICAgICAgICAgICAgJiYgdGhpcy5pLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnd2lkdGgnIDogKCh0aGlzLm8ud2lkdGggLyAyICsgNCkgPj4gMCkgKyAncHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ2hlaWdodCcgOiAoKHRoaXMuby53aWR0aCAvIDMpID4+IDApICsgJ3B4J1xuICAgICAgICAgICAgICAgICAgICAgICAgLCdwb3NpdGlvbicgOiAnYWJzb2x1dGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ3ZlcnRpY2FsLWFsaWduJyA6ICdtaWRkbGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ21hcmdpbi10b3AnIDogKCh0aGlzLm8ud2lkdGggLyAzKSA+PiAwKSArICdweCdcbiAgICAgICAgICAgICAgICAgICAgICAgICwnbWFyZ2luLWxlZnQnIDogJy0nICsgKCh0aGlzLm8ud2lkdGggKiAzIC8gNCArIDIpID4+IDApICsgJ3B4J1xuICAgICAgICAgICAgICAgICAgICAgICAgLCdib3JkZXInIDogMFxuICAgICAgICAgICAgICAgICAgICAgICAgLCdiYWNrZ3JvdW5kJyA6ICdub25lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLCdmb250JyA6ICdib2xkICcgKyAoKHRoaXMuby53aWR0aCAvIHMpID4+IDApICsgJ3B4IEFyaWFsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLCd0ZXh0LWFsaWduJyA6ICdjZW50ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ2NvbG9yJyA6IHRoaXMuby5pbnB1dENvbG9yIHx8IHRoaXMuby5mZ0NvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ3BhZGRpbmcnIDogJzBweCdcbiAgICAgICAgICAgICAgICAgICAgICAgICwnLXdlYmtpdC1hcHBlYXJhbmNlJzogJ25vbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHx8IHRoaXMuaS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3dpZHRoJyA6ICcwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAsJ3Zpc2liaWxpdHknIDogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2hhbmdlID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHRoaXMuY3YgPSB2O1xuICAgICAgICAgICAgdGhpcy4kLnZhbCh2KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFuZ2xlID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHJldHVybiAodiAtIHRoaXMuby5taW4pICogdGhpcy5hbmdsZUFyYyAvICh0aGlzLm8ubWF4IC0gdGhpcy5vLm1pbik7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgYyA9IHRoaXMuZywgICAgICAgICAgICAgICAgIC8vIGNvbnRleHRcbiAgICAgICAgICAgICAgICBhID0gdGhpcy5hbmdsZSh0aGlzLmN2KSAgICAvLyBBbmdsZVxuICAgICAgICAgICAgICAgICwgc2F0ID0gdGhpcy5zdGFydEFuZ2xlICAgICAvLyBTdGFydCBhbmdsZVxuICAgICAgICAgICAgICAgICwgZWF0ID0gc2F0ICsgYSAgICAgICAgICAgICAvLyBFbmQgYW5nbGVcbiAgICAgICAgICAgICAgICAsIHNhLCBlYSAgICAgICAgICAgICAgICAgICAgLy8gUHJldmlvdXMgYW5nbGVzXG4gICAgICAgICAgICAgICAgLCByID0gMTtcblxuICAgICAgICAgICAgYy5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aDtcblxuICAgICAgICAgICAgYy5saW5lQ2FwID0gdGhpcy5saW5lQ2FwO1xuXG4gICAgICAgICAgICB0aGlzLm8uY3Vyc29yXG4gICAgICAgICAgICAgICAgJiYgKHNhdCA9IGVhdCAtIHRoaXMuY3Vyc29yRXh0KVxuICAgICAgICAgICAgICAgICYmIChlYXQgPSBlYXQgKyB0aGlzLmN1cnNvckV4dCk7XG5cbiAgICAgICAgICAgIGMuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgYy5zdHJva2VTdHlsZSA9IHRoaXMuby5iZ0NvbG9yO1xuICAgICAgICAgICAgICAgIGMuYXJjKHRoaXMueHksIHRoaXMueHksIHRoaXMucmFkaXVzLCB0aGlzLmVuZEFuZ2xlLCB0aGlzLnN0YXJ0QW5nbGUsIHRydWUpO1xuICAgICAgICAgICAgYy5zdHJva2UoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuby5kaXNwbGF5UHJldmlvdXMpIHtcbiAgICAgICAgICAgICAgICBlYSA9IHRoaXMuc3RhcnRBbmdsZSArIHRoaXMuYW5nbGUodGhpcy52KTtcbiAgICAgICAgICAgICAgICBzYSA9IHRoaXMuc3RhcnRBbmdsZTtcbiAgICAgICAgICAgICAgICB0aGlzLm8uY3Vyc29yXG4gICAgICAgICAgICAgICAgICAgICYmIChzYSA9IGVhIC0gdGhpcy5jdXJzb3JFeHQpXG4gICAgICAgICAgICAgICAgICAgICYmIChlYSA9IGVhICsgdGhpcy5jdXJzb3JFeHQpO1xuXG4gICAgICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgYy5zdHJva2VTdHlsZSA9IHRoaXMucENvbG9yO1xuICAgICAgICAgICAgICAgICAgICBjLmFyYyh0aGlzLnh5LCB0aGlzLnh5LCB0aGlzLnJhZGl1cywgc2EsIGVhLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgYy5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICByID0gKHRoaXMuY3YgPT0gdGhpcy52KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gciA/IHRoaXMuby5mZ0NvbG9yIDogdGhpcy5mZ0NvbG9yIDtcbiAgICAgICAgICAgICAgICBjLmFyYyh0aGlzLnh5LCB0aGlzLnh5LCB0aGlzLnJhZGl1cywgc2F0LCBlYXQsIGZhbHNlKTtcbiAgICAgICAgICAgIGMuc3Ryb2tlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnZhbCh0aGlzLnYpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAkLmZuLmRpYWwgPSAkLmZuLmtub2IgPSBmdW5jdGlvbiAobykge1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkID0gbmV3IGsuRGlhbCgpO1xuICAgICAgICAgICAgICAgIGQubyA9IG87XG4gICAgICAgICAgICAgICAgZC4kID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICBkLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICApLnBhcmVudCgpO1xuICAgIH07XG5cbn0pKGpRdWVyeSk7Il0sImZpbGUiOiJyYWRpb3cvanF1ZXJ5Lmtub2IuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
