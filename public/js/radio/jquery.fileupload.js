/*
 * jQuery File Upload Plugin 5.26
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document, File, Blob, FormData, location */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'jquery.ui.widget'
        ], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // The FileReader API is not actually used, but works as feature detection,
    // as e.g. Safari supports XHR file uploads via the FormData API,
    // but not non-multipart XHR file uploads:
    $.support.xhrFileUpload = !!(window.XMLHttpRequestUpload && window.FileReader);
    $.support.xhrFormDataFileUpload = !!window.FormData;

    // The fileupload widget listens for change events on file input fields defined
    // via fileInput setting and paste or drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files using
    // the fileupload API.
    // By default, files added via file input selection, paste, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.
    $.widget('blueimp.fileupload', {

        options: {
            // The drop target element(s), by the default the complete document.
            // Set to null to disable drag & drop support:
            dropZone: $(document),
            // The paste target element(s), by the default the complete document.
            // Set to null to disable paste support:
            pasteZone: $(document),
            // The file input field(s), that are listened to for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null to disable the change listener.
            fileInput: undefined,
            // By default, the file input field is replaced with a clone after
            // each input field change event. This is required for iframe transport
            // queues and allows change events to be fired for the same file
            // selection, but can be disabled by setting the following option to false:
            replaceFileInput: true,
            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,
            // Set the following option to true to force iframe transport uploads:
            forceIframeTransport: false,
            // Set the following option to the location of a redirect url on the
            // origin server, for cross-domain iframe transport uploads:
            redirect: undefined,
            // The parameter name for the redirect url, sent as part of the form
            // data and set to 'redirect' if this option is empty:
            redirectParamName: undefined,
            // Set the following option to the location of a postMessage window,
            // to enable postMessage transport uploads:
            postMessage: undefined,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,
            // By default, uploads are started automatically when adding files:
            autoUpload: true,

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uplaods, else
            // once for each file selection.
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows to override plugin options as well as define ajax settings.
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                if (data.autoUpload || (data.autoUpload !== false &&
                        ($(this).data('blueimp-fileupload') ||
                        $(this).data('fileupload')).options.autoUpload)) {
                    data.submit();
                }
            },

            // Other callbacks:

            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);

            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);

            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);

            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);

            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);

            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);

            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);

            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // Callback for the start of each chunk upload request:
            // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

            // Callback for successful chunk uploads:
            // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

            // Callback for failed (abort or error) chunk uploads:
            // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

            // Callback for completed (success, abort or error) chunk upload requests:
            // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        },

        // A list of options that require a refresh after assigning a new value:
        _refreshOptionsList: [
            'fileInput',
            'dropZone',
            'pasteZone',
            'multipart',
            'forceIframeTransport'
        ],

        _BitrateTimer: function () {
            this.timestamp = +(new Date());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function (now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        },

        _isXHRUpload: function (options) {
            return !options.forceIframeTransport &&
                ((!options.multipart && $.support.xhrFileUpload) ||
                $.support.xhrFormDataFileUpload);
        },

        _getFormData: function (options) {
            var formData;
            if (typeof options.formData === 'function') {
                return options.formData(options.form);
            }
            if ($.isArray(options.formData)) {
                return options.formData;
            }
            if (options.formData) {
                formData = [];
                $.each(options.formData, function (name, value) {
                    formData.push({name: name, value: value});
                });
                return formData;
            }
            return [];
        },

        _getTotal: function (files) {
            var total = 0;
            $.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _initProgressObject: function (obj) {
            obj._progress = {
                loaded: 0,
                total: 0,
                bitrate: 0
            };
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var now = +(new Date()),
                    loaded;
                if (data._time && data.progressInterval &&
                        (now - data._time < data.progressInterval) &&
                        e.loaded !== e.total) {
                    return;
                }
                data._time = now;
                loaded = Math.floor(
                    e.loaded / e.total * (data.chunkSize || data._progress.total)
                ) + (data.uploadedBytes || 0);
                // Add the difference from the previously loaded state
                // to the global loaded counter:
                this._progress.loaded += (loaded - data._progress.loaded);
                this._progress.bitrate = this._bitrateTimer.getBitrate(
                    now,
                    this._progress.loaded,
                    data.bitrateInterval
                );
                data._progress.loaded = data.loaded = loaded;
                data._progress.bitrate = data.bitrate = data._bitrateTimer.getBitrate(
                    now,
                    loaded,
                    data.bitrateInterval
                );
                // Trigger a custom progress event with a total data property set
                // to the file size(s) of the current upload and a loaded data
                // property calculated accordingly:
                this._trigger('progress', e, data);
                // Trigger a global progress event for all current file uploads,
                // including ajax calls queued for sequential file uploads:
                this._trigger('progressall', e, this._progress);
            }
        },

        _initProgressListener: function (options) {
            var that = this,
                xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
            // Accesss to the native XHR object is required to add event listeners
            // for the upload progress event:
            if (xhr.upload) {
                $(xhr.upload).bind('progress', function (e) {
                    var oe = e.originalEvent;
                    // Make sure the progress event properties get copied over:
                    e.lengthComputable = oe.lengthComputable;
                    e.loaded = oe.loaded;
                    e.total = oe.total;
                    that._onProgress(e, options);
                });
                options.xhr = function () {
                    return xhr;
                };
            }
        },

        _initXHRData: function (options) {
            var formData,
                file = options.files[0],
                // Ignore non-multipart setting if not supported:
                multipart = options.multipart || !$.support.xhrFileUpload,
                paramName = options.paramName[0];
            options.headers = options.headers || {};
            if (options.contentRange) {
                options.headers['Content-Range'] = options.contentRange;
            }
            if (!multipart) {
                options.headers['Content-Disposition'] = 'attachment; filename="' +
                    encodeURI(file.name) + '"';
                options.contentType = file.type;
                options.data = options.blob || file;
            } else if ($.support.xhrFormDataFileUpload) {
                if (options.postMessage) {
                    // window.postMessage does not allow sending FormData
                    // objects, so we just add the File/Blob objects to
                    // the formData array and let the postMessage window
                    // create the FormData object out of this array:
                    formData = this._getFormData(options);
                    if (options.blob) {
                        formData.push({
                            name: paramName,
                            value: options.blob
                        });
                    } else {
                        $.each(options.files, function (index, file) {
                            formData.push({
                                name: options.paramName[index] || paramName,
                                value: file
                            });
                        });
                    }
                } else {
                    if (options.formData instanceof FormData) {
                        formData = options.formData;
                    } else {
                        formData = new FormData();
                        $.each(this._getFormData(options), function (index, field) {
                            formData.append(field.name, field.value);
                        });
                    }
                    if (options.blob) {
                        options.headers['Content-Disposition'] = 'attachment; filename="' +
                            encodeURI(file.name) + '"';
                        formData.append(paramName, options.blob, file.name);
                    } else {
                        $.each(options.files, function (index, file) {
                            // Files are also Blob instances, but some browsers
                            // (Firefox 3.6) support the File API but not Blobs.
                            // This check allows the tests to run with
                            // dummy objects:
                            if ((window.Blob && file instanceof Blob) ||
                                    (window.File && file instanceof File)) {
                                formData.append(
                                    options.paramName[index] || paramName,
                                    file,
                                    file.name
                                );
                            }
                        });
                    }
                }
                options.data = formData;
            }
            // Blob reference is not needed anymore, free memory:
            options.blob = null;
        },

        _initIframeSettings: function (options) {
            // Setting the dataType to iframe enables the iframe transport:
            options.dataType = 'iframe ' + (options.dataType || '');
            // The iframe transport accepts a serialized array as form data:
            options.formData = this._getFormData(options);
            // Add redirect url to form data on cross-domain uploads:
            if (options.redirect && $('<a></a>').prop('href', options.url)
                    .prop('host') !== location.host) {
                options.formData.push({
                    name: options.redirectParamName || 'redirect',
                    value: options.redirect
                });
            }
        },

        _initDataSettings: function (options) {
            if (this._isXHRUpload(options)) {
                if (!this._chunkedUpload(options, true)) {
                    if (!options.data) {
                        this._initXHRData(options);
                    }
                    this._initProgressListener(options);
                }
                if (options.postMessage) {
                    // Setting the dataType to postmessage enables the
                    // postMessage transport:
                    options.dataType = 'postmessage ' + (options.dataType || '');
                }
            } else {
                this._initIframeSettings(options, 'iframe');
            }
        },

        _getParamName: function (options) {
            var fileInput = $(options.fileInput),
                paramName = options.paramName;
            if (!paramName) {
                paramName = [];
                fileInput.each(function () {
                    var input = $(this),
                        name = input.prop('name') || 'files[]',
                        i = (input.prop('files') || [1]).length;
                    while (i) {
                        paramName.push(name);
                        i -= 1;
                    }
                });
                if (!paramName.length) {
                    paramName = [fileInput.prop('name') || 'files[]'];
                }
            } else if (!$.isArray(paramName)) {
                paramName = [paramName];
            }
            return paramName;
        },

        _initFormSettings: function (options) {
            // Retrieve missing options from the input field and the
            // associated form, if available:
            if (!options.form || !options.form.length) {
                options.form = $(options.fileInput.prop('form'));
                // If the given file input doesn't have an associated form,
                // use the default widget file input's form:
                if (!options.form.length) {
                    options.form = $(this.options.fileInput.prop('form'));
                }
            }
            options.paramName = this._getParamName(options);
            if (!options.url) {
                options.url = options.form.prop('action') || location.href;
            }
            // The HTTP request method must be "POST" or "PUT":
            options.type = (options.type || options.form.prop('method') || '')
                .toUpperCase();
            if (options.type !== 'POST' && options.type !== 'PUT' &&
                    options.type !== 'PATCH') {
                options.type = 'POST';
            }
            if (!options.formAcceptCharset) {
                options.formAcceptCharset = options.form.attr('accept-charset');
            }
        },

        _getAJAXSettings: function (data) {
            var options = $.extend({}, this.options, data);
            this._initFormSettings(options);
            this._initDataSettings(options);
            return options;
        },

        // jQuery 1.6 doesn't provide .state(),
        // while jQuery 1.8+ removed .isRejected() and .isResolved():
        _getDeferredState: function (deferred) {
            if (deferred.state) {
                return deferred.state();
            }
            if (deferred.isResolved()) {
                return 'resolved';
            }
            if (deferred.isRejected()) {
                return 'rejected';
            }
            return 'pending';
        },

        // Maps jqXHR callbacks to the equivalent
        // methods of the given Promise object:
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },

        // Creates and returns a Promise object enhanced with
        // the jqXHR methods abort, success, error and complete:
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = $.Deferred(),
                promise = dfd.promise();
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },

        // Adds convenience methods to the callback arguments:
        _addConvenienceMethods: function (e, data) {
            var that = this;
            data.submit = function () {
                if (this.state() !== 'pending') {
                    data.jqXHR = this.jqXHR =
                        (that._trigger('submit', e, this) !== false) &&
                        that._onSend(e, this);
                }
                return this.jqXHR || that._getXHRPromise();
            };
            data.abort = function () {
                if (this.jqXHR) {
                    return this.jqXHR.abort();
                }
                return this._getXHRPromise();
            };
            data.state = function () {
                if (this.jqXHR) {
                    return that._getDeferredState(this.jqXHR);
                }
            };
            data.progress = function () {
                return this._progress;
            };
        },

        // Parses the Range header from the server response
        // and returns the uploaded bytes:
        _getUploadedBytes: function (jqXHR) {
            var range = jqXHR.getResponseHeader('Range'),
                parts = range && range.split('-'),
                upperBytesPos = parts && parts.length > 1 &&
                    parseInt(parts[1], 10);
            return upperBytesPos && upperBytesPos + 1;
        },

        // Uploads a file in multiple, sequential requests
        // by splitting the file up in multiple blob chunks.
        // If the second parameter is true, only tests if the file
        // should be uploaded in chunks, but does not invoke any
        // upload requests:
        _chunkedUpload: function (options, testOnly) {
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes = options.uploadedBytes || 0,
                mcs = options.maxChunkSize || fs,
                slice = file.slice || file.webkitSlice || file.mozSlice,
                dfd = $.Deferred(),
                promise = dfd.promise(),
                jqXHR,
                upload;
            if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) ||
                    options.data) {
                return false;
            }
            if (testOnly) {
                return true;
            }
            if (ub >= fs) {
                file.error = 'Uploaded bytes exceed file size';
                return this._getXHRPromise(
                    false,
                    options.context,
                    [null, 'error', file.error]
                );
            }
            // The chunk upload method:
            upload = function () {
                // Clone the options object for each chunk upload:
                var o = $.extend({}, options),
                    currentLoaded = o._progress.loaded;
                o.blob = slice.call(
                    file,
                    ub,
                    ub + mcs,
                    file.type
                );
                // Store the current chunk size, as the blob itself
                // will be dereferenced after data processing:
                o.chunkSize = o.blob.size;
                // Expose the chunk bytes position range:
                o.contentRange = 'bytes ' + ub + '-' +
                    (ub + o.chunkSize - 1) + '/' + fs;
                // Process the upload data (the blob and potential form data):
                that._initXHRData(o);
                // Add progress listeners for this chunk upload:
                that._initProgressListener(o);
                jqXHR = ((that._trigger('chunksend', null, o) !== false && $.ajax(o)) ||
                        that._getXHRPromise(false, o.context))
                    .done(function (result, textStatus, jqXHR) {
                        ub = that._getUploadedBytes(jqXHR) ||
                            (ub + o.chunkSize);
                        // Create a progress event if no final progress event
                        // with loaded equaling total has been triggered
                        // for this chunk:
                        if (o._progress.loaded === currentLoaded) {
                            that._onProgress($.Event('progress', {
                                lengthComputable: true,
                                loaded: ub - o.uploadedBytes,
                                total: ub - o.uploadedBytes
                            }), o);
                        }
                        options.uploadedBytes = o.uploadedBytes = ub;
                        o.result = result;
                        o.textStatus = textStatus;
                        o.jqXHR = jqXHR;
                        that._trigger('chunkdone', null, o);
                        that._trigger('chunkalways', null, o);
                        if (ub < fs) {
                            // File upload not yet complete,
                            // continue with the next chunk:
                            upload();
                        } else {
                            dfd.resolveWith(
                                o.context,
                                [result, textStatus, jqXHR]
                            );
                        }
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        o.jqXHR = jqXHR;
                        o.textStatus = textStatus;
                        o.errorThrown = errorThrown;
                        that._trigger('chunkfail', null, o);
                        that._trigger('chunkalways', null, o);
                        dfd.rejectWith(
                            o.context,
                            [jqXHR, textStatus, errorThrown]
                        );
                    });
            };
            this._enhancePromise(promise);
            promise.abort = function () {
                return jqXHR.abort();
            };
            upload();
            return promise;
        },

        _beforeSend: function (e, data) {
            if (this._active === 0) {
                // the start callback is triggered when an upload starts
                // and no other uploads are currently running,
                // equivalent to the global ajaxStart event:
                this._trigger('start');
                // Set timer for global bitrate progress calculation:
                this._bitrateTimer = new this._BitrateTimer();
                // Reset the global progress values:
                this._progress.loaded = this._progress.total = 0;
                this._progress.bitrate = 0;
            }
            if (!data._progress) {
                data._progress = {};
            }
            data._progress.loaded = data.loaded = data.uploadedBytes || 0;
            data._progress.total = data.total = this._getTotal(data.files) || 1;
            data._progress.bitrate = data.bitrate = 0;
            this._active += 1;
            // Initialize the global progress values:
            this._progress.loaded += data.loaded;
            this._progress.total += data.total;
        },

        _onDone: function (result, textStatus, jqXHR, options) {
            var total = options._progress.total;
            if (options._progress.loaded < total) {
                // Create a progress event if no final progress event
                // with loaded equaling total has been triggered:
                this._onProgress($.Event('progress', {
                    lengthComputable: true,
                    loaded: total,
                    total: total
                }), options);
            }
            options.result = result;
            options.textStatus = textStatus;
            options.jqXHR = jqXHR;
            this._trigger('done', null, options);
        },

        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            options.jqXHR = jqXHR;
            options.textStatus = textStatus;
            options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
            if (options.recalculateProgress) {
                // Remove the failed (error or abort) file upload from
                // the global progress calculation:
                this._progress.loaded -= options._progress.loaded;
                this._progress.total -= options._progress.total;
            }
        },

        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            // jqXHRorResult, textStatus and jqXHRorError are added to the
            // options object via done and fail callbacks
            this._active -= 1;
            this._trigger('always', null, options);
            if (this._active === 0) {
                // The stop callback is triggered when all uploads have
                // been completed, equivalent to the global ajaxStop event:
                this._trigger('stop');
            }
        },

        _onSend: function (e, data) {
            if (!data.submit) {
                this._addConvenienceMethods(e, data);
            }
            var that = this,
                jqXHR,
                aborted,
                slot,
                pipe,
                options = that._getAJAXSettings(data),
                send = function () {
                    that._sending += 1;
                    // Set timer for bitrate progress calculation:
                    options._bitrateTimer = new that._BitrateTimer();
                    jqXHR = jqXHR || (
                        ((aborted || that._trigger('send', e, options) === false) &&
                        that._getXHRPromise(false, options.context, aborted)) ||
                        that._chunkedUpload(options) || $.ajax(options)
                    ).done(function (result, textStatus, jqXHR) {
                        that._onDone(result, textStatus, jqXHR, options);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        that._onFail(jqXHR, textStatus, errorThrown, options);
                    }).always(function (jqXHRorResult, textStatus, jqXHRorError) {
                        that._sending -= 1;
                        that._onAlways(
                            jqXHRorResult,
                            textStatus,
                            jqXHRorError,
                            options
                        );
                        if (options.limitConcurrentUploads &&
                                options.limitConcurrentUploads > that._sending) {
                            // Start the next queued upload,
                            // that has not been aborted:
                            var nextSlot = that._slots.shift();
                            while (nextSlot) {
                                if (that._getDeferredState(nextSlot) === 'pending') {
                                    nextSlot.resolve();
                                    break;
                                }
                                nextSlot = that._slots.shift();
                            }
                        }
                    });
                    return jqXHR;
                };
            this._beforeSend(e, options);
            if (this.options.sequentialUploads ||
                    (this.options.limitConcurrentUploads &&
                    this.options.limitConcurrentUploads <= this._sending)) {
                if (this.options.limitConcurrentUploads > 1) {
                    slot = $.Deferred();
                    this._slots.push(slot);
                    pipe = slot.pipe(send);
                } else {
                    pipe = (this._sequence = this._sequence.pipe(send, send));
                }
                // Return the piped Promise object, enhanced with an abort method,
                // which is delegated to the jqXHR object of the current upload,
                // and jqXHR callbacks mapped to the equivalent Promise methods:
                pipe.abort = function () {
                    aborted = [undefined, 'abort', 'abort'];
                    if (!jqXHR) {
                        if (slot) {
                            slot.rejectWith(options.context, aborted);
                        }
                        return send();
                    }
                    return jqXHR.abort();
                };
                return this._enhancePromise(pipe);
            }
            return send();
        },

        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = $.extend({}, this.options, data),
                limit = options.limitMultiFileUploads,
                paramName = this._getParamName(options),
                paramNameSet,
                paramNameSlice,
                fileSet,
                i;
            if (!(options.singleFileUploads || limit) ||
                    !this._isXHRUpload(options)) {
                fileSet = [data.files];
                paramNameSet = [paramName];
            } else if (!options.singleFileUploads && limit) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < data.files.length; i += limit) {
                    fileSet.push(data.files.slice(i, i + limit));
                    paramNameSlice = paramName.slice(i, i + limit);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                }
            } else {
                paramNameSet = paramName;
            }
            data.originalFiles = data.files;
            $.each(fileSet || data.files, function (index, element) {
                var newData = $.extend({}, data);
                newData.files = fileSet ? element : [element];
                newData.paramName = paramNameSet[index];
                that._initProgressObject(newData);
                that._addConvenienceMethods(e, newData);
                result = that._trigger('add', e, newData);
                return result;
            });
            return result;
        },

        _replaceFileInput: function (input) {
            var inputClone = input.clone(true);
            $('<form></form>').append(inputClone)[0].reset();
            // Detaching allows to insert the fileInput on another form
            // without loosing the file input value:
            input.after(inputClone).detach();
            // Avoid memory leaks with the detached file input:
            $.cleanData(input.unbind('remove'));
            // Replace the original file input element in the fileInput
            // elements set with the clone, which has been copied including
            // event handlers:
            this.options.fileInput = this.options.fileInput.map(function (i, el) {
                if (el === input[0]) {
                    return inputClone[0];
                }
                return el;
            });
            // If the widget has been initialized on the file input itself,
            // override this.element with the file input clone:
            if (input[0] === this.element[0]) {
                this.element = inputClone;
            }
        },

        _handleFileTreeEntry: function (entry, path) {
            var that = this,
                dfd = $.Deferred(),
                errorHandler = function (e) {
                    if (e && !e.entry) {
                        e.entry = entry;
                    }
                    // Since $.when returns immediately if one
                    // Deferred is rejected, we use resolve instead.
                    // This allows valid files and invalid items
                    // to be returned together in one set:
                    dfd.resolve([e]);
                },
                dirReader;
            path = path || '';
            if (entry.isFile) {
                if (entry._file) {
                    // Workaround for Chrome bug #149735
                    entry._file.relativePath = path;
                    dfd.resolve(entry._file);
                } else {
                    entry.file(function (file) {
                        file.relativePath = path;
                        dfd.resolve(file);
                    }, errorHandler);
                }
            } else if (entry.isDirectory) {
                dirReader = entry.createReader();
                dirReader.readEntries(function (entries) {
                    that._handleFileTreeEntries(
                        entries,
                        path + entry.name + '/'
                    ).done(function (files) {
                        dfd.resolve(files);
                    }).fail(errorHandler);
                }, errorHandler);
            } else {
                // Return an empy list for file system items
                // other than files or directories:
                dfd.resolve([]);
            }
            return dfd.promise();
        },

        _handleFileTreeEntries: function (entries, path) {
            var that = this;
            return $.when.apply(
                $,
                $.map(entries, function (entry) {
                    return that._handleFileTreeEntry(entry, path);
                })
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _getDroppedFiles: function (dataTransfer) {
            dataTransfer = dataTransfer || {};
            var items = dataTransfer.items;
            if (items && items.length && (items[0].webkitGetAsEntry ||
                    items[0].getAsEntry)) {
                return this._handleFileTreeEntries(
                    $.map(items, function (item) {
                        var entry;
                        if (item.webkitGetAsEntry) {
                            entry = item.webkitGetAsEntry();
                            if (entry) {
                                // Workaround for Chrome bug #149735:
                                entry._file = item.getAsFile();
                            }
                            return entry;
                        }
                        return item.getAsEntry();
                    })
                );
            }
            return $.Deferred().resolve(
                $.makeArray(dataTransfer.files)
            ).promise();
        },

        _getSingleFileInputFiles: function (fileInput) {
            fileInput = $(fileInput);
            var entries = fileInput.prop('webkitEntries') ||
                    fileInput.prop('entries'),
                files,
                value;
            if (entries && entries.length) {
                return this._handleFileTreeEntries(entries);
            }
            files = $.makeArray(fileInput.prop('files'));
            if (!files.length) {
                value = fileInput.prop('value');
                if (!value) {
                    return $.Deferred().resolve([]).promise();
                }
                // If the files property is not available, the browser does not
                // support the File API and we add a pseudo File object with
                // the input value as name with path information removed:
                files = [{name: value.replace(/^.*\\/, '')}];
            } else if (files[0].name === undefined && files[0].fileName) {
                // File normalization for Safari 4 and Firefox 3:
                $.each(files, function (index, file) {
                    file.name = file.fileName;
                    file.size = file.fileSize;
                });
            }
            return $.Deferred().resolve(files).promise();
        },

        _getFileInputFiles: function (fileInput) {
            if (!(fileInput instanceof $) || fileInput.length === 1) {
                return this._getSingleFileInputFiles(fileInput);
            }
            return $.when.apply(
                $,
                $.map(fileInput, this._getSingleFileInputFiles)
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _onChange: function (e) {
            var that = this,
                data = {
                    fileInput: $(e.target),
                    form: $(e.target.form)
                };
            this._getFileInputFiles(data.fileInput).always(function (files) {
                data.files = files;
                if (that.options.replaceFileInput) {
                    that._replaceFileInput(data.fileInput);
                }
                if (that._trigger('change', e, data) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onPaste: function (e) {
            var cbd = e.originalEvent.clipboardData,
                items = (cbd && cbd.items) || [],
                data = {files: []};
            $.each(items, function (index, item) {
                var file = item.getAsFile && item.getAsFile();
                if (file) {
                    data.files.push(file);
                }
            });
            if (this._trigger('paste', e, data) === false ||
                    this._onAdd(e, data) === false) {
                return false;
            }
        },

        _onDrop: function (e) {
            var that = this,
                dataTransfer = e.dataTransfer = e.originalEvent.dataTransfer,
                data = {};
            if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
                e.preventDefault();
            }
            this._getDroppedFiles(dataTransfer).always(function (files) {
                data.files = files;
                if (that._trigger('drop', e, data) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onDragOver: function (e) {
            var dataTransfer = e.dataTransfer = e.originalEvent.dataTransfer;
            if (this._trigger('dragover', e) === false) {
                return false;
            }
            if (dataTransfer && $.inArray('Files', dataTransfer.types) !== -1) {
                dataTransfer.dropEffect = 'copy';
                e.preventDefault();
            }
        },

        _initEventHandlers: function () {
            if (this._isXHRUpload(this.options)) {
                this._on(this.options.dropZone, {
                    dragover: this._onDragOver,
                    drop: this._onDrop
                });
                this._on(this.options.pasteZone, {
                    paste: this._onPaste
                });
            }
            this._on(this.options.fileInput, {
                change: this._onChange
            });
        },

        _destroyEventHandlers: function () {
            this._off(this.options.dropZone, 'dragover drop');
            this._off(this.options.pasteZone, 'paste');
            this._off(this.options.fileInput, 'change');
        },

        _setOption: function (key, value) {
            var refresh = $.inArray(key, this._refreshOptionsList) !== -1;
            if (refresh) {
                this._destroyEventHandlers();
            }
            this._super(key, value);
            if (refresh) {
                this._initSpecialOptions();
                this._initEventHandlers();
            }
        },

        _initSpecialOptions: function () {
            var options = this.options;
            if (options.fileInput === undefined) {
                options.fileInput = this.element.is('input[type="file"]') ?
                        this.element : this.element.find('input[type="file"]');
            } else if (!(options.fileInput instanceof $)) {
                options.fileInput = $(options.fileInput);
            }
            if (!(options.dropZone instanceof $)) {
                options.dropZone = $(options.dropZone);
            }
            if (!(options.pasteZone instanceof $)) {
                options.pasteZone = $(options.pasteZone);
            }
        },

        _create: function () {
            var options = this.options;
            // Initialize options set via HTML5 data-attributes:
            $.extend(options, $(this.element[0].cloneNode(false)).data());
            this._initSpecialOptions();
            this._slots = [];
            this._sequence = this._getXHRPromise(true);
            this._sending = this._active = 0;
            this._initProgressObject(this);
            this._initEventHandlers();
        },

        // This method is exposed to the widget API and allows to query
        // the widget upload progress.
        // It returns an object with loaded, total and bitrate properties
        // for the running uploads:
        progress: function () {
            return this._progress;
        },

        // This method is exposed to the widget API and allows adding files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('add', {files: filesList});
        add: function (data) {
            var that = this;
            if (!data || this.options.disabled) {
                return;
            }
            if (data.fileInput && !data.files) {
                this._getFileInputFiles(data.fileInput).always(function (files) {
                    data.files = files;
                    that._onAdd(null, data);
                });
            } else {
                data.files = $.makeArray(data.files);
                this._onAdd(null, data);
            }
        },

        // This method is exposed to the widget API and allows sending files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files or fileInput property and can contain additional options:
        // .fileupload('send', {files: filesList});
        // The method returns a Promise object for the file upload call.
        send: function (data) {
            if (data && !this.options.disabled) {
                if (data.fileInput && !data.files) {
                    var that = this,
                        dfd = $.Deferred(),
                        promise = dfd.promise(),
                        jqXHR,
                        aborted;
                    promise.abort = function () {
                        aborted = true;
                        if (jqXHR) {
                            return jqXHR.abort();
                        }
                        dfd.reject(null, 'abort', 'abort');
                        return promise;
                    };
                    this._getFileInputFiles(data.fileInput).always(
                        function (files) {
                            if (aborted) {
                                return;
                            }
                            data.files = files;
                            jqXHR = that._onSend(null, data).then(
                                function (result, textStatus, jqXHR) {
                                    dfd.resolve(result, textStatus, jqXHR);
                                },
                                function (jqXHR, textStatus, errorThrown) {
                                    dfd.reject(jqXHR, textStatus, errorThrown);
                                }
                            );
                        }
                    );
                    return this._enhancePromise(promise);
                }
                data.files = $.makeArray(data.files);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }

    });

}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby9qcXVlcnkuZmlsZXVwbG9hZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogalF1ZXJ5IEZpbGUgVXBsb2FkIFBsdWdpbiA1LjI2XG4gKiBodHRwczovL2dpdGh1Yi5jb20vYmx1ZWltcC9qUXVlcnktRmlsZS1VcGxvYWRcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMCwgU2ViYXN0aWFuIFRzY2hhblxuICogaHR0cHM6Ly9ibHVlaW1wLm5ldFxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLypqc2xpbnQgbm9tZW46IHRydWUsIHVucGFyYW06IHRydWUsIHJlZ2V4cDogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBGaWxlLCBCbG9iLCBGb3JtRGF0YSwgbG9jYXRpb24gKi9cblxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIEFNRCBtb2R1bGU6XG4gICAgICAgIGRlZmluZShbXG4gICAgICAgICAgICAnanF1ZXJ5JyxcbiAgICAgICAgICAgICdqcXVlcnkudWkud2lkZ2V0J1xuICAgICAgICBdLCBmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHM6XG4gICAgICAgIGZhY3Rvcnkod2luZG93LmpRdWVyeSk7XG4gICAgfVxufShmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIFRoZSBGaWxlUmVhZGVyIEFQSSBpcyBub3QgYWN0dWFsbHkgdXNlZCwgYnV0IHdvcmtzIGFzIGZlYXR1cmUgZGV0ZWN0aW9uLFxuICAgIC8vIGFzIGUuZy4gU2FmYXJpIHN1cHBvcnRzIFhIUiBmaWxlIHVwbG9hZHMgdmlhIHRoZSBGb3JtRGF0YSBBUEksXG4gICAgLy8gYnV0IG5vdCBub24tbXVsdGlwYXJ0IFhIUiBmaWxlIHVwbG9hZHM6XG4gICAgJC5zdXBwb3J0LnhockZpbGVVcGxvYWQgPSAhISh3aW5kb3cuWE1MSHR0cFJlcXVlc3RVcGxvYWQgJiYgd2luZG93LkZpbGVSZWFkZXIpO1xuICAgICQuc3VwcG9ydC54aHJGb3JtRGF0YUZpbGVVcGxvYWQgPSAhIXdpbmRvdy5Gb3JtRGF0YTtcblxuICAgIC8vIFRoZSBmaWxldXBsb2FkIHdpZGdldCBsaXN0ZW5zIGZvciBjaGFuZ2UgZXZlbnRzIG9uIGZpbGUgaW5wdXQgZmllbGRzIGRlZmluZWRcbiAgICAvLyB2aWEgZmlsZUlucHV0IHNldHRpbmcgYW5kIHBhc3RlIG9yIGRyb3AgZXZlbnRzIG9mIHRoZSBnaXZlbiBkcm9wWm9uZS5cbiAgICAvLyBJbiBhZGRpdGlvbiB0byB0aGUgZGVmYXVsdCBqUXVlcnkgV2lkZ2V0IG1ldGhvZHMsIHRoZSBmaWxldXBsb2FkIHdpZGdldFxuICAgIC8vIGV4cG9zZXMgdGhlIFwiYWRkXCIgYW5kIFwic2VuZFwiIG1ldGhvZHMsIHRvIGFkZCBvciBkaXJlY3RseSBzZW5kIGZpbGVzIHVzaW5nXG4gICAgLy8gdGhlIGZpbGV1cGxvYWQgQVBJLlxuICAgIC8vIEJ5IGRlZmF1bHQsIGZpbGVzIGFkZGVkIHZpYSBmaWxlIGlucHV0IHNlbGVjdGlvbiwgcGFzdGUsIGRyYWcgJiBkcm9wIG9yXG4gICAgLy8gXCJhZGRcIiBtZXRob2QgYXJlIHVwbG9hZGVkIGltbWVkaWF0ZWx5LCBidXQgaXQgaXMgcG9zc2libGUgdG8gb3ZlcnJpZGVcbiAgICAvLyB0aGUgXCJhZGRcIiBjYWxsYmFjayBvcHRpb24gdG8gcXVldWUgZmlsZSB1cGxvYWRzLlxuICAgICQud2lkZ2V0KCdibHVlaW1wLmZpbGV1cGxvYWQnLCB7XG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgLy8gVGhlIGRyb3AgdGFyZ2V0IGVsZW1lbnQocyksIGJ5IHRoZSBkZWZhdWx0IHRoZSBjb21wbGV0ZSBkb2N1bWVudC5cbiAgICAgICAgICAgIC8vIFNldCB0byBudWxsIHRvIGRpc2FibGUgZHJhZyAmIGRyb3Agc3VwcG9ydDpcbiAgICAgICAgICAgIGRyb3Bab25lOiAkKGRvY3VtZW50KSxcbiAgICAgICAgICAgIC8vIFRoZSBwYXN0ZSB0YXJnZXQgZWxlbWVudChzKSwgYnkgdGhlIGRlZmF1bHQgdGhlIGNvbXBsZXRlIGRvY3VtZW50LlxuICAgICAgICAgICAgLy8gU2V0IHRvIG51bGwgdG8gZGlzYWJsZSBwYXN0ZSBzdXBwb3J0OlxuICAgICAgICAgICAgcGFzdGVab25lOiAkKGRvY3VtZW50KSxcbiAgICAgICAgICAgIC8vIFRoZSBmaWxlIGlucHV0IGZpZWxkKHMpLCB0aGF0IGFyZSBsaXN0ZW5lZCB0byBmb3IgY2hhbmdlIGV2ZW50cy5cbiAgICAgICAgICAgIC8vIElmIHVuZGVmaW5lZCwgaXQgaXMgc2V0IHRvIHRoZSBmaWxlIGlucHV0IGZpZWxkcyBpbnNpZGVcbiAgICAgICAgICAgIC8vIG9mIHRoZSB3aWRnZXQgZWxlbWVudCBvbiBwbHVnaW4gaW5pdGlhbGl6YXRpb24uXG4gICAgICAgICAgICAvLyBTZXQgdG8gbnVsbCB0byBkaXNhYmxlIHRoZSBjaGFuZ2UgbGlzdGVuZXIuXG4gICAgICAgICAgICBmaWxlSW5wdXQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIEJ5IGRlZmF1bHQsIHRoZSBmaWxlIGlucHV0IGZpZWxkIGlzIHJlcGxhY2VkIHdpdGggYSBjbG9uZSBhZnRlclxuICAgICAgICAgICAgLy8gZWFjaCBpbnB1dCBmaWVsZCBjaGFuZ2UgZXZlbnQuIFRoaXMgaXMgcmVxdWlyZWQgZm9yIGlmcmFtZSB0cmFuc3BvcnRcbiAgICAgICAgICAgIC8vIHF1ZXVlcyBhbmQgYWxsb3dzIGNoYW5nZSBldmVudHMgdG8gYmUgZmlyZWQgZm9yIHRoZSBzYW1lIGZpbGVcbiAgICAgICAgICAgIC8vIHNlbGVjdGlvbiwgYnV0IGNhbiBiZSBkaXNhYmxlZCBieSBzZXR0aW5nIHRoZSBmb2xsb3dpbmcgb3B0aW9uIHRvIGZhbHNlOlxuICAgICAgICAgICAgcmVwbGFjZUZpbGVJbnB1dDogdHJ1ZSxcbiAgICAgICAgICAgIC8vIFRoZSBwYXJhbWV0ZXIgbmFtZSBmb3IgdGhlIGZpbGUgZm9ybSBkYXRhICh0aGUgcmVxdWVzdCBhcmd1bWVudCBuYW1lKS5cbiAgICAgICAgICAgIC8vIElmIHVuZGVmaW5lZCBvciBlbXB0eSwgdGhlIG5hbWUgcHJvcGVydHkgb2YgdGhlIGZpbGUgaW5wdXQgZmllbGQgaXNcbiAgICAgICAgICAgIC8vIHVzZWQsIG9yIFwiZmlsZXNbXVwiIGlmIHRoZSBmaWxlIGlucHV0IG5hbWUgcHJvcGVydHkgaXMgYWxzbyBlbXB0eSxcbiAgICAgICAgICAgIC8vIGNhbiBiZSBhIHN0cmluZyBvciBhbiBhcnJheSBvZiBzdHJpbmdzOlxuICAgICAgICAgICAgcGFyYW1OYW1lOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCBlYWNoIGZpbGUgb2YgYSBzZWxlY3Rpb24gaXMgdXBsb2FkZWQgdXNpbmcgYW4gaW5kaXZpZHVhbFxuICAgICAgICAgICAgLy8gcmVxdWVzdCBmb3IgWEhSIHR5cGUgdXBsb2Fkcy4gU2V0IHRvIGZhbHNlIHRvIHVwbG9hZCBmaWxlXG4gICAgICAgICAgICAvLyBzZWxlY3Rpb25zIGluIG9uZSByZXF1ZXN0IGVhY2g6XG4gICAgICAgICAgICBzaW5nbGVGaWxlVXBsb2FkczogdHJ1ZSxcbiAgICAgICAgICAgIC8vIFRvIGxpbWl0IHRoZSBudW1iZXIgb2YgZmlsZXMgdXBsb2FkZWQgd2l0aCBvbmUgWEhSIHJlcXVlc3QsXG4gICAgICAgICAgICAvLyBzZXQgdGhlIGZvbGxvd2luZyBvcHRpb24gdG8gYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gMDpcbiAgICAgICAgICAgIGxpbWl0TXVsdGlGaWxlVXBsb2FkczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLy8gU2V0IHRoZSBmb2xsb3dpbmcgb3B0aW9uIHRvIHRydWUgdG8gaXNzdWUgYWxsIGZpbGUgdXBsb2FkIHJlcXVlc3RzXG4gICAgICAgICAgICAvLyBpbiBhIHNlcXVlbnRpYWwgb3JkZXI6XG4gICAgICAgICAgICBzZXF1ZW50aWFsVXBsb2FkczogZmFsc2UsXG4gICAgICAgICAgICAvLyBUbyBsaW1pdCB0aGUgbnVtYmVyIG9mIGNvbmN1cnJlbnQgdXBsb2FkcyxcbiAgICAgICAgICAgIC8vIHNldCB0aGUgZm9sbG93aW5nIG9wdGlvbiB0byBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiAwOlxuICAgICAgICAgICAgbGltaXRDb25jdXJyZW50VXBsb2FkczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLy8gU2V0IHRoZSBmb2xsb3dpbmcgb3B0aW9uIHRvIHRydWUgdG8gZm9yY2UgaWZyYW1lIHRyYW5zcG9ydCB1cGxvYWRzOlxuICAgICAgICAgICAgZm9yY2VJZnJhbWVUcmFuc3BvcnQ6IGZhbHNlLFxuICAgICAgICAgICAgLy8gU2V0IHRoZSBmb2xsb3dpbmcgb3B0aW9uIHRvIHRoZSBsb2NhdGlvbiBvZiBhIHJlZGlyZWN0IHVybCBvbiB0aGVcbiAgICAgICAgICAgIC8vIG9yaWdpbiBzZXJ2ZXIsIGZvciBjcm9zcy1kb21haW4gaWZyYW1lIHRyYW5zcG9ydCB1cGxvYWRzOlxuICAgICAgICAgICAgcmVkaXJlY3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIFRoZSBwYXJhbWV0ZXIgbmFtZSBmb3IgdGhlIHJlZGlyZWN0IHVybCwgc2VudCBhcyBwYXJ0IG9mIHRoZSBmb3JtXG4gICAgICAgICAgICAvLyBkYXRhIGFuZCBzZXQgdG8gJ3JlZGlyZWN0JyBpZiB0aGlzIG9wdGlvbiBpcyBlbXB0eTpcbiAgICAgICAgICAgIHJlZGlyZWN0UGFyYW1OYW1lOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAvLyBTZXQgdGhlIGZvbGxvd2luZyBvcHRpb24gdG8gdGhlIGxvY2F0aW9uIG9mIGEgcG9zdE1lc3NhZ2Ugd2luZG93LFxuICAgICAgICAgICAgLy8gdG8gZW5hYmxlIHBvc3RNZXNzYWdlIHRyYW5zcG9ydCB1cGxvYWRzOlxuICAgICAgICAgICAgcG9zdE1lc3NhZ2U6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIEJ5IGRlZmF1bHQsIFhIUiBmaWxlIHVwbG9hZHMgYXJlIHNlbnQgYXMgbXVsdGlwYXJ0L2Zvcm0tZGF0YS5cbiAgICAgICAgICAgIC8vIFRoZSBpZnJhbWUgdHJhbnNwb3J0IGlzIGFsd2F5cyB1c2luZyBtdWx0aXBhcnQvZm9ybS1kYXRhLlxuICAgICAgICAgICAgLy8gU2V0IHRvIGZhbHNlIHRvIGVuYWJsZSBub24tbXVsdGlwYXJ0IFhIUiB1cGxvYWRzOlxuICAgICAgICAgICAgbXVsdGlwYXJ0OiB0cnVlLFxuICAgICAgICAgICAgLy8gVG8gdXBsb2FkIGxhcmdlIGZpbGVzIGluIHNtYWxsZXIgY2h1bmtzLCBzZXQgdGhlIGZvbGxvd2luZyBvcHRpb25cbiAgICAgICAgICAgIC8vIHRvIGEgcHJlZmVycmVkIG1heGltdW0gY2h1bmsgc2l6ZS4gSWYgc2V0IHRvIDAsIG51bGwgb3IgdW5kZWZpbmVkLFxuICAgICAgICAgICAgLy8gb3IgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGUgcmVxdWlyZWQgQmxvYiBBUEksIGZpbGVzIHdpbGxcbiAgICAgICAgICAgIC8vIGJlIHVwbG9hZGVkIGFzIGEgd2hvbGUuXG4gICAgICAgICAgICBtYXhDaHVua1NpemU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIFdoZW4gYSBub24tbXVsdGlwYXJ0IHVwbG9hZCBvciBhIGNodW5rZWQgbXVsdGlwYXJ0IHVwbG9hZCBoYXMgYmVlblxuICAgICAgICAgICAgLy8gYWJvcnRlZCwgdGhpcyBvcHRpb24gY2FuIGJlIHVzZWQgdG8gcmVzdW1lIHRoZSB1cGxvYWQgYnkgc2V0dGluZ1xuICAgICAgICAgICAgLy8gaXQgdG8gdGhlIHNpemUgb2YgdGhlIGFscmVhZHkgdXBsb2FkZWQgYnl0ZXMuIFRoaXMgb3B0aW9uIGlzIG1vc3RcbiAgICAgICAgICAgIC8vIHVzZWZ1bCB3aGVuIG1vZGlmeWluZyB0aGUgb3B0aW9ucyBvYmplY3QgaW5zaWRlIG9mIHRoZSBcImFkZFwiIG9yXG4gICAgICAgICAgICAvLyBcInNlbmRcIiBjYWxsYmFja3MsIGFzIHRoZSBvcHRpb25zIGFyZSBjbG9uZWQgZm9yIGVhY2ggZmlsZSB1cGxvYWQuXG4gICAgICAgICAgICB1cGxvYWRlZEJ5dGVzOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCBmYWlsZWQgKGFib3J0IG9yIGVycm9yKSBmaWxlIHVwbG9hZHMgYXJlIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgICAgICAgIC8vIGdsb2JhbCBwcm9ncmVzcyBjYWxjdWxhdGlvbi4gU2V0IHRoZSBmb2xsb3dpbmcgb3B0aW9uIHRvIGZhbHNlIHRvXG4gICAgICAgICAgICAvLyBwcmV2ZW50IHJlY2FsY3VsYXRpbmcgdGhlIGdsb2JhbCBwcm9ncmVzcyBkYXRhOlxuICAgICAgICAgICAgcmVjYWxjdWxhdGVQcm9ncmVzczogdHJ1ZSxcbiAgICAgICAgICAgIC8vIEludGVydmFsIGluIG1pbGxpc2Vjb25kcyB0byBjYWxjdWxhdGUgYW5kIHRyaWdnZXIgcHJvZ3Jlc3MgZXZlbnRzOlxuICAgICAgICAgICAgcHJvZ3Jlc3NJbnRlcnZhbDogMTAwLFxuICAgICAgICAgICAgLy8gSW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzIHRvIGNhbGN1bGF0ZSBwcm9ncmVzcyBiaXRyYXRlOlxuICAgICAgICAgICAgYml0cmF0ZUludGVydmFsOiA1MDAsXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCB1cGxvYWRzIGFyZSBzdGFydGVkIGF1dG9tYXRpY2FsbHkgd2hlbiBhZGRpbmcgZmlsZXM6XG4gICAgICAgICAgICBhdXRvVXBsb2FkOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyBBZGRpdGlvbmFsIGZvcm0gZGF0YSB0byBiZSBzZW50IGFsb25nIHdpdGggdGhlIGZpbGUgdXBsb2FkcyBjYW4gYmUgc2V0XG4gICAgICAgICAgICAvLyB1c2luZyB0aGlzIG9wdGlvbiwgd2hpY2ggYWNjZXB0cyBhbiBhcnJheSBvZiBvYmplY3RzIHdpdGggbmFtZSBhbmRcbiAgICAgICAgICAgIC8vIHZhbHVlIHByb3BlcnRpZXMsIGEgZnVuY3Rpb24gcmV0dXJuaW5nIHN1Y2ggYW4gYXJyYXksIGEgRm9ybURhdGFcbiAgICAgICAgICAgIC8vIG9iamVjdCAoZm9yIFhIUiBmaWxlIHVwbG9hZHMpLCBvciBhIHNpbXBsZSBvYmplY3QuXG4gICAgICAgICAgICAvLyBUaGUgZm9ybSBvZiB0aGUgZmlyc3QgZmlsZUlucHV0IGlzIGdpdmVuIGFzIHBhcmFtZXRlciB0byB0aGUgZnVuY3Rpb246XG4gICAgICAgICAgICBmb3JtRGF0YTogZnVuY3Rpb24gKGZvcm0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybS5zZXJpYWxpemVBcnJheSgpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gVGhlIGFkZCBjYWxsYmFjayBpcyBpbnZva2VkIGFzIHNvb24gYXMgZmlsZXMgYXJlIGFkZGVkIHRvIHRoZSBmaWxldXBsb2FkXG4gICAgICAgICAgICAvLyB3aWRnZXQgKHZpYSBmaWxlIGlucHV0IHNlbGVjdGlvbiwgZHJhZyAmIGRyb3AsIHBhc3RlIG9yIGFkZCBBUEkgY2FsbCkuXG4gICAgICAgICAgICAvLyBJZiB0aGUgc2luZ2xlRmlsZVVwbG9hZHMgb3B0aW9uIGlzIGVuYWJsZWQsIHRoaXMgY2FsbGJhY2sgd2lsbCBiZVxuICAgICAgICAgICAgLy8gY2FsbGVkIG9uY2UgZm9yIGVhY2ggZmlsZSBpbiB0aGUgc2VsZWN0aW9uIGZvciBYSFIgZmlsZSB1cGxhb2RzLCBlbHNlXG4gICAgICAgICAgICAvLyBvbmNlIGZvciBlYWNoIGZpbGUgc2VsZWN0aW9uLlxuICAgICAgICAgICAgLy8gVGhlIHVwbG9hZCBzdGFydHMgd2hlbiB0aGUgc3VibWl0IG1ldGhvZCBpcyBpbnZva2VkIG9uIHRoZSBkYXRhIHBhcmFtZXRlci5cbiAgICAgICAgICAgIC8vIFRoZSBkYXRhIG9iamVjdCBjb250YWlucyBhIGZpbGVzIHByb3BlcnR5IGhvbGRpbmcgdGhlIGFkZGVkIGZpbGVzXG4gICAgICAgICAgICAvLyBhbmQgYWxsb3dzIHRvIG92ZXJyaWRlIHBsdWdpbiBvcHRpb25zIGFzIHdlbGwgYXMgZGVmaW5lIGFqYXggc2V0dGluZ3MuXG4gICAgICAgICAgICAvLyBMaXN0ZW5lcnMgZm9yIHRoaXMgY2FsbGJhY2sgY2FuIGFsc28gYmUgYm91bmQgdGhlIGZvbGxvd2luZyB3YXk6XG4gICAgICAgICAgICAvLyAuYmluZCgnZmlsZXVwbG9hZGFkZCcsIGZ1bmMpO1xuICAgICAgICAgICAgLy8gZGF0YS5zdWJtaXQoKSByZXR1cm5zIGEgUHJvbWlzZSBvYmplY3QgYW5kIGFsbG93cyB0byBhdHRhY2ggYWRkaXRpb25hbFxuICAgICAgICAgICAgLy8gaGFuZGxlcnMgdXNpbmcgalF1ZXJ5J3MgRGVmZXJyZWQgY2FsbGJhY2tzOlxuICAgICAgICAgICAgLy8gZGF0YS5zdWJtaXQoKS5kb25lKGZ1bmMpLmZhaWwoZnVuYykuYWx3YXlzKGZ1bmMpO1xuICAgICAgICAgICAgYWRkOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmF1dG9VcGxvYWQgfHwgKGRhdGEuYXV0b1VwbG9hZCAhPT0gZmFsc2UgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICgkKHRoaXMpLmRhdGEoJ2JsdWVpbXAtZmlsZXVwbG9hZCcpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ2ZpbGV1cGxvYWQnKSkub3B0aW9ucy5hdXRvVXBsb2FkKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnN1Ym1pdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIE90aGVyIGNhbGxiYWNrczpcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIHRoZSBzdWJtaXQgZXZlbnQgb2YgZWFjaCBmaWxlIHVwbG9hZDpcbiAgICAgICAgICAgIC8vIHN1Ym1pdDogZnVuY3Rpb24gKGUsIGRhdGEpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZHN1Ym1pdCcsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgdGhlIHN0YXJ0IG9mIGVhY2ggZmlsZSB1cGxvYWQgcmVxdWVzdDpcbiAgICAgICAgICAgIC8vIHNlbmQ6IGZ1bmN0aW9uIChlLCBkYXRhKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRzZW5kJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBzdWNjZXNzZnVsIHVwbG9hZHM6XG4gICAgICAgICAgICAvLyBkb25lOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkZG9uZScsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgZmFpbGVkIChhYm9ydCBvciBlcnJvcikgdXBsb2FkczpcbiAgICAgICAgICAgIC8vIGZhaWw6IGZ1bmN0aW9uIChlLCBkYXRhKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRmYWlsJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBjb21wbGV0ZWQgKHN1Y2Nlc3MsIGFib3J0IG9yIGVycm9yKSByZXF1ZXN0czpcbiAgICAgICAgICAgIC8vIGFsd2F5czogZnVuY3Rpb24gKGUsIGRhdGEpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZGFsd2F5cycsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgdXBsb2FkIHByb2dyZXNzIGV2ZW50czpcbiAgICAgICAgICAgIC8vIHByb2dyZXNzOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkcHJvZ3Jlc3MnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGdsb2JhbCB1cGxvYWQgcHJvZ3Jlc3MgZXZlbnRzOlxuICAgICAgICAgICAgLy8gcHJvZ3Jlc3NhbGw6IGZ1bmN0aW9uIChlLCBkYXRhKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRwcm9ncmVzc2FsbCcsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgdXBsb2FkcyBzdGFydCwgZXF1aXZhbGVudCB0byB0aGUgZ2xvYmFsIGFqYXhTdGFydCBldmVudDpcbiAgICAgICAgICAgIC8vIHN0YXJ0OiBmdW5jdGlvbiAoZSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2Fkc3RhcnQnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIHVwbG9hZHMgc3RvcCwgZXF1aXZhbGVudCB0byB0aGUgZ2xvYmFsIGFqYXhTdG9wIGV2ZW50OlxuICAgICAgICAgICAgLy8gc3RvcDogZnVuY3Rpb24gKGUpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZHN0b3AnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGNoYW5nZSBldmVudHMgb2YgdGhlIGZpbGVJbnB1dChzKTpcbiAgICAgICAgICAgIC8vIGNoYW5nZTogZnVuY3Rpb24gKGUsIGRhdGEpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZGNoYW5nZScsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgcGFzdGUgZXZlbnRzIHRvIHRoZSBwYXN0ZVpvbmUocyk6XG4gICAgICAgICAgICAvLyBwYXN0ZTogZnVuY3Rpb24gKGUsIGRhdGEpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZHBhc3RlJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBkcm9wIGV2ZW50cyBvZiB0aGUgZHJvcFpvbmUocyk6XG4gICAgICAgICAgICAvLyBkcm9wOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkZHJvcCcsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgZHJhZ292ZXIgZXZlbnRzIG9mIHRoZSBkcm9wWm9uZShzKTpcbiAgICAgICAgICAgIC8vIGRyYWdvdmVyOiBmdW5jdGlvbiAoZSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkZHJhZ292ZXInLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIHRoZSBzdGFydCBvZiBlYWNoIGNodW5rIHVwbG9hZCByZXF1ZXN0OlxuICAgICAgICAgICAgLy8gY2h1bmtzZW5kOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkY2h1bmtzZW5kJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBzdWNjZXNzZnVsIGNodW5rIHVwbG9hZHM6XG4gICAgICAgICAgICAvLyBjaHVua2RvbmU6IGZ1bmN0aW9uIChlLCBkYXRhKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRjaHVua2RvbmUnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGZhaWxlZCAoYWJvcnQgb3IgZXJyb3IpIGNodW5rIHVwbG9hZHM6XG4gICAgICAgICAgICAvLyBjaHVua2ZhaWw6IGZ1bmN0aW9uIChlLCBkYXRhKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRjaHVua2ZhaWwnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGNvbXBsZXRlZCAoc3VjY2VzcywgYWJvcnQgb3IgZXJyb3IpIGNodW5rIHVwbG9hZCByZXF1ZXN0czpcbiAgICAgICAgICAgIC8vIGNodW5rYWx3YXlzOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkY2h1bmthbHdheXMnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gVGhlIHBsdWdpbiBvcHRpb25zIGFyZSB1c2VkIGFzIHNldHRpbmdzIG9iamVjdCBmb3IgdGhlIGFqYXggY2FsbHMuXG4gICAgICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGFyZSBqUXVlcnkgYWpheCBzZXR0aW5ncyByZXF1aXJlZCBmb3IgdGhlIGZpbGUgdXBsb2FkczpcbiAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcbiAgICAgICAgICAgIGNhY2hlOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEEgbGlzdCBvZiBvcHRpb25zIHRoYXQgcmVxdWlyZSBhIHJlZnJlc2ggYWZ0ZXIgYXNzaWduaW5nIGEgbmV3IHZhbHVlOlxuICAgICAgICBfcmVmcmVzaE9wdGlvbnNMaXN0OiBbXG4gICAgICAgICAgICAnZmlsZUlucHV0JyxcbiAgICAgICAgICAgICdkcm9wWm9uZScsXG4gICAgICAgICAgICAncGFzdGVab25lJyxcbiAgICAgICAgICAgICdtdWx0aXBhcnQnLFxuICAgICAgICAgICAgJ2ZvcmNlSWZyYW1lVHJhbnNwb3J0J1xuICAgICAgICBdLFxuXG4gICAgICAgIF9CaXRyYXRlVGltZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXN0YW1wID0gKyhuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIHRoaXMubG9hZGVkID0gMDtcbiAgICAgICAgICAgIHRoaXMuYml0cmF0ZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmdldEJpdHJhdGUgPSBmdW5jdGlvbiAobm93LCBsb2FkZWQsIGludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRpbWVEaWZmID0gbm93IC0gdGhpcy50aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmJpdHJhdGUgfHwgIWludGVydmFsIHx8IHRpbWVEaWZmID4gaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iaXRyYXRlID0gKGxvYWRlZCAtIHRoaXMubG9hZGVkKSAqICgxMDAwIC8gdGltZURpZmYpICogODtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkZWQgPSBsb2FkZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGltZXN0YW1wID0gbm93O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5iaXRyYXRlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaXNYSFJVcGxvYWQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gIW9wdGlvbnMuZm9yY2VJZnJhbWVUcmFuc3BvcnQgJiZcbiAgICAgICAgICAgICAgICAoKCFvcHRpb25zLm11bHRpcGFydCAmJiAkLnN1cHBvcnQueGhyRmlsZVVwbG9hZCkgfHxcbiAgICAgICAgICAgICAgICAkLnN1cHBvcnQueGhyRm9ybURhdGFGaWxlVXBsb2FkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0Rm9ybURhdGE6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgZm9ybURhdGE7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZm9ybURhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mb3JtRGF0YShvcHRpb25zLmZvcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCQuaXNBcnJheShvcHRpb25zLmZvcm1EYXRhKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZvcm1EYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZm9ybURhdGEpIHtcbiAgICAgICAgICAgICAgICBmb3JtRGF0YSA9IFtdO1xuICAgICAgICAgICAgICAgICQuZWFjaChvcHRpb25zLmZvcm1EYXRhLCBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybURhdGEucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1EYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRUb3RhbDogZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAwO1xuICAgICAgICAgICAgJC5lYWNoKGZpbGVzLCBmdW5jdGlvbiAoaW5kZXgsIGZpbGUpIHtcbiAgICAgICAgICAgICAgICB0b3RhbCArPSBmaWxlLnNpemUgfHwgMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRvdGFsO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9pbml0UHJvZ3Jlc3NPYmplY3Q6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIG9iai5fcHJvZ3Jlc3MgPSB7XG4gICAgICAgICAgICAgICAgbG9hZGVkOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAwLFxuICAgICAgICAgICAgICAgIGJpdHJhdGU6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uUHJvZ3Jlc3M6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vdyA9ICsobmV3IERhdGUoKSksXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlZDtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5fdGltZSAmJiBkYXRhLnByb2dyZXNzSW50ZXJ2YWwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIChub3cgLSBkYXRhLl90aW1lIDwgZGF0YS5wcm9ncmVzc0ludGVydmFsKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZS5sb2FkZWQgIT09IGUudG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkYXRhLl90aW1lID0gbm93O1xuICAgICAgICAgICAgICAgIGxvYWRlZCA9IE1hdGguZmxvb3IoXG4gICAgICAgICAgICAgICAgICAgIGUubG9hZGVkIC8gZS50b3RhbCAqIChkYXRhLmNodW5rU2l6ZSB8fCBkYXRhLl9wcm9ncmVzcy50b3RhbClcbiAgICAgICAgICAgICAgICApICsgKGRhdGEudXBsb2FkZWRCeXRlcyB8fCAwKTtcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGRpZmZlcmVuY2UgZnJvbSB0aGUgcHJldmlvdXNseSBsb2FkZWQgc3RhdGVcbiAgICAgICAgICAgICAgICAvLyB0byB0aGUgZ2xvYmFsIGxvYWRlZCBjb3VudGVyOlxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzLmxvYWRlZCArPSAobG9hZGVkIC0gZGF0YS5fcHJvZ3Jlc3MubG9hZGVkKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9ncmVzcy5iaXRyYXRlID0gdGhpcy5fYml0cmF0ZVRpbWVyLmdldEJpdHJhdGUoXG4gICAgICAgICAgICAgICAgICAgIG5vdyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MubG9hZGVkLFxuICAgICAgICAgICAgICAgICAgICBkYXRhLmJpdHJhdGVJbnRlcnZhbFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgZGF0YS5fcHJvZ3Jlc3MubG9hZGVkID0gZGF0YS5sb2FkZWQgPSBsb2FkZWQ7XG4gICAgICAgICAgICAgICAgZGF0YS5fcHJvZ3Jlc3MuYml0cmF0ZSA9IGRhdGEuYml0cmF0ZSA9IGRhdGEuX2JpdHJhdGVUaW1lci5nZXRCaXRyYXRlKFxuICAgICAgICAgICAgICAgICAgICBub3csXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlZCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5iaXRyYXRlSW50ZXJ2YWxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYSBjdXN0b20gcHJvZ3Jlc3MgZXZlbnQgd2l0aCBhIHRvdGFsIGRhdGEgcHJvcGVydHkgc2V0XG4gICAgICAgICAgICAgICAgLy8gdG8gdGhlIGZpbGUgc2l6ZShzKSBvZiB0aGUgY3VycmVudCB1cGxvYWQgYW5kIGEgbG9hZGVkIGRhdGFcbiAgICAgICAgICAgICAgICAvLyBwcm9wZXJ0eSBjYWxjdWxhdGVkIGFjY29yZGluZ2x5OlxuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ3Byb2dyZXNzJywgZSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgLy8gVHJpZ2dlciBhIGdsb2JhbCBwcm9ncmVzcyBldmVudCBmb3IgYWxsIGN1cnJlbnQgZmlsZSB1cGxvYWRzLFxuICAgICAgICAgICAgICAgIC8vIGluY2x1ZGluZyBhamF4IGNhbGxzIHF1ZXVlZCBmb3Igc2VxdWVudGlhbCBmaWxlIHVwbG9hZHM6XG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcigncHJvZ3Jlc3NhbGwnLCBlLCB0aGlzLl9wcm9ncmVzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2luaXRQcm9ncmVzc0xpc3RlbmVyOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHhociA9IG9wdGlvbnMueGhyID8gb3B0aW9ucy54aHIoKSA6ICQuYWpheFNldHRpbmdzLnhocigpO1xuICAgICAgICAgICAgLy8gQWNjZXNzcyB0byB0aGUgbmF0aXZlIFhIUiBvYmplY3QgaXMgcmVxdWlyZWQgdG8gYWRkIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICAgICAgLy8gZm9yIHRoZSB1cGxvYWQgcHJvZ3Jlc3MgZXZlbnQ6XG4gICAgICAgICAgICBpZiAoeGhyLnVwbG9hZCkge1xuICAgICAgICAgICAgICAgICQoeGhyLnVwbG9hZCkuYmluZCgncHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2UgPSBlLm9yaWdpbmFsRXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgcHJvZ3Jlc3MgZXZlbnQgcHJvcGVydGllcyBnZXQgY29waWVkIG92ZXI6XG4gICAgICAgICAgICAgICAgICAgIGUubGVuZ3RoQ29tcHV0YWJsZSA9IG9lLmxlbmd0aENvbXB1dGFibGU7XG4gICAgICAgICAgICAgICAgICAgIGUubG9hZGVkID0gb2UubG9hZGVkO1xuICAgICAgICAgICAgICAgICAgICBlLnRvdGFsID0gb2UudG90YWw7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuX29uUHJvZ3Jlc3MoZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy54aHIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4aHI7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfaW5pdFhIUkRhdGE6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgZm9ybURhdGEsXG4gICAgICAgICAgICAgICAgZmlsZSA9IG9wdGlvbnMuZmlsZXNbMF0sXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIG5vbi1tdWx0aXBhcnQgc2V0dGluZyBpZiBub3Qgc3VwcG9ydGVkOlxuICAgICAgICAgICAgICAgIG11bHRpcGFydCA9IG9wdGlvbnMubXVsdGlwYXJ0IHx8ICEkLnN1cHBvcnQueGhyRmlsZVVwbG9hZCxcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWUgPSBvcHRpb25zLnBhcmFtTmFtZVswXTtcbiAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyB8fCB7fTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmNvbnRlbnRSYW5nZSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQ29udGVudC1SYW5nZSddID0gb3B0aW9ucy5jb250ZW50UmFuZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW11bHRpcGFydCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQ29udGVudC1EaXNwb3NpdGlvbiddID0gJ2F0dGFjaG1lbnQ7IGZpbGVuYW1lPVwiJyArXG4gICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSShmaWxlLm5hbWUpICsgJ1wiJztcbiAgICAgICAgICAgICAgICBvcHRpb25zLmNvbnRlbnRUeXBlID0gZmlsZS50eXBlO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZGF0YSA9IG9wdGlvbnMuYmxvYiB8fCBmaWxlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgkLnN1cHBvcnQueGhyRm9ybURhdGFGaWxlVXBsb2FkKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucG9zdE1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2luZG93LnBvc3RNZXNzYWdlIGRvZXMgbm90IGFsbG93IHNlbmRpbmcgRm9ybURhdGFcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqZWN0cywgc28gd2UganVzdCBhZGQgdGhlIEZpbGUvQmxvYiBvYmplY3RzIHRvXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBmb3JtRGF0YSBhcnJheSBhbmQgbGV0IHRoZSBwb3N0TWVzc2FnZSB3aW5kb3dcbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBGb3JtRGF0YSBvYmplY3Qgb3V0IG9mIHRoaXMgYXJyYXk6XG4gICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhID0gdGhpcy5fZ2V0Rm9ybURhdGEob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmJsb2IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5ibG9iXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaChvcHRpb25zLmZpbGVzLCBmdW5jdGlvbiAoaW5kZXgsIGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogb3B0aW9ucy5wYXJhbU5hbWVbaW5kZXhdIHx8IHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZm9ybURhdGEgaW5zdGFuY2VvZiBGb3JtRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybURhdGEgPSBvcHRpb25zLmZvcm1EYXRhO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaCh0aGlzLl9nZXRGb3JtRGF0YShvcHRpb25zKSwgZnVuY3Rpb24gKGluZGV4LCBmaWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChmaWVsZC5uYW1lLCBmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5ibG9iKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtRGlzcG9zaXRpb24nXSA9ICdhdHRhY2htZW50OyBmaWxlbmFtZT1cIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSShmaWxlLm5hbWUpICsgJ1wiJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChwYXJhbU5hbWUsIG9wdGlvbnMuYmxvYiwgZmlsZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaChvcHRpb25zLmZpbGVzLCBmdW5jdGlvbiAoaW5kZXgsIGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaWxlcyBhcmUgYWxzbyBCbG9iIGluc3RhbmNlcywgYnV0IHNvbWUgYnJvd3NlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoRmlyZWZveCAzLjYpIHN1cHBvcnQgdGhlIEZpbGUgQVBJIGJ1dCBub3QgQmxvYnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjaGVjayBhbGxvd3MgdGhlIHRlc3RzIHRvIHJ1biB3aXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZHVtbXkgb2JqZWN0czpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKHdpbmRvdy5CbG9iICYmIGZpbGUgaW5zdGFuY2VvZiBCbG9iKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHdpbmRvdy5GaWxlICYmIGZpbGUgaW5zdGFuY2VvZiBGaWxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnBhcmFtTmFtZVtpbmRleF0gfHwgcGFyYW1OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZGF0YSA9IGZvcm1EYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQmxvYiByZWZlcmVuY2UgaXMgbm90IG5lZWRlZCBhbnltb3JlLCBmcmVlIG1lbW9yeTpcbiAgICAgICAgICAgIG9wdGlvbnMuYmxvYiA9IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2luaXRJZnJhbWVTZXR0aW5nczogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIFNldHRpbmcgdGhlIGRhdGFUeXBlIHRvIGlmcmFtZSBlbmFibGVzIHRoZSBpZnJhbWUgdHJhbnNwb3J0OlxuICAgICAgICAgICAgb3B0aW9ucy5kYXRhVHlwZSA9ICdpZnJhbWUgJyArIChvcHRpb25zLmRhdGFUeXBlIHx8ICcnKTtcbiAgICAgICAgICAgIC8vIFRoZSBpZnJhbWUgdHJhbnNwb3J0IGFjY2VwdHMgYSBzZXJpYWxpemVkIGFycmF5IGFzIGZvcm0gZGF0YTpcbiAgICAgICAgICAgIG9wdGlvbnMuZm9ybURhdGEgPSB0aGlzLl9nZXRGb3JtRGF0YShvcHRpb25zKTtcbiAgICAgICAgICAgIC8vIEFkZCByZWRpcmVjdCB1cmwgdG8gZm9ybSBkYXRhIG9uIGNyb3NzLWRvbWFpbiB1cGxvYWRzOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMucmVkaXJlY3QgJiYgJCgnPGE+PC9hPicpLnByb3AoJ2hyZWYnLCBvcHRpb25zLnVybClcbiAgICAgICAgICAgICAgICAgICAgLnByb3AoJ2hvc3QnKSAhPT0gbG9jYXRpb24uaG9zdCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZm9ybURhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG9wdGlvbnMucmVkaXJlY3RQYXJhbU5hbWUgfHwgJ3JlZGlyZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMucmVkaXJlY3RcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfaW5pdERhdGFTZXR0aW5nczogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc1hIUlVwbG9hZChvcHRpb25zKSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fY2h1bmtlZFVwbG9hZChvcHRpb25zLCB0cnVlKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdFhIUkRhdGEob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdFByb2dyZXNzTGlzdGVuZXIob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnBvc3RNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldHRpbmcgdGhlIGRhdGFUeXBlIHRvIHBvc3RtZXNzYWdlIGVuYWJsZXMgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIHBvc3RNZXNzYWdlIHRyYW5zcG9ydDpcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5kYXRhVHlwZSA9ICdwb3N0bWVzc2FnZSAnICsgKG9wdGlvbnMuZGF0YVR5cGUgfHwgJycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdElmcmFtZVNldHRpbmdzKG9wdGlvbnMsICdpZnJhbWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0UGFyYW1OYW1lOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGZpbGVJbnB1dCA9ICQob3B0aW9ucy5maWxlSW5wdXQpLFxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZSA9IG9wdGlvbnMucGFyYW1OYW1lO1xuICAgICAgICAgICAgaWYgKCFwYXJhbU5hbWUpIHtcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWUgPSBbXTtcbiAgICAgICAgICAgICAgICBmaWxlSW5wdXQuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbnB1dCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gaW5wdXQucHJvcCgnbmFtZScpIHx8ICdmaWxlc1tdJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAoaW5wdXQucHJvcCgnZmlsZXMnKSB8fCBbMV0pLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZS5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbU5hbWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZSA9IFtmaWxlSW5wdXQucHJvcCgnbmFtZScpIHx8ICdmaWxlc1tdJ107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghJC5pc0FycmF5KHBhcmFtTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWUgPSBbcGFyYW1OYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXJhbU5hbWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2luaXRGb3JtU2V0dGluZ3M6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICAvLyBSZXRyaWV2ZSBtaXNzaW5nIG9wdGlvbnMgZnJvbSB0aGUgaW5wdXQgZmllbGQgYW5kIHRoZVxuICAgICAgICAgICAgLy8gYXNzb2NpYXRlZCBmb3JtLCBpZiBhdmFpbGFibGU6XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuZm9ybSB8fCAhb3B0aW9ucy5mb3JtLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZm9ybSA9ICQob3B0aW9ucy5maWxlSW5wdXQucHJvcCgnZm9ybScpKTtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZ2l2ZW4gZmlsZSBpbnB1dCBkb2Vzbid0IGhhdmUgYW4gYXNzb2NpYXRlZCBmb3JtLFxuICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgZGVmYXVsdCB3aWRnZXQgZmlsZSBpbnB1dCdzIGZvcm06XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLmZvcm0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZm9ybSA9ICQodGhpcy5vcHRpb25zLmZpbGVJbnB1dC5wcm9wKCdmb3JtJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wdGlvbnMucGFyYW1OYW1lID0gdGhpcy5fZ2V0UGFyYW1OYW1lKG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLnVybCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMudXJsID0gb3B0aW9ucy5mb3JtLnByb3AoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUaGUgSFRUUCByZXF1ZXN0IG1ldGhvZCBtdXN0IGJlIFwiUE9TVFwiIG9yIFwiUFVUXCI6XG4gICAgICAgICAgICBvcHRpb25zLnR5cGUgPSAob3B0aW9ucy50eXBlIHx8IG9wdGlvbnMuZm9ybS5wcm9wKCdtZXRob2QnKSB8fCAnJylcbiAgICAgICAgICAgICAgICAudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnR5cGUgIT09ICdQT1NUJyAmJiBvcHRpb25zLnR5cGUgIT09ICdQVVQnICYmXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudHlwZSAhPT0gJ1BBVENIJykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMudHlwZSA9ICdQT1NUJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5mb3JtQWNjZXB0Q2hhcnNldCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZm9ybUFjY2VwdENoYXJzZXQgPSBvcHRpb25zLmZvcm0uYXR0cignYWNjZXB0LWNoYXJzZXQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0QUpBWFNldHRpbmdzOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBkYXRhKTtcbiAgICAgICAgICAgIHRoaXMuX2luaXRGb3JtU2V0dGluZ3Mob3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl9pbml0RGF0YVNldHRpbmdzKG9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8galF1ZXJ5IDEuNiBkb2Vzbid0IHByb3ZpZGUgLnN0YXRlKCksXG4gICAgICAgIC8vIHdoaWxlIGpRdWVyeSAxLjgrIHJlbW92ZWQgLmlzUmVqZWN0ZWQoKSBhbmQgLmlzUmVzb2x2ZWQoKTpcbiAgICAgICAgX2dldERlZmVycmVkU3RhdGU6IGZ1bmN0aW9uIChkZWZlcnJlZCkge1xuICAgICAgICAgICAgaWYgKGRlZmVycmVkLnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnN0YXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGVmZXJyZWQuaXNSZXNvbHZlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdyZXNvbHZlZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGVmZXJyZWQuaXNSZWplY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdyZWplY3RlZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJ3BlbmRpbmcnO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIE1hcHMganFYSFIgY2FsbGJhY2tzIHRvIHRoZSBlcXVpdmFsZW50XG4gICAgICAgIC8vIG1ldGhvZHMgb2YgdGhlIGdpdmVuIFByb21pc2Ugb2JqZWN0OlxuICAgICAgICBfZW5oYW5jZVByb21pc2U6IGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgICAgICBwcm9taXNlLnN1Y2Nlc3MgPSBwcm9taXNlLmRvbmU7XG4gICAgICAgICAgICBwcm9taXNlLmVycm9yID0gcHJvbWlzZS5mYWlsO1xuICAgICAgICAgICAgcHJvbWlzZS5jb21wbGV0ZSA9IHByb21pc2UuYWx3YXlzO1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gQ3JlYXRlcyBhbmQgcmV0dXJucyBhIFByb21pc2Ugb2JqZWN0IGVuaGFuY2VkIHdpdGhcbiAgICAgICAgLy8gdGhlIGpxWEhSIG1ldGhvZHMgYWJvcnQsIHN1Y2Nlc3MsIGVycm9yIGFuZCBjb21wbGV0ZTpcbiAgICAgICAgX2dldFhIUlByb21pc2U6IGZ1bmN0aW9uIChyZXNvbHZlT3JSZWplY3QsIGNvbnRleHQsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkZmQgPSAkLkRlZmVycmVkKCksXG4gICAgICAgICAgICAgICAgcHJvbWlzZSA9IGRmZC5wcm9taXNlKCk7XG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dCB8fCB0aGlzLm9wdGlvbnMuY29udGV4dCB8fCBwcm9taXNlO1xuICAgICAgICAgICAgaWYgKHJlc29sdmVPclJlamVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGRmZC5yZXNvbHZlV2l0aChjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzb2x2ZU9yUmVqZWN0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGRmZC5yZWplY3RXaXRoKGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvbWlzZS5hYm9ydCA9IGRmZC5wcm9taXNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2VuaGFuY2VQcm9taXNlKHByb21pc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEFkZHMgY29udmVuaWVuY2UgbWV0aG9kcyB0byB0aGUgY2FsbGJhY2sgYXJndW1lbnRzOlxuICAgICAgICBfYWRkQ29udmVuaWVuY2VNZXRob2RzOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgZGF0YS5zdWJtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUoKSAhPT0gJ3BlbmRpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuanFYSFIgPSB0aGlzLmpxWEhSID1cbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGF0Ll90cmlnZ2VyKCdzdWJtaXQnLCBlLCB0aGlzKSAhPT0gZmFsc2UpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9vblNlbmQoZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmpxWEhSIHx8IHRoYXQuX2dldFhIUlByb21pc2UoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBkYXRhLmFib3J0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmpxWEhSKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmpxWEhSLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRYSFJQcm9taXNlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZGF0YS5zdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5qcVhIUikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5fZ2V0RGVmZXJyZWRTdGF0ZSh0aGlzLmpxWEhSKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZGF0YS5wcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJvZ3Jlc3M7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFBhcnNlcyB0aGUgUmFuZ2UgaGVhZGVyIGZyb20gdGhlIHNlcnZlciByZXNwb25zZVxuICAgICAgICAvLyBhbmQgcmV0dXJucyB0aGUgdXBsb2FkZWQgYnl0ZXM6XG4gICAgICAgIF9nZXRVcGxvYWRlZEJ5dGVzOiBmdW5jdGlvbiAoanFYSFIpIHtcbiAgICAgICAgICAgIHZhciByYW5nZSA9IGpxWEhSLmdldFJlc3BvbnNlSGVhZGVyKCdSYW5nZScpLFxuICAgICAgICAgICAgICAgIHBhcnRzID0gcmFuZ2UgJiYgcmFuZ2Uuc3BsaXQoJy0nKSxcbiAgICAgICAgICAgICAgICB1cHBlckJ5dGVzUG9zID0gcGFydHMgJiYgcGFydHMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChwYXJ0c1sxXSwgMTApO1xuICAgICAgICAgICAgcmV0dXJuIHVwcGVyQnl0ZXNQb3MgJiYgdXBwZXJCeXRlc1BvcyArIDE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gVXBsb2FkcyBhIGZpbGUgaW4gbXVsdGlwbGUsIHNlcXVlbnRpYWwgcmVxdWVzdHNcbiAgICAgICAgLy8gYnkgc3BsaXR0aW5nIHRoZSBmaWxlIHVwIGluIG11bHRpcGxlIGJsb2IgY2h1bmtzLlxuICAgICAgICAvLyBJZiB0aGUgc2Vjb25kIHBhcmFtZXRlciBpcyB0cnVlLCBvbmx5IHRlc3RzIGlmIHRoZSBmaWxlXG4gICAgICAgIC8vIHNob3VsZCBiZSB1cGxvYWRlZCBpbiBjaHVua3MsIGJ1dCBkb2VzIG5vdCBpbnZva2UgYW55XG4gICAgICAgIC8vIHVwbG9hZCByZXF1ZXN0czpcbiAgICAgICAgX2NodW5rZWRVcGxvYWQ6IGZ1bmN0aW9uIChvcHRpb25zLCB0ZXN0T25seSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGZpbGUgPSBvcHRpb25zLmZpbGVzWzBdLFxuICAgICAgICAgICAgICAgIGZzID0gZmlsZS5zaXplLFxuICAgICAgICAgICAgICAgIHViID0gb3B0aW9ucy51cGxvYWRlZEJ5dGVzID0gb3B0aW9ucy51cGxvYWRlZEJ5dGVzIHx8IDAsXG4gICAgICAgICAgICAgICAgbWNzID0gb3B0aW9ucy5tYXhDaHVua1NpemUgfHwgZnMsXG4gICAgICAgICAgICAgICAgc2xpY2UgPSBmaWxlLnNsaWNlIHx8IGZpbGUud2Via2l0U2xpY2UgfHwgZmlsZS5tb3pTbGljZSxcbiAgICAgICAgICAgICAgICBkZmQgPSAkLkRlZmVycmVkKCksXG4gICAgICAgICAgICAgICAgcHJvbWlzZSA9IGRmZC5wcm9taXNlKCksXG4gICAgICAgICAgICAgICAganFYSFIsXG4gICAgICAgICAgICAgICAgdXBsb2FkO1xuICAgICAgICAgICAgaWYgKCEodGhpcy5faXNYSFJVcGxvYWQob3B0aW9ucykgJiYgc2xpY2UgJiYgKHViIHx8IG1jcyA8IGZzKSkgfHxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRlc3RPbmx5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodWIgPj0gZnMpIHtcbiAgICAgICAgICAgICAgICBmaWxlLmVycm9yID0gJ1VwbG9hZGVkIGJ5dGVzIGV4Y2VlZCBmaWxlIHNpemUnO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRYSFJQcm9taXNlKFxuICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICBbbnVsbCwgJ2Vycm9yJywgZmlsZS5lcnJvcl1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhlIGNodW5rIHVwbG9hZCBtZXRob2Q6XG4gICAgICAgICAgICB1cGxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xvbmUgdGhlIG9wdGlvbnMgb2JqZWN0IGZvciBlYWNoIGNodW5rIHVwbG9hZDpcbiAgICAgICAgICAgICAgICB2YXIgbyA9ICQuZXh0ZW5kKHt9LCBvcHRpb25zKSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudExvYWRlZCA9IG8uX3Byb2dyZXNzLmxvYWRlZDtcbiAgICAgICAgICAgICAgICBvLmJsb2IgPSBzbGljZS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgICAgICB1YixcbiAgICAgICAgICAgICAgICAgICAgdWIgKyBtY3MsXG4gICAgICAgICAgICAgICAgICAgIGZpbGUudHlwZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgLy8gU3RvcmUgdGhlIGN1cnJlbnQgY2h1bmsgc2l6ZSwgYXMgdGhlIGJsb2IgaXRzZWxmXG4gICAgICAgICAgICAgICAgLy8gd2lsbCBiZSBkZXJlZmVyZW5jZWQgYWZ0ZXIgZGF0YSBwcm9jZXNzaW5nOlxuICAgICAgICAgICAgICAgIG8uY2h1bmtTaXplID0gby5ibG9iLnNpemU7XG4gICAgICAgICAgICAgICAgLy8gRXhwb3NlIHRoZSBjaHVuayBieXRlcyBwb3NpdGlvbiByYW5nZTpcbiAgICAgICAgICAgICAgICBvLmNvbnRlbnRSYW5nZSA9ICdieXRlcyAnICsgdWIgKyAnLScgK1xuICAgICAgICAgICAgICAgICAgICAodWIgKyBvLmNodW5rU2l6ZSAtIDEpICsgJy8nICsgZnM7XG4gICAgICAgICAgICAgICAgLy8gUHJvY2VzcyB0aGUgdXBsb2FkIGRhdGEgKHRoZSBibG9iIGFuZCBwb3RlbnRpYWwgZm9ybSBkYXRhKTpcbiAgICAgICAgICAgICAgICB0aGF0Ll9pbml0WEhSRGF0YShvKTtcbiAgICAgICAgICAgICAgICAvLyBBZGQgcHJvZ3Jlc3MgbGlzdGVuZXJzIGZvciB0aGlzIGNodW5rIHVwbG9hZDpcbiAgICAgICAgICAgICAgICB0aGF0Ll9pbml0UHJvZ3Jlc3NMaXN0ZW5lcihvKTtcbiAgICAgICAgICAgICAgICBqcVhIUiA9ICgodGhhdC5fdHJpZ2dlcignY2h1bmtzZW5kJywgbnVsbCwgbykgIT09IGZhbHNlICYmICQuYWpheChvKSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX2dldFhIUlByb21pc2UoZmFsc2UsIG8uY29udGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uIChyZXN1bHQsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1YiA9IHRoYXQuX2dldFVwbG9hZGVkQnl0ZXMoanFYSFIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHViICsgby5jaHVua1NpemUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgcHJvZ3Jlc3MgZXZlbnQgaWYgbm8gZmluYWwgcHJvZ3Jlc3MgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpdGggbG9hZGVkIGVxdWFsaW5nIHRvdGFsIGhhcyBiZWVuIHRyaWdnZXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2h1bms6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5fcHJvZ3Jlc3MubG9hZGVkID09PSBjdXJyZW50TG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5fb25Qcm9ncmVzcygkLkV2ZW50KCdwcm9ncmVzcycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVkOiB1YiAtIG8udXBsb2FkZWRCeXRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IHViIC0gby51cGxvYWRlZEJ5dGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy51cGxvYWRlZEJ5dGVzID0gby51cGxvYWRlZEJ5dGVzID0gdWI7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8udGV4dFN0YXR1cyA9IHRleHRTdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLmpxWEhSID0ganFYSFI7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll90cmlnZ2VyKCdjaHVua2RvbmUnLCBudWxsLCBvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX3RyaWdnZXIoJ2NodW5rYWx3YXlzJywgbnVsbCwgbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodWIgPCBmcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbGUgdXBsb2FkIG5vdCB5ZXQgY29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29udGludWUgd2l0aCB0aGUgbmV4dCBjaHVuazpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGZkLnJlc29sdmVXaXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtyZXN1bHQsIHRleHRTdGF0dXMsIGpxWEhSXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8uanFYSFIgPSBqcVhIUjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8udGV4dFN0YXR1cyA9IHRleHRTdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLmVycm9yVGhyb3duID0gZXJyb3JUaHJvd247XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll90cmlnZ2VyKCdjaHVua2ZhaWwnLCBudWxsLCBvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX3RyaWdnZXIoJ2NodW5rYWx3YXlzJywgbnVsbCwgbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZmQucmVqZWN0V2l0aChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2pxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bl1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2VuaGFuY2VQcm9taXNlKHByb21pc2UpO1xuICAgICAgICAgICAgcHJvbWlzZS5hYm9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ganFYSFIuYWJvcnQoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB1cGxvYWQoKTtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9iZWZvcmVTZW5kOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2FjdGl2ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBzdGFydCBjYWxsYmFjayBpcyB0cmlnZ2VyZWQgd2hlbiBhbiB1cGxvYWQgc3RhcnRzXG4gICAgICAgICAgICAgICAgLy8gYW5kIG5vIG90aGVyIHVwbG9hZHMgYXJlIGN1cnJlbnRseSBydW5uaW5nLFxuICAgICAgICAgICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gdGhlIGdsb2JhbCBhamF4U3RhcnQgZXZlbnQ6XG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcignc3RhcnQnKTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgdGltZXIgZm9yIGdsb2JhbCBiaXRyYXRlIHByb2dyZXNzIGNhbGN1bGF0aW9uOlxuICAgICAgICAgICAgICAgIHRoaXMuX2JpdHJhdGVUaW1lciA9IG5ldyB0aGlzLl9CaXRyYXRlVGltZXIoKTtcbiAgICAgICAgICAgICAgICAvLyBSZXNldCB0aGUgZ2xvYmFsIHByb2dyZXNzIHZhbHVlczpcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9ncmVzcy5sb2FkZWQgPSB0aGlzLl9wcm9ncmVzcy50b3RhbCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MuYml0cmF0ZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWRhdGEuX3Byb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5fcHJvZ3Jlc3MgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGEuX3Byb2dyZXNzLmxvYWRlZCA9IGRhdGEubG9hZGVkID0gZGF0YS51cGxvYWRlZEJ5dGVzIHx8IDA7XG4gICAgICAgICAgICBkYXRhLl9wcm9ncmVzcy50b3RhbCA9IGRhdGEudG90YWwgPSB0aGlzLl9nZXRUb3RhbChkYXRhLmZpbGVzKSB8fCAxO1xuICAgICAgICAgICAgZGF0YS5fcHJvZ3Jlc3MuYml0cmF0ZSA9IGRhdGEuYml0cmF0ZSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9hY3RpdmUgKz0gMTtcbiAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGdsb2JhbCBwcm9ncmVzcyB2YWx1ZXM6XG4gICAgICAgICAgICB0aGlzLl9wcm9ncmVzcy5sb2FkZWQgKz0gZGF0YS5sb2FkZWQ7XG4gICAgICAgICAgICB0aGlzLl9wcm9ncmVzcy50b3RhbCArPSBkYXRhLnRvdGFsO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkRvbmU6IGZ1bmN0aW9uIChyZXN1bHQsIHRleHRTdGF0dXMsIGpxWEhSLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSBvcHRpb25zLl9wcm9ncmVzcy50b3RhbDtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLl9wcm9ncmVzcy5sb2FkZWQgPCB0b3RhbCkge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIHByb2dyZXNzIGV2ZW50IGlmIG5vIGZpbmFsIHByb2dyZXNzIGV2ZW50XG4gICAgICAgICAgICAgICAgLy8gd2l0aCBsb2FkZWQgZXF1YWxpbmcgdG90YWwgaGFzIGJlZW4gdHJpZ2dlcmVkOlxuICAgICAgICAgICAgICAgIHRoaXMuX29uUHJvZ3Jlc3MoJC5FdmVudCgncHJvZ3Jlc3MnLCB7XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aENvbXB1dGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlZDogdG90YWwsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsOiB0b3RhbFxuICAgICAgICAgICAgICAgIH0pLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wdGlvbnMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICAgICAgb3B0aW9ucy50ZXh0U3RhdHVzID0gdGV4dFN0YXR1cztcbiAgICAgICAgICAgIG9wdGlvbnMuanFYSFIgPSBqcVhIUjtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2RvbmUnLCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25GYWlsOiBmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zLmpxWEhSID0ganFYSFI7XG4gICAgICAgICAgICBvcHRpb25zLnRleHRTdGF0dXMgPSB0ZXh0U3RhdHVzO1xuICAgICAgICAgICAgb3B0aW9ucy5lcnJvclRocm93biA9IGVycm9yVGhyb3duO1xuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcignZmFpbCcsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMucmVjYWxjdWxhdGVQcm9ncmVzcykge1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgZmFpbGVkIChlcnJvciBvciBhYm9ydCkgZmlsZSB1cGxvYWQgZnJvbVxuICAgICAgICAgICAgICAgIC8vIHRoZSBnbG9iYWwgcHJvZ3Jlc3MgY2FsY3VsYXRpb246XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MubG9hZGVkIC09IG9wdGlvbnMuX3Byb2dyZXNzLmxvYWRlZDtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9ncmVzcy50b3RhbCAtPSBvcHRpb25zLl9wcm9ncmVzcy50b3RhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25BbHdheXM6IGZ1bmN0aW9uIChqcVhIUm9yUmVzdWx0LCB0ZXh0U3RhdHVzLCBqcVhIUm9yRXJyb3IsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIGpxWEhSb3JSZXN1bHQsIHRleHRTdGF0dXMgYW5kIGpxWEhSb3JFcnJvciBhcmUgYWRkZWQgdG8gdGhlXG4gICAgICAgICAgICAvLyBvcHRpb25zIG9iamVjdCB2aWEgZG9uZSBhbmQgZmFpbCBjYWxsYmFja3NcbiAgICAgICAgICAgIHRoaXMuX2FjdGl2ZSAtPSAxO1xuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcignYWx3YXlzJywgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAodGhpcy5fYWN0aXZlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHN0b3AgY2FsbGJhY2sgaXMgdHJpZ2dlcmVkIHdoZW4gYWxsIHVwbG9hZHMgaGF2ZVxuICAgICAgICAgICAgICAgIC8vIGJlZW4gY29tcGxldGVkLCBlcXVpdmFsZW50IHRvIHRoZSBnbG9iYWwgYWpheFN0b3AgZXZlbnQ6XG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcignc3RvcCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vblNlbmQ6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoIWRhdGEuc3VibWl0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29udmVuaWVuY2VNZXRob2RzKGUsIGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGpxWEhSLFxuICAgICAgICAgICAgICAgIGFib3J0ZWQsXG4gICAgICAgICAgICAgICAgc2xvdCxcbiAgICAgICAgICAgICAgICBwaXBlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Ll9nZXRBSkFYU2V0dGluZ3MoZGF0YSksXG4gICAgICAgICAgICAgICAgc2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fc2VuZGluZyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgdGltZXIgZm9yIGJpdHJhdGUgcHJvZ3Jlc3MgY2FsY3VsYXRpb246XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuX2JpdHJhdGVUaW1lciA9IG5ldyB0aGF0Ll9CaXRyYXRlVGltZXIoKTtcbiAgICAgICAgICAgICAgICAgICAganFYSFIgPSBqcVhIUiB8fCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAoKGFib3J0ZWQgfHwgdGhhdC5fdHJpZ2dlcignc2VuZCcsIGUsIG9wdGlvbnMpID09PSBmYWxzZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX2dldFhIUlByb21pc2UoZmFsc2UsIG9wdGlvbnMuY29udGV4dCwgYWJvcnRlZCkpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9jaHVua2VkVXBsb2FkKG9wdGlvbnMpIHx8ICQuYWpheChvcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICApLmRvbmUoZnVuY3Rpb24gKHJlc3VsdCwgdGV4dFN0YXR1cywganFYSFIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX29uRG9uZShyZXN1bHQsIHRleHRTdGF0dXMsIGpxWEhSLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9vbkZhaWwoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuYWx3YXlzKGZ1bmN0aW9uIChqcVhIUm9yUmVzdWx0LCB0ZXh0U3RhdHVzLCBqcVhIUm9yRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX3NlbmRpbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX29uQWx3YXlzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpxWEhSb3JSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dFN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqcVhIUm9yRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmxpbWl0Q29uY3VycmVudFVwbG9hZHMgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5saW1pdENvbmN1cnJlbnRVcGxvYWRzID4gdGhhdC5fc2VuZGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHRoZSBuZXh0IHF1ZXVlZCB1cGxvYWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhhdCBoYXMgbm90IGJlZW4gYWJvcnRlZDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dFNsb3QgPSB0aGF0Ll9zbG90cy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0U2xvdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5fZ2V0RGVmZXJyZWRTdGF0ZShuZXh0U2xvdCkgPT09ICdwZW5kaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFNsb3QucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFNsb3QgPSB0aGF0Ll9zbG90cy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBqcVhIUjtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5fYmVmb3JlU2VuZChlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2VxdWVudGlhbFVwbG9hZHMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMub3B0aW9ucy5saW1pdENvbmN1cnJlbnRVcGxvYWRzICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5saW1pdENvbmN1cnJlbnRVcGxvYWRzIDw9IHRoaXMuX3NlbmRpbmcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5saW1pdENvbmN1cnJlbnRVcGxvYWRzID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBzbG90ID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zbG90cy5wdXNoKHNsb3QpO1xuICAgICAgICAgICAgICAgICAgICBwaXBlID0gc2xvdC5waXBlKHNlbmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBpcGUgPSAodGhpcy5fc2VxdWVuY2UgPSB0aGlzLl9zZXF1ZW5jZS5waXBlKHNlbmQsIHNlbmQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSBwaXBlZCBQcm9taXNlIG9iamVjdCwgZW5oYW5jZWQgd2l0aCBhbiBhYm9ydCBtZXRob2QsXG4gICAgICAgICAgICAgICAgLy8gd2hpY2ggaXMgZGVsZWdhdGVkIHRvIHRoZSBqcVhIUiBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgdXBsb2FkLFxuICAgICAgICAgICAgICAgIC8vIGFuZCBqcVhIUiBjYWxsYmFja3MgbWFwcGVkIHRvIHRoZSBlcXVpdmFsZW50IFByb21pc2UgbWV0aG9kczpcbiAgICAgICAgICAgICAgICBwaXBlLmFib3J0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBhYm9ydGVkID0gW3VuZGVmaW5lZCwgJ2Fib3J0JywgJ2Fib3J0J107XG4gICAgICAgICAgICAgICAgICAgIGlmICghanFYSFIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzbG90KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2xvdC5yZWplY3RXaXRoKG9wdGlvbnMuY29udGV4dCwgYWJvcnRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VuZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBqcVhIUi5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2VuaGFuY2VQcm9taXNlKHBpcGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNlbmQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25BZGQ6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgZGF0YSksXG4gICAgICAgICAgICAgICAgbGltaXQgPSBvcHRpb25zLmxpbWl0TXVsdGlGaWxlVXBsb2FkcyxcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWUgPSB0aGlzLl9nZXRQYXJhbU5hbWUob3B0aW9ucyksXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lU2V0LFxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZVNsaWNlLFxuICAgICAgICAgICAgICAgIGZpbGVTZXQsXG4gICAgICAgICAgICAgICAgaTtcbiAgICAgICAgICAgIGlmICghKG9wdGlvbnMuc2luZ2xlRmlsZVVwbG9hZHMgfHwgbGltaXQpIHx8XG4gICAgICAgICAgICAgICAgICAgICF0aGlzLl9pc1hIUlVwbG9hZChvcHRpb25zKSkge1xuICAgICAgICAgICAgICAgIGZpbGVTZXQgPSBbZGF0YS5maWxlc107XG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lU2V0ID0gW3BhcmFtTmFtZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFvcHRpb25zLnNpbmdsZUZpbGVVcGxvYWRzICYmIGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgZmlsZVNldCA9IFtdO1xuICAgICAgICAgICAgICAgIHBhcmFtTmFtZVNldCA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhLmZpbGVzLmxlbmd0aDsgaSArPSBsaW1pdCkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlU2V0LnB1c2goZGF0YS5maWxlcy5zbGljZShpLCBpICsgbGltaXQpKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1OYW1lU2xpY2UgPSBwYXJhbU5hbWUuc2xpY2UoaSwgaSArIGxpbWl0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJhbU5hbWVTbGljZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZVNsaWNlID0gcGFyYW1OYW1lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZVNldC5wdXNoKHBhcmFtTmFtZVNsaWNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmFtTmFtZVNldCA9IHBhcmFtTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGEub3JpZ2luYWxGaWxlcyA9IGRhdGEuZmlsZXM7XG4gICAgICAgICAgICAkLmVhY2goZmlsZVNldCB8fCBkYXRhLmZpbGVzLCBmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3RGF0YSA9ICQuZXh0ZW5kKHt9LCBkYXRhKTtcbiAgICAgICAgICAgICAgICBuZXdEYXRhLmZpbGVzID0gZmlsZVNldCA/IGVsZW1lbnQgOiBbZWxlbWVudF07XG4gICAgICAgICAgICAgICAgbmV3RGF0YS5wYXJhbU5hbWUgPSBwYXJhbU5hbWVTZXRbaW5kZXhdO1xuICAgICAgICAgICAgICAgIHRoYXQuX2luaXRQcm9ncmVzc09iamVjdChuZXdEYXRhKTtcbiAgICAgICAgICAgICAgICB0aGF0Ll9hZGRDb252ZW5pZW5jZU1ldGhvZHMoZSwgbmV3RGF0YSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhhdC5fdHJpZ2dlcignYWRkJywgZSwgbmV3RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBfcmVwbGFjZUZpbGVJbnB1dDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgaW5wdXRDbG9uZSA9IGlucHV0LmNsb25lKHRydWUpO1xuICAgICAgICAgICAgJCgnPGZvcm0+PC9mb3JtPicpLmFwcGVuZChpbnB1dENsb25lKVswXS5yZXNldCgpO1xuICAgICAgICAgICAgLy8gRGV0YWNoaW5nIGFsbG93cyB0byBpbnNlcnQgdGhlIGZpbGVJbnB1dCBvbiBhbm90aGVyIGZvcm1cbiAgICAgICAgICAgIC8vIHdpdGhvdXQgbG9vc2luZyB0aGUgZmlsZSBpbnB1dCB2YWx1ZTpcbiAgICAgICAgICAgIGlucHV0LmFmdGVyKGlucHV0Q2xvbmUpLmRldGFjaCgpO1xuICAgICAgICAgICAgLy8gQXZvaWQgbWVtb3J5IGxlYWtzIHdpdGggdGhlIGRldGFjaGVkIGZpbGUgaW5wdXQ6XG4gICAgICAgICAgICAkLmNsZWFuRGF0YShpbnB1dC51bmJpbmQoJ3JlbW92ZScpKTtcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgdGhlIG9yaWdpbmFsIGZpbGUgaW5wdXQgZWxlbWVudCBpbiB0aGUgZmlsZUlucHV0XG4gICAgICAgICAgICAvLyBlbGVtZW50cyBzZXQgd2l0aCB0aGUgY2xvbmUsIHdoaWNoIGhhcyBiZWVuIGNvcGllZCBpbmNsdWRpbmdcbiAgICAgICAgICAgIC8vIGV2ZW50IGhhbmRsZXJzOlxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmZpbGVJbnB1dCA9IHRoaXMub3B0aW9ucy5maWxlSW5wdXQubWFwKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgICAgICAgIGlmIChlbCA9PT0gaW5wdXRbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlucHV0Q2xvbmVbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gSWYgdGhlIHdpZGdldCBoYXMgYmVlbiBpbml0aWFsaXplZCBvbiB0aGUgZmlsZSBpbnB1dCBpdHNlbGYsXG4gICAgICAgICAgICAvLyBvdmVycmlkZSB0aGlzLmVsZW1lbnQgd2l0aCB0aGUgZmlsZSBpbnB1dCBjbG9uZTpcbiAgICAgICAgICAgIGlmIChpbnB1dFswXSA9PT0gdGhpcy5lbGVtZW50WzBdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gaW5wdXRDbG9uZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfaGFuZGxlRmlsZVRyZWVFbnRyeTogZnVuY3Rpb24gKGVudHJ5LCBwYXRoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGZkID0gJC5EZWZlcnJlZCgpLFxuICAgICAgICAgICAgICAgIGVycm9ySGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlICYmICFlLmVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLmVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgJC53aGVuIHJldHVybnMgaW1tZWRpYXRlbHkgaWYgb25lXG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmVycmVkIGlzIHJlamVjdGVkLCB3ZSB1c2UgcmVzb2x2ZSBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGFsbG93cyB2YWxpZCBmaWxlcyBhbmQgaW52YWxpZCBpdGVtc1xuICAgICAgICAgICAgICAgICAgICAvLyB0byBiZSByZXR1cm5lZCB0b2dldGhlciBpbiBvbmUgc2V0OlxuICAgICAgICAgICAgICAgICAgICBkZmQucmVzb2x2ZShbZV0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlyUmVhZGVyO1xuICAgICAgICAgICAgcGF0aCA9IHBhdGggfHwgJyc7XG4gICAgICAgICAgICBpZiAoZW50cnkuaXNGaWxlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5Ll9maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdvcmthcm91bmQgZm9yIENocm9tZSBidWcgIzE0OTczNVxuICAgICAgICAgICAgICAgICAgICBlbnRyeS5fZmlsZS5yZWxhdGl2ZVBhdGggPSBwYXRoO1xuICAgICAgICAgICAgICAgICAgICBkZmQucmVzb2x2ZShlbnRyeS5fZmlsZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnkuZmlsZShmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5yZWxhdGl2ZVBhdGggPSBwYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGZkLnJlc29sdmUoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0RpcmVjdG9yeSkge1xuICAgICAgICAgICAgICAgIGRpclJlYWRlciA9IGVudHJ5LmNyZWF0ZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgIGRpclJlYWRlci5yZWFkRW50cmllcyhmdW5jdGlvbiAoZW50cmllcykge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Ll9oYW5kbGVGaWxlVHJlZUVudHJpZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCArIGVudHJ5Lm5hbWUgKyAnLydcbiAgICAgICAgICAgICAgICAgICAgKS5kb25lKGZ1bmN0aW9uIChmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGZkLnJlc29sdmUoZmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICB9KS5mYWlsKGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfSwgZXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUmV0dXJuIGFuIGVtcHkgbGlzdCBmb3IgZmlsZSBzeXN0ZW0gaXRlbXNcbiAgICAgICAgICAgICAgICAvLyBvdGhlciB0aGFuIGZpbGVzIG9yIGRpcmVjdG9yaWVzOlxuICAgICAgICAgICAgICAgIGRmZC5yZXNvbHZlKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZmQucHJvbWlzZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9oYW5kbGVGaWxlVHJlZUVudHJpZXM6IGZ1bmN0aW9uIChlbnRyaWVzLCBwYXRoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gJC53aGVuLmFwcGx5KFxuICAgICAgICAgICAgICAgICQsXG4gICAgICAgICAgICAgICAgJC5tYXAoZW50cmllcywgZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGF0Ll9oYW5kbGVGaWxlVHJlZUVudHJ5KGVudHJ5LCBwYXRoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKS5waXBlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShcbiAgICAgICAgICAgICAgICAgICAgW10sXG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0RHJvcHBlZEZpbGVzOiBmdW5jdGlvbiAoZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgICAgICBkYXRhVHJhbnNmZXIgPSBkYXRhVHJhbnNmZXIgfHwge307XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBkYXRhVHJhbnNmZXIuaXRlbXM7XG4gICAgICAgICAgICBpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoICYmIChpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5IHx8XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zWzBdLmdldEFzRW50cnkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZUZpbGVUcmVlRW50cmllcyhcbiAgICAgICAgICAgICAgICAgICAgJC5tYXAoaXRlbXMsIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW50cnk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS53ZWJraXRHZXRBc0VudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkgPSBpdGVtLndlYmtpdEdldEFzRW50cnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgQ2hyb21lIGJ1ZyAjMTQ5NzM1OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5fZmlsZSA9IGl0ZW0uZ2V0QXNGaWxlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbnRyeTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmdldEFzRW50cnkoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQoKS5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICQubWFrZUFycmF5KGRhdGFUcmFuc2Zlci5maWxlcylcbiAgICAgICAgICAgICkucHJvbWlzZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRTaW5nbGVGaWxlSW5wdXRGaWxlczogZnVuY3Rpb24gKGZpbGVJbnB1dCkge1xuICAgICAgICAgICAgZmlsZUlucHV0ID0gJChmaWxlSW5wdXQpO1xuICAgICAgICAgICAgdmFyIGVudHJpZXMgPSBmaWxlSW5wdXQucHJvcCgnd2Via2l0RW50cmllcycpIHx8XG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbnB1dC5wcm9wKCdlbnRyaWVzJyksXG4gICAgICAgICAgICAgICAgZmlsZXMsXG4gICAgICAgICAgICAgICAgdmFsdWU7XG4gICAgICAgICAgICBpZiAoZW50cmllcyAmJiBlbnRyaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVGaWxlVHJlZUVudHJpZXMoZW50cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlcyA9ICQubWFrZUFycmF5KGZpbGVJbnB1dC5wcm9wKCdmaWxlcycpKTtcbiAgICAgICAgICAgIGlmICghZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBmaWxlSW5wdXQucHJvcCgndmFsdWUnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVzb2x2ZShbXSkucHJvbWlzZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZmlsZXMgcHJvcGVydHkgaXMgbm90IGF2YWlsYWJsZSwgdGhlIGJyb3dzZXIgZG9lcyBub3RcbiAgICAgICAgICAgICAgICAvLyBzdXBwb3J0IHRoZSBGaWxlIEFQSSBhbmQgd2UgYWRkIGEgcHNldWRvIEZpbGUgb2JqZWN0IHdpdGhcbiAgICAgICAgICAgICAgICAvLyB0aGUgaW5wdXQgdmFsdWUgYXMgbmFtZSB3aXRoIHBhdGggaW5mb3JtYXRpb24gcmVtb3ZlZDpcbiAgICAgICAgICAgICAgICBmaWxlcyA9IFt7bmFtZTogdmFsdWUucmVwbGFjZSgvXi4qXFxcXC8sICcnKX1dO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWxlc1swXS5uYW1lID09PSB1bmRlZmluZWQgJiYgZmlsZXNbMF0uZmlsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAvLyBGaWxlIG5vcm1hbGl6YXRpb24gZm9yIFNhZmFyaSA0IGFuZCBGaXJlZm94IDM6XG4gICAgICAgICAgICAgICAgJC5lYWNoKGZpbGVzLCBmdW5jdGlvbiAoaW5kZXgsIGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5uYW1lID0gZmlsZS5maWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5zaXplID0gZmlsZS5maWxlU2l6ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVzb2x2ZShmaWxlcykucHJvbWlzZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRGaWxlSW5wdXRGaWxlczogZnVuY3Rpb24gKGZpbGVJbnB1dCkge1xuICAgICAgICAgICAgaWYgKCEoZmlsZUlucHV0IGluc3RhbmNlb2YgJCkgfHwgZmlsZUlucHV0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRTaW5nbGVGaWxlSW5wdXRGaWxlcyhmaWxlSW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICQud2hlbi5hcHBseShcbiAgICAgICAgICAgICAgICAkLFxuICAgICAgICAgICAgICAgICQubWFwKGZpbGVJbnB1dCwgdGhpcy5fZ2V0U2luZ2xlRmlsZUlucHV0RmlsZXMpXG4gICAgICAgICAgICApLnBpcGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFxuICAgICAgICAgICAgICAgICAgICBbXSxcbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlSW5wdXQ6ICQoZS50YXJnZXQpLFxuICAgICAgICAgICAgICAgICAgICBmb3JtOiAkKGUudGFyZ2V0LmZvcm0pXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2dldEZpbGVJbnB1dEZpbGVzKGRhdGEuZmlsZUlucHV0KS5hbHdheXMoZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5maWxlcyA9IGZpbGVzO1xuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMucmVwbGFjZUZpbGVJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Ll9yZXBsYWNlRmlsZUlucHV0KGRhdGEuZmlsZUlucHV0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuX3RyaWdnZXIoJ2NoYW5nZScsIGUsIGRhdGEpICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Ll9vbkFkZChlLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25QYXN0ZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBjYmQgPSBlLm9yaWdpbmFsRXZlbnQuY2xpcGJvYXJkRGF0YSxcbiAgICAgICAgICAgICAgICBpdGVtcyA9IChjYmQgJiYgY2JkLml0ZW1zKSB8fCBbXSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge2ZpbGVzOiBbXX07XG4gICAgICAgICAgICAkLmVhY2goaXRlbXMsIGZ1bmN0aW9uIChpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBmaWxlID0gaXRlbS5nZXRBc0ZpbGUgJiYgaXRlbS5nZXRBc0ZpbGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fdHJpZ2dlcigncGFzdGUnLCBlLCBkYXRhKSA9PT0gZmFsc2UgfHxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25BZGQoZSwgZGF0YSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkRyb3A6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGF0YVRyYW5zZmVyID0gZS5kYXRhVHJhbnNmZXIgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fTtcbiAgICAgICAgICAgIGlmIChkYXRhVHJhbnNmZXIgJiYgZGF0YVRyYW5zZmVyLmZpbGVzICYmIGRhdGFUcmFuc2Zlci5maWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9nZXREcm9wcGVkRmlsZXMoZGF0YVRyYW5zZmVyKS5hbHdheXMoZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5maWxlcyA9IGZpbGVzO1xuICAgICAgICAgICAgICAgIGlmICh0aGF0Ll90cmlnZ2VyKCdkcm9wJywgZSwgZGF0YSkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuX29uQWRkKGUsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkRyYWdPdmVyOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGRhdGFUcmFuc2ZlciA9IGUuZGF0YVRyYW5zZmVyID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2ZlcjtcbiAgICAgICAgICAgIGlmICh0aGlzLl90cmlnZ2VyKCdkcmFnb3ZlcicsIGUpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhVHJhbnNmZXIgJiYgJC5pbkFycmF5KCdGaWxlcycsIGRhdGFUcmFuc2Zlci50eXBlcykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnY29weSc7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9pbml0RXZlbnRIYW5kbGVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzWEhSVXBsb2FkKHRoaXMub3B0aW9ucykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbih0aGlzLm9wdGlvbnMuZHJvcFpvbmUsIHtcbiAgICAgICAgICAgICAgICAgICAgZHJhZ292ZXI6IHRoaXMuX29uRHJhZ092ZXIsXG4gICAgICAgICAgICAgICAgICAgIGRyb3A6IHRoaXMuX29uRHJvcFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX29uKHRoaXMub3B0aW9ucy5wYXN0ZVpvbmUsIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzdGU6IHRoaXMuX29uUGFzdGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX29uKHRoaXMub3B0aW9ucy5maWxlSW5wdXQsIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2U6IHRoaXMuX29uQ2hhbmdlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZGVzdHJveUV2ZW50SGFuZGxlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX29mZih0aGlzLm9wdGlvbnMuZHJvcFpvbmUsICdkcmFnb3ZlciBkcm9wJyk7XG4gICAgICAgICAgICB0aGlzLl9vZmYodGhpcy5vcHRpb25zLnBhc3RlWm9uZSwgJ3Bhc3RlJyk7XG4gICAgICAgICAgICB0aGlzLl9vZmYodGhpcy5vcHRpb25zLmZpbGVJbnB1dCwgJ2NoYW5nZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9zZXRPcHRpb246IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmVmcmVzaCA9ICQuaW5BcnJheShrZXksIHRoaXMuX3JlZnJlc2hPcHRpb25zTGlzdCkgIT09IC0xO1xuICAgICAgICAgICAgaWYgKHJlZnJlc2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZXN0cm95RXZlbnRIYW5kbGVycygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc3VwZXIoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAocmVmcmVzaCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXRTcGVjaWFsT3B0aW9ucygpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXRFdmVudEhhbmRsZXJzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2luaXRTcGVjaWFsT3B0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5maWxlSW5wdXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZmlsZUlucHV0ID0gdGhpcy5lbGVtZW50LmlzKCdpbnB1dFt0eXBlPVwiZmlsZVwiXScpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudCA6IHRoaXMuZWxlbWVudC5maW5kKCdpbnB1dFt0eXBlPVwiZmlsZVwiXScpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghKG9wdGlvbnMuZmlsZUlucHV0IGluc3RhbmNlb2YgJCkpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmZpbGVJbnB1dCA9ICQob3B0aW9ucy5maWxlSW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEob3B0aW9ucy5kcm9wWm9uZSBpbnN0YW5jZW9mICQpKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5kcm9wWm9uZSA9ICQob3B0aW9ucy5kcm9wWm9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIShvcHRpb25zLnBhc3RlWm9uZSBpbnN0YW5jZW9mICQpKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wYXN0ZVpvbmUgPSAkKG9wdGlvbnMucGFzdGVab25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgICAgIC8vIEluaXRpYWxpemUgb3B0aW9ucyBzZXQgdmlhIEhUTUw1IGRhdGEtYXR0cmlidXRlczpcbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsICQodGhpcy5lbGVtZW50WzBdLmNsb25lTm9kZShmYWxzZSkpLmRhdGEoKSk7XG4gICAgICAgICAgICB0aGlzLl9pbml0U3BlY2lhbE9wdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuX3Nsb3RzID0gW107XG4gICAgICAgICAgICB0aGlzLl9zZXF1ZW5jZSA9IHRoaXMuX2dldFhIUlByb21pc2UodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl9zZW5kaW5nID0gdGhpcy5fYWN0aXZlID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2luaXRQcm9ncmVzc09iamVjdCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuX2luaXRFdmVudEhhbmRsZXJzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gVGhpcyBtZXRob2QgaXMgZXhwb3NlZCB0byB0aGUgd2lkZ2V0IEFQSSBhbmQgYWxsb3dzIHRvIHF1ZXJ5XG4gICAgICAgIC8vIHRoZSB3aWRnZXQgdXBsb2FkIHByb2dyZXNzLlxuICAgICAgICAvLyBJdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIGxvYWRlZCwgdG90YWwgYW5kIGJpdHJhdGUgcHJvcGVydGllc1xuICAgICAgICAvLyBmb3IgdGhlIHJ1bm5pbmcgdXBsb2FkczpcbiAgICAgICAgcHJvZ3Jlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm9ncmVzcztcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGlzIG1ldGhvZCBpcyBleHBvc2VkIHRvIHRoZSB3aWRnZXQgQVBJIGFuZCBhbGxvd3MgYWRkaW5nIGZpbGVzXG4gICAgICAgIC8vIHVzaW5nIHRoZSBmaWxldXBsb2FkIEFQSS4gVGhlIGRhdGEgcGFyYW1ldGVyIGFjY2VwdHMgYW4gb2JqZWN0IHdoaWNoXG4gICAgICAgIC8vIG11c3QgaGF2ZSBhIGZpbGVzIHByb3BlcnR5IGFuZCBjYW4gY29udGFpbiBhZGRpdGlvbmFsIG9wdGlvbnM6XG4gICAgICAgIC8vIC5maWxldXBsb2FkKCdhZGQnLCB7ZmlsZXM6IGZpbGVzTGlzdH0pO1xuICAgICAgICBhZGQ6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoIWRhdGEgfHwgdGhpcy5vcHRpb25zLmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEuZmlsZUlucHV0ICYmICFkYXRhLmZpbGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0RmlsZUlucHV0RmlsZXMoZGF0YS5maWxlSW5wdXQpLmFsd2F5cyhmdW5jdGlvbiAoZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5maWxlcyA9IGZpbGVzO1xuICAgICAgICAgICAgICAgICAgICB0aGF0Ll9vbkFkZChudWxsLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGF0YS5maWxlcyA9ICQubWFrZUFycmF5KGRhdGEuZmlsZXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX29uQWRkKG51bGwsIGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFRoaXMgbWV0aG9kIGlzIGV4cG9zZWQgdG8gdGhlIHdpZGdldCBBUEkgYW5kIGFsbG93cyBzZW5kaW5nIGZpbGVzXG4gICAgICAgIC8vIHVzaW5nIHRoZSBmaWxldXBsb2FkIEFQSS4gVGhlIGRhdGEgcGFyYW1ldGVyIGFjY2VwdHMgYW4gb2JqZWN0IHdoaWNoXG4gICAgICAgIC8vIG11c3QgaGF2ZSBhIGZpbGVzIG9yIGZpbGVJbnB1dCBwcm9wZXJ0eSBhbmQgY2FuIGNvbnRhaW4gYWRkaXRpb25hbCBvcHRpb25zOlxuICAgICAgICAvLyAuZmlsZXVwbG9hZCgnc2VuZCcsIHtmaWxlczogZmlsZXNMaXN0fSk7XG4gICAgICAgIC8vIFRoZSBtZXRob2QgcmV0dXJucyBhIFByb21pc2Ugb2JqZWN0IGZvciB0aGUgZmlsZSB1cGxvYWQgY2FsbC5cbiAgICAgICAgc2VuZDogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChkYXRhICYmICF0aGlzLm9wdGlvbnMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5maWxlSW5wdXQgJiYgIWRhdGEuZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGZkID0gJC5EZWZlcnJlZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSA9IGRmZC5wcm9taXNlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBqcVhIUixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3J0ZWQ7XG4gICAgICAgICAgICAgICAgICAgIHByb21pc2UuYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqcVhIUikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqcVhIUi5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGZkLnJlamVjdChudWxsLCAnYWJvcnQnLCAnYWJvcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9nZXRGaWxlSW5wdXRGaWxlcyhkYXRhLmZpbGVJbnB1dCkuYWx3YXlzKFxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmZpbGVzID0gZmlsZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganFYSFIgPSB0aGF0Ll9vblNlbmQobnVsbCwgZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3VsdCwgdGV4dFN0YXR1cywganFYSFIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRmZC5yZXNvbHZlKHJlc3VsdCwgdGV4dFN0YXR1cywganFYSFIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZmQucmVqZWN0KGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZW5oYW5jZVByb21pc2UocHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGEuZmlsZXMgPSAkLm1ha2VBcnJheShkYXRhLmZpbGVzKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5maWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29uU2VuZChudWxsLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0WEhSUHJvbWlzZShmYWxzZSwgZGF0YSAmJiBkYXRhLmNvbnRleHQpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxufSkpO1xuIl0sImZpbGUiOiJyYWRpby9qcXVlcnkuZmlsZXVwbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
