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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpb3cvanF1ZXJ5LmlmcmFtZS10cmFuc3BvcnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIGpRdWVyeSBJZnJhbWUgVHJhbnNwb3J0IFBsdWdpbiAxLjYuMVxuICogaHR0cHM6Ly9naXRodWIuY29tL2JsdWVpbXAvalF1ZXJ5LUZpbGUtVXBsb2FkXG4gKlxuICogQ29weXJpZ2h0IDIwMTEsIFNlYmFzdGlhbiBUc2NoYW5cbiAqIGh0dHBzOi8vYmx1ZWltcC5uZXRcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5cbi8qanNsaW50IHVucGFyYW06IHRydWUsIG5vbWVuOiB0cnVlICovXG4vKmdsb2JhbCBkZWZpbmUsIHdpbmRvdywgZG9jdW1lbnQgKi9cblxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIEFNRCBtb2R1bGU6XG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHM6XG4gICAgICAgIGZhY3Rvcnkod2luZG93LmpRdWVyeSk7XG4gICAgfVxufShmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhlbHBlciB2YXJpYWJsZSB0byBjcmVhdGUgdW5pcXVlIG5hbWVzIGZvciB0aGUgdHJhbnNwb3J0IGlmcmFtZXM6XG4gICAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gICAgLy8gVGhlIGlmcmFtZSB0cmFuc3BvcnQgYWNjZXB0cyB0aHJlZSBhZGRpdGlvbmFsIG9wdGlvbnM6XG4gICAgLy8gb3B0aW9ucy5maWxlSW5wdXQ6IGEgalF1ZXJ5IGNvbGxlY3Rpb24gb2YgZmlsZSBpbnB1dCBmaWVsZHNcbiAgICAvLyBvcHRpb25zLnBhcmFtTmFtZTogdGhlIHBhcmFtZXRlciBuYW1lIGZvciB0aGUgZmlsZSBmb3JtIGRhdGEsXG4gICAgLy8gIG92ZXJyaWRlcyB0aGUgbmFtZSBwcm9wZXJ0eSBvZiB0aGUgZmlsZSBpbnB1dCBmaWVsZChzKSxcbiAgICAvLyAgY2FuIGJlIGEgc3RyaW5nIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MuXG4gICAgLy8gb3B0aW9ucy5mb3JtRGF0YTogYW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIG5hbWUgYW5kIHZhbHVlIHByb3BlcnRpZXMsXG4gICAgLy8gIGVxdWl2YWxlbnQgdG8gdGhlIHJldHVybiBkYXRhIG9mIC5zZXJpYWxpemVBcnJheSgpLCBlLmcuOlxuICAgIC8vICBbe25hbWU6ICdhJywgdmFsdWU6IDF9LCB7bmFtZTogJ2InLCB2YWx1ZTogMn1dXG4gICAgJC5hamF4VHJhbnNwb3J0KCdpZnJhbWUnLCBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucy5hc3luYykge1xuICAgICAgICAgICAgdmFyIGZvcm0sXG4gICAgICAgICAgICAgICAgaWZyYW1lLFxuICAgICAgICAgICAgICAgIGFkZFBhcmFtQ2hhcjtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2VuZDogZnVuY3Rpb24gKF8sIGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybSA9ICQoJzxmb3JtIHN0eWxlPVwiZGlzcGxheTpub25lO1wiPjwvZm9ybT4nKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5hdHRyKCdhY2NlcHQtY2hhcnNldCcsIG9wdGlvbnMuZm9ybUFjY2VwdENoYXJzZXQpO1xuICAgICAgICAgICAgICAgICAgICBhZGRQYXJhbUNoYXIgPSAvXFw/Ly50ZXN0KG9wdGlvbnMudXJsKSA/ICcmJyA6ICc/JztcbiAgICAgICAgICAgICAgICAgICAgLy8gWERvbWFpblJlcXVlc3Qgb25seSBzdXBwb3J0cyBHRVQgYW5kIFBPU1Q6XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnR5cGUgPT09ICdERUxFVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnVybCA9IG9wdGlvbnMudXJsICsgYWRkUGFyYW1DaGFyICsgJ19tZXRob2Q9REVMRVRFJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudHlwZSA9ICdQT1NUJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnR5cGUgPT09ICdQVVQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnVybCA9IG9wdGlvbnMudXJsICsgYWRkUGFyYW1DaGFyICsgJ19tZXRob2Q9UFVUJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudHlwZSA9ICdQT1NUJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnR5cGUgPT09ICdQQVRDSCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudXJsID0gb3B0aW9ucy51cmwgKyBhZGRQYXJhbUNoYXIgKyAnX21ldGhvZD1QQVRDSCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnR5cGUgPSAnUE9TVCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gamF2YXNjcmlwdDpmYWxzZSBhcyBpbml0aWFsIGlmcmFtZSBzcmNcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJldmVudHMgd2FybmluZyBwb3B1cHMgb24gSFRUUFMgaW4gSUU2LlxuICAgICAgICAgICAgICAgICAgICAvLyBJRSB2ZXJzaW9ucyBiZWxvdyBJRTggY2Fubm90IHNldCB0aGUgbmFtZSBwcm9wZXJ0eSBvZlxuICAgICAgICAgICAgICAgICAgICAvLyBlbGVtZW50cyB0aGF0IGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIHRoZSBET00sXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvIHdlIHNldCB0aGUgbmFtZSBhbG9uZyB3aXRoIHRoZSBpZnJhbWUgSFRNTCBtYXJrdXA6XG4gICAgICAgICAgICAgICAgICAgIGlmcmFtZSA9ICQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGlmcmFtZSBzcmM9XCJqYXZhc2NyaXB0OmZhbHNlO1wiIG5hbWU9XCJpZnJhbWUtdHJhbnNwb3J0LScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb3VudGVyICs9IDEpICsgJ1wiPjwvaWZyYW1lPidcbiAgICAgICAgICAgICAgICAgICAgKS5iaW5kKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpbGVJbnB1dENsb25lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbU5hbWVzID0gJC5pc0FycmF5KG9wdGlvbnMucGFyYW1OYW1lKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnBhcmFtTmFtZSA6IFtvcHRpb25zLnBhcmFtTmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudW5iaW5kKCdsb2FkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYmluZCgnbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXcmFwIGluIGEgdHJ5L2NhdGNoIGJsb2NrIHRvIGNhdGNoIGV4Y2VwdGlvbnMgdGhyb3duXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdHJ5aW5nIHRvIGFjY2VzcyBjcm9zcy1kb21haW4gaWZyYW1lIGNvbnRlbnRzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBpZnJhbWUuY29udGVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBDaHJvbWUgYW5kIEZpcmVmb3ggZG8gbm90IHRocm93IGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleGNlcHRpb24gd2hlbiBjYWxsaW5nIGlmcmFtZS5jb250ZW50cygpIG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjcm9zcy1kb21haW4gcmVxdWVzdHMsIHNvIHdlIHVuaWZ5IHRoZSByZXNwb25zZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UubGVuZ3RoIHx8ICFyZXNwb25zZVswXS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjb21wbGV0ZSBjYWxsYmFjayByZXR1cm5zIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZnJhbWUgY29udGVudCBkb2N1bWVudCBhcyByZXNwb25zZSBvYmplY3Q6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlQ2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7J2lmcmFtZSc6IHJlc3BvbnNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXggZm9yIElFIGVuZGxlc3MgcHJvZ3Jlc3MgYmFyIGFjdGl2aXR5IGJ1Z1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoaGFwcGVucyBvbiBmb3JtIHN1Ym1pdHMgdG8gaWZyYW1lIHRhcmdldHMpOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCc8aWZyYW1lIHNyYz1cImphdmFzY3JpcHQ6ZmFsc2U7XCI+PC9pZnJhbWU+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmRUbyhmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCgndGFyZ2V0JywgaWZyYW1lLnByb3AoJ25hbWUnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCgnYWN0aW9uJywgb3B0aW9ucy51cmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoJ21ldGhvZCcsIG9wdGlvbnMudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5mb3JtRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaChvcHRpb25zLmZvcm1EYXRhLCBmdW5jdGlvbiAoaW5kZXgsIGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIvPicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCgnbmFtZScsIGZpZWxkLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsKGZpZWxkLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKGZvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZmlsZUlucHV0ICYmIG9wdGlvbnMuZmlsZUlucHV0Lmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnR5cGUgPT09ICdQT1NUJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVJbnB1dENsb25lcyA9IG9wdGlvbnMuZmlsZUlucHV0LmNsb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IGEgY2xvbmUgZm9yIGVhY2ggZmlsZSBpbnB1dCBmaWVsZDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmZpbGVJbnB1dC5hZnRlcihmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVJbnB1dENsb25lc1tpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucGFyYW1OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZmlsZUlucHV0LmVhY2goZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnByb3AoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25hbWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZXNbaW5kZXhdIHx8IG9wdGlvbnMucGFyYW1OYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXBwZW5kaW5nIHRoZSBmaWxlIGlucHV0IGZpZWxkcyB0byB0aGUgaGlkZGVuIGZvcm1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmVzIHRoZW0gZnJvbSB0aGVpciBvcmlnaW5hbCBsb2NhdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQob3B0aW9ucy5maWxlSW5wdXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCdlbmN0eXBlJywgJ211bHRpcGFydC9mb3JtLWRhdGEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbmN0eXBlIG11c3QgYmUgc2V0IGFzIGVuY29kaW5nIGZvciBJRTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoJ2VuY29kaW5nJywgJ211bHRpcGFydC9mb3JtLWRhdGEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm0uc3VibWl0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGhlIGZpbGUgaW5wdXQgZmllbGRzIGF0IHRoZWlyIG9yaWdpbmFsIGxvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBieSByZXBsYWNpbmcgdGhlIGNsb25lcyB3aXRoIHRoZSBvcmlnaW5hbHM6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZUlucHV0Q2xvbmVzICYmIGZpbGVJbnB1dENsb25lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmZpbGVJbnB1dC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgaW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsb25lID0gJChmaWxlSW5wdXRDbG9uZXNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChpbnB1dCkucHJvcCgnbmFtZScsIGNsb25lLnByb3AoJ25hbWUnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lLnJlcGxhY2VXaXRoKGlucHV0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uYXBwZW5kKGlmcmFtZSkuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhYm9ydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBqYXZhc2NyaXB0OmZhbHNlIGFzIGlmcmFtZSBzcmMgYWJvcnRzIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmQgcHJldmVudHMgd2FybmluZyBwb3B1cHMgb24gSFRUUFMgaW4gSUU2LlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uY2F0IGlzIHVzZWQgdG8gYXZvaWQgdGhlIFwiU2NyaXB0IFVSTFwiIEpTTGludCBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmcmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC51bmJpbmQoJ2xvYWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCdzcmMnLCAnamF2YXNjcmlwdCcuY29uY2F0KCc6ZmFsc2U7JykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGhlIGlmcmFtZSB0cmFuc3BvcnQgcmV0dXJucyB0aGUgaWZyYW1lIGNvbnRlbnQgZG9jdW1lbnQgYXMgcmVzcG9uc2UuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBhZGRzIGNvbnZlcnRlcnMgZnJvbSBpZnJhbWUgdG8gdGV4dCwganNvbiwgaHRtbCwgYW5kIHNjcmlwdDpcbiAgICAkLmFqYXhTZXR1cCh7XG4gICAgICAgIGNvbnZlcnRlcnM6IHtcbiAgICAgICAgICAgICdpZnJhbWUgdGV4dCc6IGZ1bmN0aW9uIChpZnJhbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWZyYW1lICYmICQoaWZyYW1lWzBdLmJvZHkpLnRleHQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnaWZyYW1lIGpzb24nOiBmdW5jdGlvbiAoaWZyYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmcmFtZSAmJiAkLnBhcnNlSlNPTigkKGlmcmFtZVswXS5ib2R5KS50ZXh0KCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdpZnJhbWUgaHRtbCc6IGZ1bmN0aW9uIChpZnJhbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWZyYW1lICYmICQoaWZyYW1lWzBdLmJvZHkpLmh0bWwoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnaWZyYW1lIHNjcmlwdCc6IGZ1bmN0aW9uIChpZnJhbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWZyYW1lICYmICQuZ2xvYmFsRXZhbCgkKGlmcmFtZVswXS5ib2R5KS50ZXh0KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKTtcbiJdLCJmaWxlIjoicmFkaW93L2pxdWVyeS5pZnJhbWUtdHJhbnNwb3J0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
