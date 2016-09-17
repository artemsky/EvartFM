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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby9qcXVlcnkudWkud2lkZ2V0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBqUXVlcnkgVUkgV2lkZ2V0IDEuMTAuMSthbWRcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ibHVlaW1wL2pRdWVyeS1GaWxlLVVwbG9hZFxuICpcbiAqIENvcHlyaWdodCAyMDEzIGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqXG4gKiBodHRwOi8vYXBpLmpxdWVyeXVpLmNvbS9qUXVlcnkud2lkZ2V0L1xuICovXG5cbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgQU1EIG1vZHVsZTpcbiAgICAgICAgZGVmaW5lKFtcImpxdWVyeVwiXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzOlxuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxufShmdW5jdGlvbiggJCwgdW5kZWZpbmVkICkge1xuXG52YXIgdXVpZCA9IDAsXG5cdHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLFxuXHRfY2xlYW5EYXRhID0gJC5jbGVhbkRhdGE7XG4kLmNsZWFuRGF0YSA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcblx0Zm9yICggdmFyIGkgPSAwLCBlbGVtOyAoZWxlbSA9IGVsZW1zW2ldKSAhPSBudWxsOyBpKysgKSB7XG5cdFx0dHJ5IHtcblx0XHRcdCQoIGVsZW0gKS50cmlnZ2VySGFuZGxlciggXCJyZW1vdmVcIiApO1xuXHRcdC8vIGh0dHA6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0LzgyMzVcblx0XHR9IGNhdGNoKCBlICkge31cblx0fVxuXHRfY2xlYW5EYXRhKCBlbGVtcyApO1xufTtcblxuJC53aWRnZXQgPSBmdW5jdGlvbiggbmFtZSwgYmFzZSwgcHJvdG90eXBlICkge1xuXHR2YXIgZnVsbE5hbWUsIGV4aXN0aW5nQ29uc3RydWN0b3IsIGNvbnN0cnVjdG9yLCBiYXNlUHJvdG90eXBlLFxuXHRcdC8vIHByb3hpZWRQcm90b3R5cGUgYWxsb3dzIHRoZSBwcm92aWRlZCBwcm90b3R5cGUgdG8gcmVtYWluIHVubW9kaWZpZWRcblx0XHQvLyBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIGFzIGEgbWl4aW4gZm9yIG11bHRpcGxlIHdpZGdldHMgKCM4ODc2KVxuXHRcdHByb3hpZWRQcm90b3R5cGUgPSB7fSxcblx0XHRuYW1lc3BhY2UgPSBuYW1lLnNwbGl0KCBcIi5cIiApWyAwIF07XG5cblx0bmFtZSA9IG5hbWUuc3BsaXQoIFwiLlwiIClbIDEgXTtcblx0ZnVsbE5hbWUgPSBuYW1lc3BhY2UgKyBcIi1cIiArIG5hbWU7XG5cblx0aWYgKCAhcHJvdG90eXBlICkge1xuXHRcdHByb3RvdHlwZSA9IGJhc2U7XG5cdFx0YmFzZSA9ICQuV2lkZ2V0O1xuXHR9XG5cblx0Ly8gY3JlYXRlIHNlbGVjdG9yIGZvciBwbHVnaW5cblx0JC5leHByWyBcIjpcIiBdWyBmdWxsTmFtZS50b0xvd2VyQ2FzZSgpIF0gPSBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRyZXR1cm4gISEkLmRhdGEoIGVsZW0sIGZ1bGxOYW1lICk7XG5cdH07XG5cblx0JFsgbmFtZXNwYWNlIF0gPSAkWyBuYW1lc3BhY2UgXSB8fCB7fTtcblx0ZXhpc3RpbmdDb25zdHJ1Y3RvciA9ICRbIG5hbWVzcGFjZSBdWyBuYW1lIF07XG5cdGNvbnN0cnVjdG9yID0gJFsgbmFtZXNwYWNlIF1bIG5hbWUgXSA9IGZ1bmN0aW9uKCBvcHRpb25zLCBlbGVtZW50ICkge1xuXHRcdC8vIGFsbG93IGluc3RhbnRpYXRpb24gd2l0aG91dCBcIm5ld1wiIGtleXdvcmRcblx0XHRpZiAoICF0aGlzLl9jcmVhdGVXaWRnZXQgKSB7XG5cdFx0XHRyZXR1cm4gbmV3IGNvbnN0cnVjdG9yKCBvcHRpb25zLCBlbGVtZW50ICk7XG5cdFx0fVxuXG5cdFx0Ly8gYWxsb3cgaW5zdGFudGlhdGlvbiB3aXRob3V0IGluaXRpYWxpemluZyBmb3Igc2ltcGxlIGluaGVyaXRhbmNlXG5cdFx0Ly8gbXVzdCB1c2UgXCJuZXdcIiBrZXl3b3JkICh0aGUgY29kZSBhYm92ZSBhbHdheXMgcGFzc2VzIGFyZ3MpXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5fY3JlYXRlV2lkZ2V0KCBvcHRpb25zLCBlbGVtZW50ICk7XG5cdFx0fVxuXHR9O1xuXHQvLyBleHRlbmQgd2l0aCB0aGUgZXhpc3RpbmcgY29uc3RydWN0b3IgdG8gY2Fycnkgb3ZlciBhbnkgc3RhdGljIHByb3BlcnRpZXNcblx0JC5leHRlbmQoIGNvbnN0cnVjdG9yLCBleGlzdGluZ0NvbnN0cnVjdG9yLCB7XG5cdFx0dmVyc2lvbjogcHJvdG90eXBlLnZlcnNpb24sXG5cdFx0Ly8gY29weSB0aGUgb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBwcm90b3R5cGUgaW4gY2FzZSB3ZSBuZWVkIHRvXG5cdFx0Ly8gcmVkZWZpbmUgdGhlIHdpZGdldCBsYXRlclxuXHRcdF9wcm90bzogJC5leHRlbmQoIHt9LCBwcm90b3R5cGUgKSxcblx0XHQvLyB0cmFjayB3aWRnZXRzIHRoYXQgaW5oZXJpdCBmcm9tIHRoaXMgd2lkZ2V0IGluIGNhc2UgdGhpcyB3aWRnZXQgaXNcblx0XHQvLyByZWRlZmluZWQgYWZ0ZXIgYSB3aWRnZXQgaW5oZXJpdHMgZnJvbSBpdFxuXHRcdF9jaGlsZENvbnN0cnVjdG9yczogW11cblx0fSk7XG5cblx0YmFzZVByb3RvdHlwZSA9IG5ldyBiYXNlKCk7XG5cdC8vIHdlIG5lZWQgdG8gbWFrZSB0aGUgb3B0aW9ucyBoYXNoIGEgcHJvcGVydHkgZGlyZWN0bHkgb24gdGhlIG5ldyBpbnN0YW5jZVxuXHQvLyBvdGhlcndpc2Ugd2UnbGwgbW9kaWZ5IHRoZSBvcHRpb25zIGhhc2ggb24gdGhlIHByb3RvdHlwZSB0aGF0IHdlJ3JlXG5cdC8vIGluaGVyaXRpbmcgZnJvbVxuXHRiYXNlUHJvdG90eXBlLm9wdGlvbnMgPSAkLndpZGdldC5leHRlbmQoIHt9LCBiYXNlUHJvdG90eXBlLm9wdGlvbnMgKTtcblx0JC5lYWNoKCBwcm90b3R5cGUsIGZ1bmN0aW9uKCBwcm9wLCB2YWx1ZSApIHtcblx0XHRpZiAoICEkLmlzRnVuY3Rpb24oIHZhbHVlICkgKSB7XG5cdFx0XHRwcm94aWVkUHJvdG90eXBlWyBwcm9wIF0gPSB2YWx1ZTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0cHJveGllZFByb3RvdHlwZVsgcHJvcCBdID0gKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIF9zdXBlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHJldHVybiBiYXNlLnByb3RvdHlwZVsgcHJvcCBdLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0X3N1cGVyQXBwbHkgPSBmdW5jdGlvbiggYXJncyApIHtcblx0XHRcdFx0XHRyZXR1cm4gYmFzZS5wcm90b3R5cGVbIHByb3AgXS5hcHBseSggdGhpcywgYXJncyApO1xuXHRcdFx0XHR9O1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgX19zdXBlciA9IHRoaXMuX3N1cGVyLFxuXHRcdFx0XHRcdF9fc3VwZXJBcHBseSA9IHRoaXMuX3N1cGVyQXBwbHksXG5cdFx0XHRcdFx0cmV0dXJuVmFsdWU7XG5cblx0XHRcdFx0dGhpcy5fc3VwZXIgPSBfc3VwZXI7XG5cdFx0XHRcdHRoaXMuX3N1cGVyQXBwbHkgPSBfc3VwZXJBcHBseTtcblxuXHRcdFx0XHRyZXR1cm5WYWx1ZSA9IHZhbHVlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHR0aGlzLl9zdXBlciA9IF9fc3VwZXI7XG5cdFx0XHRcdHRoaXMuX3N1cGVyQXBwbHkgPSBfX3N1cGVyQXBwbHk7XG5cblx0XHRcdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHRcdFx0fTtcblx0XHR9KSgpO1xuXHR9KTtcblx0Y29uc3RydWN0b3IucHJvdG90eXBlID0gJC53aWRnZXQuZXh0ZW5kKCBiYXNlUHJvdG90eXBlLCB7XG5cdFx0Ly8gVE9ETzogcmVtb3ZlIHN1cHBvcnQgZm9yIHdpZGdldEV2ZW50UHJlZml4XG5cdFx0Ly8gYWx3YXlzIHVzZSB0aGUgbmFtZSArIGEgY29sb24gYXMgdGhlIHByZWZpeCwgZS5nLiwgZHJhZ2dhYmxlOnN0YXJ0XG5cdFx0Ly8gZG9uJ3QgcHJlZml4IGZvciB3aWRnZXRzIHRoYXQgYXJlbid0IERPTS1iYXNlZFxuXHRcdHdpZGdldEV2ZW50UHJlZml4OiBleGlzdGluZ0NvbnN0cnVjdG9yID8gYmFzZVByb3RvdHlwZS53aWRnZXRFdmVudFByZWZpeCA6IG5hbWVcblx0fSwgcHJveGllZFByb3RvdHlwZSwge1xuXHRcdGNvbnN0cnVjdG9yOiBjb25zdHJ1Y3Rvcixcblx0XHRuYW1lc3BhY2U6IG5hbWVzcGFjZSxcblx0XHR3aWRnZXROYW1lOiBuYW1lLFxuXHRcdHdpZGdldEZ1bGxOYW1lOiBmdWxsTmFtZVxuXHR9KTtcblxuXHQvLyBJZiB0aGlzIHdpZGdldCBpcyBiZWluZyByZWRlZmluZWQgdGhlbiB3ZSBuZWVkIHRvIGZpbmQgYWxsIHdpZGdldHMgdGhhdFxuXHQvLyBhcmUgaW5oZXJpdGluZyBmcm9tIGl0IGFuZCByZWRlZmluZSBhbGwgb2YgdGhlbSBzbyB0aGF0IHRoZXkgaW5oZXJpdCBmcm9tXG5cdC8vIHRoZSBuZXcgdmVyc2lvbiBvZiB0aGlzIHdpZGdldC4gV2UncmUgZXNzZW50aWFsbHkgdHJ5aW5nIHRvIHJlcGxhY2Ugb25lXG5cdC8vIGxldmVsIGluIHRoZSBwcm90b3R5cGUgY2hhaW4uXG5cdGlmICggZXhpc3RpbmdDb25zdHJ1Y3RvciApIHtcblx0XHQkLmVhY2goIGV4aXN0aW5nQ29uc3RydWN0b3IuX2NoaWxkQ29uc3RydWN0b3JzLCBmdW5jdGlvbiggaSwgY2hpbGQgKSB7XG5cdFx0XHR2YXIgY2hpbGRQcm90b3R5cGUgPSBjaGlsZC5wcm90b3R5cGU7XG5cblx0XHRcdC8vIHJlZGVmaW5lIHRoZSBjaGlsZCB3aWRnZXQgdXNpbmcgdGhlIHNhbWUgcHJvdG90eXBlIHRoYXQgd2FzXG5cdFx0XHQvLyBvcmlnaW5hbGx5IHVzZWQsIGJ1dCBpbmhlcml0IGZyb20gdGhlIG5ldyB2ZXJzaW9uIG9mIHRoZSBiYXNlXG5cdFx0XHQkLndpZGdldCggY2hpbGRQcm90b3R5cGUubmFtZXNwYWNlICsgXCIuXCIgKyBjaGlsZFByb3RvdHlwZS53aWRnZXROYW1lLCBjb25zdHJ1Y3RvciwgY2hpbGQuX3Byb3RvICk7XG5cdFx0fSk7XG5cdFx0Ly8gcmVtb3ZlIHRoZSBsaXN0IG9mIGV4aXN0aW5nIGNoaWxkIGNvbnN0cnVjdG9ycyBmcm9tIHRoZSBvbGQgY29uc3RydWN0b3Jcblx0XHQvLyBzbyB0aGUgb2xkIGNoaWxkIGNvbnN0cnVjdG9ycyBjYW4gYmUgZ2FyYmFnZSBjb2xsZWN0ZWRcblx0XHRkZWxldGUgZXhpc3RpbmdDb25zdHJ1Y3Rvci5fY2hpbGRDb25zdHJ1Y3RvcnM7XG5cdH0gZWxzZSB7XG5cdFx0YmFzZS5fY2hpbGRDb25zdHJ1Y3RvcnMucHVzaCggY29uc3RydWN0b3IgKTtcblx0fVxuXG5cdCQud2lkZ2V0LmJyaWRnZSggbmFtZSwgY29uc3RydWN0b3IgKTtcbn07XG5cbiQud2lkZ2V0LmV4dGVuZCA9IGZ1bmN0aW9uKCB0YXJnZXQgKSB7XG5cdHZhciBpbnB1dCA9IHNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApLFxuXHRcdGlucHV0SW5kZXggPSAwLFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdGtleSxcblx0XHR2YWx1ZTtcblx0Zm9yICggOyBpbnB1dEluZGV4IDwgaW5wdXRMZW5ndGg7IGlucHV0SW5kZXgrKyApIHtcblx0XHRmb3IgKCBrZXkgaW4gaW5wdXRbIGlucHV0SW5kZXggXSApIHtcblx0XHRcdHZhbHVlID0gaW5wdXRbIGlucHV0SW5kZXggXVsga2V5IF07XG5cdFx0XHRpZiAoIGlucHV0WyBpbnB1dEluZGV4IF0uaGFzT3duUHJvcGVydHkoIGtleSApICYmIHZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdC8vIENsb25lIG9iamVjdHNcblx0XHRcdFx0aWYgKCAkLmlzUGxhaW5PYmplY3QoIHZhbHVlICkgKSB7XG5cdFx0XHRcdFx0dGFyZ2V0WyBrZXkgXSA9ICQuaXNQbGFpbk9iamVjdCggdGFyZ2V0WyBrZXkgXSApID9cblx0XHRcdFx0XHRcdCQud2lkZ2V0LmV4dGVuZCgge30sIHRhcmdldFsga2V5IF0sIHZhbHVlICkgOlxuXHRcdFx0XHRcdFx0Ly8gRG9uJ3QgZXh0ZW5kIHN0cmluZ3MsIGFycmF5cywgZXRjLiB3aXRoIG9iamVjdHNcblx0XHRcdFx0XHRcdCQud2lkZ2V0LmV4dGVuZCgge30sIHZhbHVlICk7XG5cdFx0XHRcdC8vIENvcHkgZXZlcnl0aGluZyBlbHNlIGJ5IHJlZmVyZW5jZVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRhcmdldFsga2V5IF0gPSB2YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuJC53aWRnZXQuYnJpZGdlID0gZnVuY3Rpb24oIG5hbWUsIG9iamVjdCApIHtcblx0dmFyIGZ1bGxOYW1lID0gb2JqZWN0LnByb3RvdHlwZS53aWRnZXRGdWxsTmFtZSB8fCBuYW1lO1xuXHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIgaXNNZXRob2RDYWxsID0gdHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIsXG5cdFx0XHRhcmdzID0gc2xpY2UuY2FsbCggYXJndW1lbnRzLCAxICksXG5cdFx0XHRyZXR1cm5WYWx1ZSA9IHRoaXM7XG5cblx0XHQvLyBhbGxvdyBtdWx0aXBsZSBoYXNoZXMgdG8gYmUgcGFzc2VkIG9uIGluaXRcblx0XHRvcHRpb25zID0gIWlzTWV0aG9kQ2FsbCAmJiBhcmdzLmxlbmd0aCA/XG5cdFx0XHQkLndpZGdldC5leHRlbmQuYXBwbHkoIG51bGwsIFsgb3B0aW9ucyBdLmNvbmNhdChhcmdzKSApIDpcblx0XHRcdG9wdGlvbnM7XG5cblx0XHRpZiAoIGlzTWV0aG9kQ2FsbCApIHtcblx0XHRcdHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIG1ldGhvZFZhbHVlLFxuXHRcdFx0XHRcdGluc3RhbmNlID0gJC5kYXRhKCB0aGlzLCBmdWxsTmFtZSApO1xuXHRcdFx0XHRpZiAoICFpbnN0YW5jZSApIHtcblx0XHRcdFx0XHRyZXR1cm4gJC5lcnJvciggXCJjYW5ub3QgY2FsbCBtZXRob2RzIG9uIFwiICsgbmFtZSArIFwiIHByaW9yIHRvIGluaXRpYWxpemF0aW9uOyBcIiArXG5cdFx0XHRcdFx0XHRcImF0dGVtcHRlZCB0byBjYWxsIG1ldGhvZCAnXCIgKyBvcHRpb25zICsgXCInXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoICEkLmlzRnVuY3Rpb24oIGluc3RhbmNlW29wdGlvbnNdICkgfHwgb3B0aW9ucy5jaGFyQXQoIDAgKSA9PT0gXCJfXCIgKSB7XG5cdFx0XHRcdFx0cmV0dXJuICQuZXJyb3IoIFwibm8gc3VjaCBtZXRob2QgJ1wiICsgb3B0aW9ucyArIFwiJyBmb3IgXCIgKyBuYW1lICsgXCIgd2lkZ2V0IGluc3RhbmNlXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRtZXRob2RWYWx1ZSA9IGluc3RhbmNlWyBvcHRpb25zIF0uYXBwbHkoIGluc3RhbmNlLCBhcmdzICk7XG5cdFx0XHRcdGlmICggbWV0aG9kVmFsdWUgIT09IGluc3RhbmNlICYmIG1ldGhvZFZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0cmV0dXJuVmFsdWUgPSBtZXRob2RWYWx1ZSAmJiBtZXRob2RWYWx1ZS5qcXVlcnkgP1xuXHRcdFx0XHRcdFx0cmV0dXJuVmFsdWUucHVzaFN0YWNrKCBtZXRob2RWYWx1ZS5nZXQoKSApIDpcblx0XHRcdFx0XHRcdG1ldGhvZFZhbHVlO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGluc3RhbmNlID0gJC5kYXRhKCB0aGlzLCBmdWxsTmFtZSApO1xuXHRcdFx0XHRpZiAoIGluc3RhbmNlICkge1xuXHRcdFx0XHRcdGluc3RhbmNlLm9wdGlvbiggb3B0aW9ucyB8fCB7fSApLl9pbml0KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JC5kYXRhKCB0aGlzLCBmdWxsTmFtZSwgbmV3IG9iamVjdCggb3B0aW9ucywgdGhpcyApICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXR1cm5WYWx1ZTtcblx0fTtcbn07XG5cbiQuV2lkZ2V0ID0gZnVuY3Rpb24oIC8qIG9wdGlvbnMsIGVsZW1lbnQgKi8gKSB7fTtcbiQuV2lkZ2V0Ll9jaGlsZENvbnN0cnVjdG9ycyA9IFtdO1xuXG4kLldpZGdldC5wcm90b3R5cGUgPSB7XG5cdHdpZGdldE5hbWU6IFwid2lkZ2V0XCIsXG5cdHdpZGdldEV2ZW50UHJlZml4OiBcIlwiLFxuXHRkZWZhdWx0RWxlbWVudDogXCI8ZGl2PlwiLFxuXHRvcHRpb25zOiB7XG5cdFx0ZGlzYWJsZWQ6IGZhbHNlLFxuXG5cdFx0Ly8gY2FsbGJhY2tzXG5cdFx0Y3JlYXRlOiBudWxsXG5cdH0sXG5cdF9jcmVhdGVXaWRnZXQ6IGZ1bmN0aW9uKCBvcHRpb25zLCBlbGVtZW50ICkge1xuXHRcdGVsZW1lbnQgPSAkKCBlbGVtZW50IHx8IHRoaXMuZGVmYXVsdEVsZW1lbnQgfHwgdGhpcyApWyAwIF07XG5cdFx0dGhpcy5lbGVtZW50ID0gJCggZWxlbWVudCApO1xuXHRcdHRoaXMudXVpZCA9IHV1aWQrKztcblx0XHR0aGlzLmV2ZW50TmFtZXNwYWNlID0gXCIuXCIgKyB0aGlzLndpZGdldE5hbWUgKyB0aGlzLnV1aWQ7XG5cdFx0dGhpcy5vcHRpb25zID0gJC53aWRnZXQuZXh0ZW5kKCB7fSxcblx0XHRcdHRoaXMub3B0aW9ucyxcblx0XHRcdHRoaXMuX2dldENyZWF0ZU9wdGlvbnMoKSxcblx0XHRcdG9wdGlvbnMgKTtcblxuXHRcdHRoaXMuYmluZGluZ3MgPSAkKCk7XG5cdFx0dGhpcy5ob3ZlcmFibGUgPSAkKCk7XG5cdFx0dGhpcy5mb2N1c2FibGUgPSAkKCk7XG5cblx0XHRpZiAoIGVsZW1lbnQgIT09IHRoaXMgKSB7XG5cdFx0XHQkLmRhdGEoIGVsZW1lbnQsIHRoaXMud2lkZ2V0RnVsbE5hbWUsIHRoaXMgKTtcblx0XHRcdHRoaXMuX29uKCB0cnVlLCB0aGlzLmVsZW1lbnQsIHtcblx0XHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCBldmVudC50YXJnZXQgPT09IGVsZW1lbnQgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlc3Ryb3koKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5kb2N1bWVudCA9ICQoIGVsZW1lbnQuc3R5bGUgP1xuXHRcdFx0XHQvLyBlbGVtZW50IHdpdGhpbiB0aGUgZG9jdW1lbnRcblx0XHRcdFx0ZWxlbWVudC5vd25lckRvY3VtZW50IDpcblx0XHRcdFx0Ly8gZWxlbWVudCBpcyB3aW5kb3cgb3IgZG9jdW1lbnRcblx0XHRcdFx0ZWxlbWVudC5kb2N1bWVudCB8fCBlbGVtZW50ICk7XG5cdFx0XHR0aGlzLndpbmRvdyA9ICQoIHRoaXMuZG9jdW1lbnRbMF0uZGVmYXVsdFZpZXcgfHwgdGhpcy5kb2N1bWVudFswXS5wYXJlbnRXaW5kb3cgKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jcmVhdGUoKTtcblx0XHR0aGlzLl90cmlnZ2VyKCBcImNyZWF0ZVwiLCBudWxsLCB0aGlzLl9nZXRDcmVhdGVFdmVudERhdGEoKSApO1xuXHRcdHRoaXMuX2luaXQoKTtcblx0fSxcblx0X2dldENyZWF0ZU9wdGlvbnM6ICQubm9vcCxcblx0X2dldENyZWF0ZUV2ZW50RGF0YTogJC5ub29wLFxuXHRfY3JlYXRlOiAkLm5vb3AsXG5cdF9pbml0OiAkLm5vb3AsXG5cblx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fZGVzdHJveSgpO1xuXHRcdC8vIHdlIGNhbiBwcm9iYWJseSByZW1vdmUgdGhlIHVuYmluZCBjYWxscyBpbiAyLjBcblx0XHQvLyBhbGwgZXZlbnQgYmluZGluZ3Mgc2hvdWxkIGdvIHRocm91Z2ggdGhpcy5fb24oKVxuXHRcdHRoaXMuZWxlbWVudFxuXHRcdFx0LnVuYmluZCggdGhpcy5ldmVudE5hbWVzcGFjZSApXG5cdFx0XHQvLyAxLjkgQkMgZm9yICM3ODEwXG5cdFx0XHQvLyBUT0RPIHJlbW92ZSBkdWFsIHN0b3JhZ2Vcblx0XHRcdC5yZW1vdmVEYXRhKCB0aGlzLndpZGdldE5hbWUgKVxuXHRcdFx0LnJlbW92ZURhdGEoIHRoaXMud2lkZ2V0RnVsbE5hbWUgKVxuXHRcdFx0Ly8gc3VwcG9ydDoganF1ZXJ5IDwxLjYuM1xuXHRcdFx0Ly8gaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvOTQxM1xuXHRcdFx0LnJlbW92ZURhdGEoICQuY2FtZWxDYXNlKCB0aGlzLndpZGdldEZ1bGxOYW1lICkgKTtcblx0XHR0aGlzLndpZGdldCgpXG5cdFx0XHQudW5iaW5kKCB0aGlzLmV2ZW50TmFtZXNwYWNlIClcblx0XHRcdC5yZW1vdmVBdHRyKCBcImFyaWEtZGlzYWJsZWRcIiApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoXG5cdFx0XHRcdHRoaXMud2lkZ2V0RnVsbE5hbWUgKyBcIi1kaXNhYmxlZCBcIiArXG5cdFx0XHRcdFwidWktc3RhdGUtZGlzYWJsZWRcIiApO1xuXG5cdFx0Ly8gY2xlYW4gdXAgZXZlbnRzIGFuZCBzdGF0ZXNcblx0XHR0aGlzLmJpbmRpbmdzLnVuYmluZCggdGhpcy5ldmVudE5hbWVzcGFjZSApO1xuXHRcdHRoaXMuaG92ZXJhYmxlLnJlbW92ZUNsYXNzKCBcInVpLXN0YXRlLWhvdmVyXCIgKTtcblx0XHR0aGlzLmZvY3VzYWJsZS5yZW1vdmVDbGFzcyggXCJ1aS1zdGF0ZS1mb2N1c1wiICk7XG5cdH0sXG5cdF9kZXN0cm95OiAkLm5vb3AsXG5cblx0d2lkZ2V0OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5lbGVtZW50O1xuXHR9LFxuXG5cdG9wdGlvbjogZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSBrZXksXG5cdFx0XHRwYXJ0cyxcblx0XHRcdGN1ck9wdGlvbixcblx0XHRcdGk7XG5cblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHQvLyBkb24ndCByZXR1cm4gYSByZWZlcmVuY2UgdG8gdGhlIGludGVybmFsIGhhc2hcblx0XHRcdHJldHVybiAkLndpZGdldC5leHRlbmQoIHt9LCB0aGlzLm9wdGlvbnMgKTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHQvLyBoYW5kbGUgbmVzdGVkIGtleXMsIGUuZy4sIFwiZm9vLmJhclwiID0+IHsgZm9vOiB7IGJhcjogX19fIH0gfVxuXHRcdFx0b3B0aW9ucyA9IHt9O1xuXHRcdFx0cGFydHMgPSBrZXkuc3BsaXQoIFwiLlwiICk7XG5cdFx0XHRrZXkgPSBwYXJ0cy5zaGlmdCgpO1xuXHRcdFx0aWYgKCBwYXJ0cy5sZW5ndGggKSB7XG5cdFx0XHRcdGN1ck9wdGlvbiA9IG9wdGlvbnNbIGtleSBdID0gJC53aWRnZXQuZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zWyBrZXkgXSApO1xuXHRcdFx0XHRmb3IgKCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKyApIHtcblx0XHRcdFx0XHRjdXJPcHRpb25bIHBhcnRzWyBpIF0gXSA9IGN1ck9wdGlvblsgcGFydHNbIGkgXSBdIHx8IHt9O1xuXHRcdFx0XHRcdGN1ck9wdGlvbiA9IGN1ck9wdGlvblsgcGFydHNbIGkgXSBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGtleSA9IHBhcnRzLnBvcCgpO1xuXHRcdFx0XHRpZiAoIHZhbHVlID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGN1ck9wdGlvblsga2V5IF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBjdXJPcHRpb25bIGtleSBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGN1ck9wdGlvblsga2V5IF0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICggdmFsdWUgPT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zWyBrZXkgXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHRoaXMub3B0aW9uc1sga2V5IF07XG5cdFx0XHRcdH1cblx0XHRcdFx0b3B0aW9uc1sga2V5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9zZXRPcHRpb25zKCBvcHRpb25zICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0X3NldE9wdGlvbnM6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHZhciBrZXk7XG5cblx0XHRmb3IgKCBrZXkgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMuX3NldE9wdGlvbigga2V5LCBvcHRpb25zWyBrZXkgXSApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRfc2V0T3B0aW9uOiBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHR0aGlzLm9wdGlvbnNbIGtleSBdID0gdmFsdWU7XG5cblx0XHRpZiAoIGtleSA9PT0gXCJkaXNhYmxlZFwiICkge1xuXHRcdFx0dGhpcy53aWRnZXQoKVxuXHRcdFx0XHQudG9nZ2xlQ2xhc3MoIHRoaXMud2lkZ2V0RnVsbE5hbWUgKyBcIi1kaXNhYmxlZCB1aS1zdGF0ZS1kaXNhYmxlZFwiLCAhIXZhbHVlIClcblx0XHRcdFx0LmF0dHIoIFwiYXJpYS1kaXNhYmxlZFwiLCB2YWx1ZSApO1xuXHRcdFx0dGhpcy5ob3ZlcmFibGUucmVtb3ZlQ2xhc3MoIFwidWktc3RhdGUtaG92ZXJcIiApO1xuXHRcdFx0dGhpcy5mb2N1c2FibGUucmVtb3ZlQ2xhc3MoIFwidWktc3RhdGUtZm9jdXNcIiApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGVuYWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3NldE9wdGlvbiggXCJkaXNhYmxlZFwiLCBmYWxzZSApO1xuXHR9LFxuXHRkaXNhYmxlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2V0T3B0aW9uKCBcImRpc2FibGVkXCIsIHRydWUgKTtcblx0fSxcblxuXHRfb246IGZ1bmN0aW9uKCBzdXBwcmVzc0Rpc2FibGVkQ2hlY2ssIGVsZW1lbnQsIGhhbmRsZXJzICkge1xuXHRcdHZhciBkZWxlZ2F0ZUVsZW1lbnQsXG5cdFx0XHRpbnN0YW5jZSA9IHRoaXM7XG5cblx0XHQvLyBubyBzdXBwcmVzc0Rpc2FibGVkQ2hlY2sgZmxhZywgc2h1ZmZsZSBhcmd1bWVudHNcblx0XHRpZiAoIHR5cGVvZiBzdXBwcmVzc0Rpc2FibGVkQ2hlY2sgIT09IFwiYm9vbGVhblwiICkge1xuXHRcdFx0aGFuZGxlcnMgPSBlbGVtZW50O1xuXHRcdFx0ZWxlbWVudCA9IHN1cHByZXNzRGlzYWJsZWRDaGVjaztcblx0XHRcdHN1cHByZXNzRGlzYWJsZWRDaGVjayA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIG5vIGVsZW1lbnQgYXJndW1lbnQsIHNodWZmbGUgYW5kIHVzZSB0aGlzLmVsZW1lbnRcblx0XHRpZiAoICFoYW5kbGVycyApIHtcblx0XHRcdGhhbmRsZXJzID0gZWxlbWVudDtcblx0XHRcdGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG5cdFx0XHRkZWxlZ2F0ZUVsZW1lbnQgPSB0aGlzLndpZGdldCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBhY2NlcHQgc2VsZWN0b3JzLCBET00gZWxlbWVudHNcblx0XHRcdGVsZW1lbnQgPSBkZWxlZ2F0ZUVsZW1lbnQgPSAkKCBlbGVtZW50ICk7XG5cdFx0XHR0aGlzLmJpbmRpbmdzID0gdGhpcy5iaW5kaW5ncy5hZGQoIGVsZW1lbnQgKTtcblx0XHR9XG5cblx0XHQkLmVhY2goIGhhbmRsZXJzLCBmdW5jdGlvbiggZXZlbnQsIGhhbmRsZXIgKSB7XG5cdFx0XHRmdW5jdGlvbiBoYW5kbGVyUHJveHkoKSB7XG5cdFx0XHRcdC8vIGFsbG93IHdpZGdldHMgdG8gY3VzdG9taXplIHRoZSBkaXNhYmxlZCBoYW5kbGluZ1xuXHRcdFx0XHQvLyAtIGRpc2FibGVkIGFzIGFuIGFycmF5IGluc3RlYWQgb2YgYm9vbGVhblxuXHRcdFx0XHQvLyAtIGRpc2FibGVkIGNsYXNzIGFzIG1ldGhvZCBmb3IgZGlzYWJsaW5nIGluZGl2aWR1YWwgcGFydHNcblx0XHRcdFx0aWYgKCAhc3VwcHJlc3NEaXNhYmxlZENoZWNrICYmXG5cdFx0XHRcdFx0XHQoIGluc3RhbmNlLm9wdGlvbnMuZGlzYWJsZWQgPT09IHRydWUgfHxcblx0XHRcdFx0XHRcdFx0JCggdGhpcyApLmhhc0NsYXNzKCBcInVpLXN0YXRlLWRpc2FibGVkXCIgKSApICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gKCB0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIiA/IGluc3RhbmNlWyBoYW5kbGVyIF0gOiBoYW5kbGVyIClcblx0XHRcdFx0XHQuYXBwbHkoIGluc3RhbmNlLCBhcmd1bWVudHMgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gY29weSB0aGUgZ3VpZCBzbyBkaXJlY3QgdW5iaW5kaW5nIHdvcmtzXG5cdFx0XHRpZiAoIHR5cGVvZiBoYW5kbGVyICE9PSBcInN0cmluZ1wiICkge1xuXHRcdFx0XHRoYW5kbGVyUHJveHkuZ3VpZCA9IGhhbmRsZXIuZ3VpZCA9XG5cdFx0XHRcdFx0aGFuZGxlci5ndWlkIHx8IGhhbmRsZXJQcm94eS5ndWlkIHx8ICQuZ3VpZCsrO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbWF0Y2ggPSBldmVudC5tYXRjaCggL14oXFx3KylcXHMqKC4qKSQvICksXG5cdFx0XHRcdGV2ZW50TmFtZSA9IG1hdGNoWzFdICsgaW5zdGFuY2UuZXZlbnROYW1lc3BhY2UsXG5cdFx0XHRcdHNlbGVjdG9yID0gbWF0Y2hbMl07XG5cdFx0XHRpZiAoIHNlbGVjdG9yICkge1xuXHRcdFx0XHRkZWxlZ2F0ZUVsZW1lbnQuZGVsZWdhdGUoIHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXJQcm94eSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWxlbWVudC5iaW5kKCBldmVudE5hbWUsIGhhbmRsZXJQcm94eSApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdF9vZmY6IGZ1bmN0aW9uKCBlbGVtZW50LCBldmVudE5hbWUgKSB7XG5cdFx0ZXZlbnROYW1lID0gKGV2ZW50TmFtZSB8fCBcIlwiKS5zcGxpdCggXCIgXCIgKS5qb2luKCB0aGlzLmV2ZW50TmFtZXNwYWNlICsgXCIgXCIgKSArIHRoaXMuZXZlbnROYW1lc3BhY2U7XG5cdFx0ZWxlbWVudC51bmJpbmQoIGV2ZW50TmFtZSApLnVuZGVsZWdhdGUoIGV2ZW50TmFtZSApO1xuXHR9LFxuXG5cdF9kZWxheTogZnVuY3Rpb24oIGhhbmRsZXIsIGRlbGF5ICkge1xuXHRcdGZ1bmN0aW9uIGhhbmRsZXJQcm94eSgpIHtcblx0XHRcdHJldHVybiAoIHR5cGVvZiBoYW5kbGVyID09PSBcInN0cmluZ1wiID8gaW5zdGFuY2VbIGhhbmRsZXIgXSA6IGhhbmRsZXIgKVxuXHRcdFx0XHQuYXBwbHkoIGluc3RhbmNlLCBhcmd1bWVudHMgKTtcblx0XHR9XG5cdFx0dmFyIGluc3RhbmNlID0gdGhpcztcblx0XHRyZXR1cm4gc2V0VGltZW91dCggaGFuZGxlclByb3h5LCBkZWxheSB8fCAwICk7XG5cdH0sXG5cblx0X2hvdmVyYWJsZTogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0dGhpcy5ob3ZlcmFibGUgPSB0aGlzLmhvdmVyYWJsZS5hZGQoIGVsZW1lbnQgKTtcblx0XHR0aGlzLl9vbiggZWxlbWVudCwge1xuXHRcdFx0bW91c2VlbnRlcjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHQkKCBldmVudC5jdXJyZW50VGFyZ2V0ICkuYWRkQ2xhc3MoIFwidWktc3RhdGUtaG92ZXJcIiApO1xuXHRcdFx0fSxcblx0XHRcdG1vdXNlbGVhdmU6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0JCggZXZlbnQuY3VycmVudFRhcmdldCApLnJlbW92ZUNsYXNzKCBcInVpLXN0YXRlLWhvdmVyXCIgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRfZm9jdXNhYmxlOiBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHR0aGlzLmZvY3VzYWJsZSA9IHRoaXMuZm9jdXNhYmxlLmFkZCggZWxlbWVudCApO1xuXHRcdHRoaXMuX29uKCBlbGVtZW50LCB7XG5cdFx0XHRmb2N1c2luOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdCQoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKS5hZGRDbGFzcyggXCJ1aS1zdGF0ZS1mb2N1c1wiICk7XG5cdFx0XHR9LFxuXHRcdFx0Zm9jdXNvdXQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0JCggZXZlbnQuY3VycmVudFRhcmdldCApLnJlbW92ZUNsYXNzKCBcInVpLXN0YXRlLWZvY3VzXCIgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRfdHJpZ2dlcjogZnVuY3Rpb24oIHR5cGUsIGV2ZW50LCBkYXRhICkge1xuXHRcdHZhciBwcm9wLCBvcmlnLFxuXHRcdFx0Y2FsbGJhY2sgPSB0aGlzLm9wdGlvbnNbIHR5cGUgXTtcblxuXHRcdGRhdGEgPSBkYXRhIHx8IHt9O1xuXHRcdGV2ZW50ID0gJC5FdmVudCggZXZlbnQgKTtcblx0XHRldmVudC50eXBlID0gKCB0eXBlID09PSB0aGlzLndpZGdldEV2ZW50UHJlZml4ID9cblx0XHRcdHR5cGUgOlxuXHRcdFx0dGhpcy53aWRnZXRFdmVudFByZWZpeCArIHR5cGUgKS50b0xvd2VyQ2FzZSgpO1xuXHRcdC8vIHRoZSBvcmlnaW5hbCBldmVudCBtYXkgY29tZSBmcm9tIGFueSBlbGVtZW50XG5cdFx0Ly8gc28gd2UgbmVlZCB0byByZXNldCB0aGUgdGFyZ2V0IG9uIHRoZSBuZXcgZXZlbnRcblx0XHRldmVudC50YXJnZXQgPSB0aGlzLmVsZW1lbnRbIDAgXTtcblxuXHRcdC8vIGNvcHkgb3JpZ2luYWwgZXZlbnQgcHJvcGVydGllcyBvdmVyIHRvIHRoZSBuZXcgZXZlbnRcblx0XHRvcmlnID0gZXZlbnQub3JpZ2luYWxFdmVudDtcblx0XHRpZiAoIG9yaWcgKSB7XG5cdFx0XHRmb3IgKCBwcm9wIGluIG9yaWcgKSB7XG5cdFx0XHRcdGlmICggISggcHJvcCBpbiBldmVudCApICkge1xuXHRcdFx0XHRcdGV2ZW50WyBwcm9wIF0gPSBvcmlnWyBwcm9wIF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmVsZW1lbnQudHJpZ2dlciggZXZlbnQsIGRhdGEgKTtcblx0XHRyZXR1cm4gISggJC5pc0Z1bmN0aW9uKCBjYWxsYmFjayApICYmXG5cdFx0XHRjYWxsYmFjay5hcHBseSggdGhpcy5lbGVtZW50WzBdLCBbIGV2ZW50IF0uY29uY2F0KCBkYXRhICkgKSA9PT0gZmFsc2UgfHxcblx0XHRcdGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpICk7XG5cdH1cbn07XG5cbiQuZWFjaCggeyBzaG93OiBcImZhZGVJblwiLCBoaWRlOiBcImZhZGVPdXRcIiB9LCBmdW5jdGlvbiggbWV0aG9kLCBkZWZhdWx0RWZmZWN0ICkge1xuXHQkLldpZGdldC5wcm90b3R5cGVbIFwiX1wiICsgbWV0aG9kIF0gPSBmdW5jdGlvbiggZWxlbWVudCwgb3B0aW9ucywgY2FsbGJhY2sgKSB7XG5cdFx0aWYgKCB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdG9wdGlvbnMgPSB7IGVmZmVjdDogb3B0aW9ucyB9O1xuXHRcdH1cblx0XHR2YXIgaGFzT3B0aW9ucyxcblx0XHRcdGVmZmVjdE5hbWUgPSAhb3B0aW9ucyA/XG5cdFx0XHRcdG1ldGhvZCA6XG5cdFx0XHRcdG9wdGlvbnMgPT09IHRydWUgfHwgdHlwZW9mIG9wdGlvbnMgPT09IFwibnVtYmVyXCIgP1xuXHRcdFx0XHRcdGRlZmF1bHRFZmZlY3QgOlxuXHRcdFx0XHRcdG9wdGlvbnMuZWZmZWN0IHx8IGRlZmF1bHRFZmZlY3Q7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0aWYgKCB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJudW1iZXJcIiApIHtcblx0XHRcdG9wdGlvbnMgPSB7IGR1cmF0aW9uOiBvcHRpb25zIH07XG5cdFx0fVxuXHRcdGhhc09wdGlvbnMgPSAhJC5pc0VtcHR5T2JqZWN0KCBvcHRpb25zICk7XG5cdFx0b3B0aW9ucy5jb21wbGV0ZSA9IGNhbGxiYWNrO1xuXHRcdGlmICggb3B0aW9ucy5kZWxheSApIHtcblx0XHRcdGVsZW1lbnQuZGVsYXkoIG9wdGlvbnMuZGVsYXkgKTtcblx0XHR9XG5cdFx0aWYgKCBoYXNPcHRpb25zICYmICQuZWZmZWN0cyAmJiAkLmVmZmVjdHMuZWZmZWN0WyBlZmZlY3ROYW1lIF0gKSB7XG5cdFx0XHRlbGVtZW50WyBtZXRob2QgXSggb3B0aW9ucyApO1xuXHRcdH0gZWxzZSBpZiAoIGVmZmVjdE5hbWUgIT09IG1ldGhvZCAmJiBlbGVtZW50WyBlZmZlY3ROYW1lIF0gKSB7XG5cdFx0XHRlbGVtZW50WyBlZmZlY3ROYW1lIF0oIG9wdGlvbnMuZHVyYXRpb24sIG9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbGVtZW50LnF1ZXVlKGZ1bmN0aW9uKCBuZXh0ICkge1xuXHRcdFx0XHQkKCB0aGlzIClbIG1ldGhvZCBdKCk7XG5cdFx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbCggZWxlbWVudFsgMCBdICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSk7XG5cbn0pKTtcbiJdLCJmaWxlIjoicmFkaW8vanF1ZXJ5LnVpLndpZGdldC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
