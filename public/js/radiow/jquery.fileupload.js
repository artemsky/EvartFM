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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpb3cvanF1ZXJ5LmZpbGV1cGxvYWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIGpRdWVyeSBGaWxlIFVwbG9hZCBQbHVnaW4gNS4yNlxuICogaHR0cHM6Ly9naXRodWIuY29tL2JsdWVpbXAvalF1ZXJ5LUZpbGUtVXBsb2FkXG4gKlxuICogQ29weXJpZ2h0IDIwMTAsIFNlYmFzdGlhbiBUc2NoYW5cbiAqIGh0dHBzOi8vYmx1ZWltcC5uZXRcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5cbi8qanNsaW50IG5vbWVuOiB0cnVlLCB1bnBhcmFtOiB0cnVlLCByZWdleHA6IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZSwgd2luZG93LCBkb2N1bWVudCwgRmlsZSwgQmxvYiwgRm9ybURhdGEsIGxvY2F0aW9uICovXG5cbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBBTUQgbW9kdWxlOlxuICAgICAgICBkZWZpbmUoW1xuICAgICAgICAgICAgJ2pxdWVyeScsXG4gICAgICAgICAgICAnanF1ZXJ5LnVpLndpZGdldCdcbiAgICAgICAgXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzOlxuICAgICAgICBmYWN0b3J5KHdpbmRvdy5qUXVlcnkpO1xuICAgIH1cbn0oZnVuY3Rpb24gKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBUaGUgRmlsZVJlYWRlciBBUEkgaXMgbm90IGFjdHVhbGx5IHVzZWQsIGJ1dCB3b3JrcyBhcyBmZWF0dXJlIGRldGVjdGlvbixcbiAgICAvLyBhcyBlLmcuIFNhZmFyaSBzdXBwb3J0cyBYSFIgZmlsZSB1cGxvYWRzIHZpYSB0aGUgRm9ybURhdGEgQVBJLFxuICAgIC8vIGJ1dCBub3Qgbm9uLW11bHRpcGFydCBYSFIgZmlsZSB1cGxvYWRzOlxuICAgICQuc3VwcG9ydC54aHJGaWxlVXBsb2FkID0gISEod2luZG93LlhNTEh0dHBSZXF1ZXN0VXBsb2FkICYmIHdpbmRvdy5GaWxlUmVhZGVyKTtcbiAgICAkLnN1cHBvcnQueGhyRm9ybURhdGFGaWxlVXBsb2FkID0gISF3aW5kb3cuRm9ybURhdGE7XG5cbiAgICAvLyBUaGUgZmlsZXVwbG9hZCB3aWRnZXQgbGlzdGVucyBmb3IgY2hhbmdlIGV2ZW50cyBvbiBmaWxlIGlucHV0IGZpZWxkcyBkZWZpbmVkXG4gICAgLy8gdmlhIGZpbGVJbnB1dCBzZXR0aW5nIGFuZCBwYXN0ZSBvciBkcm9wIGV2ZW50cyBvZiB0aGUgZ2l2ZW4gZHJvcFpvbmUuXG4gICAgLy8gSW4gYWRkaXRpb24gdG8gdGhlIGRlZmF1bHQgalF1ZXJ5IFdpZGdldCBtZXRob2RzLCB0aGUgZmlsZXVwbG9hZCB3aWRnZXRcbiAgICAvLyBleHBvc2VzIHRoZSBcImFkZFwiIGFuZCBcInNlbmRcIiBtZXRob2RzLCB0byBhZGQgb3IgZGlyZWN0bHkgc2VuZCBmaWxlcyB1c2luZ1xuICAgIC8vIHRoZSBmaWxldXBsb2FkIEFQSS5cbiAgICAvLyBCeSBkZWZhdWx0LCBmaWxlcyBhZGRlZCB2aWEgZmlsZSBpbnB1dCBzZWxlY3Rpb24sIHBhc3RlLCBkcmFnICYgZHJvcCBvclxuICAgIC8vIFwiYWRkXCIgbWV0aG9kIGFyZSB1cGxvYWRlZCBpbW1lZGlhdGVseSwgYnV0IGl0IGlzIHBvc3NpYmxlIHRvIG92ZXJyaWRlXG4gICAgLy8gdGhlIFwiYWRkXCIgY2FsbGJhY2sgb3B0aW9uIHRvIHF1ZXVlIGZpbGUgdXBsb2Fkcy5cbiAgICAkLndpZGdldCgnYmx1ZWltcC5maWxldXBsb2FkJywge1xuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIC8vIFRoZSBkcm9wIHRhcmdldCBlbGVtZW50KHMpLCBieSB0aGUgZGVmYXVsdCB0aGUgY29tcGxldGUgZG9jdW1lbnQuXG4gICAgICAgICAgICAvLyBTZXQgdG8gbnVsbCB0byBkaXNhYmxlIGRyYWcgJiBkcm9wIHN1cHBvcnQ6XG4gICAgICAgICAgICBkcm9wWm9uZTogJChkb2N1bWVudCksXG4gICAgICAgICAgICAvLyBUaGUgcGFzdGUgdGFyZ2V0IGVsZW1lbnQocyksIGJ5IHRoZSBkZWZhdWx0IHRoZSBjb21wbGV0ZSBkb2N1bWVudC5cbiAgICAgICAgICAgIC8vIFNldCB0byBudWxsIHRvIGRpc2FibGUgcGFzdGUgc3VwcG9ydDpcbiAgICAgICAgICAgIHBhc3RlWm9uZTogJChkb2N1bWVudCksXG4gICAgICAgICAgICAvLyBUaGUgZmlsZSBpbnB1dCBmaWVsZChzKSwgdGhhdCBhcmUgbGlzdGVuZWQgdG8gZm9yIGNoYW5nZSBldmVudHMuXG4gICAgICAgICAgICAvLyBJZiB1bmRlZmluZWQsIGl0IGlzIHNldCB0byB0aGUgZmlsZSBpbnB1dCBmaWVsZHMgaW5zaWRlXG4gICAgICAgICAgICAvLyBvZiB0aGUgd2lkZ2V0IGVsZW1lbnQgb24gcGx1Z2luIGluaXRpYWxpemF0aW9uLlxuICAgICAgICAgICAgLy8gU2V0IHRvIG51bGwgdG8gZGlzYWJsZSB0aGUgY2hhbmdlIGxpc3RlbmVyLlxuICAgICAgICAgICAgZmlsZUlucHV0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCB0aGUgZmlsZSBpbnB1dCBmaWVsZCBpcyByZXBsYWNlZCB3aXRoIGEgY2xvbmUgYWZ0ZXJcbiAgICAgICAgICAgIC8vIGVhY2ggaW5wdXQgZmllbGQgY2hhbmdlIGV2ZW50LiBUaGlzIGlzIHJlcXVpcmVkIGZvciBpZnJhbWUgdHJhbnNwb3J0XG4gICAgICAgICAgICAvLyBxdWV1ZXMgYW5kIGFsbG93cyBjaGFuZ2UgZXZlbnRzIHRvIGJlIGZpcmVkIGZvciB0aGUgc2FtZSBmaWxlXG4gICAgICAgICAgICAvLyBzZWxlY3Rpb24sIGJ1dCBjYW4gYmUgZGlzYWJsZWQgYnkgc2V0dGluZyB0aGUgZm9sbG93aW5nIG9wdGlvbiB0byBmYWxzZTpcbiAgICAgICAgICAgIHJlcGxhY2VGaWxlSW5wdXQ6IHRydWUsXG4gICAgICAgICAgICAvLyBUaGUgcGFyYW1ldGVyIG5hbWUgZm9yIHRoZSBmaWxlIGZvcm0gZGF0YSAodGhlIHJlcXVlc3QgYXJndW1lbnQgbmFtZSkuXG4gICAgICAgICAgICAvLyBJZiB1bmRlZmluZWQgb3IgZW1wdHksIHRoZSBuYW1lIHByb3BlcnR5IG9mIHRoZSBmaWxlIGlucHV0IGZpZWxkIGlzXG4gICAgICAgICAgICAvLyB1c2VkLCBvciBcImZpbGVzW11cIiBpZiB0aGUgZmlsZSBpbnB1dCBuYW1lIHByb3BlcnR5IGlzIGFsc28gZW1wdHksXG4gICAgICAgICAgICAvLyBjYW4gYmUgYSBzdHJpbmcgb3IgYW4gYXJyYXkgb2Ygc3RyaW5nczpcbiAgICAgICAgICAgIHBhcmFtTmFtZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLy8gQnkgZGVmYXVsdCwgZWFjaCBmaWxlIG9mIGEgc2VsZWN0aW9uIGlzIHVwbG9hZGVkIHVzaW5nIGFuIGluZGl2aWR1YWxcbiAgICAgICAgICAgIC8vIHJlcXVlc3QgZm9yIFhIUiB0eXBlIHVwbG9hZHMuIFNldCB0byBmYWxzZSB0byB1cGxvYWQgZmlsZVxuICAgICAgICAgICAgLy8gc2VsZWN0aW9ucyBpbiBvbmUgcmVxdWVzdCBlYWNoOlxuICAgICAgICAgICAgc2luZ2xlRmlsZVVwbG9hZHM6IHRydWUsXG4gICAgICAgICAgICAvLyBUbyBsaW1pdCB0aGUgbnVtYmVyIG9mIGZpbGVzIHVwbG9hZGVkIHdpdGggb25lIFhIUiByZXF1ZXN0LFxuICAgICAgICAgICAgLy8gc2V0IHRoZSBmb2xsb3dpbmcgb3B0aW9uIHRvIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIDA6XG4gICAgICAgICAgICBsaW1pdE11bHRpRmlsZVVwbG9hZHM6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIFNldCB0aGUgZm9sbG93aW5nIG9wdGlvbiB0byB0cnVlIHRvIGlzc3VlIGFsbCBmaWxlIHVwbG9hZCByZXF1ZXN0c1xuICAgICAgICAgICAgLy8gaW4gYSBzZXF1ZW50aWFsIG9yZGVyOlxuICAgICAgICAgICAgc2VxdWVudGlhbFVwbG9hZHM6IGZhbHNlLFxuICAgICAgICAgICAgLy8gVG8gbGltaXQgdGhlIG51bWJlciBvZiBjb25jdXJyZW50IHVwbG9hZHMsXG4gICAgICAgICAgICAvLyBzZXQgdGhlIGZvbGxvd2luZyBvcHRpb24gdG8gYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gMDpcbiAgICAgICAgICAgIGxpbWl0Q29uY3VycmVudFVwbG9hZHM6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIFNldCB0aGUgZm9sbG93aW5nIG9wdGlvbiB0byB0cnVlIHRvIGZvcmNlIGlmcmFtZSB0cmFuc3BvcnQgdXBsb2FkczpcbiAgICAgICAgICAgIGZvcmNlSWZyYW1lVHJhbnNwb3J0OiBmYWxzZSxcbiAgICAgICAgICAgIC8vIFNldCB0aGUgZm9sbG93aW5nIG9wdGlvbiB0byB0aGUgbG9jYXRpb24gb2YgYSByZWRpcmVjdCB1cmwgb24gdGhlXG4gICAgICAgICAgICAvLyBvcmlnaW4gc2VydmVyLCBmb3IgY3Jvc3MtZG9tYWluIGlmcmFtZSB0cmFuc3BvcnQgdXBsb2FkczpcbiAgICAgICAgICAgIHJlZGlyZWN0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICAvLyBUaGUgcGFyYW1ldGVyIG5hbWUgZm9yIHRoZSByZWRpcmVjdCB1cmwsIHNlbnQgYXMgcGFydCBvZiB0aGUgZm9ybVxuICAgICAgICAgICAgLy8gZGF0YSBhbmQgc2V0IHRvICdyZWRpcmVjdCcgaWYgdGhpcyBvcHRpb24gaXMgZW1wdHk6XG4gICAgICAgICAgICByZWRpcmVjdFBhcmFtTmFtZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLy8gU2V0IHRoZSBmb2xsb3dpbmcgb3B0aW9uIHRvIHRoZSBsb2NhdGlvbiBvZiBhIHBvc3RNZXNzYWdlIHdpbmRvdyxcbiAgICAgICAgICAgIC8vIHRvIGVuYWJsZSBwb3N0TWVzc2FnZSB0cmFuc3BvcnQgdXBsb2FkczpcbiAgICAgICAgICAgIHBvc3RNZXNzYWdlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCBYSFIgZmlsZSB1cGxvYWRzIGFyZSBzZW50IGFzIG11bHRpcGFydC9mb3JtLWRhdGEuXG4gICAgICAgICAgICAvLyBUaGUgaWZyYW1lIHRyYW5zcG9ydCBpcyBhbHdheXMgdXNpbmcgbXVsdGlwYXJ0L2Zvcm0tZGF0YS5cbiAgICAgICAgICAgIC8vIFNldCB0byBmYWxzZSB0byBlbmFibGUgbm9uLW11bHRpcGFydCBYSFIgdXBsb2FkczpcbiAgICAgICAgICAgIG11bHRpcGFydDogdHJ1ZSxcbiAgICAgICAgICAgIC8vIFRvIHVwbG9hZCBsYXJnZSBmaWxlcyBpbiBzbWFsbGVyIGNodW5rcywgc2V0IHRoZSBmb2xsb3dpbmcgb3B0aW9uXG4gICAgICAgICAgICAvLyB0byBhIHByZWZlcnJlZCBtYXhpbXVtIGNodW5rIHNpemUuIElmIHNldCB0byAwLCBudWxsIG9yIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIG9yIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgdGhlIHJlcXVpcmVkIEJsb2IgQVBJLCBmaWxlcyB3aWxsXG4gICAgICAgICAgICAvLyBiZSB1cGxvYWRlZCBhcyBhIHdob2xlLlxuICAgICAgICAgICAgbWF4Q2h1bmtTaXplOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAvLyBXaGVuIGEgbm9uLW11bHRpcGFydCB1cGxvYWQgb3IgYSBjaHVua2VkIG11bHRpcGFydCB1cGxvYWQgaGFzIGJlZW5cbiAgICAgICAgICAgIC8vIGFib3J0ZWQsIHRoaXMgb3B0aW9uIGNhbiBiZSB1c2VkIHRvIHJlc3VtZSB0aGUgdXBsb2FkIGJ5IHNldHRpbmdcbiAgICAgICAgICAgIC8vIGl0IHRvIHRoZSBzaXplIG9mIHRoZSBhbHJlYWR5IHVwbG9hZGVkIGJ5dGVzLiBUaGlzIG9wdGlvbiBpcyBtb3N0XG4gICAgICAgICAgICAvLyB1c2VmdWwgd2hlbiBtb2RpZnlpbmcgdGhlIG9wdGlvbnMgb2JqZWN0IGluc2lkZSBvZiB0aGUgXCJhZGRcIiBvclxuICAgICAgICAgICAgLy8gXCJzZW5kXCIgY2FsbGJhY2tzLCBhcyB0aGUgb3B0aW9ucyBhcmUgY2xvbmVkIGZvciBlYWNoIGZpbGUgdXBsb2FkLlxuICAgICAgICAgICAgdXBsb2FkZWRCeXRlczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLy8gQnkgZGVmYXVsdCwgZmFpbGVkIChhYm9ydCBvciBlcnJvcikgZmlsZSB1cGxvYWRzIGFyZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICAgICAgICAvLyBnbG9iYWwgcHJvZ3Jlc3MgY2FsY3VsYXRpb24uIFNldCB0aGUgZm9sbG93aW5nIG9wdGlvbiB0byBmYWxzZSB0b1xuICAgICAgICAgICAgLy8gcHJldmVudCByZWNhbGN1bGF0aW5nIHRoZSBnbG9iYWwgcHJvZ3Jlc3MgZGF0YTpcbiAgICAgICAgICAgIHJlY2FsY3VsYXRlUHJvZ3Jlc3M6IHRydWUsXG4gICAgICAgICAgICAvLyBJbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMgdG8gY2FsY3VsYXRlIGFuZCB0cmlnZ2VyIHByb2dyZXNzIGV2ZW50czpcbiAgICAgICAgICAgIHByb2dyZXNzSW50ZXJ2YWw6IDEwMCxcbiAgICAgICAgICAgIC8vIEludGVydmFsIGluIG1pbGxpc2Vjb25kcyB0byBjYWxjdWxhdGUgcHJvZ3Jlc3MgYml0cmF0ZTpcbiAgICAgICAgICAgIGJpdHJhdGVJbnRlcnZhbDogNTAwLFxuICAgICAgICAgICAgLy8gQnkgZGVmYXVsdCwgdXBsb2FkcyBhcmUgc3RhcnRlZCBhdXRvbWF0aWNhbGx5IHdoZW4gYWRkaW5nIGZpbGVzOlxuICAgICAgICAgICAgYXV0b1VwbG9hZDogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gQWRkaXRpb25hbCBmb3JtIGRhdGEgdG8gYmUgc2VudCBhbG9uZyB3aXRoIHRoZSBmaWxlIHVwbG9hZHMgY2FuIGJlIHNldFxuICAgICAgICAgICAgLy8gdXNpbmcgdGhpcyBvcHRpb24sIHdoaWNoIGFjY2VwdHMgYW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIG5hbWUgYW5kXG4gICAgICAgICAgICAvLyB2YWx1ZSBwcm9wZXJ0aWVzLCBhIGZ1bmN0aW9uIHJldHVybmluZyBzdWNoIGFuIGFycmF5LCBhIEZvcm1EYXRhXG4gICAgICAgICAgICAvLyBvYmplY3QgKGZvciBYSFIgZmlsZSB1cGxvYWRzKSwgb3IgYSBzaW1wbGUgb2JqZWN0LlxuICAgICAgICAgICAgLy8gVGhlIGZvcm0gb2YgdGhlIGZpcnN0IGZpbGVJbnB1dCBpcyBnaXZlbiBhcyBwYXJhbWV0ZXIgdG8gdGhlIGZ1bmN0aW9uOlxuICAgICAgICAgICAgZm9ybURhdGE6IGZ1bmN0aW9uIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm0uc2VyaWFsaXplQXJyYXkoKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIFRoZSBhZGQgY2FsbGJhY2sgaXMgaW52b2tlZCBhcyBzb29uIGFzIGZpbGVzIGFyZSBhZGRlZCB0byB0aGUgZmlsZXVwbG9hZFxuICAgICAgICAgICAgLy8gd2lkZ2V0ICh2aWEgZmlsZSBpbnB1dCBzZWxlY3Rpb24sIGRyYWcgJiBkcm9wLCBwYXN0ZSBvciBhZGQgQVBJIGNhbGwpLlxuICAgICAgICAgICAgLy8gSWYgdGhlIHNpbmdsZUZpbGVVcGxvYWRzIG9wdGlvbiBpcyBlbmFibGVkLCB0aGlzIGNhbGxiYWNrIHdpbGwgYmVcbiAgICAgICAgICAgIC8vIGNhbGxlZCBvbmNlIGZvciBlYWNoIGZpbGUgaW4gdGhlIHNlbGVjdGlvbiBmb3IgWEhSIGZpbGUgdXBsYW9kcywgZWxzZVxuICAgICAgICAgICAgLy8gb25jZSBmb3IgZWFjaCBmaWxlIHNlbGVjdGlvbi5cbiAgICAgICAgICAgIC8vIFRoZSB1cGxvYWQgc3RhcnRzIHdoZW4gdGhlIHN1Ym1pdCBtZXRob2QgaXMgaW52b2tlZCBvbiB0aGUgZGF0YSBwYXJhbWV0ZXIuXG4gICAgICAgICAgICAvLyBUaGUgZGF0YSBvYmplY3QgY29udGFpbnMgYSBmaWxlcyBwcm9wZXJ0eSBob2xkaW5nIHRoZSBhZGRlZCBmaWxlc1xuICAgICAgICAgICAgLy8gYW5kIGFsbG93cyB0byBvdmVycmlkZSBwbHVnaW4gb3B0aW9ucyBhcyB3ZWxsIGFzIGRlZmluZSBhamF4IHNldHRpbmdzLlxuICAgICAgICAgICAgLy8gTGlzdGVuZXJzIGZvciB0aGlzIGNhbGxiYWNrIGNhbiBhbHNvIGJlIGJvdW5kIHRoZSBmb2xsb3dpbmcgd2F5OlxuICAgICAgICAgICAgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRhZGQnLCBmdW5jKTtcbiAgICAgICAgICAgIC8vIGRhdGEuc3VibWl0KCkgcmV0dXJucyBhIFByb21pc2Ugb2JqZWN0IGFuZCBhbGxvd3MgdG8gYXR0YWNoIGFkZGl0aW9uYWxcbiAgICAgICAgICAgIC8vIGhhbmRsZXJzIHVzaW5nIGpRdWVyeSdzIERlZmVycmVkIGNhbGxiYWNrczpcbiAgICAgICAgICAgIC8vIGRhdGEuc3VibWl0KCkuZG9uZShmdW5jKS5mYWlsKGZ1bmMpLmFsd2F5cyhmdW5jKTtcbiAgICAgICAgICAgIGFkZDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5hdXRvVXBsb2FkIHx8IChkYXRhLmF1dG9VcGxvYWQgIT09IGZhbHNlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAoJCh0aGlzKS5kYXRhKCdibHVlaW1wLWZpbGV1cGxvYWQnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdmaWxldXBsb2FkJykpLm9wdGlvbnMuYXV0b1VwbG9hZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5zdWJtaXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBPdGhlciBjYWxsYmFja3M6XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciB0aGUgc3VibWl0IGV2ZW50IG9mIGVhY2ggZmlsZSB1cGxvYWQ6XG4gICAgICAgICAgICAvLyBzdWJtaXQ6IGZ1bmN0aW9uIChlLCBkYXRhKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRzdWJtaXQnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIHRoZSBzdGFydCBvZiBlYWNoIGZpbGUgdXBsb2FkIHJlcXVlc3Q6XG4gICAgICAgICAgICAvLyBzZW5kOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2Fkc2VuZCcsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3Igc3VjY2Vzc2Z1bCB1cGxvYWRzOlxuICAgICAgICAgICAgLy8gZG9uZTogZnVuY3Rpb24gKGUsIGRhdGEpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZGRvbmUnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGZhaWxlZCAoYWJvcnQgb3IgZXJyb3IpIHVwbG9hZHM6XG4gICAgICAgICAgICAvLyBmYWlsOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkZmFpbCcsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgY29tcGxldGVkIChzdWNjZXNzLCBhYm9ydCBvciBlcnJvcikgcmVxdWVzdHM6XG4gICAgICAgICAgICAvLyBhbHdheXM6IGZ1bmN0aW9uIChlLCBkYXRhKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRhbHdheXMnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIHVwbG9hZCBwcm9ncmVzcyBldmVudHM6XG4gICAgICAgICAgICAvLyBwcm9ncmVzczogZnVuY3Rpb24gKGUsIGRhdGEpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZHByb2dyZXNzJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBnbG9iYWwgdXBsb2FkIHByb2dyZXNzIGV2ZW50czpcbiAgICAgICAgICAgIC8vIHByb2dyZXNzYWxsOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkcHJvZ3Jlc3NhbGwnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIHVwbG9hZHMgc3RhcnQsIGVxdWl2YWxlbnQgdG8gdGhlIGdsb2JhbCBhamF4U3RhcnQgZXZlbnQ6XG4gICAgICAgICAgICAvLyBzdGFydDogZnVuY3Rpb24gKGUpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZHN0YXJ0JywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciB1cGxvYWRzIHN0b3AsIGVxdWl2YWxlbnQgdG8gdGhlIGdsb2JhbCBhamF4U3RvcCBldmVudDpcbiAgICAgICAgICAgIC8vIHN0b3A6IGZ1bmN0aW9uIChlKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRzdG9wJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBjaGFuZ2UgZXZlbnRzIG9mIHRoZSBmaWxlSW5wdXQocyk6XG4gICAgICAgICAgICAvLyBjaGFuZ2U6IGZ1bmN0aW9uIChlLCBkYXRhKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRjaGFuZ2UnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIHBhc3RlIGV2ZW50cyB0byB0aGUgcGFzdGVab25lKHMpOlxuICAgICAgICAgICAgLy8gcGFzdGU6IGZ1bmN0aW9uIChlLCBkYXRhKSB7fSwgLy8gLmJpbmQoJ2ZpbGV1cGxvYWRwYXN0ZScsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgZHJvcCBldmVudHMgb2YgdGhlIGRyb3Bab25lKHMpOlxuICAgICAgICAgICAgLy8gZHJvcDogZnVuY3Rpb24gKGUsIGRhdGEpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZGRyb3AnLCBmdW5jKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGRyYWdvdmVyIGV2ZW50cyBvZiB0aGUgZHJvcFpvbmUocyk6XG4gICAgICAgICAgICAvLyBkcmFnb3ZlcjogZnVuY3Rpb24gKGUpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZGRyYWdvdmVyJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciB0aGUgc3RhcnQgb2YgZWFjaCBjaHVuayB1cGxvYWQgcmVxdWVzdDpcbiAgICAgICAgICAgIC8vIGNodW5rc2VuZDogZnVuY3Rpb24gKGUsIGRhdGEpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZGNodW5rc2VuZCcsIGZ1bmMpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3Igc3VjY2Vzc2Z1bCBjaHVuayB1cGxvYWRzOlxuICAgICAgICAgICAgLy8gY2h1bmtkb25lOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkY2h1bmtkb25lJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBmYWlsZWQgKGFib3J0IG9yIGVycm9yKSBjaHVuayB1cGxvYWRzOlxuICAgICAgICAgICAgLy8gY2h1bmtmYWlsOiBmdW5jdGlvbiAoZSwgZGF0YSkge30sIC8vIC5iaW5kKCdmaWxldXBsb2FkY2h1bmtmYWlsJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBjb21wbGV0ZWQgKHN1Y2Nlc3MsIGFib3J0IG9yIGVycm9yKSBjaHVuayB1cGxvYWQgcmVxdWVzdHM6XG4gICAgICAgICAgICAvLyBjaHVua2Fsd2F5czogZnVuY3Rpb24gKGUsIGRhdGEpIHt9LCAvLyAuYmluZCgnZmlsZXVwbG9hZGNodW5rYWx3YXlzJywgZnVuYyk7XG5cbiAgICAgICAgICAgIC8vIFRoZSBwbHVnaW4gb3B0aW9ucyBhcmUgdXNlZCBhcyBzZXR0aW5ncyBvYmplY3QgZm9yIHRoZSBhamF4IGNhbGxzLlxuICAgICAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBhcmUgalF1ZXJ5IGFqYXggc2V0dGluZ3MgcmVxdWlyZWQgZm9yIHRoZSBmaWxlIHVwbG9hZHM6XG4gICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgICAgICAgICBjYWNoZTogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBBIGxpc3Qgb2Ygb3B0aW9ucyB0aGF0IHJlcXVpcmUgYSByZWZyZXNoIGFmdGVyIGFzc2lnbmluZyBhIG5ldyB2YWx1ZTpcbiAgICAgICAgX3JlZnJlc2hPcHRpb25zTGlzdDogW1xuICAgICAgICAgICAgJ2ZpbGVJbnB1dCcsXG4gICAgICAgICAgICAnZHJvcFpvbmUnLFxuICAgICAgICAgICAgJ3Bhc3RlWm9uZScsXG4gICAgICAgICAgICAnbXVsdGlwYXJ0JyxcbiAgICAgICAgICAgICdmb3JjZUlmcmFtZVRyYW5zcG9ydCdcbiAgICAgICAgXSxcblxuICAgICAgICBfQml0cmF0ZVRpbWVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVzdGFtcCA9ICsobmV3IERhdGUoKSk7XG4gICAgICAgICAgICB0aGlzLmxvYWRlZCA9IDA7XG4gICAgICAgICAgICB0aGlzLmJpdHJhdGUgPSAwO1xuICAgICAgICAgICAgdGhpcy5nZXRCaXRyYXRlID0gZnVuY3Rpb24gKG5vdywgbG9hZGVkLCBpbnRlcnZhbCkge1xuICAgICAgICAgICAgICAgIHZhciB0aW1lRGlmZiA9IG5vdyAtIHRoaXMudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5iaXRyYXRlIHx8ICFpbnRlcnZhbCB8fCB0aW1lRGlmZiA+IGludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYml0cmF0ZSA9IChsb2FkZWQgLSB0aGlzLmxvYWRlZCkgKiAoMTAwMCAvIHRpbWVEaWZmKSAqIDg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGVkID0gbG9hZGVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVzdGFtcCA9IG5vdztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYml0cmF0ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2lzWEhSVXBsb2FkOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuICFvcHRpb25zLmZvcmNlSWZyYW1lVHJhbnNwb3J0ICYmXG4gICAgICAgICAgICAgICAgKCghb3B0aW9ucy5tdWx0aXBhcnQgJiYgJC5zdXBwb3J0LnhockZpbGVVcGxvYWQpIHx8XG4gICAgICAgICAgICAgICAgJC5zdXBwb3J0LnhockZvcm1EYXRhRmlsZVVwbG9hZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldEZvcm1EYXRhOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGZvcm1EYXRhO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmZvcm1EYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm9ybURhdGEob3B0aW9ucy5mb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkLmlzQXJyYXkob3B0aW9ucy5mb3JtRGF0YSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mb3JtRGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmZvcm1EYXRhKSB7XG4gICAgICAgICAgICAgICAgZm9ybURhdGEgPSBbXTtcbiAgICAgICAgICAgICAgICAkLmVhY2gob3B0aW9ucy5mb3JtRGF0YSwgZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBmb3JtRGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0VG90YWw6IGZ1bmN0aW9uIChmaWxlcykge1xuICAgICAgICAgICAgdmFyIHRvdGFsID0gMDtcbiAgICAgICAgICAgICQuZWFjaChmaWxlcywgZnVuY3Rpb24gKGluZGV4LCBmaWxlKSB7XG4gICAgICAgICAgICAgICAgdG90YWwgKz0gZmlsZS5zaXplIHx8IDE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0b3RhbDtcbiAgICAgICAgfSxcblxuICAgICAgICBfaW5pdFByb2dyZXNzT2JqZWN0OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBvYmouX3Byb2dyZXNzID0ge1xuICAgICAgICAgICAgICAgIGxvYWRlZDogMCxcbiAgICAgICAgICAgICAgICB0b3RhbDogMCxcbiAgICAgICAgICAgICAgICBiaXRyYXRlOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vblByb2dyZXNzOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xuICAgICAgICAgICAgaWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICAgIHZhciBub3cgPSArKG5ldyBEYXRlKCkpLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuX3RpbWUgJiYgZGF0YS5wcm9ncmVzc0ludGVydmFsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAobm93IC0gZGF0YS5fdGltZSA8IGRhdGEucHJvZ3Jlc3NJbnRlcnZhbCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGUubG9hZGVkICE9PSBlLnRvdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGF0YS5fdGltZSA9IG5vdztcbiAgICAgICAgICAgICAgICBsb2FkZWQgPSBNYXRoLmZsb29yKFxuICAgICAgICAgICAgICAgICAgICBlLmxvYWRlZCAvIGUudG90YWwgKiAoZGF0YS5jaHVua1NpemUgfHwgZGF0YS5fcHJvZ3Jlc3MudG90YWwpXG4gICAgICAgICAgICAgICAgKSArIChkYXRhLnVwbG9hZGVkQnl0ZXMgfHwgMCk7XG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBkaWZmZXJlbmNlIGZyb20gdGhlIHByZXZpb3VzbHkgbG9hZGVkIHN0YXRlXG4gICAgICAgICAgICAgICAgLy8gdG8gdGhlIGdsb2JhbCBsb2FkZWQgY291bnRlcjpcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9ncmVzcy5sb2FkZWQgKz0gKGxvYWRlZCAtIGRhdGEuX3Byb2dyZXNzLmxvYWRlZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MuYml0cmF0ZSA9IHRoaXMuX2JpdHJhdGVUaW1lci5nZXRCaXRyYXRlKFxuICAgICAgICAgICAgICAgICAgICBub3csXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzLmxvYWRlZCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5iaXRyYXRlSW50ZXJ2YWxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGRhdGEuX3Byb2dyZXNzLmxvYWRlZCA9IGRhdGEubG9hZGVkID0gbG9hZGVkO1xuICAgICAgICAgICAgICAgIGRhdGEuX3Byb2dyZXNzLmJpdHJhdGUgPSBkYXRhLmJpdHJhdGUgPSBkYXRhLl9iaXRyYXRlVGltZXIuZ2V0Qml0cmF0ZShcbiAgICAgICAgICAgICAgICAgICAgbm93LFxuICAgICAgICAgICAgICAgICAgICBsb2FkZWQsXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuYml0cmF0ZUludGVydmFsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGEgY3VzdG9tIHByb2dyZXNzIGV2ZW50IHdpdGggYSB0b3RhbCBkYXRhIHByb3BlcnR5IHNldFxuICAgICAgICAgICAgICAgIC8vIHRvIHRoZSBmaWxlIHNpemUocykgb2YgdGhlIGN1cnJlbnQgdXBsb2FkIGFuZCBhIGxvYWRlZCBkYXRhXG4gICAgICAgICAgICAgICAgLy8gcHJvcGVydHkgY2FsY3VsYXRlZCBhY2NvcmRpbmdseTpcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyKCdwcm9ncmVzcycsIGUsIGRhdGEpO1xuICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYSBnbG9iYWwgcHJvZ3Jlc3MgZXZlbnQgZm9yIGFsbCBjdXJyZW50IGZpbGUgdXBsb2FkcyxcbiAgICAgICAgICAgICAgICAvLyBpbmNsdWRpbmcgYWpheCBjYWxscyBxdWV1ZWQgZm9yIHNlcXVlbnRpYWwgZmlsZSB1cGxvYWRzOlxuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ3Byb2dyZXNzYWxsJywgZSwgdGhpcy5fcHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9pbml0UHJvZ3Jlc3NMaXN0ZW5lcjogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB4aHIgPSBvcHRpb25zLnhociA/IG9wdGlvbnMueGhyKCkgOiAkLmFqYXhTZXR0aW5ncy54aHIoKTtcbiAgICAgICAgICAgIC8vIEFjY2Vzc3MgdG8gdGhlIG5hdGl2ZSBYSFIgb2JqZWN0IGlzIHJlcXVpcmVkIHRvIGFkZCBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgICAgIC8vIGZvciB0aGUgdXBsb2FkIHByb2dyZXNzIGV2ZW50OlxuICAgICAgICAgICAgaWYgKHhoci51cGxvYWQpIHtcbiAgICAgICAgICAgICAgICAkKHhoci51cGxvYWQpLmJpbmQoJ3Byb2dyZXNzJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9lID0gZS5vcmlnaW5hbEV2ZW50O1xuICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHByb2dyZXNzIGV2ZW50IHByb3BlcnRpZXMgZ2V0IGNvcGllZCBvdmVyOlxuICAgICAgICAgICAgICAgICAgICBlLmxlbmd0aENvbXB1dGFibGUgPSBvZS5sZW5ndGhDb21wdXRhYmxlO1xuICAgICAgICAgICAgICAgICAgICBlLmxvYWRlZCA9IG9lLmxvYWRlZDtcbiAgICAgICAgICAgICAgICAgICAgZS50b3RhbCA9IG9lLnRvdGFsO1xuICAgICAgICAgICAgICAgICAgICB0aGF0Ll9vblByb2dyZXNzKGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMueGhyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geGhyO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2luaXRYSFJEYXRhOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGZvcm1EYXRhLFxuICAgICAgICAgICAgICAgIGZpbGUgPSBvcHRpb25zLmZpbGVzWzBdLFxuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBub24tbXVsdGlwYXJ0IHNldHRpbmcgaWYgbm90IHN1cHBvcnRlZDpcbiAgICAgICAgICAgICAgICBtdWx0aXBhcnQgPSBvcHRpb25zLm11bHRpcGFydCB8fCAhJC5zdXBwb3J0LnhockZpbGVVcGxvYWQsXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lID0gb3B0aW9ucy5wYXJhbU5hbWVbMF07XG4gICAgICAgICAgICBvcHRpb25zLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge307XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5jb250ZW50UmFuZ2UpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtUmFuZ2UnXSA9IG9wdGlvbnMuY29udGVudFJhbmdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFtdWx0aXBhcnQpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtRGlzcG9zaXRpb24nXSA9ICdhdHRhY2htZW50OyBmaWxlbmFtZT1cIicgK1xuICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUkkoZmlsZS5uYW1lKSArICdcIic7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jb250ZW50VHlwZSA9IGZpbGUudHlwZTtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmRhdGEgPSBvcHRpb25zLmJsb2IgfHwgZmlsZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJC5zdXBwb3J0LnhockZvcm1EYXRhRmlsZVVwbG9hZCkge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnBvc3RNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdpbmRvdy5wb3N0TWVzc2FnZSBkb2VzIG5vdCBhbGxvdyBzZW5kaW5nIEZvcm1EYXRhXG4gICAgICAgICAgICAgICAgICAgIC8vIG9iamVjdHMsIHNvIHdlIGp1c3QgYWRkIHRoZSBGaWxlL0Jsb2Igb2JqZWN0cyB0b1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgZm9ybURhdGEgYXJyYXkgYW5kIGxldCB0aGUgcG9zdE1lc3NhZ2Ugd2luZG93XG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgRm9ybURhdGEgb2JqZWN0IG91dCBvZiB0aGlzIGFycmF5OlxuICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YSA9IHRoaXMuX2dldEZvcm1EYXRhKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5ibG9iKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMuYmxvYlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2gob3B0aW9ucy5maWxlcywgZnVuY3Rpb24gKGluZGV4LCBmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybURhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG9wdGlvbnMucGFyYW1OYW1lW2luZGV4XSB8fCBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmZvcm1EYXRhIGluc3RhbmNlb2YgRm9ybURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhID0gb3B0aW9ucy5mb3JtRGF0YTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2godGhpcy5fZ2V0Rm9ybURhdGEob3B0aW9ucyksIGZ1bmN0aW9uIChpbmRleCwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoZmllbGQubmFtZSwgZmllbGQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYmxvYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5oZWFkZXJzWydDb250ZW50LURpc3Bvc2l0aW9uJ10gPSAnYXR0YWNobWVudDsgZmlsZW5hbWU9XCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUkkoZmlsZS5uYW1lKSArICdcIic7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQocGFyYW1OYW1lLCBvcHRpb25zLmJsb2IsIGZpbGUubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2gob3B0aW9ucy5maWxlcywgZnVuY3Rpb24gKGluZGV4LCBmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlsZXMgYXJlIGFsc28gQmxvYiBpbnN0YW5jZXMsIGJ1dCBzb21lIGJyb3dzZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKEZpcmVmb3ggMy42KSBzdXBwb3J0IHRoZSBGaWxlIEFQSSBidXQgbm90IEJsb2JzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY2hlY2sgYWxsb3dzIHRoZSB0ZXN0cyB0byBydW4gd2l0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGR1bW15IG9iamVjdHM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCh3aW5kb3cuQmxvYiAmJiBmaWxlIGluc3RhbmNlb2YgQmxvYikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh3aW5kb3cuRmlsZSAmJiBmaWxlIGluc3RhbmNlb2YgRmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5wYXJhbU5hbWVbaW5kZXhdIHx8IHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRpb25zLmRhdGEgPSBmb3JtRGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEJsb2IgcmVmZXJlbmNlIGlzIG5vdCBuZWVkZWQgYW55bW9yZSwgZnJlZSBtZW1vcnk6XG4gICAgICAgICAgICBvcHRpb25zLmJsb2IgPSBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9pbml0SWZyYW1lU2V0dGluZ3M6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICAvLyBTZXR0aW5nIHRoZSBkYXRhVHlwZSB0byBpZnJhbWUgZW5hYmxlcyB0aGUgaWZyYW1lIHRyYW5zcG9ydDpcbiAgICAgICAgICAgIG9wdGlvbnMuZGF0YVR5cGUgPSAnaWZyYW1lICcgKyAob3B0aW9ucy5kYXRhVHlwZSB8fCAnJyk7XG4gICAgICAgICAgICAvLyBUaGUgaWZyYW1lIHRyYW5zcG9ydCBhY2NlcHRzIGEgc2VyaWFsaXplZCBhcnJheSBhcyBmb3JtIGRhdGE6XG4gICAgICAgICAgICBvcHRpb25zLmZvcm1EYXRhID0gdGhpcy5fZ2V0Rm9ybURhdGEob3B0aW9ucyk7XG4gICAgICAgICAgICAvLyBBZGQgcmVkaXJlY3QgdXJsIHRvIGZvcm0gZGF0YSBvbiBjcm9zcy1kb21haW4gdXBsb2FkczpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnJlZGlyZWN0ICYmICQoJzxhPjwvYT4nKS5wcm9wKCdocmVmJywgb3B0aW9ucy51cmwpXG4gICAgICAgICAgICAgICAgICAgIC5wcm9wKCdob3N0JykgIT09IGxvY2F0aW9uLmhvc3QpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmZvcm1EYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBvcHRpb25zLnJlZGlyZWN0UGFyYW1OYW1lIHx8ICdyZWRpcmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLnJlZGlyZWN0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2luaXREYXRhU2V0dGluZ3M6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNYSFJVcGxvYWQob3B0aW9ucykpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2NodW5rZWRVcGxvYWQob3B0aW9ucywgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXRYSFJEYXRhKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXRQcm9ncmVzc0xpc3RlbmVyKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wb3N0TWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTZXR0aW5nIHRoZSBkYXRhVHlwZSB0byBwb3N0bWVzc2FnZSBlbmFibGVzIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBwb3N0TWVzc2FnZSB0cmFuc3BvcnQ6XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZGF0YVR5cGUgPSAncG9zdG1lc3NhZ2UgJyArIChvcHRpb25zLmRhdGFUeXBlIHx8ICcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXRJZnJhbWVTZXR0aW5ncyhvcHRpb25zLCAnaWZyYW1lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFBhcmFtTmFtZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBmaWxlSW5wdXQgPSAkKG9wdGlvbnMuZmlsZUlucHV0KSxcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWUgPSBvcHRpb25zLnBhcmFtTmFtZTtcbiAgICAgICAgICAgIGlmICghcGFyYW1OYW1lKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lID0gW107XG4gICAgICAgICAgICAgICAgZmlsZUlucHV0LmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGlucHV0LnByb3AoJ25hbWUnKSB8fCAnZmlsZXNbXScsXG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gKGlucHV0LnByb3AoJ2ZpbGVzJykgfHwgWzFdKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbU5hbWUucHVzaChuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1OYW1lLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJhbU5hbWUgPSBbZmlsZUlucHV0LnByb3AoJ25hbWUnKSB8fCAnZmlsZXNbXSddO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoISQuaXNBcnJheShwYXJhbU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lID0gW3BhcmFtTmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1OYW1lO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9pbml0Rm9ybVNldHRpbmdzOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgLy8gUmV0cmlldmUgbWlzc2luZyBvcHRpb25zIGZyb20gdGhlIGlucHV0IGZpZWxkIGFuZCB0aGVcbiAgICAgICAgICAgIC8vIGFzc29jaWF0ZWQgZm9ybSwgaWYgYXZhaWxhYmxlOlxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLmZvcm0gfHwgIW9wdGlvbnMuZm9ybS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmZvcm0gPSAkKG9wdGlvbnMuZmlsZUlucHV0LnByb3AoJ2Zvcm0nKSk7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGdpdmVuIGZpbGUgaW5wdXQgZG9lc24ndCBoYXZlIGFuIGFzc29jaWF0ZWQgZm9ybSxcbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGRlZmF1bHQgd2lkZ2V0IGZpbGUgaW5wdXQncyBmb3JtOlxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5mb3JtLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmZvcm0gPSAkKHRoaXMub3B0aW9ucy5maWxlSW5wdXQucHJvcCgnZm9ybScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtTmFtZSA9IHRoaXMuX2dldFBhcmFtTmFtZShvcHRpb25zKTtcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy51cmwpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLnVybCA9IG9wdGlvbnMuZm9ybS5wcm9wKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhlIEhUVFAgcmVxdWVzdCBtZXRob2QgbXVzdCBiZSBcIlBPU1RcIiBvciBcIlBVVFwiOlxuICAgICAgICAgICAgb3B0aW9ucy50eXBlID0gKG9wdGlvbnMudHlwZSB8fCBvcHRpb25zLmZvcm0ucHJvcCgnbWV0aG9kJykgfHwgJycpXG4gICAgICAgICAgICAgICAgLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy50eXBlICE9PSAnUE9TVCcgJiYgb3B0aW9ucy50eXBlICE9PSAnUFVUJyAmJlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnR5cGUgIT09ICdQQVRDSCcpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLnR5cGUgPSAnUE9TVCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuZm9ybUFjY2VwdENoYXJzZXQpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmZvcm1BY2NlcHRDaGFyc2V0ID0gb3B0aW9ucy5mb3JtLmF0dHIoJ2FjY2VwdC1jaGFyc2V0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldEFKQVhTZXR0aW5nczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgZGF0YSk7XG4gICAgICAgICAgICB0aGlzLl9pbml0Rm9ybVNldHRpbmdzKG9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5faW5pdERhdGFTZXR0aW5ncyhvcHRpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGpRdWVyeSAxLjYgZG9lc24ndCBwcm92aWRlIC5zdGF0ZSgpLFxuICAgICAgICAvLyB3aGlsZSBqUXVlcnkgMS44KyByZW1vdmVkIC5pc1JlamVjdGVkKCkgYW5kIC5pc1Jlc29sdmVkKCk6XG4gICAgICAgIF9nZXREZWZlcnJlZFN0YXRlOiBmdW5jdGlvbiAoZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIGlmIChkZWZlcnJlZC5zdGF0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5zdGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlZmVycmVkLmlzUmVzb2x2ZWQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAncmVzb2x2ZWQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlZmVycmVkLmlzUmVqZWN0ZWQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAncmVqZWN0ZWQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICdwZW5kaW5nJztcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBNYXBzIGpxWEhSIGNhbGxiYWNrcyB0byB0aGUgZXF1aXZhbGVudFxuICAgICAgICAvLyBtZXRob2RzIG9mIHRoZSBnaXZlbiBQcm9taXNlIG9iamVjdDpcbiAgICAgICAgX2VuaGFuY2VQcm9taXNlOiBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcHJvbWlzZS5zdWNjZXNzID0gcHJvbWlzZS5kb25lO1xuICAgICAgICAgICAgcHJvbWlzZS5lcnJvciA9IHByb21pc2UuZmFpbDtcbiAgICAgICAgICAgIHByb21pc2UuY29tcGxldGUgPSBwcm9taXNlLmFsd2F5cztcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIENyZWF0ZXMgYW5kIHJldHVybnMgYSBQcm9taXNlIG9iamVjdCBlbmhhbmNlZCB3aXRoXG4gICAgICAgIC8vIHRoZSBqcVhIUiBtZXRob2RzIGFib3J0LCBzdWNjZXNzLCBlcnJvciBhbmQgY29tcGxldGU6XG4gICAgICAgIF9nZXRYSFJQcm9taXNlOiBmdW5jdGlvbiAocmVzb2x2ZU9yUmVqZWN0LCBjb250ZXh0LCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGZkID0gJC5EZWZlcnJlZCgpLFxuICAgICAgICAgICAgICAgIHByb21pc2UgPSBkZmQucHJvbWlzZSgpO1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQgfHwgdGhpcy5vcHRpb25zLmNvbnRleHQgfHwgcHJvbWlzZTtcbiAgICAgICAgICAgIGlmIChyZXNvbHZlT3JSZWplY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBkZmQucmVzb2x2ZVdpdGgoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlc29sdmVPclJlamVjdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBkZmQucmVqZWN0V2l0aChjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb21pc2UuYWJvcnQgPSBkZmQucHJvbWlzZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmhhbmNlUHJvbWlzZShwcm9taXNlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBBZGRzIGNvbnZlbmllbmNlIG1ldGhvZHMgdG8gdGhlIGNhbGxiYWNrIGFyZ3VtZW50czpcbiAgICAgICAgX2FkZENvbnZlbmllbmNlTWV0aG9kczogZnVuY3Rpb24gKGUsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGRhdGEuc3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlKCkgIT09ICdwZW5kaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmpxWEhSID0gdGhpcy5qcVhIUiA9XG4gICAgICAgICAgICAgICAgICAgICAgICAodGhhdC5fdHJpZ2dlcignc3VibWl0JywgZSwgdGhpcykgIT09IGZhbHNlKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5fb25TZW5kKGUsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5qcVhIUiB8fCB0aGF0Ll9nZXRYSFJQcm9taXNlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZGF0YS5hYm9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5qcVhIUikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5qcVhIUi5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0WEhSUHJvbWlzZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRhdGEuc3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuanFYSFIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQuX2dldERlZmVycmVkU3RhdGUodGhpcy5qcVhIUik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRhdGEucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2dyZXNzO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBQYXJzZXMgdGhlIFJhbmdlIGhlYWRlciBmcm9tIHRoZSBzZXJ2ZXIgcmVzcG9uc2VcbiAgICAgICAgLy8gYW5kIHJldHVybnMgdGhlIHVwbG9hZGVkIGJ5dGVzOlxuICAgICAgICBfZ2V0VXBsb2FkZWRCeXRlczogZnVuY3Rpb24gKGpxWEhSKSB7XG4gICAgICAgICAgICB2YXIgcmFuZ2UgPSBqcVhIUi5nZXRSZXNwb25zZUhlYWRlcignUmFuZ2UnKSxcbiAgICAgICAgICAgICAgICBwYXJ0cyA9IHJhbmdlICYmIHJhbmdlLnNwbGl0KCctJyksXG4gICAgICAgICAgICAgICAgdXBwZXJCeXRlc1BvcyA9IHBhcnRzICYmIHBhcnRzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocGFydHNbMV0sIDEwKTtcbiAgICAgICAgICAgIHJldHVybiB1cHBlckJ5dGVzUG9zICYmIHVwcGVyQnl0ZXNQb3MgKyAxO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFVwbG9hZHMgYSBmaWxlIGluIG11bHRpcGxlLCBzZXF1ZW50aWFsIHJlcXVlc3RzXG4gICAgICAgIC8vIGJ5IHNwbGl0dGluZyB0aGUgZmlsZSB1cCBpbiBtdWx0aXBsZSBibG9iIGNodW5rcy5cbiAgICAgICAgLy8gSWYgdGhlIHNlY29uZCBwYXJhbWV0ZXIgaXMgdHJ1ZSwgb25seSB0ZXN0cyBpZiB0aGUgZmlsZVxuICAgICAgICAvLyBzaG91bGQgYmUgdXBsb2FkZWQgaW4gY2h1bmtzLCBidXQgZG9lcyBub3QgaW52b2tlIGFueVxuICAgICAgICAvLyB1cGxvYWQgcmVxdWVzdHM6XG4gICAgICAgIF9jaHVua2VkVXBsb2FkOiBmdW5jdGlvbiAob3B0aW9ucywgdGVzdE9ubHkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBmaWxlID0gb3B0aW9ucy5maWxlc1swXSxcbiAgICAgICAgICAgICAgICBmcyA9IGZpbGUuc2l6ZSxcbiAgICAgICAgICAgICAgICB1YiA9IG9wdGlvbnMudXBsb2FkZWRCeXRlcyA9IG9wdGlvbnMudXBsb2FkZWRCeXRlcyB8fCAwLFxuICAgICAgICAgICAgICAgIG1jcyA9IG9wdGlvbnMubWF4Q2h1bmtTaXplIHx8IGZzLFxuICAgICAgICAgICAgICAgIHNsaWNlID0gZmlsZS5zbGljZSB8fCBmaWxlLndlYmtpdFNsaWNlIHx8IGZpbGUubW96U2xpY2UsXG4gICAgICAgICAgICAgICAgZGZkID0gJC5EZWZlcnJlZCgpLFxuICAgICAgICAgICAgICAgIHByb21pc2UgPSBkZmQucHJvbWlzZSgpLFxuICAgICAgICAgICAgICAgIGpxWEhSLFxuICAgICAgICAgICAgICAgIHVwbG9hZDtcbiAgICAgICAgICAgIGlmICghKHRoaXMuX2lzWEhSVXBsb2FkKG9wdGlvbnMpICYmIHNsaWNlICYmICh1YiB8fCBtY3MgPCBmcykpIHx8XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0ZXN0T25seSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHViID49IGZzKSB7XG4gICAgICAgICAgICAgICAgZmlsZS5lcnJvciA9ICdVcGxvYWRlZCBieXRlcyBleGNlZWQgZmlsZSBzaXplJztcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0WEhSUHJvbWlzZShcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgW251bGwsICdlcnJvcicsIGZpbGUuZXJyb3JdXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoZSBjaHVuayB1cGxvYWQgbWV0aG9kOlxuICAgICAgICAgICAgdXBsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIENsb25lIHRoZSBvcHRpb25zIG9iamVjdCBmb3IgZWFjaCBjaHVuayB1cGxvYWQ6XG4gICAgICAgICAgICAgICAgdmFyIG8gPSAkLmV4dGVuZCh7fSwgb3B0aW9ucyksXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRMb2FkZWQgPSBvLl9wcm9ncmVzcy5sb2FkZWQ7XG4gICAgICAgICAgICAgICAgby5ibG9iID0gc2xpY2UuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdWIsXG4gICAgICAgICAgICAgICAgICAgIHViICsgbWNzLFxuICAgICAgICAgICAgICAgICAgICBmaWxlLnR5cGVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBjdXJyZW50IGNodW5rIHNpemUsIGFzIHRoZSBibG9iIGl0c2VsZlxuICAgICAgICAgICAgICAgIC8vIHdpbGwgYmUgZGVyZWZlcmVuY2VkIGFmdGVyIGRhdGEgcHJvY2Vzc2luZzpcbiAgICAgICAgICAgICAgICBvLmNodW5rU2l6ZSA9IG8uYmxvYi5zaXplO1xuICAgICAgICAgICAgICAgIC8vIEV4cG9zZSB0aGUgY2h1bmsgYnl0ZXMgcG9zaXRpb24gcmFuZ2U6XG4gICAgICAgICAgICAgICAgby5jb250ZW50UmFuZ2UgPSAnYnl0ZXMgJyArIHViICsgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgKHViICsgby5jaHVua1NpemUgLSAxKSArICcvJyArIGZzO1xuICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgdGhlIHVwbG9hZCBkYXRhICh0aGUgYmxvYiBhbmQgcG90ZW50aWFsIGZvcm0gZGF0YSk6XG4gICAgICAgICAgICAgICAgdGhhdC5faW5pdFhIUkRhdGEobyk7XG4gICAgICAgICAgICAgICAgLy8gQWRkIHByb2dyZXNzIGxpc3RlbmVycyBmb3IgdGhpcyBjaHVuayB1cGxvYWQ6XG4gICAgICAgICAgICAgICAgdGhhdC5faW5pdFByb2dyZXNzTGlzdGVuZXIobyk7XG4gICAgICAgICAgICAgICAganFYSFIgPSAoKHRoYXQuX3RyaWdnZXIoJ2NodW5rc2VuZCcsIG51bGwsIG8pICE9PSBmYWxzZSAmJiAkLmFqYXgobykpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9nZXRYSFJQcm9taXNlKGZhbHNlLCBvLmNvbnRleHQpKVxuICAgICAgICAgICAgICAgICAgICAuZG9uZShmdW5jdGlvbiAocmVzdWx0LCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdWIgPSB0aGF0Ll9nZXRVcGxvYWRlZEJ5dGVzKGpxWEhSKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh1YiArIG8uY2h1bmtTaXplKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIHByb2dyZXNzIGV2ZW50IGlmIG5vIGZpbmFsIHByb2dyZXNzIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3aXRoIGxvYWRlZCBlcXVhbGluZyB0b3RhbCBoYXMgYmVlbiB0cmlnZ2VyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvciB0aGlzIGNodW5rOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8uX3Byb2dyZXNzLmxvYWRlZCA9PT0gY3VycmVudExvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX29uUHJvZ3Jlc3MoJC5FdmVudCgncHJvZ3Jlc3MnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aENvbXB1dGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZDogdWIgLSBvLnVwbG9hZGVkQnl0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsOiB1YiAtIG8udXBsb2FkZWRCeXRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudXBsb2FkZWRCeXRlcyA9IG8udXBsb2FkZWRCeXRlcyA9IHViO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLnRleHRTdGF0dXMgPSB0ZXh0U3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5qcVhIUiA9IGpxWEhSO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5fdHJpZ2dlcignY2h1bmtkb25lJywgbnVsbCwgbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll90cmlnZ2VyKCdjaHVua2Fsd2F5cycsIG51bGwsIG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHViIDwgZnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaWxlIHVwbG9hZCBub3QgeWV0IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgY2h1bms6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBsb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRmZC5yZXNvbHZlV2l0aChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbcmVzdWx0LCB0ZXh0U3RhdHVzLCBqcVhIUl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLmpxWEhSID0ganFYSFI7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLnRleHRTdGF0dXMgPSB0ZXh0U3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5lcnJvclRocm93biA9IGVycm9yVGhyb3duO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5fdHJpZ2dlcignY2h1bmtmYWlsJywgbnVsbCwgbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll90cmlnZ2VyKCdjaHVua2Fsd2F5cycsIG51bGwsIG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGZkLnJlamVjdFdpdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd25dXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9lbmhhbmNlUHJvbWlzZShwcm9taXNlKTtcbiAgICAgICAgICAgIHByb21pc2UuYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpxWEhSLmFib3J0KCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdXBsb2FkKCk7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYmVmb3JlU2VuZDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hY3RpdmUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgc3RhcnQgY2FsbGJhY2sgaXMgdHJpZ2dlcmVkIHdoZW4gYW4gdXBsb2FkIHN0YXJ0c1xuICAgICAgICAgICAgICAgIC8vIGFuZCBubyBvdGhlciB1cGxvYWRzIGFyZSBjdXJyZW50bHkgcnVubmluZyxcbiAgICAgICAgICAgICAgICAvLyBlcXVpdmFsZW50IHRvIHRoZSBnbG9iYWwgYWpheFN0YXJ0IGV2ZW50OlxuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgLy8gU2V0IHRpbWVyIGZvciBnbG9iYWwgYml0cmF0ZSBwcm9ncmVzcyBjYWxjdWxhdGlvbjpcbiAgICAgICAgICAgICAgICB0aGlzLl9iaXRyYXRlVGltZXIgPSBuZXcgdGhpcy5fQml0cmF0ZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgLy8gUmVzZXQgdGhlIGdsb2JhbCBwcm9ncmVzcyB2YWx1ZXM6XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MubG9hZGVkID0gdGhpcy5fcHJvZ3Jlc3MudG90YWwgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzLmJpdHJhdGUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFkYXRhLl9wcm9ncmVzcykge1xuICAgICAgICAgICAgICAgIGRhdGEuX3Byb2dyZXNzID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhLl9wcm9ncmVzcy5sb2FkZWQgPSBkYXRhLmxvYWRlZCA9IGRhdGEudXBsb2FkZWRCeXRlcyB8fCAwO1xuICAgICAgICAgICAgZGF0YS5fcHJvZ3Jlc3MudG90YWwgPSBkYXRhLnRvdGFsID0gdGhpcy5fZ2V0VG90YWwoZGF0YS5maWxlcykgfHwgMTtcbiAgICAgICAgICAgIGRhdGEuX3Byb2dyZXNzLmJpdHJhdGUgPSBkYXRhLmJpdHJhdGUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fYWN0aXZlICs9IDE7XG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBnbG9iYWwgcHJvZ3Jlc3MgdmFsdWVzOlxuICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MubG9hZGVkICs9IGRhdGEubG9hZGVkO1xuICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MudG90YWwgKz0gZGF0YS50b3RhbDtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25Eb25lOiBmdW5jdGlvbiAocmVzdWx0LCB0ZXh0U3RhdHVzLCBqcVhIUiwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHRvdGFsID0gb3B0aW9ucy5fcHJvZ3Jlc3MudG90YWw7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5fcHJvZ3Jlc3MubG9hZGVkIDwgdG90YWwpIHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBwcm9ncmVzcyBldmVudCBpZiBubyBmaW5hbCBwcm9ncmVzcyBldmVudFxuICAgICAgICAgICAgICAgIC8vIHdpdGggbG9hZGVkIGVxdWFsaW5nIHRvdGFsIGhhcyBiZWVuIHRyaWdnZXJlZDpcbiAgICAgICAgICAgICAgICB0aGlzLl9vblByb2dyZXNzKCQuRXZlbnQoJ3Byb2dyZXNzJywge1xuICAgICAgICAgICAgICAgICAgICBsZW5ndGhDb21wdXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZWQ6IHRvdGFsLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbDogdG90YWxcbiAgICAgICAgICAgICAgICB9KSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcHRpb25zLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgICAgIG9wdGlvbnMudGV4dFN0YXR1cyA9IHRleHRTdGF0dXM7XG4gICAgICAgICAgICBvcHRpb25zLmpxWEhSID0ganFYSFI7XG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyKCdkb25lJywgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uRmFpbDogZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93biwgb3B0aW9ucykge1xuICAgICAgICAgICAgb3B0aW9ucy5qcVhIUiA9IGpxWEhSO1xuICAgICAgICAgICAgb3B0aW9ucy50ZXh0U3RhdHVzID0gdGV4dFN0YXR1cztcbiAgICAgICAgICAgIG9wdGlvbnMuZXJyb3JUaHJvd24gPSBlcnJvclRocm93bjtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2ZhaWwnLCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnJlY2FsY3VsYXRlUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGZhaWxlZCAoZXJyb3Igb3IgYWJvcnQpIGZpbGUgdXBsb2FkIGZyb21cbiAgICAgICAgICAgICAgICAvLyB0aGUgZ2xvYmFsIHByb2dyZXNzIGNhbGN1bGF0aW9uOlxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzLmxvYWRlZCAtPSBvcHRpb25zLl9wcm9ncmVzcy5sb2FkZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MudG90YWwgLT0gb3B0aW9ucy5fcHJvZ3Jlc3MudG90YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uQWx3YXlzOiBmdW5jdGlvbiAoanFYSFJvclJlc3VsdCwgdGV4dFN0YXR1cywganFYSFJvckVycm9yLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAvLyBqcVhIUm9yUmVzdWx0LCB0ZXh0U3RhdHVzIGFuZCBqcVhIUm9yRXJyb3IgYXJlIGFkZGVkIHRvIHRoZVxuICAgICAgICAgICAgLy8gb3B0aW9ucyBvYmplY3QgdmlhIGRvbmUgYW5kIGZhaWwgY2FsbGJhY2tzXG4gICAgICAgICAgICB0aGlzLl9hY3RpdmUgLT0gMTtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2Fsd2F5cycsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2FjdGl2ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBzdG9wIGNhbGxiYWNrIGlzIHRyaWdnZXJlZCB3aGVuIGFsbCB1cGxvYWRzIGhhdmVcbiAgICAgICAgICAgICAgICAvLyBiZWVuIGNvbXBsZXRlZCwgZXF1aXZhbGVudCB0byB0aGUgZ2xvYmFsIGFqYXhTdG9wIGV2ZW50OlxuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ3N0b3AnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25TZW5kOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFkYXRhLnN1Ym1pdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZENvbnZlbmllbmNlTWV0aG9kcyhlLCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBqcVhIUixcbiAgICAgICAgICAgICAgICBhYm9ydGVkLFxuICAgICAgICAgICAgICAgIHNsb3QsXG4gICAgICAgICAgICAgICAgcGlwZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5fZ2V0QUpBWFNldHRpbmdzKGRhdGEpLFxuICAgICAgICAgICAgICAgIHNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuX3NlbmRpbmcgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHRpbWVyIGZvciBiaXRyYXRlIHByb2dyZXNzIGNhbGN1bGF0aW9uOlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLl9iaXRyYXRlVGltZXIgPSBuZXcgdGhhdC5fQml0cmF0ZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGpxWEhSID0ganFYSFIgfHwgKFxuICAgICAgICAgICAgICAgICAgICAgICAgKChhYm9ydGVkIHx8IHRoYXQuX3RyaWdnZXIoJ3NlbmQnLCBlLCBvcHRpb25zKSA9PT0gZmFsc2UpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9nZXRYSFJQcm9taXNlKGZhbHNlLCBvcHRpb25zLmNvbnRleHQsIGFib3J0ZWQpKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5fY2h1bmtlZFVwbG9hZChvcHRpb25zKSB8fCAkLmFqYXgob3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgKS5kb25lKGZ1bmN0aW9uIChyZXN1bHQsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9vbkRvbmUocmVzdWx0LCB0ZXh0U3RhdHVzLCBqcVhIUiwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5fb25GYWlsKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93biwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmFsd2F5cyhmdW5jdGlvbiAoanFYSFJvclJlc3VsdCwgdGV4dFN0YXR1cywganFYSFJvckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9zZW5kaW5nIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9vbkFsd2F5cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqcVhIUm9yUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganFYSFJvckVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5saW1pdENvbmN1cnJlbnRVcGxvYWRzICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubGltaXRDb25jdXJyZW50VXBsb2FkcyA+IHRoYXQuX3NlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgbmV4dCBxdWV1ZWQgdXBsb2FkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoYXQgaGFzIG5vdCBiZWVuIGFib3J0ZWQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRTbG90ID0gdGhhdC5fc2xvdHMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAobmV4dFNsb3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuX2dldERlZmVycmVkU3RhdGUobmV4dFNsb3QpID09PSAncGVuZGluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRTbG90LnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRTbG90ID0gdGhhdC5fc2xvdHMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ganFYSFI7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2JlZm9yZVNlbmQoZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNlcXVlbnRpYWxVcGxvYWRzIHx8XG4gICAgICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMubGltaXRDb25jdXJyZW50VXBsb2FkcyAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMubGltaXRDb25jdXJyZW50VXBsb2FkcyA8PSB0aGlzLl9zZW5kaW5nKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubGltaXRDb25jdXJyZW50VXBsb2FkcyA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2xvdCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2xvdHMucHVzaChzbG90KTtcbiAgICAgICAgICAgICAgICAgICAgcGlwZSA9IHNsb3QucGlwZShzZW5kKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwaXBlID0gKHRoaXMuX3NlcXVlbmNlID0gdGhpcy5fc2VxdWVuY2UucGlwZShzZW5kLCBzZW5kKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFJldHVybiB0aGUgcGlwZWQgUHJvbWlzZSBvYmplY3QsIGVuaGFuY2VkIHdpdGggYW4gYWJvcnQgbWV0aG9kLFxuICAgICAgICAgICAgICAgIC8vIHdoaWNoIGlzIGRlbGVnYXRlZCB0byB0aGUganFYSFIgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHVwbG9hZCxcbiAgICAgICAgICAgICAgICAvLyBhbmQganFYSFIgY2FsbGJhY2tzIG1hcHBlZCB0byB0aGUgZXF1aXZhbGVudCBQcm9taXNlIG1ldGhvZHM6XG4gICAgICAgICAgICAgICAgcGlwZS5hYm9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYWJvcnRlZCA9IFt1bmRlZmluZWQsICdhYm9ydCcsICdhYm9ydCddO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWpxWEhSKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2xvdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsb3QucmVqZWN0V2l0aChvcHRpb25zLmNvbnRleHQsIGFib3J0ZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ganFYSFIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmhhbmNlUHJvbWlzZShwaXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzZW5kKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uQWRkOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWUsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIGRhdGEpLFxuICAgICAgICAgICAgICAgIGxpbWl0ID0gb3B0aW9ucy5saW1pdE11bHRpRmlsZVVwbG9hZHMsXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lID0gdGhpcy5fZ2V0UGFyYW1OYW1lKG9wdGlvbnMpLFxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZVNldCxcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWVTbGljZSxcbiAgICAgICAgICAgICAgICBmaWxlU2V0LFxuICAgICAgICAgICAgICAgIGk7XG4gICAgICAgICAgICBpZiAoIShvcHRpb25zLnNpbmdsZUZpbGVVcGxvYWRzIHx8IGxpbWl0KSB8fFxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5faXNYSFJVcGxvYWQob3B0aW9ucykpIHtcbiAgICAgICAgICAgICAgICBmaWxlU2V0ID0gW2RhdGEuZmlsZXNdO1xuICAgICAgICAgICAgICAgIHBhcmFtTmFtZVNldCA9IFtwYXJhbU5hbWVdO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghb3B0aW9ucy5zaW5nbGVGaWxlVXBsb2FkcyAmJiBsaW1pdCkge1xuICAgICAgICAgICAgICAgIGZpbGVTZXQgPSBbXTtcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWVTZXQgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5maWxlcy5sZW5ndGg7IGkgKz0gbGltaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVNldC5wdXNoKGRhdGEuZmlsZXMuc2xpY2UoaSwgaSArIGxpbWl0KSk7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZVNsaWNlID0gcGFyYW1OYW1lLnNsaWNlKGksIGkgKyBsaW1pdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFyYW1OYW1lU2xpY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbU5hbWVTbGljZSA9IHBhcmFtTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYXJhbU5hbWVTZXQucHVzaChwYXJhbU5hbWVTbGljZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWVTZXQgPSBwYXJhbU5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhLm9yaWdpbmFsRmlsZXMgPSBkYXRhLmZpbGVzO1xuICAgICAgICAgICAgJC5lYWNoKGZpbGVTZXQgfHwgZGF0YS5maWxlcywgZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld0RhdGEgPSAkLmV4dGVuZCh7fSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgbmV3RGF0YS5maWxlcyA9IGZpbGVTZXQgPyBlbGVtZW50IDogW2VsZW1lbnRdO1xuICAgICAgICAgICAgICAgIG5ld0RhdGEucGFyYW1OYW1lID0gcGFyYW1OYW1lU2V0W2luZGV4XTtcbiAgICAgICAgICAgICAgICB0aGF0Ll9pbml0UHJvZ3Jlc3NPYmplY3QobmV3RGF0YSk7XG4gICAgICAgICAgICAgICAgdGhhdC5fYWRkQ29udmVuaWVuY2VNZXRob2RzKGUsIG5ld0RhdGEpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoYXQuX3RyaWdnZXIoJ2FkZCcsIGUsIG5ld0RhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlcGxhY2VGaWxlSW5wdXQ6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIGlucHV0Q2xvbmUgPSBpbnB1dC5jbG9uZSh0cnVlKTtcbiAgICAgICAgICAgICQoJzxmb3JtPjwvZm9ybT4nKS5hcHBlbmQoaW5wdXRDbG9uZSlbMF0ucmVzZXQoKTtcbiAgICAgICAgICAgIC8vIERldGFjaGluZyBhbGxvd3MgdG8gaW5zZXJ0IHRoZSBmaWxlSW5wdXQgb24gYW5vdGhlciBmb3JtXG4gICAgICAgICAgICAvLyB3aXRob3V0IGxvb3NpbmcgdGhlIGZpbGUgaW5wdXQgdmFsdWU6XG4gICAgICAgICAgICBpbnB1dC5hZnRlcihpbnB1dENsb25lKS5kZXRhY2goKTtcbiAgICAgICAgICAgIC8vIEF2b2lkIG1lbW9yeSBsZWFrcyB3aXRoIHRoZSBkZXRhY2hlZCBmaWxlIGlucHV0OlxuICAgICAgICAgICAgJC5jbGVhbkRhdGEoaW5wdXQudW5iaW5kKCdyZW1vdmUnKSk7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBvcmlnaW5hbCBmaWxlIGlucHV0IGVsZW1lbnQgaW4gdGhlIGZpbGVJbnB1dFxuICAgICAgICAgICAgLy8gZWxlbWVudHMgc2V0IHdpdGggdGhlIGNsb25lLCB3aGljaCBoYXMgYmVlbiBjb3BpZWQgaW5jbHVkaW5nXG4gICAgICAgICAgICAvLyBldmVudCBoYW5kbGVyczpcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5maWxlSW5wdXQgPSB0aGlzLm9wdGlvbnMuZmlsZUlucHV0Lm1hcChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWwgPT09IGlucHV0WzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dENsb25lWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIElmIHRoZSB3aWRnZXQgaGFzIGJlZW4gaW5pdGlhbGl6ZWQgb24gdGhlIGZpbGUgaW5wdXQgaXRzZWxmLFxuICAgICAgICAgICAgLy8gb3ZlcnJpZGUgdGhpcy5lbGVtZW50IHdpdGggdGhlIGZpbGUgaW5wdXQgY2xvbmU6XG4gICAgICAgICAgICBpZiAoaW5wdXRbMF0gPT09IHRoaXMuZWxlbWVudFswXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGlucHV0Q2xvbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2hhbmRsZUZpbGVUcmVlRW50cnk6IGZ1bmN0aW9uIChlbnRyeSwgcGF0aCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRmZCA9ICQuRGVmZXJyZWQoKSxcbiAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZSAmJiAhZS5lbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5lbnRyeSA9IGVudHJ5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlICQud2hlbiByZXR1cm5zIGltbWVkaWF0ZWx5IGlmIG9uZVxuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlcnJlZCBpcyByZWplY3RlZCwgd2UgdXNlIHJlc29sdmUgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBhbGxvd3MgdmFsaWQgZmlsZXMgYW5kIGludmFsaWQgaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gYmUgcmV0dXJuZWQgdG9nZXRoZXIgaW4gb25lIHNldDpcbiAgICAgICAgICAgICAgICAgICAgZGZkLnJlc29sdmUoW2VdKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpclJlYWRlcjtcbiAgICAgICAgICAgIHBhdGggPSBwYXRoIHx8ICcnO1xuICAgICAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSkge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5fZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBDaHJvbWUgYnVnICMxNDk3MzVcbiAgICAgICAgICAgICAgICAgICAgZW50cnkuX2ZpbGUucmVsYXRpdmVQYXRoID0gcGF0aDtcbiAgICAgICAgICAgICAgICAgICAgZGZkLnJlc29sdmUoZW50cnkuX2ZpbGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LmZpbGUoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUucmVsYXRpdmVQYXRoID0gcGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRmZC5yZXNvbHZlKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICB9LCBlcnJvckhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgICAgICBkaXJSZWFkZXIgPSBlbnRyeS5jcmVhdGVSZWFkZXIoKTtcbiAgICAgICAgICAgICAgICBkaXJSZWFkZXIucmVhZEVudHJpZXMoZnVuY3Rpb24gKGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5faGFuZGxlRmlsZVRyZWVFbnRyaWVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgZW50cmllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggKyBlbnRyeS5uYW1lICsgJy8nXG4gICAgICAgICAgICAgICAgICAgICkuZG9uZShmdW5jdGlvbiAoZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRmZC5yZXNvbHZlKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmFpbChlcnJvckhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH0sIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFJldHVybiBhbiBlbXB5IGxpc3QgZm9yIGZpbGUgc3lzdGVtIGl0ZW1zXG4gICAgICAgICAgICAgICAgLy8gb3RoZXIgdGhhbiBmaWxlcyBvciBkaXJlY3RvcmllczpcbiAgICAgICAgICAgICAgICBkZmQucmVzb2x2ZShbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGZkLnByb21pc2UoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaGFuZGxlRmlsZVRyZWVFbnRyaWVzOiBmdW5jdGlvbiAoZW50cmllcywgcGF0aCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuICQud2hlbi5hcHBseShcbiAgICAgICAgICAgICAgICAkLFxuICAgICAgICAgICAgICAgICQubWFwKGVudHJpZXMsIGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5faGFuZGxlRmlsZVRyZWVFbnRyeShlbnRyeSwgcGF0aCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICkucGlwZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoXG4gICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldERyb3BwZWRGaWxlczogZnVuY3Rpb24gKGRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgICAgZGF0YVRyYW5zZmVyID0gZGF0YVRyYW5zZmVyIHx8IHt9O1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gZGF0YVRyYW5zZmVyLml0ZW1zO1xuICAgICAgICAgICAgaWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCAmJiAoaXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSB8fFxuICAgICAgICAgICAgICAgICAgICBpdGVtc1swXS5nZXRBc0VudHJ5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVGaWxlVHJlZUVudHJpZXMoXG4gICAgICAgICAgICAgICAgICAgICQubWFwKGl0ZW1zLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVudHJ5O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ud2Via2l0R2V0QXNFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5ID0gaXRlbS53ZWJraXRHZXRBc0VudHJ5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdvcmthcm91bmQgZm9yIENocm9tZSBidWcgIzE0OTczNTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkuX2ZpbGUgPSBpdGVtLmdldEFzRmlsZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5nZXRBc0VudHJ5KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAkLm1ha2VBcnJheShkYXRhVHJhbnNmZXIuZmlsZXMpXG4gICAgICAgICAgICApLnByb21pc2UoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0U2luZ2xlRmlsZUlucHV0RmlsZXM6IGZ1bmN0aW9uIChmaWxlSW5wdXQpIHtcbiAgICAgICAgICAgIGZpbGVJbnB1dCA9ICQoZmlsZUlucHV0KTtcbiAgICAgICAgICAgIHZhciBlbnRyaWVzID0gZmlsZUlucHV0LnByb3AoJ3dlYmtpdEVudHJpZXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5wdXQucHJvcCgnZW50cmllcycpLFxuICAgICAgICAgICAgICAgIGZpbGVzLFxuICAgICAgICAgICAgICAgIHZhbHVlO1xuICAgICAgICAgICAgaWYgKGVudHJpZXMgJiYgZW50cmllcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlRmlsZVRyZWVFbnRyaWVzKGVudHJpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZXMgPSAkLm1ha2VBcnJheShmaWxlSW5wdXQucHJvcCgnZmlsZXMnKSk7XG4gICAgICAgICAgICBpZiAoIWZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gZmlsZUlucHV0LnByb3AoJ3ZhbHVlJyk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUoW10pLnByb21pc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGZpbGVzIHByb3BlcnR5IGlzIG5vdCBhdmFpbGFibGUsIHRoZSBicm93c2VyIGRvZXMgbm90XG4gICAgICAgICAgICAgICAgLy8gc3VwcG9ydCB0aGUgRmlsZSBBUEkgYW5kIHdlIGFkZCBhIHBzZXVkbyBGaWxlIG9iamVjdCB3aXRoXG4gICAgICAgICAgICAgICAgLy8gdGhlIGlucHV0IHZhbHVlIGFzIG5hbWUgd2l0aCBwYXRoIGluZm9ybWF0aW9uIHJlbW92ZWQ6XG4gICAgICAgICAgICAgICAgZmlsZXMgPSBbe25hbWU6IHZhbHVlLnJlcGxhY2UoL14uKlxcXFwvLCAnJyl9XTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZXNbMF0ubmFtZSA9PT0gdW5kZWZpbmVkICYmIGZpbGVzWzBdLmZpbGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gRmlsZSBub3JtYWxpemF0aW9uIGZvciBTYWZhcmkgNCBhbmQgRmlyZWZveCAzOlxuICAgICAgICAgICAgICAgICQuZWFjaChmaWxlcywgZnVuY3Rpb24gKGluZGV4LCBmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUuZmlsZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGZpbGUuc2l6ZSA9IGZpbGUuZmlsZVNpemU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUoZmlsZXMpLnByb21pc2UoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0RmlsZUlucHV0RmlsZXM6IGZ1bmN0aW9uIChmaWxlSW5wdXQpIHtcbiAgICAgICAgICAgIGlmICghKGZpbGVJbnB1dCBpbnN0YW5jZW9mICQpIHx8IGZpbGVJbnB1dC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U2luZ2xlRmlsZUlucHV0RmlsZXMoZmlsZUlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAkLndoZW4uYXBwbHkoXG4gICAgICAgICAgICAgICAgJCxcbiAgICAgICAgICAgICAgICAkLm1hcChmaWxlSW5wdXQsIHRoaXMuX2dldFNpbmdsZUZpbGVJbnB1dEZpbGVzKVxuICAgICAgICAgICAgKS5waXBlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShcbiAgICAgICAgICAgICAgICAgICAgW10sXG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZUlucHV0OiAkKGUudGFyZ2V0KSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybTogJChlLnRhcmdldC5mb3JtKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9nZXRGaWxlSW5wdXRGaWxlcyhkYXRhLmZpbGVJbnB1dCkuYWx3YXlzKGZ1bmN0aW9uIChmaWxlcykge1xuICAgICAgICAgICAgICAgIGRhdGEuZmlsZXMgPSBmaWxlcztcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnJlcGxhY2VGaWxlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fcmVwbGFjZUZpbGVJbnB1dChkYXRhLmZpbGVJbnB1dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGF0Ll90cmlnZ2VyKCdjaGFuZ2UnLCBlLCBkYXRhKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fb25BZGQoZSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uUGFzdGU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgY2JkID0gZS5vcmlnaW5hbEV2ZW50LmNsaXBib2FyZERhdGEsXG4gICAgICAgICAgICAgICAgaXRlbXMgPSAoY2JkICYmIGNiZC5pdGVtcykgfHwgW10sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtmaWxlczogW119O1xuICAgICAgICAgICAgJC5lYWNoKGl0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgZmlsZSA9IGl0ZW0uZ2V0QXNGaWxlICYmIGl0ZW0uZ2V0QXNGaWxlKCk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5maWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3RyaWdnZXIoJ3Bhc3RlJywgZSwgZGF0YSkgPT09IGZhbHNlIHx8XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uQWRkKGUsIGRhdGEpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25Ecm9wOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRhdGFUcmFuc2ZlciA9IGUuZGF0YVRyYW5zZmVyID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2ZlcixcbiAgICAgICAgICAgICAgICBkYXRhID0ge307XG4gICAgICAgICAgICBpZiAoZGF0YVRyYW5zZmVyICYmIGRhdGFUcmFuc2Zlci5maWxlcyAmJiBkYXRhVHJhbnNmZXIuZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZ2V0RHJvcHBlZEZpbGVzKGRhdGFUcmFuc2ZlcikuYWx3YXlzKGZ1bmN0aW9uIChmaWxlcykge1xuICAgICAgICAgICAgICAgIGRhdGEuZmlsZXMgPSBmaWxlcztcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5fdHJpZ2dlcignZHJvcCcsIGUsIGRhdGEpICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Ll9vbkFkZChlLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25EcmFnT3ZlcjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBkYXRhVHJhbnNmZXIgPSBlLmRhdGFUcmFuc2ZlciA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXI7XG4gICAgICAgICAgICBpZiAodGhpcy5fdHJpZ2dlcignZHJhZ292ZXInLCBlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YVRyYW5zZmVyICYmICQuaW5BcnJheSgnRmlsZXMnLCBkYXRhVHJhbnNmZXIudHlwZXMpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfaW5pdEV2ZW50SGFuZGxlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc1hIUlVwbG9hZCh0aGlzLm9wdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb24odGhpcy5vcHRpb25zLmRyb3Bab25lLCB7XG4gICAgICAgICAgICAgICAgICAgIGRyYWdvdmVyOiB0aGlzLl9vbkRyYWdPdmVyLFxuICAgICAgICAgICAgICAgICAgICBkcm9wOiB0aGlzLl9vbkRyb3BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbih0aGlzLm9wdGlvbnMucGFzdGVab25lLCB7XG4gICAgICAgICAgICAgICAgICAgIHBhc3RlOiB0aGlzLl9vblBhc3RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9vbih0aGlzLm9wdGlvbnMuZmlsZUlucHV0LCB7XG4gICAgICAgICAgICAgICAgY2hhbmdlOiB0aGlzLl9vbkNoYW5nZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2Rlc3Ryb3lFdmVudEhhbmRsZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9vZmYodGhpcy5vcHRpb25zLmRyb3Bab25lLCAnZHJhZ292ZXIgZHJvcCcpO1xuICAgICAgICAgICAgdGhpcy5fb2ZmKHRoaXMub3B0aW9ucy5wYXN0ZVpvbmUsICdwYXN0ZScpO1xuICAgICAgICAgICAgdGhpcy5fb2ZmKHRoaXMub3B0aW9ucy5maWxlSW5wdXQsICdjaGFuZ2UnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfc2V0T3B0aW9uOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHJlZnJlc2ggPSAkLmluQXJyYXkoa2V5LCB0aGlzLl9yZWZyZXNoT3B0aW9uc0xpc3QpICE9PSAtMTtcbiAgICAgICAgICAgIGlmIChyZWZyZXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVzdHJveUV2ZW50SGFuZGxlcnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3N1cGVyKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgaWYgKHJlZnJlc2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0U3BlY2lhbE9wdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0RXZlbnRIYW5kbGVycygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9pbml0U3BlY2lhbE9wdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZmlsZUlucHV0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmZpbGVJbnB1dCA9IHRoaXMuZWxlbWVudC5pcygnaW5wdXRbdHlwZT1cImZpbGVcIl0nKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQgOiB0aGlzLmVsZW1lbnQuZmluZCgnaW5wdXRbdHlwZT1cImZpbGVcIl0nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIShvcHRpb25zLmZpbGVJbnB1dCBpbnN0YW5jZW9mICQpKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5maWxlSW5wdXQgPSAkKG9wdGlvbnMuZmlsZUlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghKG9wdGlvbnMuZHJvcFpvbmUgaW5zdGFuY2VvZiAkKSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZHJvcFpvbmUgPSAkKG9wdGlvbnMuZHJvcFpvbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEob3B0aW9ucy5wYXN0ZVpvbmUgaW5zdGFuY2VvZiAkKSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMucGFzdGVab25lID0gJChvcHRpb25zLnBhc3RlWm9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIG9wdGlvbnMgc2V0IHZpYSBIVE1MNSBkYXRhLWF0dHJpYnV0ZXM6XG4gICAgICAgICAgICAkLmV4dGVuZChvcHRpb25zLCAkKHRoaXMuZWxlbWVudFswXS5jbG9uZU5vZGUoZmFsc2UpKS5kYXRhKCkpO1xuICAgICAgICAgICAgdGhpcy5faW5pdFNwZWNpYWxPcHRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLl9zbG90cyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSB0aGlzLl9nZXRYSFJQcm9taXNlKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5fc2VuZGluZyA9IHRoaXMuX2FjdGl2ZSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9pbml0UHJvZ3Jlc3NPYmplY3QodGhpcyk7XG4gICAgICAgICAgICB0aGlzLl9pbml0RXZlbnRIYW5kbGVycygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFRoaXMgbWV0aG9kIGlzIGV4cG9zZWQgdG8gdGhlIHdpZGdldCBBUEkgYW5kIGFsbG93cyB0byBxdWVyeVxuICAgICAgICAvLyB0aGUgd2lkZ2V0IHVwbG9hZCBwcm9ncmVzcy5cbiAgICAgICAgLy8gSXQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBsb2FkZWQsIHRvdGFsIGFuZCBiaXRyYXRlIHByb3BlcnRpZXNcbiAgICAgICAgLy8gZm9yIHRoZSBydW5uaW5nIHVwbG9hZHM6XG4gICAgICAgIHByb2dyZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJvZ3Jlc3M7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gVGhpcyBtZXRob2QgaXMgZXhwb3NlZCB0byB0aGUgd2lkZ2V0IEFQSSBhbmQgYWxsb3dzIGFkZGluZyBmaWxlc1xuICAgICAgICAvLyB1c2luZyB0aGUgZmlsZXVwbG9hZCBBUEkuIFRoZSBkYXRhIHBhcmFtZXRlciBhY2NlcHRzIGFuIG9iamVjdCB3aGljaFxuICAgICAgICAvLyBtdXN0IGhhdmUgYSBmaWxlcyBwcm9wZXJ0eSBhbmQgY2FuIGNvbnRhaW4gYWRkaXRpb25hbCBvcHRpb25zOlxuICAgICAgICAvLyAuZmlsZXVwbG9hZCgnYWRkJywge2ZpbGVzOiBmaWxlc0xpc3R9KTtcbiAgICAgICAgYWRkOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKCFkYXRhIHx8IHRoaXMub3B0aW9ucy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhLmZpbGVJbnB1dCAmJiAhZGF0YS5maWxlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2dldEZpbGVJbnB1dEZpbGVzKGRhdGEuZmlsZUlucHV0KS5hbHdheXMoZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmlsZXMgPSBmaWxlcztcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fb25BZGQobnVsbCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGEuZmlsZXMgPSAkLm1ha2VBcnJheShkYXRhLmZpbGVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkFkZChudWxsLCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGlzIG1ldGhvZCBpcyBleHBvc2VkIHRvIHRoZSB3aWRnZXQgQVBJIGFuZCBhbGxvd3Mgc2VuZGluZyBmaWxlc1xuICAgICAgICAvLyB1c2luZyB0aGUgZmlsZXVwbG9hZCBBUEkuIFRoZSBkYXRhIHBhcmFtZXRlciBhY2NlcHRzIGFuIG9iamVjdCB3aGljaFxuICAgICAgICAvLyBtdXN0IGhhdmUgYSBmaWxlcyBvciBmaWxlSW5wdXQgcHJvcGVydHkgYW5kIGNhbiBjb250YWluIGFkZGl0aW9uYWwgb3B0aW9uczpcbiAgICAgICAgLy8gLmZpbGV1cGxvYWQoJ3NlbmQnLCB7ZmlsZXM6IGZpbGVzTGlzdH0pO1xuICAgICAgICAvLyBUaGUgbWV0aG9kIHJldHVybnMgYSBQcm9taXNlIG9iamVjdCBmb3IgdGhlIGZpbGUgdXBsb2FkIGNhbGwuXG4gICAgICAgIHNlbmQ6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YSAmJiAhdGhpcy5vcHRpb25zLmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZmlsZUlucHV0ICYmICFkYXRhLmZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRmZCA9ICQuRGVmZXJyZWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UgPSBkZmQucHJvbWlzZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAganFYSFIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhYm9ydGVkO1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLmFib3J0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanFYSFIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ganFYSFIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRmZC5yZWplY3QobnVsbCwgJ2Fib3J0JywgJ2Fib3J0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0RmlsZUlucHV0RmlsZXMoZGF0YS5maWxlSW5wdXQpLmFsd2F5cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5maWxlcyA9IGZpbGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpxWEhSID0gdGhhdC5fb25TZW5kKG51bGwsIGRhdGEpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZmQucmVzb2x2ZShyZXN1bHQsIHRleHRTdGF0dXMsIGpxWEhSKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGZkLnJlamVjdChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2VuaGFuY2VQcm9taXNlKHByb21pc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkYXRhLmZpbGVzID0gJC5tYWtlQXJyYXkoZGF0YS5maWxlcyk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vblNlbmQobnVsbCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFhIUlByb21pc2UoZmFsc2UsIGRhdGEgJiYgZGF0YS5jb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbn0pKTtcbiJdLCJmaWxlIjoicmFkaW93L2pxdWVyeS5maWxldXBsb2FkLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
