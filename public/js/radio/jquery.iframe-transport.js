/*
 * jQuery Iframe Transport Plugin 1.6.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint unparam: true, nomen: true */
/*global define, window, document */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // Helper variable to create unique names for the transport iframes:
    var counter = 0;

    // The iframe transport accepts three additional options:
    // options.fileInput: a jQuery collection of file input fields
    // options.paramName: the parameter name for the file form data,
    //  overrides the name property of the file input field(s),
    //  can be a string or an array of strings.
    // options.formData: an array of objects with name and value properties,
    //  equivalent to the return data of .serializeArray(), e.g.:
    //  [{name: 'a', value: 1}, {name: 'b', value: 2}]
    $.ajaxTransport('iframe', function (options) {
        if (options.async) {
            var form,
                iframe,
                addParamChar;
            return {
                send: function (_, completeCallback) {
                    form = $('<form style="display:none;"></form>');
                    form.attr('accept-charset', options.formAcceptCharset);
                    addParamChar = /\?/.test(options.url) ? '&' : '?';
                    // XDomainRequest only supports GET and POST:
                    if (options.type === 'DELETE') {
                        options.url = options.url + addParamChar + '_method=DELETE';
                        options.type = 'POST';
                    } else if (options.type === 'PUT') {
                        options.url = options.url + addParamChar + '_method=PUT';
                        options.type = 'POST';
                    } else if (options.type === 'PATCH') {
                        options.url = options.url + addParamChar + '_method=PATCH';
                        options.type = 'POST';
                    }
                    // javascript:false as initial iframe src
                    // prevents warning popups on HTTPS in IE6.
                    // IE versions below IE8 cannot set the name property of
                    // elements that have already been added to the DOM,
                    // so we set the name along with the iframe HTML markup:
                    iframe = $(
                        '<iframe src="javascript:false;" name="iframe-transport-' +
                            (counter += 1) + '"></iframe>'
                    ).bind('load', function () {
                        var fileInputClones,
                            paramNames = $.isArray(options.paramName) ?
                                    options.paramName : [options.paramName];
                        iframe
                            .unbind('load')
                            .bind('load', function () {
                                var response;
                                // Wrap in a try/catch block to catch exceptions thrown
                                // when trying to access cross-domain iframe contents:
                                try {
                                    response = iframe.contents();
                                    // Google Chrome and Firefox do not throw an
                                    // exception when calling iframe.contents() on
                                    // cross-domain requests, so we unify the response:
                                    if (!response.length || !response[0].firstChild) {
                                        throw new Error();
                                    }
                                } catch (e) {
                                    response = undefined;
                                }
                                // The complete callback returns the
                                // iframe content document as response object:
                                completeCallback(
                                    200,
                                    'success',
                                    {'iframe': response}
                                );
                                // Fix for IE endless progress bar activity bug
                                // (happens on form submits to iframe targets):
                                $('<iframe src="javascript:false;"></iframe>')
                                    .appendTo(form);
                                form.remove();
                            });
                        form
                            .prop('target', iframe.prop('name'))
                            .prop('action', options.url)
                            .prop('method', options.type);
                        if (options.formData) {
                            $.each(options.formData, function (index, field) {
                                $('<input type="hidden"/>')
                                    .prop('name', field.name)
                                    .val(field.value)
                                    .appendTo(form);
                            });
                        }
                        if (options.fileInput && options.fileInput.length &&
                                options.type === 'POST') {
                            fileInputClones = options.fileInput.clone();
                            // Insert a clone for each file input field:
                            options.fileInput.after(function (index) {
                                return fileInputClones[index];
                            });
                            if (options.paramName) {
                                options.fileInput.each(function (index) {
                                    $(this).prop(
                                        'name',
                                        paramNames[index] || options.paramName
                                    );
                                });
                            }
                            // Appending the file input fields to the hidden form
                            // removes them from their original location:
                            form
                                .append(options.fileInput)
                                .prop('enctype', 'multipart/form-data')
                                // enctype must be set as encoding for IE:
                                .prop('encoding', 'multipart/form-data');
                        }
                        form.submit();
                        // Insert the file input fields at their original location
                        // by replacing the clones with the originals:
                        if (fileInputClones && fileInputClones.length) {
                            options.fileInput.each(function (index, input) {
                                var clone = $(fileInputClones[index]);
                                $(input).prop('name', clone.prop('name'));
                                clone.replaceWith(input);
                            });
                        }
                    });
                    form.append(iframe).appendTo(document.body);
                },
                abort: function () {
                    if (iframe) {
                        // javascript:false as iframe src aborts the request
                        // and prevents warning popups on HTTPS in IE6.
                        // concat is used to avoid the "Script URL" JSLint error:
                        iframe
                            .unbind('load')
                            .prop('src', 'javascript'.concat(':false;'));
                    }
                    if (form) {
                        form.remove();
                    }
                }
            };
        }
    });

    // The iframe transport returns the iframe content document as response.
    // The following adds converters from iframe to text, json, html, and script:
    $.ajaxSetup({
        converters: {
            'iframe text': function (iframe) {
                return iframe && $(iframe[0].body).text();
            },
            'iframe json': function (iframe) {
                return iframe && $.parseJSON($(iframe[0].body).text());
            },
            'iframe html': function (iframe) {
                return iframe && $(iframe[0].body).html();
            },
            'iframe script': function (iframe) {
                return iframe && $.globalEval($(iframe[0].body).text());
            }
        }
    });

}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby9qcXVlcnkuaWZyYW1lLXRyYW5zcG9ydC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogalF1ZXJ5IElmcmFtZSBUcmFuc3BvcnQgUGx1Z2luIDEuNi4xXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYmx1ZWltcC9qUXVlcnktRmlsZS1VcGxvYWRcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMSwgU2ViYXN0aWFuIFRzY2hhblxuICogaHR0cHM6Ly9ibHVlaW1wLm5ldFxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLypqc2xpbnQgdW5wYXJhbTogdHJ1ZSwgbm9tZW46IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZSwgd2luZG93LCBkb2N1bWVudCAqL1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgQU1EIG1vZHVsZTpcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsczpcbiAgICAgICAgZmFjdG9yeSh3aW5kb3cualF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSGVscGVyIHZhcmlhYmxlIHRvIGNyZWF0ZSB1bmlxdWUgbmFtZXMgZm9yIHRoZSB0cmFuc3BvcnQgaWZyYW1lczpcbiAgICB2YXIgY291bnRlciA9IDA7XG5cbiAgICAvLyBUaGUgaWZyYW1lIHRyYW5zcG9ydCBhY2NlcHRzIHRocmVlIGFkZGl0aW9uYWwgb3B0aW9uczpcbiAgICAvLyBvcHRpb25zLmZpbGVJbnB1dDogYSBqUXVlcnkgY29sbGVjdGlvbiBvZiBmaWxlIGlucHV0IGZpZWxkc1xuICAgIC8vIG9wdGlvbnMucGFyYW1OYW1lOiB0aGUgcGFyYW1ldGVyIG5hbWUgZm9yIHRoZSBmaWxlIGZvcm0gZGF0YSxcbiAgICAvLyAgb3ZlcnJpZGVzIHRoZSBuYW1lIHByb3BlcnR5IG9mIHRoZSBmaWxlIGlucHV0IGZpZWxkKHMpLFxuICAgIC8vICBjYW4gYmUgYSBzdHJpbmcgb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncy5cbiAgICAvLyBvcHRpb25zLmZvcm1EYXRhOiBhbiBhcnJheSBvZiBvYmplY3RzIHdpdGggbmFtZSBhbmQgdmFsdWUgcHJvcGVydGllcyxcbiAgICAvLyAgZXF1aXZhbGVudCB0byB0aGUgcmV0dXJuIGRhdGEgb2YgLnNlcmlhbGl6ZUFycmF5KCksIGUuZy46XG4gICAgLy8gIFt7bmFtZTogJ2EnLCB2YWx1ZTogMX0sIHtuYW1lOiAnYicsIHZhbHVlOiAyfV1cbiAgICAkLmFqYXhUcmFuc3BvcnQoJ2lmcmFtZScsIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmFzeW5jKSB7XG4gICAgICAgICAgICB2YXIgZm9ybSxcbiAgICAgICAgICAgICAgICBpZnJhbWUsXG4gICAgICAgICAgICAgICAgYWRkUGFyYW1DaGFyO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzZW5kOiBmdW5jdGlvbiAoXywgY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBmb3JtID0gJCgnPGZvcm0gc3R5bGU9XCJkaXNwbGF5Om5vbmU7XCI+PC9mb3JtPicpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLmF0dHIoJ2FjY2VwdC1jaGFyc2V0Jywgb3B0aW9ucy5mb3JtQWNjZXB0Q2hhcnNldCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZFBhcmFtQ2hhciA9IC9cXD8vLnRlc3Qob3B0aW9ucy51cmwpID8gJyYnIDogJz8nO1xuICAgICAgICAgICAgICAgICAgICAvLyBYRG9tYWluUmVxdWVzdCBvbmx5IHN1cHBvcnRzIEdFVCBhbmQgUE9TVDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudHlwZSA9PT0gJ0RFTEVURScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudXJsID0gb3B0aW9ucy51cmwgKyBhZGRQYXJhbUNoYXIgKyAnX21ldGhvZD1ERUxFVEUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50eXBlID0gJ1BPU1QnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMudHlwZSA9PT0gJ1BVVCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudXJsID0gb3B0aW9ucy51cmwgKyBhZGRQYXJhbUNoYXIgKyAnX21ldGhvZD1QVVQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50eXBlID0gJ1BPU1QnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMudHlwZSA9PT0gJ1BBVENIJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy51cmwgPSBvcHRpb25zLnVybCArIGFkZFBhcmFtQ2hhciArICdfbWV0aG9kPVBBVENIJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudHlwZSA9ICdQT1NUJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBqYXZhc2NyaXB0OmZhbHNlIGFzIGluaXRpYWwgaWZyYW1lIHNyY1xuICAgICAgICAgICAgICAgICAgICAvLyBwcmV2ZW50cyB3YXJuaW5nIHBvcHVwcyBvbiBIVFRQUyBpbiBJRTYuXG4gICAgICAgICAgICAgICAgICAgIC8vIElFIHZlcnNpb25zIGJlbG93IElFOCBjYW5ub3Qgc2V0IHRoZSBuYW1lIHByb3BlcnR5IG9mXG4gICAgICAgICAgICAgICAgICAgIC8vIGVsZW1lbnRzIHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gdGhlIERPTSxcbiAgICAgICAgICAgICAgICAgICAgLy8gc28gd2Ugc2V0IHRoZSBuYW1lIGFsb25nIHdpdGggdGhlIGlmcmFtZSBIVE1MIG1hcmt1cDpcbiAgICAgICAgICAgICAgICAgICAgaWZyYW1lID0gJChcbiAgICAgICAgICAgICAgICAgICAgICAgICc8aWZyYW1lIHNyYz1cImphdmFzY3JpcHQ6ZmFsc2U7XCIgbmFtZT1cImlmcmFtZS10cmFuc3BvcnQtJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvdW50ZXIgKz0gMSkgKyAnXCI+PC9pZnJhbWU+J1xuICAgICAgICAgICAgICAgICAgICApLmJpbmQoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmlsZUlucHV0Q2xvbmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZXMgPSAkLmlzQXJyYXkob3B0aW9ucy5wYXJhbU5hbWUpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucGFyYW1OYW1lIDogW29wdGlvbnMucGFyYW1OYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmcmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC51bmJpbmQoJ2xvYWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5iaW5kKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdyYXAgaW4gYSB0cnkvY2F0Y2ggYmxvY2sgdG8gY2F0Y2ggZXhjZXB0aW9ucyB0aHJvd25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiB0cnlpbmcgdG8gYWNjZXNzIGNyb3NzLWRvbWFpbiBpZnJhbWUgY29udGVudHM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IGlmcmFtZS5jb250ZW50cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR29vZ2xlIENocm9tZSBhbmQgRmlyZWZveCBkbyBub3QgdGhyb3cgYW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4Y2VwdGlvbiB3aGVuIGNhbGxpbmcgaWZyYW1lLmNvbnRlbnRzKCkgb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyb3NzLWRvbWFpbiByZXF1ZXN0cywgc28gd2UgdW5pZnkgdGhlIHJlc3BvbnNlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5sZW5ndGggfHwgIXJlc3BvbnNlWzBdLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNvbXBsZXRlIGNhbGxiYWNrIHJldHVybnMgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmcmFtZSBjb250ZW50IGRvY3VtZW50IGFzIHJlc3BvbnNlIG9iamVjdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVDYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDIwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsnaWZyYW1lJzogcmVzcG9uc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpeCBmb3IgSUUgZW5kbGVzcyBwcm9ncmVzcyBiYXIgYWN0aXZpdHkgYnVnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIChoYXBwZW5zIG9uIGZvcm0gc3VibWl0cyB0byBpZnJhbWUgdGFyZ2V0cyk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJzxpZnJhbWUgc3JjPVwiamF2YXNjcmlwdDpmYWxzZTtcIj48L2lmcmFtZT4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKGZvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCd0YXJnZXQnLCBpZnJhbWUucHJvcCgnbmFtZScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCdhY3Rpb24nLCBvcHRpb25zLnVybClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCgnbWV0aG9kJywgb3B0aW9ucy50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmZvcm1EYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5lYWNoKG9wdGlvbnMuZm9ybURhdGEsIGZ1bmN0aW9uIChpbmRleCwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIi8+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCduYW1lJywgZmllbGQubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWwoZmllbGQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5maWxlSW5wdXQgJiYgb3B0aW9ucy5maWxlSW5wdXQubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudHlwZSA9PT0gJ1BPU1QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUlucHV0Q2xvbmVzID0gb3B0aW9ucy5maWxlSW5wdXQuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgYSBjbG9uZSBmb3IgZWFjaCBmaWxlIGlucHV0IGZpZWxkOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZmlsZUlucHV0LmFmdGVyKGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZUlucHV0Q2xvbmVzW2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wYXJhbU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5maWxlSW5wdXQuZWFjaChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucHJvcChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbmFtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1OYW1lc1tpbmRleF0gfHwgb3B0aW9ucy5wYXJhbU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBcHBlbmRpbmcgdGhlIGZpbGUgaW5wdXQgZmllbGRzIHRvIHRoZSBoaWRkZW4gZm9ybVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZXMgdGhlbSBmcm9tIHRoZWlyIG9yaWdpbmFsIGxvY2F0aW9uOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChvcHRpb25zLmZpbGVJbnB1dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoJ2VuY3R5cGUnLCAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVuY3R5cGUgbXVzdCBiZSBzZXQgYXMgZW5jb2RpbmcgZm9yIElFOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCgnZW5jb2RpbmcnLCAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybS5zdWJtaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCB0aGUgZmlsZSBpbnB1dCBmaWVsZHMgYXQgdGhlaXIgb3JpZ2luYWwgbG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ5IHJlcGxhY2luZyB0aGUgY2xvbmVzIHdpdGggdGhlIG9yaWdpbmFsczpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlSW5wdXRDbG9uZXMgJiYgZmlsZUlucHV0Q2xvbmVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZmlsZUlucHV0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBpbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xvbmUgPSAkKGZpbGVJbnB1dENsb25lc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGlucHV0KS5wcm9wKCduYW1lJywgY2xvbmUucHJvcCgnbmFtZScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmUucmVwbGFjZVdpdGgoaW5wdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5hcHBlbmQoaWZyYW1lKS5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFib3J0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGphdmFzY3JpcHQ6ZmFsc2UgYXMgaWZyYW1lIHNyYyBhYm9ydHMgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZCBwcmV2ZW50cyB3YXJuaW5nIHBvcHVwcyBvbiBIVFRQUyBpbiBJRTYuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25jYXQgaXMgdXNlZCB0byBhdm9pZCB0aGUgXCJTY3JpcHQgVVJMXCIgSlNMaW50IGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWZyYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnVuYmluZCgnbG9hZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoJ3NyYycsICdqYXZhc2NyaXB0Jy5jb25jYXQoJzpmYWxzZTsnKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgaWZyYW1lIHRyYW5zcG9ydCByZXR1cm5zIHRoZSBpZnJhbWUgY29udGVudCBkb2N1bWVudCBhcyByZXNwb25zZS5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGFkZHMgY29udmVydGVycyBmcm9tIGlmcmFtZSB0byB0ZXh0LCBqc29uLCBodG1sLCBhbmQgc2NyaXB0OlxuICAgICQuYWpheFNldHVwKHtcbiAgICAgICAgY29udmVydGVyczoge1xuICAgICAgICAgICAgJ2lmcmFtZSB0ZXh0JzogZnVuY3Rpb24gKGlmcmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpZnJhbWUgJiYgJChpZnJhbWVbMF0uYm9keSkudGV4dCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdpZnJhbWUganNvbic6IGZ1bmN0aW9uIChpZnJhbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWZyYW1lICYmICQucGFyc2VKU09OKCQoaWZyYW1lWzBdLmJvZHkpLnRleHQoKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2lmcmFtZSBodG1sJzogZnVuY3Rpb24gKGlmcmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpZnJhbWUgJiYgJChpZnJhbWVbMF0uYm9keSkuaHRtbCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdpZnJhbWUgc2NyaXB0JzogZnVuY3Rpb24gKGlmcmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpZnJhbWUgJiYgJC5nbG9iYWxFdmFsKCQoaWZyYW1lWzBdLmJvZHkpLnRleHQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkpO1xuIl0sImZpbGUiOiJyYWRpby9qcXVlcnkuaWZyYW1lLXRyYW5zcG9ydC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
