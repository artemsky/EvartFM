/*
 * jQuery UI Widget 1.10.1+amd
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */

(function (factory) {
    if (typeof define === "function" && define.amd) {
        // Register as an anonymous AMD module:
        define(["jquery"], factory);
    } else {
        // Browser globals:
        factory(jQuery);
    }
}(function( $, undefined ) {

var uuid = 0,
	slice = Array.prototype.slice,
	_cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		try {
			$( elem ).triggerHandler( "remove" );
		// http://bugs.jquery.com/ticket/8235
		} catch( e ) {}
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			// 1.9 BC for #7810
			// TODO remove dual storage
			.removeData( this.widgetName )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( value === undefined ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( value === undefined ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			// accept selectors, DOM elements
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^(\w+)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpb3cvanF1ZXJ5LnVpLndpZGdldC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogalF1ZXJ5IFVJIFdpZGdldCAxLjEwLjErYW1kXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYmx1ZWltcC9qUXVlcnktRmlsZS1VcGxvYWRcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKlxuICogaHR0cDovL2FwaS5qcXVlcnl1aS5jb20valF1ZXJ5LndpZGdldC9cbiAqL1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIEFNRCBtb2R1bGU6XG4gICAgICAgIGRlZmluZShbXCJqcXVlcnlcIl0sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsczpcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cbn0oZnVuY3Rpb24oICQsIHVuZGVmaW5lZCApIHtcblxudmFyIHV1aWQgPSAwLFxuXHRzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZSxcblx0X2NsZWFuRGF0YSA9ICQuY2xlYW5EYXRhO1xuJC5jbGVhbkRhdGEgPSBmdW5jdGlvbiggZWxlbXMgKSB7XG5cdGZvciAoIHZhciBpID0gMCwgZWxlbTsgKGVsZW0gPSBlbGVtc1tpXSkgIT0gbnVsbDsgaSsrICkge1xuXHRcdHRyeSB7XG5cdFx0XHQkKCBlbGVtICkudHJpZ2dlckhhbmRsZXIoIFwicmVtb3ZlXCIgKTtcblx0XHQvLyBodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC84MjM1XG5cdFx0fSBjYXRjaCggZSApIHt9XG5cdH1cblx0X2NsZWFuRGF0YSggZWxlbXMgKTtcbn07XG5cbiQud2lkZ2V0ID0gZnVuY3Rpb24oIG5hbWUsIGJhc2UsIHByb3RvdHlwZSApIHtcblx0dmFyIGZ1bGxOYW1lLCBleGlzdGluZ0NvbnN0cnVjdG9yLCBjb25zdHJ1Y3RvciwgYmFzZVByb3RvdHlwZSxcblx0XHQvLyBwcm94aWVkUHJvdG90eXBlIGFsbG93cyB0aGUgcHJvdmlkZWQgcHJvdG90eXBlIHRvIHJlbWFpbiB1bm1vZGlmaWVkXG5cdFx0Ly8gc28gdGhhdCBpdCBjYW4gYmUgdXNlZCBhcyBhIG1peGluIGZvciBtdWx0aXBsZSB3aWRnZXRzICgjODg3Nilcblx0XHRwcm94aWVkUHJvdG90eXBlID0ge30sXG5cdFx0bmFtZXNwYWNlID0gbmFtZS5zcGxpdCggXCIuXCIgKVsgMCBdO1xuXG5cdG5hbWUgPSBuYW1lLnNwbGl0KCBcIi5cIiApWyAxIF07XG5cdGZ1bGxOYW1lID0gbmFtZXNwYWNlICsgXCItXCIgKyBuYW1lO1xuXG5cdGlmICggIXByb3RvdHlwZSApIHtcblx0XHRwcm90b3R5cGUgPSBiYXNlO1xuXHRcdGJhc2UgPSAkLldpZGdldDtcblx0fVxuXG5cdC8vIGNyZWF0ZSBzZWxlY3RvciBmb3IgcGx1Z2luXG5cdCQuZXhwclsgXCI6XCIgXVsgZnVsbE5hbWUudG9Mb3dlckNhc2UoKSBdID0gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0cmV0dXJuICEhJC5kYXRhKCBlbGVtLCBmdWxsTmFtZSApO1xuXHR9O1xuXG5cdCRbIG5hbWVzcGFjZSBdID0gJFsgbmFtZXNwYWNlIF0gfHwge307XG5cdGV4aXN0aW5nQ29uc3RydWN0b3IgPSAkWyBuYW1lc3BhY2UgXVsgbmFtZSBdO1xuXHRjb25zdHJ1Y3RvciA9ICRbIG5hbWVzcGFjZSBdWyBuYW1lIF0gPSBmdW5jdGlvbiggb3B0aW9ucywgZWxlbWVudCApIHtcblx0XHQvLyBhbGxvdyBpbnN0YW50aWF0aW9uIHdpdGhvdXQgXCJuZXdcIiBrZXl3b3JkXG5cdFx0aWYgKCAhdGhpcy5fY3JlYXRlV2lkZ2V0ICkge1xuXHRcdFx0cmV0dXJuIG5ldyBjb25zdHJ1Y3Rvciggb3B0aW9ucywgZWxlbWVudCApO1xuXHRcdH1cblxuXHRcdC8vIGFsbG93IGluc3RhbnRpYXRpb24gd2l0aG91dCBpbml0aWFsaXppbmcgZm9yIHNpbXBsZSBpbmhlcml0YW5jZVxuXHRcdC8vIG11c3QgdXNlIFwibmV3XCIga2V5d29yZCAodGhlIGNvZGUgYWJvdmUgYWx3YXlzIHBhc3NlcyBhcmdzKVxuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuX2NyZWF0ZVdpZGdldCggb3B0aW9ucywgZWxlbWVudCApO1xuXHRcdH1cblx0fTtcblx0Ly8gZXh0ZW5kIHdpdGggdGhlIGV4aXN0aW5nIGNvbnN0cnVjdG9yIHRvIGNhcnJ5IG92ZXIgYW55IHN0YXRpYyBwcm9wZXJ0aWVzXG5cdCQuZXh0ZW5kKCBjb25zdHJ1Y3RvciwgZXhpc3RpbmdDb25zdHJ1Y3Rvciwge1xuXHRcdHZlcnNpb246IHByb3RvdHlwZS52ZXJzaW9uLFxuXHRcdC8vIGNvcHkgdGhlIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSB0aGUgcHJvdG90eXBlIGluIGNhc2Ugd2UgbmVlZCB0b1xuXHRcdC8vIHJlZGVmaW5lIHRoZSB3aWRnZXQgbGF0ZXJcblx0XHRfcHJvdG86ICQuZXh0ZW5kKCB7fSwgcHJvdG90eXBlICksXG5cdFx0Ly8gdHJhY2sgd2lkZ2V0cyB0aGF0IGluaGVyaXQgZnJvbSB0aGlzIHdpZGdldCBpbiBjYXNlIHRoaXMgd2lkZ2V0IGlzXG5cdFx0Ly8gcmVkZWZpbmVkIGFmdGVyIGEgd2lkZ2V0IGluaGVyaXRzIGZyb20gaXRcblx0XHRfY2hpbGRDb25zdHJ1Y3RvcnM6IFtdXG5cdH0pO1xuXG5cdGJhc2VQcm90b3R5cGUgPSBuZXcgYmFzZSgpO1xuXHQvLyB3ZSBuZWVkIHRvIG1ha2UgdGhlIG9wdGlvbnMgaGFzaCBhIHByb3BlcnR5IGRpcmVjdGx5IG9uIHRoZSBuZXcgaW5zdGFuY2Vcblx0Ly8gb3RoZXJ3aXNlIHdlJ2xsIG1vZGlmeSB0aGUgb3B0aW9ucyBoYXNoIG9uIHRoZSBwcm90b3R5cGUgdGhhdCB3ZSdyZVxuXHQvLyBpbmhlcml0aW5nIGZyb21cblx0YmFzZVByb3RvdHlwZS5vcHRpb25zID0gJC53aWRnZXQuZXh0ZW5kKCB7fSwgYmFzZVByb3RvdHlwZS5vcHRpb25zICk7XG5cdCQuZWFjaCggcHJvdG90eXBlLCBmdW5jdGlvbiggcHJvcCwgdmFsdWUgKSB7XG5cdFx0aWYgKCAhJC5pc0Z1bmN0aW9uKCB2YWx1ZSApICkge1xuXHRcdFx0cHJveGllZFByb3RvdHlwZVsgcHJvcCBdID0gdmFsdWU7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHByb3hpZWRQcm90b3R5cGVbIHByb3AgXSA9IChmdW5jdGlvbigpIHtcblx0XHRcdHZhciBfc3VwZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gYmFzZS5wcm90b3R5cGVbIHByb3AgXS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdF9zdXBlckFwcGx5ID0gZnVuY3Rpb24oIGFyZ3MgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGJhc2UucHJvdG90eXBlWyBwcm9wIF0uYXBwbHkoIHRoaXMsIGFyZ3MgKTtcblx0XHRcdFx0fTtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIF9fc3VwZXIgPSB0aGlzLl9zdXBlcixcblx0XHRcdFx0XHRfX3N1cGVyQXBwbHkgPSB0aGlzLl9zdXBlckFwcGx5LFxuXHRcdFx0XHRcdHJldHVyblZhbHVlO1xuXG5cdFx0XHRcdHRoaXMuX3N1cGVyID0gX3N1cGVyO1xuXHRcdFx0XHR0aGlzLl9zdXBlckFwcGx5ID0gX3N1cGVyQXBwbHk7XG5cblx0XHRcdFx0cmV0dXJuVmFsdWUgPSB2YWx1ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRcdFx0dGhpcy5fc3VwZXIgPSBfX3N1cGVyO1xuXHRcdFx0XHR0aGlzLl9zdXBlckFwcGx5ID0gX19zdXBlckFwcGx5O1xuXG5cdFx0XHRcdHJldHVybiByZXR1cm5WYWx1ZTtcblx0XHRcdH07XG5cdFx0fSkoKTtcblx0fSk7XG5cdGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9ICQud2lkZ2V0LmV4dGVuZCggYmFzZVByb3RvdHlwZSwge1xuXHRcdC8vIFRPRE86IHJlbW92ZSBzdXBwb3J0IGZvciB3aWRnZXRFdmVudFByZWZpeFxuXHRcdC8vIGFsd2F5cyB1c2UgdGhlIG5hbWUgKyBhIGNvbG9uIGFzIHRoZSBwcmVmaXgsIGUuZy4sIGRyYWdnYWJsZTpzdGFydFxuXHRcdC8vIGRvbid0IHByZWZpeCBmb3Igd2lkZ2V0cyB0aGF0IGFyZW4ndCBET00tYmFzZWRcblx0XHR3aWRnZXRFdmVudFByZWZpeDogZXhpc3RpbmdDb25zdHJ1Y3RvciA/IGJhc2VQcm90b3R5cGUud2lkZ2V0RXZlbnRQcmVmaXggOiBuYW1lXG5cdH0sIHByb3hpZWRQcm90b3R5cGUsIHtcblx0XHRjb25zdHJ1Y3RvcjogY29uc3RydWN0b3IsXG5cdFx0bmFtZXNwYWNlOiBuYW1lc3BhY2UsXG5cdFx0d2lkZ2V0TmFtZTogbmFtZSxcblx0XHR3aWRnZXRGdWxsTmFtZTogZnVsbE5hbWVcblx0fSk7XG5cblx0Ly8gSWYgdGhpcyB3aWRnZXQgaXMgYmVpbmcgcmVkZWZpbmVkIHRoZW4gd2UgbmVlZCB0byBmaW5kIGFsbCB3aWRnZXRzIHRoYXRcblx0Ly8gYXJlIGluaGVyaXRpbmcgZnJvbSBpdCBhbmQgcmVkZWZpbmUgYWxsIG9mIHRoZW0gc28gdGhhdCB0aGV5IGluaGVyaXQgZnJvbVxuXHQvLyB0aGUgbmV3IHZlcnNpb24gb2YgdGhpcyB3aWRnZXQuIFdlJ3JlIGVzc2VudGlhbGx5IHRyeWluZyB0byByZXBsYWNlIG9uZVxuXHQvLyBsZXZlbCBpbiB0aGUgcHJvdG90eXBlIGNoYWluLlxuXHRpZiAoIGV4aXN0aW5nQ29uc3RydWN0b3IgKSB7XG5cdFx0JC5lYWNoKCBleGlzdGluZ0NvbnN0cnVjdG9yLl9jaGlsZENvbnN0cnVjdG9ycywgZnVuY3Rpb24oIGksIGNoaWxkICkge1xuXHRcdFx0dmFyIGNoaWxkUHJvdG90eXBlID0gY2hpbGQucHJvdG90eXBlO1xuXG5cdFx0XHQvLyByZWRlZmluZSB0aGUgY2hpbGQgd2lkZ2V0IHVzaW5nIHRoZSBzYW1lIHByb3RvdHlwZSB0aGF0IHdhc1xuXHRcdFx0Ly8gb3JpZ2luYWxseSB1c2VkLCBidXQgaW5oZXJpdCBmcm9tIHRoZSBuZXcgdmVyc2lvbiBvZiB0aGUgYmFzZVxuXHRcdFx0JC53aWRnZXQoIGNoaWxkUHJvdG90eXBlLm5hbWVzcGFjZSArIFwiLlwiICsgY2hpbGRQcm90b3R5cGUud2lkZ2V0TmFtZSwgY29uc3RydWN0b3IsIGNoaWxkLl9wcm90byApO1xuXHRcdH0pO1xuXHRcdC8vIHJlbW92ZSB0aGUgbGlzdCBvZiBleGlzdGluZyBjaGlsZCBjb25zdHJ1Y3RvcnMgZnJvbSB0aGUgb2xkIGNvbnN0cnVjdG9yXG5cdFx0Ly8gc28gdGhlIG9sZCBjaGlsZCBjb25zdHJ1Y3RvcnMgY2FuIGJlIGdhcmJhZ2UgY29sbGVjdGVkXG5cdFx0ZGVsZXRlIGV4aXN0aW5nQ29uc3RydWN0b3IuX2NoaWxkQ29uc3RydWN0b3JzO1xuXHR9IGVsc2Uge1xuXHRcdGJhc2UuX2NoaWxkQ29uc3RydWN0b3JzLnB1c2goIGNvbnN0cnVjdG9yICk7XG5cdH1cblxuXHQkLndpZGdldC5icmlkZ2UoIG5hbWUsIGNvbnN0cnVjdG9yICk7XG59O1xuXG4kLndpZGdldC5leHRlbmQgPSBmdW5jdGlvbiggdGFyZ2V0ICkge1xuXHR2YXIgaW5wdXQgPSBzbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKSxcblx0XHRpbnB1dEluZGV4ID0gMCxcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHRrZXksXG5cdFx0dmFsdWU7XG5cdGZvciAoIDsgaW5wdXRJbmRleCA8IGlucHV0TGVuZ3RoOyBpbnB1dEluZGV4KysgKSB7XG5cdFx0Zm9yICgga2V5IGluIGlucHV0WyBpbnB1dEluZGV4IF0gKSB7XG5cdFx0XHR2YWx1ZSA9IGlucHV0WyBpbnB1dEluZGV4IF1bIGtleSBdO1xuXHRcdFx0aWYgKCBpbnB1dFsgaW5wdXRJbmRleCBdLmhhc093blByb3BlcnR5KCBrZXkgKSAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHQvLyBDbG9uZSBvYmplY3RzXG5cdFx0XHRcdGlmICggJC5pc1BsYWluT2JqZWN0KCB2YWx1ZSApICkge1xuXHRcdFx0XHRcdHRhcmdldFsga2V5IF0gPSAkLmlzUGxhaW5PYmplY3QoIHRhcmdldFsga2V5IF0gKSA/XG5cdFx0XHRcdFx0XHQkLndpZGdldC5leHRlbmQoIHt9LCB0YXJnZXRbIGtleSBdLCB2YWx1ZSApIDpcblx0XHRcdFx0XHRcdC8vIERvbid0IGV4dGVuZCBzdHJpbmdzLCBhcnJheXMsIGV0Yy4gd2l0aCBvYmplY3RzXG5cdFx0XHRcdFx0XHQkLndpZGdldC5leHRlbmQoIHt9LCB2YWx1ZSApO1xuXHRcdFx0XHQvLyBDb3B5IGV2ZXJ5dGhpbmcgZWxzZSBieSByZWZlcmVuY2Vcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0YXJnZXRbIGtleSBdID0gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiQud2lkZ2V0LmJyaWRnZSA9IGZ1bmN0aW9uKCBuYW1lLCBvYmplY3QgKSB7XG5cdHZhciBmdWxsTmFtZSA9IG9iamVjdC5wcm90b3R5cGUud2lkZ2V0RnVsbE5hbWUgfHwgbmFtZTtcblx0JC5mblsgbmFtZSBdID0gZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dmFyIGlzTWV0aG9kQ2FsbCA9IHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiLFxuXHRcdFx0YXJncyA9IHNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApLFxuXHRcdFx0cmV0dXJuVmFsdWUgPSB0aGlzO1xuXG5cdFx0Ly8gYWxsb3cgbXVsdGlwbGUgaGFzaGVzIHRvIGJlIHBhc3NlZCBvbiBpbml0XG5cdFx0b3B0aW9ucyA9ICFpc01ldGhvZENhbGwgJiYgYXJncy5sZW5ndGggP1xuXHRcdFx0JC53aWRnZXQuZXh0ZW5kLmFwcGx5KCBudWxsLCBbIG9wdGlvbnMgXS5jb25jYXQoYXJncykgKSA6XG5cdFx0XHRvcHRpb25zO1xuXG5cdFx0aWYgKCBpc01ldGhvZENhbGwgKSB7XG5cdFx0XHR0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBtZXRob2RWYWx1ZSxcblx0XHRcdFx0XHRpbnN0YW5jZSA9ICQuZGF0YSggdGhpcywgZnVsbE5hbWUgKTtcblx0XHRcdFx0aWYgKCAhaW5zdGFuY2UgKSB7XG5cdFx0XHRcdFx0cmV0dXJuICQuZXJyb3IoIFwiY2Fubm90IGNhbGwgbWV0aG9kcyBvbiBcIiArIG5hbWUgKyBcIiBwcmlvciB0byBpbml0aWFsaXphdGlvbjsgXCIgK1xuXHRcdFx0XHRcdFx0XCJhdHRlbXB0ZWQgdG8gY2FsbCBtZXRob2QgJ1wiICsgb3B0aW9ucyArIFwiJ1wiICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCAhJC5pc0Z1bmN0aW9uKCBpbnN0YW5jZVtvcHRpb25zXSApIHx8IG9wdGlvbnMuY2hhckF0KCAwICkgPT09IFwiX1wiICkge1xuXHRcdFx0XHRcdHJldHVybiAkLmVycm9yKCBcIm5vIHN1Y2ggbWV0aG9kICdcIiArIG9wdGlvbnMgKyBcIicgZm9yIFwiICsgbmFtZSArIFwiIHdpZGdldCBpbnN0YW5jZVwiICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bWV0aG9kVmFsdWUgPSBpbnN0YW5jZVsgb3B0aW9ucyBdLmFwcGx5KCBpbnN0YW5jZSwgYXJncyApO1xuXHRcdFx0XHRpZiAoIG1ldGhvZFZhbHVlICE9PSBpbnN0YW5jZSAmJiBtZXRob2RWYWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHJldHVyblZhbHVlID0gbWV0aG9kVmFsdWUgJiYgbWV0aG9kVmFsdWUuanF1ZXJ5ID9cblx0XHRcdFx0XHRcdHJldHVyblZhbHVlLnB1c2hTdGFjayggbWV0aG9kVmFsdWUuZ2V0KCkgKSA6XG5cdFx0XHRcdFx0XHRtZXRob2RWYWx1ZTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBpbnN0YW5jZSA9ICQuZGF0YSggdGhpcywgZnVsbE5hbWUgKTtcblx0XHRcdFx0aWYgKCBpbnN0YW5jZSApIHtcblx0XHRcdFx0XHRpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgfHwge30gKS5faW5pdCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQuZGF0YSggdGhpcywgZnVsbE5hbWUsIG5ldyBvYmplY3QoIG9wdGlvbnMsIHRoaXMgKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH07XG59O1xuXG4kLldpZGdldCA9IGZ1bmN0aW9uKCAvKiBvcHRpb25zLCBlbGVtZW50ICovICkge307XG4kLldpZGdldC5fY2hpbGRDb25zdHJ1Y3RvcnMgPSBbXTtcblxuJC5XaWRnZXQucHJvdG90eXBlID0ge1xuXHR3aWRnZXROYW1lOiBcIndpZGdldFwiLFxuXHR3aWRnZXRFdmVudFByZWZpeDogXCJcIixcblx0ZGVmYXVsdEVsZW1lbnQ6IFwiPGRpdj5cIixcblx0b3B0aW9uczoge1xuXHRcdGRpc2FibGVkOiBmYWxzZSxcblxuXHRcdC8vIGNhbGxiYWNrc1xuXHRcdGNyZWF0ZTogbnVsbFxuXHR9LFxuXHRfY3JlYXRlV2lkZ2V0OiBmdW5jdGlvbiggb3B0aW9ucywgZWxlbWVudCApIHtcblx0XHRlbGVtZW50ID0gJCggZWxlbWVudCB8fCB0aGlzLmRlZmF1bHRFbGVtZW50IHx8IHRoaXMgKVsgMCBdO1xuXHRcdHRoaXMuZWxlbWVudCA9ICQoIGVsZW1lbnQgKTtcblx0XHR0aGlzLnV1aWQgPSB1dWlkKys7XG5cdFx0dGhpcy5ldmVudE5hbWVzcGFjZSA9IFwiLlwiICsgdGhpcy53aWRnZXROYW1lICsgdGhpcy51dWlkO1xuXHRcdHRoaXMub3B0aW9ucyA9ICQud2lkZ2V0LmV4dGVuZCgge30sXG5cdFx0XHR0aGlzLm9wdGlvbnMsXG5cdFx0XHR0aGlzLl9nZXRDcmVhdGVPcHRpb25zKCksXG5cdFx0XHRvcHRpb25zICk7XG5cblx0XHR0aGlzLmJpbmRpbmdzID0gJCgpO1xuXHRcdHRoaXMuaG92ZXJhYmxlID0gJCgpO1xuXHRcdHRoaXMuZm9jdXNhYmxlID0gJCgpO1xuXG5cdFx0aWYgKCBlbGVtZW50ICE9PSB0aGlzICkge1xuXHRcdFx0JC5kYXRhKCBlbGVtZW50LCB0aGlzLndpZGdldEZ1bGxOYW1lLCB0aGlzICk7XG5cdFx0XHR0aGlzLl9vbiggdHJ1ZSwgdGhpcy5lbGVtZW50LCB7XG5cdFx0XHRcdHJlbW92ZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdGlmICggZXZlbnQudGFyZ2V0ID09PSBlbGVtZW50ICkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuZG9jdW1lbnQgPSAkKCBlbGVtZW50LnN0eWxlID9cblx0XHRcdFx0Ly8gZWxlbWVudCB3aXRoaW4gdGhlIGRvY3VtZW50XG5cdFx0XHRcdGVsZW1lbnQub3duZXJEb2N1bWVudCA6XG5cdFx0XHRcdC8vIGVsZW1lbnQgaXMgd2luZG93IG9yIGRvY3VtZW50XG5cdFx0XHRcdGVsZW1lbnQuZG9jdW1lbnQgfHwgZWxlbWVudCApO1xuXHRcdFx0dGhpcy53aW5kb3cgPSAkKCB0aGlzLmRvY3VtZW50WzBdLmRlZmF1bHRWaWV3IHx8IHRoaXMuZG9jdW1lbnRbMF0ucGFyZW50V2luZG93ICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3JlYXRlKCk7XG5cdFx0dGhpcy5fdHJpZ2dlciggXCJjcmVhdGVcIiwgbnVsbCwgdGhpcy5fZ2V0Q3JlYXRlRXZlbnREYXRhKCkgKTtcblx0XHR0aGlzLl9pbml0KCk7XG5cdH0sXG5cdF9nZXRDcmVhdGVPcHRpb25zOiAkLm5vb3AsXG5cdF9nZXRDcmVhdGVFdmVudERhdGE6ICQubm9vcCxcblx0X2NyZWF0ZTogJC5ub29wLFxuXHRfaW5pdDogJC5ub29wLFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX2Rlc3Ryb3koKTtcblx0XHQvLyB3ZSBjYW4gcHJvYmFibHkgcmVtb3ZlIHRoZSB1bmJpbmQgY2FsbHMgaW4gMi4wXG5cdFx0Ly8gYWxsIGV2ZW50IGJpbmRpbmdzIHNob3VsZCBnbyB0aHJvdWdoIHRoaXMuX29uKClcblx0XHR0aGlzLmVsZW1lbnRcblx0XHRcdC51bmJpbmQoIHRoaXMuZXZlbnROYW1lc3BhY2UgKVxuXHRcdFx0Ly8gMS45IEJDIGZvciAjNzgxMFxuXHRcdFx0Ly8gVE9ETyByZW1vdmUgZHVhbCBzdG9yYWdlXG5cdFx0XHQucmVtb3ZlRGF0YSggdGhpcy53aWRnZXROYW1lIClcblx0XHRcdC5yZW1vdmVEYXRhKCB0aGlzLndpZGdldEZ1bGxOYW1lIClcblx0XHRcdC8vIHN1cHBvcnQ6IGpxdWVyeSA8MS42LjNcblx0XHRcdC8vIGh0dHA6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0Lzk0MTNcblx0XHRcdC5yZW1vdmVEYXRhKCAkLmNhbWVsQ2FzZSggdGhpcy53aWRnZXRGdWxsTmFtZSApICk7XG5cdFx0dGhpcy53aWRnZXQoKVxuXHRcdFx0LnVuYmluZCggdGhpcy5ldmVudE5hbWVzcGFjZSApXG5cdFx0XHQucmVtb3ZlQXR0ciggXCJhcmlhLWRpc2FibGVkXCIgKVxuXHRcdFx0LnJlbW92ZUNsYXNzKFxuXHRcdFx0XHR0aGlzLndpZGdldEZ1bGxOYW1lICsgXCItZGlzYWJsZWQgXCIgK1xuXHRcdFx0XHRcInVpLXN0YXRlLWRpc2FibGVkXCIgKTtcblxuXHRcdC8vIGNsZWFuIHVwIGV2ZW50cyBhbmQgc3RhdGVzXG5cdFx0dGhpcy5iaW5kaW5ncy51bmJpbmQoIHRoaXMuZXZlbnROYW1lc3BhY2UgKTtcblx0XHR0aGlzLmhvdmVyYWJsZS5yZW1vdmVDbGFzcyggXCJ1aS1zdGF0ZS1ob3ZlclwiICk7XG5cdFx0dGhpcy5mb2N1c2FibGUucmVtb3ZlQ2xhc3MoIFwidWktc3RhdGUtZm9jdXNcIiApO1xuXHR9LFxuXHRfZGVzdHJveTogJC5ub29wLFxuXG5cdHdpZGdldDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZWxlbWVudDtcblx0fSxcblxuXHRvcHRpb246IGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdHZhciBvcHRpb25zID0ga2V5LFxuXHRcdFx0cGFydHMsXG5cdFx0XHRjdXJPcHRpb24sXG5cdFx0XHRpO1xuXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0Ly8gZG9uJ3QgcmV0dXJuIGEgcmVmZXJlbmNlIHRvIHRoZSBpbnRlcm5hbCBoYXNoXG5cdFx0XHRyZXR1cm4gJC53aWRnZXQuZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0Ly8gaGFuZGxlIG5lc3RlZCBrZXlzLCBlLmcuLCBcImZvby5iYXJcIiA9PiB7IGZvbzogeyBiYXI6IF9fXyB9IH1cblx0XHRcdG9wdGlvbnMgPSB7fTtcblx0XHRcdHBhcnRzID0ga2V5LnNwbGl0KCBcIi5cIiApO1xuXHRcdFx0a2V5ID0gcGFydHMuc2hpZnQoKTtcblx0XHRcdGlmICggcGFydHMubGVuZ3RoICkge1xuXHRcdFx0XHRjdXJPcHRpb24gPSBvcHRpb25zWyBrZXkgXSA9ICQud2lkZ2V0LmV4dGVuZCgge30sIHRoaXMub3B0aW9uc1sga2V5IF0gKTtcblx0XHRcdFx0Zm9yICggaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKysgKSB7XG5cdFx0XHRcdFx0Y3VyT3B0aW9uWyBwYXJ0c1sgaSBdIF0gPSBjdXJPcHRpb25bIHBhcnRzWyBpIF0gXSB8fCB7fTtcblx0XHRcdFx0XHRjdXJPcHRpb24gPSBjdXJPcHRpb25bIHBhcnRzWyBpIF0gXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRrZXkgPSBwYXJ0cy5wb3AoKTtcblx0XHRcdFx0aWYgKCB2YWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHJldHVybiBjdXJPcHRpb25bIGtleSBdID09PSB1bmRlZmluZWQgPyBudWxsIDogY3VyT3B0aW9uWyBrZXkgXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjdXJPcHRpb25bIGtleSBdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIHZhbHVlID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uc1sga2V5IF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiB0aGlzLm9wdGlvbnNbIGtleSBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9wdGlvbnNbIGtleSBdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fc2V0T3B0aW9ucyggb3B0aW9ucyApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdF9zZXRPcHRpb25zOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIga2V5O1xuXG5cdFx0Zm9yICgga2V5IGluIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLl9zZXRPcHRpb24oIGtleSwgb3B0aW9uc1sga2V5IF0gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0X3NldE9wdGlvbjogZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0dGhpcy5vcHRpb25zWyBrZXkgXSA9IHZhbHVlO1xuXG5cdFx0aWYgKCBrZXkgPT09IFwiZGlzYWJsZWRcIiApIHtcblx0XHRcdHRoaXMud2lkZ2V0KClcblx0XHRcdFx0LnRvZ2dsZUNsYXNzKCB0aGlzLndpZGdldEZ1bGxOYW1lICsgXCItZGlzYWJsZWQgdWktc3RhdGUtZGlzYWJsZWRcIiwgISF2YWx1ZSApXG5cdFx0XHRcdC5hdHRyKCBcImFyaWEtZGlzYWJsZWRcIiwgdmFsdWUgKTtcblx0XHRcdHRoaXMuaG92ZXJhYmxlLnJlbW92ZUNsYXNzKCBcInVpLXN0YXRlLWhvdmVyXCIgKTtcblx0XHRcdHRoaXMuZm9jdXNhYmxlLnJlbW92ZUNsYXNzKCBcInVpLXN0YXRlLWZvY3VzXCIgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRlbmFibGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9zZXRPcHRpb24oIFwiZGlzYWJsZWRcIiwgZmFsc2UgKTtcblx0fSxcblx0ZGlzYWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3NldE9wdGlvbiggXCJkaXNhYmxlZFwiLCB0cnVlICk7XG5cdH0sXG5cblx0X29uOiBmdW5jdGlvbiggc3VwcHJlc3NEaXNhYmxlZENoZWNrLCBlbGVtZW50LCBoYW5kbGVycyApIHtcblx0XHR2YXIgZGVsZWdhdGVFbGVtZW50LFxuXHRcdFx0aW5zdGFuY2UgPSB0aGlzO1xuXG5cdFx0Ly8gbm8gc3VwcHJlc3NEaXNhYmxlZENoZWNrIGZsYWcsIHNodWZmbGUgYXJndW1lbnRzXG5cdFx0aWYgKCB0eXBlb2Ygc3VwcHJlc3NEaXNhYmxlZENoZWNrICE9PSBcImJvb2xlYW5cIiApIHtcblx0XHRcdGhhbmRsZXJzID0gZWxlbWVudDtcblx0XHRcdGVsZW1lbnQgPSBzdXBwcmVzc0Rpc2FibGVkQ2hlY2s7XG5cdFx0XHRzdXBwcmVzc0Rpc2FibGVkQ2hlY2sgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBubyBlbGVtZW50IGFyZ3VtZW50LCBzaHVmZmxlIGFuZCB1c2UgdGhpcy5lbGVtZW50XG5cdFx0aWYgKCAhaGFuZGxlcnMgKSB7XG5cdFx0XHRoYW5kbGVycyA9IGVsZW1lbnQ7XG5cdFx0XHRlbGVtZW50ID0gdGhpcy5lbGVtZW50O1xuXHRcdFx0ZGVsZWdhdGVFbGVtZW50ID0gdGhpcy53aWRnZXQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gYWNjZXB0IHNlbGVjdG9ycywgRE9NIGVsZW1lbnRzXG5cdFx0XHRlbGVtZW50ID0gZGVsZWdhdGVFbGVtZW50ID0gJCggZWxlbWVudCApO1xuXHRcdFx0dGhpcy5iaW5kaW5ncyA9IHRoaXMuYmluZGluZ3MuYWRkKCBlbGVtZW50ICk7XG5cdFx0fVxuXG5cdFx0JC5lYWNoKCBoYW5kbGVycywgZnVuY3Rpb24oIGV2ZW50LCBoYW5kbGVyICkge1xuXHRcdFx0ZnVuY3Rpb24gaGFuZGxlclByb3h5KCkge1xuXHRcdFx0XHQvLyBhbGxvdyB3aWRnZXRzIHRvIGN1c3RvbWl6ZSB0aGUgZGlzYWJsZWQgaGFuZGxpbmdcblx0XHRcdFx0Ly8gLSBkaXNhYmxlZCBhcyBhbiBhcnJheSBpbnN0ZWFkIG9mIGJvb2xlYW5cblx0XHRcdFx0Ly8gLSBkaXNhYmxlZCBjbGFzcyBhcyBtZXRob2QgZm9yIGRpc2FibGluZyBpbmRpdmlkdWFsIHBhcnRzXG5cdFx0XHRcdGlmICggIXN1cHByZXNzRGlzYWJsZWRDaGVjayAmJlxuXHRcdFx0XHRcdFx0KCBpbnN0YW5jZS5vcHRpb25zLmRpc2FibGVkID09PSB0cnVlIHx8XG5cdFx0XHRcdFx0XHRcdCQoIHRoaXMgKS5oYXNDbGFzcyggXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiICkgKSApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuICggdHlwZW9mIGhhbmRsZXIgPT09IFwic3RyaW5nXCIgPyBpbnN0YW5jZVsgaGFuZGxlciBdIDogaGFuZGxlciApXG5cdFx0XHRcdFx0LmFwcGx5KCBpbnN0YW5jZSwgYXJndW1lbnRzICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNvcHkgdGhlIGd1aWQgc28gZGlyZWN0IHVuYmluZGluZyB3b3Jrc1xuXHRcdFx0aWYgKCB0eXBlb2YgaGFuZGxlciAhPT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0aGFuZGxlclByb3h5Lmd1aWQgPSBoYW5kbGVyLmd1aWQgPVxuXHRcdFx0XHRcdGhhbmRsZXIuZ3VpZCB8fCBoYW5kbGVyUHJveHkuZ3VpZCB8fCAkLmd1aWQrKztcblx0XHRcdH1cblxuXHRcdFx0dmFyIG1hdGNoID0gZXZlbnQubWF0Y2goIC9eKFxcdyspXFxzKiguKikkLyApLFxuXHRcdFx0XHRldmVudE5hbWUgPSBtYXRjaFsxXSArIGluc3RhbmNlLmV2ZW50TmFtZXNwYWNlLFxuXHRcdFx0XHRzZWxlY3RvciA9IG1hdGNoWzJdO1xuXHRcdFx0aWYgKCBzZWxlY3RvciApIHtcblx0XHRcdFx0ZGVsZWdhdGVFbGVtZW50LmRlbGVnYXRlKCBzZWxlY3RvciwgZXZlbnROYW1lLCBoYW5kbGVyUHJveHkgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVsZW1lbnQuYmluZCggZXZlbnROYW1lLCBoYW5kbGVyUHJveHkgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRfb2ZmOiBmdW5jdGlvbiggZWxlbWVudCwgZXZlbnROYW1lICkge1xuXHRcdGV2ZW50TmFtZSA9IChldmVudE5hbWUgfHwgXCJcIikuc3BsaXQoIFwiIFwiICkuam9pbiggdGhpcy5ldmVudE5hbWVzcGFjZSArIFwiIFwiICkgKyB0aGlzLmV2ZW50TmFtZXNwYWNlO1xuXHRcdGVsZW1lbnQudW5iaW5kKCBldmVudE5hbWUgKS51bmRlbGVnYXRlKCBldmVudE5hbWUgKTtcblx0fSxcblxuXHRfZGVsYXk6IGZ1bmN0aW9uKCBoYW5kbGVyLCBkZWxheSApIHtcblx0XHRmdW5jdGlvbiBoYW5kbGVyUHJveHkoKSB7XG5cdFx0XHRyZXR1cm4gKCB0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIiA/IGluc3RhbmNlWyBoYW5kbGVyIF0gOiBoYW5kbGVyIClcblx0XHRcdFx0LmFwcGx5KCBpbnN0YW5jZSwgYXJndW1lbnRzICk7XG5cdFx0fVxuXHRcdHZhciBpbnN0YW5jZSA9IHRoaXM7XG5cdFx0cmV0dXJuIHNldFRpbWVvdXQoIGhhbmRsZXJQcm94eSwgZGVsYXkgfHwgMCApO1xuXHR9LFxuXG5cdF9ob3ZlcmFibGU6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdHRoaXMuaG92ZXJhYmxlID0gdGhpcy5ob3ZlcmFibGUuYWRkKCBlbGVtZW50ICk7XG5cdFx0dGhpcy5fb24oIGVsZW1lbnQsIHtcblx0XHRcdG1vdXNlZW50ZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0JCggZXZlbnQuY3VycmVudFRhcmdldCApLmFkZENsYXNzKCBcInVpLXN0YXRlLWhvdmVyXCIgKTtcblx0XHRcdH0sXG5cdFx0XHRtb3VzZWxlYXZlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdCQoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKS5yZW1vdmVDbGFzcyggXCJ1aS1zdGF0ZS1ob3ZlclwiICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0X2ZvY3VzYWJsZTogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0dGhpcy5mb2N1c2FibGUgPSB0aGlzLmZvY3VzYWJsZS5hZGQoIGVsZW1lbnQgKTtcblx0XHR0aGlzLl9vbiggZWxlbWVudCwge1xuXHRcdFx0Zm9jdXNpbjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHQkKCBldmVudC5jdXJyZW50VGFyZ2V0ICkuYWRkQ2xhc3MoIFwidWktc3RhdGUtZm9jdXNcIiApO1xuXHRcdFx0fSxcblx0XHRcdGZvY3Vzb3V0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdCQoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKS5yZW1vdmVDbGFzcyggXCJ1aS1zdGF0ZS1mb2N1c1wiICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0X3RyaWdnZXI6IGZ1bmN0aW9uKCB0eXBlLCBldmVudCwgZGF0YSApIHtcblx0XHR2YXIgcHJvcCwgb3JpZyxcblx0XHRcdGNhbGxiYWNrID0gdGhpcy5vcHRpb25zWyB0eXBlIF07XG5cblx0XHRkYXRhID0gZGF0YSB8fCB7fTtcblx0XHRldmVudCA9ICQuRXZlbnQoIGV2ZW50ICk7XG5cdFx0ZXZlbnQudHlwZSA9ICggdHlwZSA9PT0gdGhpcy53aWRnZXRFdmVudFByZWZpeCA/XG5cdFx0XHR0eXBlIDpcblx0XHRcdHRoaXMud2lkZ2V0RXZlbnRQcmVmaXggKyB0eXBlICkudG9Mb3dlckNhc2UoKTtcblx0XHQvLyB0aGUgb3JpZ2luYWwgZXZlbnQgbWF5IGNvbWUgZnJvbSBhbnkgZWxlbWVudFxuXHRcdC8vIHNvIHdlIG5lZWQgdG8gcmVzZXQgdGhlIHRhcmdldCBvbiB0aGUgbmV3IGV2ZW50XG5cdFx0ZXZlbnQudGFyZ2V0ID0gdGhpcy5lbGVtZW50WyAwIF07XG5cblx0XHQvLyBjb3B5IG9yaWdpbmFsIGV2ZW50IHByb3BlcnRpZXMgb3ZlciB0byB0aGUgbmV3IGV2ZW50XG5cdFx0b3JpZyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG5cdFx0aWYgKCBvcmlnICkge1xuXHRcdFx0Zm9yICggcHJvcCBpbiBvcmlnICkge1xuXHRcdFx0XHRpZiAoICEoIHByb3AgaW4gZXZlbnQgKSApIHtcblx0XHRcdFx0XHRldmVudFsgcHJvcCBdID0gb3JpZ1sgcHJvcCBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5lbGVtZW50LnRyaWdnZXIoIGV2ZW50LCBkYXRhICk7XG5cdFx0cmV0dXJuICEoICQuaXNGdW5jdGlvbiggY2FsbGJhY2sgKSAmJlxuXHRcdFx0Y2FsbGJhY2suYXBwbHkoIHRoaXMuZWxlbWVudFswXSwgWyBldmVudCBdLmNvbmNhdCggZGF0YSApICkgPT09IGZhbHNlIHx8XG5cdFx0XHRldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApO1xuXHR9XG59O1xuXG4kLmVhY2goIHsgc2hvdzogXCJmYWRlSW5cIiwgaGlkZTogXCJmYWRlT3V0XCIgfSwgZnVuY3Rpb24oIG1ldGhvZCwgZGVmYXVsdEVmZmVjdCApIHtcblx0JC5XaWRnZXQucHJvdG90eXBlWyBcIl9cIiArIG1ldGhvZCBdID0gZnVuY3Rpb24oIGVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrICkge1xuXHRcdGlmICggdHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRvcHRpb25zID0geyBlZmZlY3Q6IG9wdGlvbnMgfTtcblx0XHR9XG5cdFx0dmFyIGhhc09wdGlvbnMsXG5cdFx0XHRlZmZlY3ROYW1lID0gIW9wdGlvbnMgP1xuXHRcdFx0XHRtZXRob2QgOlxuXHRcdFx0XHRvcHRpb25zID09PSB0cnVlIHx8IHR5cGVvZiBvcHRpb25zID09PSBcIm51bWJlclwiID9cblx0XHRcdFx0XHRkZWZhdWx0RWZmZWN0IDpcblx0XHRcdFx0XHRvcHRpb25zLmVmZmVjdCB8fCBkZWZhdWx0RWZmZWN0O1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdGlmICggdHlwZW9mIG9wdGlvbnMgPT09IFwibnVtYmVyXCIgKSB7XG5cdFx0XHRvcHRpb25zID0geyBkdXJhdGlvbjogb3B0aW9ucyB9O1xuXHRcdH1cblx0XHRoYXNPcHRpb25zID0gISQuaXNFbXB0eU9iamVjdCggb3B0aW9ucyApO1xuXHRcdG9wdGlvbnMuY29tcGxldGUgPSBjYWxsYmFjaztcblx0XHRpZiAoIG9wdGlvbnMuZGVsYXkgKSB7XG5cdFx0XHRlbGVtZW50LmRlbGF5KCBvcHRpb25zLmRlbGF5ICk7XG5cdFx0fVxuXHRcdGlmICggaGFzT3B0aW9ucyAmJiAkLmVmZmVjdHMgJiYgJC5lZmZlY3RzLmVmZmVjdFsgZWZmZWN0TmFtZSBdICkge1xuXHRcdFx0ZWxlbWVudFsgbWV0aG9kIF0oIG9wdGlvbnMgKTtcblx0XHR9IGVsc2UgaWYgKCBlZmZlY3ROYW1lICE9PSBtZXRob2QgJiYgZWxlbWVudFsgZWZmZWN0TmFtZSBdICkge1xuXHRcdFx0ZWxlbWVudFsgZWZmZWN0TmFtZSBdKCBvcHRpb25zLmR1cmF0aW9uLCBvcHRpb25zLmVhc2luZywgY2FsbGJhY2sgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxlbWVudC5xdWV1ZShmdW5jdGlvbiggbmV4dCApIHtcblx0XHRcdFx0JCggdGhpcyApWyBtZXRob2QgXSgpO1xuXHRcdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoIGVsZW1lbnRbIDAgXSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5leHQoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0pO1xuXG59KSk7XG4iXSwiZmlsZSI6InJhZGlvdy9qcXVlcnkudWkud2lkZ2V0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
