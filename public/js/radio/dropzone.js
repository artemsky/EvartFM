
/*
 *
 * More info at [www.dropzonejs.com](http://www.dropzonejs.com)
 *
 * Copyright (c) 2012, Matias Meno
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

(function() {
  var Dropzone, Emitter, camelize, contentLoaded, detectVerticalSquash, drawImageIOSFix, noop, without,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  noop = function() {};

  Emitter = (function() {
    function Emitter() {}

    Emitter.prototype.addEventListener = Emitter.prototype.on;

    Emitter.prototype.on = function(event, fn) {
      this._callbacks = this._callbacks || {};
      if (!this._callbacks[event]) {
        this._callbacks[event] = [];
      }
      this._callbacks[event].push(fn);
      return this;
    };

    Emitter.prototype.emit = function() {
      var args, callback, callbacks, event, _i, _len;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this._callbacks = this._callbacks || {};
      callbacks = this._callbacks[event];
      if (callbacks) {
        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
          callback = callbacks[_i];
          callback.apply(this, args);
        }
      }
      return this;
    };

    Emitter.prototype.removeListener = Emitter.prototype.off;

    Emitter.prototype.removeAllListeners = Emitter.prototype.off;

    Emitter.prototype.removeEventListener = Emitter.prototype.off;

    Emitter.prototype.off = function(event, fn) {
      var callback, callbacks, i, _i, _len;
      if (!this._callbacks || arguments.length === 0) {
        this._callbacks = {};
        return this;
      }
      callbacks = this._callbacks[event];
      if (!callbacks) {
        return this;
      }
      if (arguments.length === 1) {
        delete this._callbacks[event];
        return this;
      }
      for (i = _i = 0, _len = callbacks.length; _i < _len; i = ++_i) {
        callback = callbacks[i];
        if (callback === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    };

    return Emitter;

  })();

  Dropzone = (function(_super) {
    var extend, resolveOption;

    __extends(Dropzone, _super);

    Dropzone.prototype.Emitter = Emitter;


    /*
    This is a list of all available events you can register on a dropzone object.
    
    You can register an event handler like this:
    
        dropzone.on("dragEnter", function() { });
     */

    Dropzone.prototype.events = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "addedfiles", "removedfile", "thumbnail", "error", "errormultiple", "processing", "processingmultiple", "uploadprogress", "totaluploadprogress", "sending", "sendingmultiple", "success", "successmultiple", "canceled", "canceledmultiple", "complete", "completemultiple", "reset", "maxfilesexceeded", "maxfilesreached", "queuecomplete"];

    Dropzone.prototype.defaultOptions = {
      url: null,
      method: "post",
      withCredentials: false,
      parallelUploads: 2,
      uploadMultiple: false,
      maxFilesize: 256,
      paramName: "file",
      createImageThumbnails: true,
      maxThumbnailFilesize: 10,
      thumbnailWidth: 120,
      thumbnailHeight: 120,
      filesizeBase: 1000,
      maxFiles: null,
      params: {},
      clickable: true,
      ignoreHiddenFiles: true,
      acceptedFiles: null,
      acceptedMimeTypes: null,
      autoProcessQueue: true,
      autoQueue: true,
      addRemoveLinks: false,
      previewsContainer: null,
      hiddenInputContainer: "body",
      capture: null,
      renameFilename: null,
      dictDefaultMessage: "Drop files here to upload",
      dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
      dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
      dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
      dictInvalidFileType: "You can't upload files of this type.",
      dictResponseError: "Server responded with {{statusCode}} code.",
      dictCancelUpload: "Cancel upload",
      dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
      dictRemoveFile: "Remove file",
      dictRemoveFileConfirmation: null,
      dictMaxFilesExceeded: "You can not upload any more files.",
      accept: function(file, done) {
        return done();
      },
      init: function() {
        return noop;
      },
      forceFallback: false,
      fallback: function() {
        var child, messageElement, span, _i, _len, _ref;
        this.element.className = "" + this.element.className + " dz-browser-not-supported";
        _ref = this.element.getElementsByTagName("div");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (/(^| )dz-message($| )/.test(child.className)) {
            messageElement = child;
            child.className = "dz-message";
            continue;
          }
        }
        if (!messageElement) {
          messageElement = Dropzone.createElement("<div class=\"dz-message\"><span></span></div>");
          this.element.appendChild(messageElement);
        }
        span = messageElement.getElementsByTagName("span")[0];
        if (span) {
          if (span.textContent != null) {
            span.textContent = this.options.dictFallbackMessage;
          } else if (span.innerText != null) {
            span.innerText = this.options.dictFallbackMessage;
          }
        }
        return this.element.appendChild(this.getFallbackForm());
      },
      resize: function(file) {
        var info, srcRatio, trgRatio;
        info = {
          srcX: 0,
          srcY: 0,
          srcWidth: file.width,
          srcHeight: file.height
        };
        srcRatio = file.width / file.height;
        info.optWidth = this.options.thumbnailWidth;
        info.optHeight = this.options.thumbnailHeight;
        if ((info.optWidth == null) && (info.optHeight == null)) {
          info.optWidth = info.srcWidth;
          info.optHeight = info.srcHeight;
        } else if (info.optWidth == null) {
          info.optWidth = srcRatio * info.optHeight;
        } else if (info.optHeight == null) {
          info.optHeight = (1 / srcRatio) * info.optWidth;
        }
        trgRatio = info.optWidth / info.optHeight;
        if (file.height < info.optHeight || file.width < info.optWidth) {
          info.trgHeight = info.srcHeight;
          info.trgWidth = info.srcWidth;
        } else {
          if (srcRatio > trgRatio) {
            info.srcHeight = file.height;
            info.srcWidth = info.srcHeight * trgRatio;
          } else {
            info.srcWidth = file.width;
            info.srcHeight = info.srcWidth / trgRatio;
          }
        }
        info.srcX = (file.width - info.srcWidth) / 2;
        info.srcY = (file.height - info.srcHeight) / 2;
        return info;
      },

      /*
      Those functions register themselves to the events on init and handle all
      the user interface specific stuff. Overwriting them won't break the upload
      but can break the way it's displayed.
      You can overwrite them if you don't like the default behavior. If you just
      want to add an additional event handler, register it on the dropzone object
      and don't overwrite those options.
       */
      drop: function(e) {
        return this.element.classList.remove("dz-drag-hover");
      },
      dragstart: noop,
      dragend: function(e) {
        return this.element.classList.remove("dz-drag-hover");
      },
      dragenter: function(e) {
        return this.element.classList.add("dz-drag-hover");
      },
      dragover: function(e) {
        return this.element.classList.add("dz-drag-hover");
      },
      dragleave: function(e) {
        return this.element.classList.remove("dz-drag-hover");
      },
      paste: noop,
      reset: function() {
        return this.element.classList.remove("dz-started");
      },
      addedfile: function(file) {
        var node, removeFileEvent, removeLink, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
        if (this.element === this.previewsContainer) {
          this.element.classList.add("dz-started");
        }
        if (this.previewsContainer) {
          file.previewElement = Dropzone.createElement(this.options.previewTemplate.trim());
          file.previewTemplate = file.previewElement;
          this.previewsContainer.appendChild(file.previewElement);
          _ref = file.previewElement.querySelectorAll("[data-dz-name]");
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            node = _ref[_i];
            node.textContent = this._renameFilename(file.name);
          }
          _ref1 = file.previewElement.querySelectorAll("[data-dz-size]");
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            node = _ref1[_j];
            node.innerHTML = this.filesize(file.size);
          }
          if (this.options.addRemoveLinks) {
            file._removeLink = Dropzone.createElement("<a class=\"dz-remove\" href=\"javascript:undefined;\" data-dz-remove>" + this.options.dictRemoveFile + "</a>");
            file.previewElement.appendChild(file._removeLink);
          }
          removeFileEvent = (function(_this) {
            return function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (file.status === Dropzone.UPLOADING) {
                return Dropzone.confirm(_this.options.dictCancelUploadConfirmation, function() {
                  return _this.removeFile(file);
                });
              } else {
                if (_this.options.dictRemoveFileConfirmation) {
                  return Dropzone.confirm(_this.options.dictRemoveFileConfirmation, function() {
                    return _this.removeFile(file);
                  });
                } else {
                  return _this.removeFile(file);
                }
              }
            };
          })(this);
          _ref2 = file.previewElement.querySelectorAll("[data-dz-remove]");
          _results = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            removeLink = _ref2[_k];
            _results.push(removeLink.addEventListener("click", removeFileEvent));
          }
          return _results;
        }
      },
      removedfile: function(file) {
        var _ref;
        if (file.previewElement) {
          if ((_ref = file.previewElement) != null) {
            _ref.parentNode.removeChild(file.previewElement);
          }
        }
        return this._updateMaxFilesReachedClass();
      },
      thumbnail: function(file, dataUrl) {
        var thumbnailElement, _i, _len, _ref;
        if (file.previewElement) {
          file.previewElement.classList.remove("dz-file-preview");
          _ref = file.previewElement.querySelectorAll("[data-dz-thumbnail]");
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            thumbnailElement = _ref[_i];
            thumbnailElement.alt = file.name;
            thumbnailElement.src = dataUrl;
          }
          return setTimeout(((function(_this) {
            return function() {
              return file.previewElement.classList.add("dz-image-preview");
            };
          })(this)), 1);
        }
      },
      error: function(file, message) {
        var node, _i, _len, _ref, _results;
        if (file.previewElement) {
          file.previewElement.classList.add("dz-error");
          if (typeof message !== "String" && message.error) {
            message = message.error;
          }
          _ref = file.previewElement.querySelectorAll("[data-dz-errormessage]");
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            node = _ref[_i];
            _results.push(node.textContent = message);
          }
          return _results;
        }
      },
      errormultiple: noop,
      processing: function(file) {
        if (file.previewElement) {
          file.previewElement.classList.add("dz-processing");
          if (file._removeLink) {
            return file._removeLink.textContent = this.options.dictCancelUpload;
          }
        }
      },
      processingmultiple: noop,
      uploadprogress: function(file, progress, bytesSent) {
        var node, _i, _len, _ref, _results;
        if (file.previewElement) {
          _ref = file.previewElement.querySelectorAll("[data-dz-uploadprogress]");
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            node = _ref[_i];
            if (node.nodeName === 'PROGRESS') {
              _results.push(node.value = progress);
            } else {
              _results.push(node.style.width = "" + progress + "%");
            }
          }
          return _results;
        }
      },
      totaluploadprogress: noop,
      sending: noop,
      sendingmultiple: noop,
      success: function(file) {
        if (file.previewElement) {
          return file.previewElement.classList.add("dz-success");
        }
      },
      successmultiple: noop,
      canceled: function(file) {
        return this.emit("error", file, "Upload canceled.");
      },
      canceledmultiple: noop,
      complete: function(file) {
        if (file._removeLink) {
          file._removeLink.textContent = this.options.dictRemoveFile;
        }
        if (file.previewElement) {
          return file.previewElement.classList.add("dz-complete");
        }
      },
      completemultiple: noop,
      maxfilesexceeded: noop,
      maxfilesreached: noop,
      queuecomplete: noop,
      addedfiles: noop,
      previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-image\"><img data-dz-thumbnail /></div>\n  <div class=\"dz-details\">\n    <div class=\"dz-size\"><span data-dz-size></span></div>\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n  <div class=\"dz-success-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Check</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <path d=\"M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" stroke-opacity=\"0.198794158\" stroke=\"#747474\" fill-opacity=\"0.816519475\" fill=\"#FFFFFF\" sketch:type=\"MSShapeGroup\"></path>\n      </g>\n    </svg>\n  </div>\n  <div class=\"dz-error-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Error</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <g id=\"Check-+-Oval-2\" sketch:type=\"MSLayerGroup\" stroke=\"#747474\" stroke-opacity=\"0.198794158\" fill=\"#FFFFFF\" fill-opacity=\"0.816519475\">\n          <path d=\"M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" sketch:type=\"MSShapeGroup\"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>"
    };

    extend = function() {
      var key, object, objects, target, val, _i, _len;
      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        for (key in object) {
          val = object[key];
          target[key] = val;
        }
      }
      return target;
    };

    function Dropzone(element, options) {
      var elementOptions, fallback, _ref;
      this.element = element;
      this.version = Dropzone.version;
      this.defaultOptions.previewTemplate = this.defaultOptions.previewTemplate.replace(/\n*/g, "");
      this.clickableElements = [];
      this.listeners = [];
      this.files = [];
      if (typeof this.element === "string") {
        this.element = document.querySelector(this.element);
      }
      if (!(this.element && (this.element.nodeType != null))) {
        throw new Error("Invalid dropzone element.");
      }
      if (this.element.dropzone) {
        throw new Error("Dropzone already attached.");
      }
      Dropzone.instances.push(this);
      this.element.dropzone = this;
      elementOptions = (_ref = Dropzone.optionsForElement(this.element)) != null ? _ref : {};
      this.options = extend({}, this.defaultOptions, elementOptions, options != null ? options : {});
      if (this.options.forceFallback || !Dropzone.isBrowserSupported()) {
        return this.options.fallback.call(this);
      }
      if (this.options.url == null) {
        this.options.url = this.element.getAttribute("action");
      }
      if (!this.options.url) {
        throw new Error("No URL provided.");
      }
      if (this.options.acceptedFiles && this.options.acceptedMimeTypes) {
        throw new Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
      }
      if (this.options.acceptedMimeTypes) {
        this.options.acceptedFiles = this.options.acceptedMimeTypes;
        delete this.options.acceptedMimeTypes;
      }
      this.options.method = this.options.method.toUpperCase();
      if ((fallback = this.getExistingFallback()) && fallback.parentNode) {
        fallback.parentNode.removeChild(fallback);
      }
      if (this.options.previewsContainer !== false) {
        if (this.options.previewsContainer) {
          this.previewsContainer = Dropzone.getElement(this.options.previewsContainer, "previewsContainer");
        } else {
          this.previewsContainer = this.element;
        }
      }
      if (this.options.clickable) {
        if (this.options.clickable === true) {
          this.clickableElements = [this.element];
        } else {
          this.clickableElements = Dropzone.getElements(this.options.clickable, "clickable");
        }
      }
      this.init();
    }

    Dropzone.prototype.getAcceptedFiles = function() {
      var file, _i, _len, _ref, _results;
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.accepted) {
          _results.push(file);
        }
      }
      return _results;
    };

    Dropzone.prototype.getRejectedFiles = function() {
      var file, _i, _len, _ref, _results;
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (!file.accepted) {
          _results.push(file);
        }
      }
      return _results;
    };

    Dropzone.prototype.getFilesWithStatus = function(status) {
      var file, _i, _len, _ref, _results;
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.status === status) {
          _results.push(file);
        }
      }
      return _results;
    };

    Dropzone.prototype.getQueuedFiles = function() {
      return this.getFilesWithStatus(Dropzone.QUEUED);
    };

    Dropzone.prototype.getUploadingFiles = function() {
      return this.getFilesWithStatus(Dropzone.UPLOADING);
    };

    Dropzone.prototype.getAddedFiles = function() {
      return this.getFilesWithStatus(Dropzone.ADDED);
    };

    Dropzone.prototype.getActiveFiles = function() {
      var file, _i, _len, _ref, _results;
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.status === Dropzone.UPLOADING || file.status === Dropzone.QUEUED) {
          _results.push(file);
        }
      }
      return _results;
    };

    Dropzone.prototype.init = function() {
      var eventName, noPropagation, setupHiddenFileInput, _i, _len, _ref, _ref1;
      if (this.element.tagName === "form") {
        this.element.setAttribute("enctype", "multipart/form-data");
      }
      if (this.element.classList.contains("dropzone") && !this.element.querySelector(".dz-message")) {
        this.element.appendChild(Dropzone.createElement("<div class=\"dz-default dz-message\"><span>" + this.options.dictDefaultMessage + "</span></div>"));
      }
      if (this.clickableElements.length) {
        setupHiddenFileInput = (function(_this) {
          return function() {
            if (_this.hiddenFileInput) {
              _this.hiddenFileInput.parentNode.removeChild(_this.hiddenFileInput);
            }
            _this.hiddenFileInput = document.createElement("input");
            _this.hiddenFileInput.setAttribute("type", "file");
            if ((_this.options.maxFiles == null) || _this.options.maxFiles > 1) {
              _this.hiddenFileInput.setAttribute("multiple", "multiple");
            }
            _this.hiddenFileInput.className = "dz-hidden-input";
            if (_this.options.acceptedFiles != null) {
              _this.hiddenFileInput.setAttribute("accept", _this.options.acceptedFiles);
            }
            if (_this.options.capture != null) {
              _this.hiddenFileInput.setAttribute("capture", _this.options.capture);
            }
            _this.hiddenFileInput.style.visibility = "hidden";
            _this.hiddenFileInput.style.position = "absolute";
            _this.hiddenFileInput.style.top = "0";
            _this.hiddenFileInput.style.left = "0";
            _this.hiddenFileInput.style.height = "0";
            _this.hiddenFileInput.style.width = "0";
            document.querySelector(_this.options.hiddenInputContainer).appendChild(_this.hiddenFileInput);
            return _this.hiddenFileInput.addEventListener("change", function() {
              var file, files, _i, _len;
              files = _this.hiddenFileInput.files;
              if (files.length) {
                for (_i = 0, _len = files.length; _i < _len; _i++) {
                  file = files[_i];
                  _this.addFile(file);
                }
              }
              _this.emit("addedfiles", files);
              return setupHiddenFileInput();
            });
          };
        })(this);
        setupHiddenFileInput();
      }
      this.URL = (_ref = window.URL) != null ? _ref : window.webkitURL;
      _ref1 = this.events;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        eventName = _ref1[_i];
        this.on(eventName, this.options[eventName]);
      }
      this.on("uploadprogress", (function(_this) {
        return function() {
          return _this.updateTotalUploadProgress();
        };
      })(this));
      this.on("removedfile", (function(_this) {
        return function() {
          return _this.updateTotalUploadProgress();
        };
      })(this));
      this.on("canceled", (function(_this) {
        return function(file) {
          return _this.emit("complete", file);
        };
      })(this));
      this.on("complete", (function(_this) {
        return function(file) {
          if (_this.getAddedFiles().length === 0 && _this.getUploadingFiles().length === 0 && _this.getQueuedFiles().length === 0) {
            return setTimeout((function() {
              return _this.emit("queuecomplete");
            }), 0);
          }
        };
      })(this));
      noPropagation = function(e) {
        e.stopPropagation();
        if (e.preventDefault) {
          return e.preventDefault();
        } else {
          return e.returnValue = false;
        }
      };
      this.listeners = [
        {
          element: this.element,
          events: {
            "dragstart": (function(_this) {
              return function(e) {
                return _this.emit("dragstart", e);
              };
            })(this),
            "dragenter": (function(_this) {
              return function(e) {
                noPropagation(e);
                return _this.emit("dragenter", e);
              };
            })(this),
            "dragover": (function(_this) {
              return function(e) {
                var efct;
                try {
                  efct = e.dataTransfer.effectAllowed;
                } catch (_error) {}
                e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
                noPropagation(e);
                return _this.emit("dragover", e);
              };
            })(this),
            "dragleave": (function(_this) {
              return function(e) {
                return _this.emit("dragleave", e);
              };
            })(this),
            "drop": (function(_this) {
              return function(e) {
                noPropagation(e);
                return _this.drop(e);
              };
            })(this),
            "dragend": (function(_this) {
              return function(e) {
                return _this.emit("dragend", e);
              };
            })(this)
          }
        }
      ];
      this.clickableElements.forEach((function(_this) {
        return function(clickableElement) {
          return _this.listeners.push({
            element: clickableElement,
            events: {
              "click": function(evt) {
                if ((clickableElement !== _this.element) || (evt.target === _this.element || Dropzone.elementInside(evt.target, _this.element.querySelector(".dz-message")))) {
                  _this.hiddenFileInput.click();
                }
                return true;
              }
            }
          });
        };
      })(this));
      this.enable();
      return this.options.init.call(this);
    };

    Dropzone.prototype.destroy = function() {
      var _ref;
      this.disable();
      this.removeAllFiles(true);
      if ((_ref = this.hiddenFileInput) != null ? _ref.parentNode : void 0) {
        this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
        this.hiddenFileInput = null;
      }
      delete this.element.dropzone;
      return Dropzone.instances.splice(Dropzone.instances.indexOf(this), 1);
    };

    Dropzone.prototype.updateTotalUploadProgress = function() {
      var activeFiles, file, totalBytes, totalBytesSent, totalUploadProgress, _i, _len, _ref;
      totalBytesSent = 0;
      totalBytes = 0;
      activeFiles = this.getActiveFiles();
      if (activeFiles.length) {
        _ref = this.getActiveFiles();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          totalBytesSent += file.upload.bytesSent;
          totalBytes += file.upload.total;
        }
        totalUploadProgress = 100 * totalBytesSent / totalBytes;
      } else {
        totalUploadProgress = 100;
      }
      return this.emit("totaluploadprogress", totalUploadProgress, totalBytes, totalBytesSent);
    };

    Dropzone.prototype._getParamName = function(n) {
      if (typeof this.options.paramName === "function") {
        return this.options.paramName(n);
      } else {
        return "" + this.options.paramName + (this.options.uploadMultiple ? "[" + n + "]" : "");
      }
    };

    Dropzone.prototype._renameFilename = function(name) {
      if (typeof this.options.renameFilename !== "function") {
        return name;
      }
      return this.options.renameFilename(name);
    };

    Dropzone.prototype.getFallbackForm = function() {
      var existingFallback, fields, fieldsString, form;
      if (existingFallback = this.getExistingFallback()) {
        return existingFallback;
      }
      fieldsString = "<div class=\"dz-fallback\">";
      if (this.options.dictFallbackText) {
        fieldsString += "<p>" + this.options.dictFallbackText + "</p>";
      }
      fieldsString += "<input type=\"file\" name=\"" + (this._getParamName(0)) + "\" " + (this.options.uploadMultiple ? 'multiple="multiple"' : void 0) + " /><input type=\"submit\" value=\"Upload!\"></div>";
      fields = Dropzone.createElement(fieldsString);
      if (this.element.tagName !== "FORM") {
        form = Dropzone.createElement("<form action=\"" + this.options.url + "\" enctype=\"multipart/form-data\" method=\"" + this.options.method + "\"></form>");
        form.appendChild(fields);
      } else {
        this.element.setAttribute("enctype", "multipart/form-data");
        this.element.setAttribute("method", this.options.method);
      }
      return form != null ? form : fields;
    };

    Dropzone.prototype.getExistingFallback = function() {
      var fallback, getFallback, tagName, _i, _len, _ref;
      getFallback = function(elements) {
        var el, _i, _len;
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          el = elements[_i];
          if (/(^| )fallback($| )/.test(el.className)) {
            return el;
          }
        }
      };
      _ref = ["div", "form"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tagName = _ref[_i];
        if (fallback = getFallback(this.element.getElementsByTagName(tagName))) {
          return fallback;
        }
      }
    };

    Dropzone.prototype.setupEventListeners = function() {
      var elementListeners, event, listener, _i, _len, _ref, _results;
      _ref = this.listeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elementListeners = _ref[_i];
        _results.push((function() {
          var _ref1, _results1;
          _ref1 = elementListeners.events;
          _results1 = [];
          for (event in _ref1) {
            listener = _ref1[event];
            _results1.push(elementListeners.element.addEventListener(event, listener, false));
          }
          return _results1;
        })());
      }
      return _results;
    };

    Dropzone.prototype.removeEventListeners = function() {
      var elementListeners, event, listener, _i, _len, _ref, _results;
      _ref = this.listeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elementListeners = _ref[_i];
        _results.push((function() {
          var _ref1, _results1;
          _ref1 = elementListeners.events;
          _results1 = [];
          for (event in _ref1) {
            listener = _ref1[event];
            _results1.push(elementListeners.element.removeEventListener(event, listener, false));
          }
          return _results1;
        })());
      }
      return _results;
    };

    Dropzone.prototype.disable = function() {
      var file, _i, _len, _ref, _results;
      this.clickableElements.forEach(function(element) {
        return element.classList.remove("dz-clickable");
      });
      this.removeEventListeners();
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        _results.push(this.cancelUpload(file));
      }
      return _results;
    };

    Dropzone.prototype.enable = function() {
      this.clickableElements.forEach(function(element) {
        return element.classList.add("dz-clickable");
      });
      return this.setupEventListeners();
    };

    Dropzone.prototype.filesize = function(size) {
      var cutoff, i, selectedSize, selectedUnit, unit, units, _i, _len;
      selectedSize = 0;
      selectedUnit = "b";
      if (size > 0) {
        units = ['TB', 'GB', 'MB', 'KB', 'b'];
        for (i = _i = 0, _len = units.length; _i < _len; i = ++_i) {
          unit = units[i];
          cutoff = Math.pow(this.options.filesizeBase, 4 - i) / 10;
          if (size >= cutoff) {
            selectedSize = size / Math.pow(this.options.filesizeBase, 4 - i);
            selectedUnit = unit;
            break;
          }
        }
        selectedSize = Math.round(10 * selectedSize) / 10;
      }
      return "<strong>" + selectedSize + "</strong> " + selectedUnit;
    };

    Dropzone.prototype._updateMaxFilesReachedClass = function() {
      if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
        if (this.getAcceptedFiles().length === this.options.maxFiles) {
          this.emit('maxfilesreached', this.files);
        }
        return this.element.classList.add("dz-max-files-reached");
      } else {
        return this.element.classList.remove("dz-max-files-reached");
      }
    };

    Dropzone.prototype.drop = function(e) {
      var files, items;
      if (!e.dataTransfer) {
        return;
      }
      this.emit("drop", e);
      files = e.dataTransfer.files;
      this.emit("addedfiles", files);
      if (files.length) {
        items = e.dataTransfer.items;
        if (items && items.length && (items[0].webkitGetAsEntry != null)) {
          this._addFilesFromItems(items);
        } else {
          this.handleFiles(files);
        }
      }
    };

    Dropzone.prototype.paste = function(e) {
      var items, _ref;
      if ((e != null ? (_ref = e.clipboardData) != null ? _ref.items : void 0 : void 0) == null) {
        return;
      }
      this.emit("paste", e);
      items = e.clipboardData.items;
      if (items.length) {
        return this._addFilesFromItems(items);
      }
    };

    Dropzone.prototype.handleFiles = function(files) {
      var file, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        _results.push(this.addFile(file));
      }
      return _results;
    };

    Dropzone.prototype._addFilesFromItems = function(items) {
      var entry, item, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        if ((item.webkitGetAsEntry != null) && (entry = item.webkitGetAsEntry())) {
          if (entry.isFile) {
            _results.push(this.addFile(item.getAsFile()));
          } else if (entry.isDirectory) {
            _results.push(this._addFilesFromDirectory(entry, entry.name));
          } else {
            _results.push(void 0);
          }
        } else if (item.getAsFile != null) {
          if ((item.kind == null) || item.kind === "file") {
            _results.push(this.addFile(item.getAsFile()));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Dropzone.prototype._addFilesFromDirectory = function(directory, path) {
      var dirReader, errorHandler, readEntries;
      dirReader = directory.createReader();
      errorHandler = function(error) {
        return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(error) : void 0 : void 0;
      };
      readEntries = (function(_this) {
        return function() {
          return dirReader.readEntries(function(entries) {
            var entry, _i, _len;
            if (entries.length > 0) {
              for (_i = 0, _len = entries.length; _i < _len; _i++) {
                entry = entries[_i];
                if (entry.isFile) {
                  entry.file(function(file) {
                    if (_this.options.ignoreHiddenFiles && file.name.substring(0, 1) === '.') {
                      return;
                    }
                    file.fullPath = "" + path + "/" + file.name;
                    return _this.addFile(file);
                  });
                } else if (entry.isDirectory) {
                  _this._addFilesFromDirectory(entry, "" + path + "/" + entry.name);
                }
              }
              readEntries();
            }
            return null;
          }, errorHandler);
        };
      })(this);
      return readEntries();
    };

    Dropzone.prototype.accept = function(file, done) {
      if (file.size > this.options.maxFilesize * 1024 * 1024) {
        return done(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(file.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize));
      } else if (!Dropzone.isValidFile(file, this.options.acceptedFiles)) {
        return done(this.options.dictInvalidFileType);
      } else if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
        done(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles));
        return this.emit("maxfilesexceeded", file);
      } else {
        return this.options.accept.call(this, file, done);
      }
    };

    Dropzone.prototype.addFile = function(file) {
      file.upload = {
        progress: 0,
        total: file.size,
        bytesSent: 0
      };
      this.files.push(file);
      file.status = Dropzone.ADDED;
      this.emit("addedfile", file);
      this._enqueueThumbnail(file);
      return this.accept(file, (function(_this) {
        return function(error) {
          if (error) {
            file.accepted = false;
            _this._errorProcessing([file], error);
          } else {
            file.accepted = true;
            if (_this.options.autoQueue) {
              _this.enqueueFile(file);
            }
          }
          return _this._updateMaxFilesReachedClass();
        };
      })(this));
    };

    Dropzone.prototype.enqueueFiles = function(files) {
      var file, _i, _len;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        this.enqueueFile(file);
      }
      return null;
    };

    Dropzone.prototype.enqueueFile = function(file) {
      if (file.status === Dropzone.ADDED && file.accepted === true) {
        file.status = Dropzone.QUEUED;
        if (this.options.autoProcessQueue) {
          return setTimeout(((function(_this) {
            return function() {
              return _this.processQueue();
            };
          })(this)), 0);
        }
      } else {
        throw new Error("This file can't be queued because it has already been processed or was rejected.");
      }
    };

    Dropzone.prototype._thumbnailQueue = [];

    Dropzone.prototype._processingThumbnail = false;

    Dropzone.prototype._enqueueThumbnail = function(file) {
      if (this.options.createImageThumbnails && file.type.match(/image.*/) && file.size <= this.options.maxThumbnailFilesize * 1024 * 1024) {
        this._thumbnailQueue.push(file);
        return setTimeout(((function(_this) {
          return function() {
            return _this._processThumbnailQueue();
          };
        })(this)), 0);
      }
    };

    Dropzone.prototype._processThumbnailQueue = function() {
      if (this._processingThumbnail || this._thumbnailQueue.length === 0) {
        return;
      }
      this._processingThumbnail = true;
      return this.createThumbnail(this._thumbnailQueue.shift(), (function(_this) {
        return function() {
          _this._processingThumbnail = false;
          return _this._processThumbnailQueue();
        };
      })(this));
    };

    Dropzone.prototype.removeFile = function(file) {
      if (file.status === Dropzone.UPLOADING) {
        this.cancelUpload(file);
      }
      this.files = without(this.files, file);
      this.emit("removedfile", file);
      if (this.files.length === 0) {
        return this.emit("reset");
      }
    };

    Dropzone.prototype.removeAllFiles = function(cancelIfNecessary) {
      var file, _i, _len, _ref;
      if (cancelIfNecessary == null) {
        cancelIfNecessary = false;
      }
      _ref = this.files.slice();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.status !== Dropzone.UPLOADING || cancelIfNecessary) {
          this.removeFile(file);
        }
      }
      return null;
    };

    Dropzone.prototype.createThumbnail = function(file, callback) {
      var fileReader;
      fileReader = new FileReader;
      fileReader.onload = (function(_this) {
        return function() {
          if (file.type === "image/svg+xml") {
            _this.emit("thumbnail", file, fileReader.result);
            if (callback != null) {
              callback();
            }
            return;
          }
          return _this.createThumbnailFromUrl(file, fileReader.result, callback);
        };
      })(this);
      return fileReader.readAsDataURL(file);
    };

    Dropzone.prototype.createThumbnailFromUrl = function(file, imageUrl, callback, crossOrigin) {
      var img;
      img = document.createElement("img");
      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }
      img.onload = (function(_this) {
        return function() {
          var canvas, ctx, resizeInfo, thumbnail, _ref, _ref1, _ref2, _ref3;
          file.width = img.width;
          file.height = img.height;
          resizeInfo = _this.options.resize.call(_this, file);
          if (resizeInfo.trgWidth == null) {
            resizeInfo.trgWidth = resizeInfo.optWidth;
          }
          if (resizeInfo.trgHeight == null) {
            resizeInfo.trgHeight = resizeInfo.optHeight;
          }
          canvas = document.createElement("canvas");
          ctx = canvas.getContext("2d");
          canvas.width = resizeInfo.trgWidth;
          canvas.height = resizeInfo.trgHeight;
          drawImageIOSFix(ctx, img, (_ref = resizeInfo.srcX) != null ? _ref : 0, (_ref1 = resizeInfo.srcY) != null ? _ref1 : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, (_ref2 = resizeInfo.trgX) != null ? _ref2 : 0, (_ref3 = resizeInfo.trgY) != null ? _ref3 : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
          thumbnail = canvas.toDataURL("image/png");
          _this.emit("thumbnail", file, thumbnail);
          if (callback != null) {
            return callback();
          }
        };
      })(this);
      if (callback != null) {
        img.onerror = callback;
      }
      return img.src = imageUrl;
    };

    Dropzone.prototype.processQueue = function() {
      var i, parallelUploads, processingLength, queuedFiles;
      parallelUploads = this.options.parallelUploads;
      processingLength = this.getUploadingFiles().length;
      i = processingLength;
      if (processingLength >= parallelUploads) {
        return;
      }
      queuedFiles = this.getQueuedFiles();
      if (!(queuedFiles.length > 0)) {
        return;
      }
      if (this.options.uploadMultiple) {
        return this.processFiles(queuedFiles.slice(0, parallelUploads - processingLength));
      } else {
        while (i < parallelUploads) {
          if (!queuedFiles.length) {
            return;
          }
          this.processFile(queuedFiles.shift());
          i++;
        }
      }
    };

    Dropzone.prototype.processFile = function(file) {
      return this.processFiles([file]);
    };

    Dropzone.prototype.processFiles = function(files) {
      var file, _i, _len;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        file.processing = true;
        file.status = Dropzone.UPLOADING;
        this.emit("processing", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("processingmultiple", files);
      }
      return this.uploadFiles(files);
    };

    Dropzone.prototype._getFilesWithXhr = function(xhr) {
      var file, files;
      return files = (function() {
        var _i, _len, _ref, _results;
        _ref = this.files;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (file.xhr === xhr) {
            _results.push(file);
          }
        }
        return _results;
      }).call(this);
    };

    Dropzone.prototype.cancelUpload = function(file) {
      var groupedFile, groupedFiles, _i, _j, _len, _len1, _ref;
      if (file.status === Dropzone.UPLOADING) {
        groupedFiles = this._getFilesWithXhr(file.xhr);
        for (_i = 0, _len = groupedFiles.length; _i < _len; _i++) {
          groupedFile = groupedFiles[_i];
          groupedFile.status = Dropzone.CANCELED;
        }
        file.xhr.abort();
        for (_j = 0, _len1 = groupedFiles.length; _j < _len1; _j++) {
          groupedFile = groupedFiles[_j];
          this.emit("canceled", groupedFile);
        }
        if (this.options.uploadMultiple) {
          this.emit("canceledmultiple", groupedFiles);
        }
      } else if ((_ref = file.status) === Dropzone.ADDED || _ref === Dropzone.QUEUED) {
        file.status = Dropzone.CANCELED;
        this.emit("canceled", file);
        if (this.options.uploadMultiple) {
          this.emit("canceledmultiple", [file]);
        }
      }
      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    };

    resolveOption = function() {
      var args, option;
      option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (typeof option === 'function') {
        return option.apply(this, args);
      }
      return option;
    };

    Dropzone.prototype.uploadFile = function(file) {
      return this.uploadFiles([file]);
    };

    Dropzone.prototype.uploadFiles = function(files) {
      var file, formData, handleError, headerName, headerValue, headers, i, input, inputName, inputType, key, method, option, progressObj, response, updateProgress, url, value, xhr, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      xhr = new XMLHttpRequest();
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        file.xhr = xhr;
      }
      method = resolveOption(this.options.method, files);
      url = resolveOption(this.options.url, files);
      xhr.open(method, url, true);
      xhr.withCredentials = !!this.options.withCredentials;
      response = null;
      handleError = (function(_this) {
        return function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
            file = files[_j];
            _results.push(_this._errorProcessing(files, response || _this.options.dictResponseError.replace("{{statusCode}}", xhr.status), xhr));
          }
          return _results;
        };
      })(this);
      updateProgress = (function(_this) {
        return function(e) {
          var allFilesFinished, progress, _j, _k, _l, _len1, _len2, _len3, _results;
          if (e != null) {
            progress = 100 * e.loaded / e.total;
            for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
              file = files[_j];
              file.upload = {
                progress: progress,
                total: e.total,
                bytesSent: e.loaded
              };
            }
          } else {
            allFilesFinished = true;
            progress = 100;
            for (_k = 0, _len2 = files.length; _k < _len2; _k++) {
              file = files[_k];
              if (!(file.upload.progress === 100 && file.upload.bytesSent === file.upload.total)) {
                allFilesFinished = false;
              }
              file.upload.progress = progress;
              file.upload.bytesSent = file.upload.total;
            }
            if (allFilesFinished) {
              return;
            }
          }
          _results = [];
          for (_l = 0, _len3 = files.length; _l < _len3; _l++) {
            file = files[_l];
            _results.push(_this.emit("uploadprogress", file, progress, file.upload.bytesSent));
          }
          return _results;
        };
      })(this);
      xhr.onload = (function(_this) {
        return function(e) {
          var _ref;
          if (files[0].status === Dropzone.CANCELED) {
            return;
          }
          if (xhr.readyState !== 4) {
            return;
          }
          response = xhr.responseText;
          if (xhr.getResponseHeader("content-type") && ~xhr.getResponseHeader("content-type").indexOf("application/json")) {
            try {
              response = JSON.parse(response);
            } catch (_error) {
              e = _error;
              response = "Invalid JSON response from server.";
            }
          }
          updateProgress();
          if (!((200 <= (_ref = xhr.status) && _ref < 300))) {
            return handleError();
          } else {
            return _this._finished(files, response, e);
          }
        };
      })(this);
      xhr.onerror = (function(_this) {
        return function() {
          if (files[0].status === Dropzone.CANCELED) {
            return;
          }
          return handleError();
        };
      })(this);
      progressObj = (_ref = xhr.upload) != null ? _ref : xhr;
      progressObj.onprogress = updateProgress;
      headers = {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "X-Requested-With": "XMLHttpRequest"
      };
      if (this.options.headers) {
        extend(headers, this.options.headers);
      }
      for (headerName in headers) {
        headerValue = headers[headerName];
        if (headerValue) {
          xhr.setRequestHeader(headerName, headerValue);
        }
      }
      formData = new FormData();
      if (this.options.params) {
        _ref1 = this.options.params;
        for (key in _ref1) {
          value = _ref1[key];
          formData.append(key, value);
        }
      }
      for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
        file = files[_j];
        this.emit("sending", file, xhr, formData);
      }
      if (this.options.uploadMultiple) {
        this.emit("sendingmultiple", files, xhr, formData);
      }
      if (this.element.tagName === "FORM") {
        _ref2 = this.element.querySelectorAll("input, textarea, select, button");
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          input = _ref2[_k];
          inputName = input.getAttribute("name");
          inputType = input.getAttribute("type");
          if (input.tagName === "SELECT" && input.hasAttribute("multiple")) {
            _ref3 = input.options;
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              option = _ref3[_l];
              if (option.selected) {
                formData.append(inputName, option.value);
              }
            }
          } else if (!inputType || ((_ref4 = inputType.toLowerCase()) !== "checkbox" && _ref4 !== "radio") || input.checked) {
            formData.append(inputName, input.value);
          }
        }
      }
      for (i = _m = 0, _ref5 = files.length - 1; 0 <= _ref5 ? _m <= _ref5 : _m >= _ref5; i = 0 <= _ref5 ? ++_m : --_m) {
        formData.append(this._getParamName(i), files[i], this._renameFilename(files[i].name));
      }
      return this.submitRequest(xhr, formData, files);
    };

    Dropzone.prototype.submitRequest = function(xhr, formData, files) {
      return xhr.send(formData);
    };

    Dropzone.prototype._finished = function(files, responseText, e) {
      var file, _i, _len;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        file.status = Dropzone.SUCCESS;
        this.emit("success", file, responseText, e);
        this.emit("complete", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("successmultiple", files, responseText, e);
        this.emit("completemultiple", files);
      }
      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    };

    Dropzone.prototype._errorProcessing = function(files, message, xhr) {
      var file, _i, _len;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        file.status = Dropzone.ERROR;
        this.emit("error", file, message, xhr);
        this.emit("complete", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("errormultiple", files, message, xhr);
        this.emit("completemultiple", files);
      }
      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    };

    return Dropzone;

  })(Emitter);

  Dropzone.version = "4.3.0";

  Dropzone.options = {};

  Dropzone.optionsForElement = function(element) {
    if (element.getAttribute("id")) {
      return Dropzone.options[camelize(element.getAttribute("id"))];
    } else {
      return void 0;
    }
  };

  Dropzone.instances = [];

  Dropzone.forElement = function(element) {
    if (typeof element === "string") {
      element = document.querySelector(element);
    }
    if ((element != null ? element.dropzone : void 0) == null) {
      throw new Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");
    }
    return element.dropzone;
  };

  Dropzone.autoDiscover = true;

  Dropzone.discover = function() {
    var checkElements, dropzone, dropzones, _i, _len, _results;
    if (document.querySelectorAll) {
      dropzones = document.querySelectorAll(".dropzone");
    } else {
      dropzones = [];
      checkElements = function(elements) {
        var el, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          el = elements[_i];
          if (/(^| )dropzone($| )/.test(el.className)) {
            _results.push(dropzones.push(el));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      checkElements(document.getElementsByTagName("div"));
      checkElements(document.getElementsByTagName("form"));
    }
    _results = [];
    for (_i = 0, _len = dropzones.length; _i < _len; _i++) {
      dropzone = dropzones[_i];
      if (Dropzone.optionsForElement(dropzone) !== false) {
        _results.push(new Dropzone(dropzone));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Dropzone.blacklistedBrowsers = [/opera.*Macintosh.*version\/12/i];

  Dropzone.isBrowserSupported = function() {
    var capableBrowser, regex, _i, _len, _ref;
    capableBrowser = true;
    if (window.File && window.FileReader && window.FileList && window.Blob && window.FormData && document.querySelector) {
      if (!("classList" in document.createElement("a"))) {
        capableBrowser = false;
      } else {
        _ref = Dropzone.blacklistedBrowsers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          regex = _ref[_i];
          if (regex.test(navigator.userAgent)) {
            capableBrowser = false;
            continue;
          }
        }
      }
    } else {
      capableBrowser = false;
    }
    return capableBrowser;
  };

  without = function(list, rejectedItem) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      item = list[_i];
      if (item !== rejectedItem) {
        _results.push(item);
      }
    }
    return _results;
  };

  camelize = function(str) {
    return str.replace(/[\-_](\w)/g, function(match) {
      return match.charAt(1).toUpperCase();
    });
  };

  Dropzone.createElement = function(string) {
    var div;
    div = document.createElement("div");
    div.innerHTML = string;
    return div.childNodes[0];
  };

  Dropzone.elementInside = function(element, container) {
    if (element === container) {
      return true;
    }
    while (element = element.parentNode) {
      if (element === container) {
        return true;
      }
    }
    return false;
  };

  Dropzone.getElement = function(el, name) {
    var element;
    if (typeof el === "string") {
      element = document.querySelector(el);
    } else if (el.nodeType != null) {
      element = el;
    }
    if (element == null) {
      throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector or a plain HTML element.");
    }
    return element;
  };

  Dropzone.getElements = function(els, name) {
    var e, el, elements, _i, _j, _len, _len1, _ref;
    if (els instanceof Array) {
      elements = [];
      try {
        for (_i = 0, _len = els.length; _i < _len; _i++) {
          el = els[_i];
          elements.push(this.getElement(el, name));
        }
      } catch (_error) {
        e = _error;
        elements = null;
      }
    } else if (typeof els === "string") {
      elements = [];
      _ref = document.querySelectorAll(els);
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        el = _ref[_j];
        elements.push(el);
      }
    } else if (els.nodeType != null) {
      elements = [els];
    }
    if (!((elements != null) && elements.length)) {
      throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector, a plain HTML element or a list of those.");
    }
    return elements;
  };

  Dropzone.confirm = function(question, accepted, rejected) {
    if (window.confirm(question)) {
      return accepted();
    } else if (rejected != null) {
      return rejected();
    }
  };

  Dropzone.isValidFile = function(file, acceptedFiles) {
    var baseMimeType, mimeType, validType, _i, _len;
    if (!acceptedFiles) {
      return true;
    }
    acceptedFiles = acceptedFiles.split(",");
    mimeType = file.type;
    baseMimeType = mimeType.replace(/\/.*$/, "");
    for (_i = 0, _len = acceptedFiles.length; _i < _len; _i++) {
      validType = acceptedFiles[_i];
      validType = validType.trim();
      if (validType.charAt(0) === ".") {
        if (file.name.toLowerCase().indexOf(validType.toLowerCase(), file.name.length - validType.length) !== -1) {
          return true;
        }
      } else if (/\/\*$/.test(validType)) {
        if (baseMimeType === validType.replace(/\/.*$/, "")) {
          return true;
        }
      } else {
        if (mimeType === validType) {
          return true;
        }
      }
    }
    return false;
  };

  if (typeof jQuery !== "undefined" && jQuery !== null) {
    jQuery.fn.dropzone = function(options) {
      return this.each(function() {
        return new Dropzone(this, options);
      });
    };
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Dropzone;
  } else {
    window.Dropzone = Dropzone;
  }

  Dropzone.ADDED = "added";

  Dropzone.QUEUED = "queued";

  Dropzone.ACCEPTED = Dropzone.QUEUED;

  Dropzone.UPLOADING = "uploading";

  Dropzone.PROCESSING = Dropzone.UPLOADING;

  Dropzone.CANCELED = "canceled";

  Dropzone.ERROR = "error";

  Dropzone.SUCCESS = "success";


  /*
  
  Bugfix for iOS 6 and 7
  Source: http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios
  based on the work of https://github.com/stomita/ios-imagefile-megapixel
   */

  detectVerticalSquash = function(img) {
    var alpha, canvas, ctx, data, ey, ih, iw, py, ratio, sy;
    iw = img.naturalWidth;
    ih = img.naturalHeight;
    canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = ih;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    data = ctx.getImageData(0, 0, 1, ih).data;
    sy = 0;
    ey = ih;
    py = ih;
    while (py > sy) {
      alpha = data[(py - 1) * 4 + 3];
      if (alpha === 0) {
        ey = py;
      } else {
        sy = py;
      }
      py = (ey + sy) >> 1;
    }
    ratio = py / ih;
    if (ratio === 0) {
      return 1;
    } else {
      return ratio;
    }
  };

  drawImageIOSFix = function(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    var vertSquashRatio;
    vertSquashRatio = detectVerticalSquash(img);
    return ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
  };


  /*
   * contentloaded.js
   *
   * Author: Diego Perini (diego.perini at gmail.com)
   * Summary: cross-browser wrapper for DOMContentLoaded
   * Updated: 20101020
   * License: MIT
   * Version: 1.2
   *
   * URL:
   * http://javascript.nwbox.com/ContentLoaded/
   * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
   */

  contentLoaded = function(win, fn) {
    var add, doc, done, init, poll, pre, rem, root, top;
    done = false;
    top = true;
    doc = win.document;
    root = doc.documentElement;
    add = (doc.addEventListener ? "addEventListener" : "attachEvent");
    rem = (doc.addEventListener ? "removeEventListener" : "detachEvent");
    pre = (doc.addEventListener ? "" : "on");
    init = function(e) {
      if (e.type === "readystatechange" && doc.readyState !== "complete") {
        return;
      }
      (e.type === "load" ? win : doc)[rem](pre + e.type, init, false);
      if (!done && (done = true)) {
        return fn.call(win, e.type || e);
      }
    };
    poll = function() {
      var e;
      try {
        root.doScroll("left");
      } catch (_error) {
        e = _error;
        setTimeout(poll, 50);
        return;
      }
      return init("poll");
    };
    if (doc.readyState !== "complete") {
      if (doc.createEventObject && root.doScroll) {
        try {
          top = !win.frameElement;
        } catch (_error) {}
        if (top) {
          poll();
        }
      }
      doc[add](pre + "DOMContentLoaded", init, false);
      doc[add](pre + "readystatechange", init, false);
      return win[add](pre + "load", init, false);
    }
  };

  Dropzone._autoDiscoverFunction = function() {
    if (Dropzone.autoDiscover) {
      return Dropzone.discover();
    }
  };

  contentLoaded(window, Dropzone._autoDiscoverFunction);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby9kcm9wem9uZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qXG4gKlxuICogTW9yZSBpbmZvIGF0IFt3d3cuZHJvcHpvbmVqcy5jb21dKGh0dHA6Ly93d3cuZHJvcHpvbmVqcy5jb20pXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyLCBNYXRpYXMgTWVub1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKlxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIERyb3B6b25lLCBFbWl0dGVyLCBjYW1lbGl6ZSwgY29udGVudExvYWRlZCwgZGV0ZWN0VmVydGljYWxTcXVhc2gsIGRyYXdJbWFnZUlPU0ZpeCwgbm9vcCwgd2l0aG91dCxcbiAgICBfX3NsaWNlID0gW10uc2xpY2UsXG4gICAgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHksXG4gICAgX19leHRlbmRzID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChfX2hhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH07XG5cbiAgbm9vcCA9IGZ1bmN0aW9uKCkge307XG5cbiAgRW1pdHRlciA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBFbWl0dGVyKCkge31cblxuICAgIEVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuICAgIEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnQsIGZuKSB7XG4gICAgICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICAgICBpZiAoIXRoaXMuX2NhbGxiYWNrc1tldmVudF0pIHtcbiAgICAgICAgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XS5wdXNoKGZuKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncywgY2FsbGJhY2ssIGNhbGxiYWNrcywgZXZlbnQsIF9pLCBfbGVuO1xuICAgICAgZXZlbnQgPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgICAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAgICAgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICAgIGlmIChjYWxsYmFja3MpIHtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrc1tfaV07XG4gICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IEVtaXR0ZXIucHJvdG90eXBlLm9mZjtcblxuICAgIEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IEVtaXR0ZXIucHJvdG90eXBlLm9mZjtcblxuICAgIEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBFbWl0dGVyLnByb3RvdHlwZS5vZmY7XG5cbiAgICBFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbihldmVudCwgZm4pIHtcbiAgICAgIHZhciBjYWxsYmFjaywgY2FsbGJhY2tzLCBpLCBfaSwgX2xlbjtcbiAgICAgIGlmICghdGhpcy5fY2FsbGJhY2tzIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICAgIGlmICghY2FsbGJhY2tzKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgZm9yIChpID0gX2kgPSAwLCBfbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgX2kgPCBfbGVuOyBpID0gKytfaSkge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrc1tpXTtcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSBmbikge1xuICAgICAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICByZXR1cm4gRW1pdHRlcjtcblxuICB9KSgpO1xuXG4gIERyb3B6b25lID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIHZhciBleHRlbmQsIHJlc29sdmVPcHRpb247XG5cbiAgICBfX2V4dGVuZHMoRHJvcHpvbmUsIF9zdXBlcik7XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuRW1pdHRlciA9IEVtaXR0ZXI7XG5cblxuICAgIC8qXG4gICAgVGhpcyBpcyBhIGxpc3Qgb2YgYWxsIGF2YWlsYWJsZSBldmVudHMgeW91IGNhbiByZWdpc3RlciBvbiBhIGRyb3B6b25lIG9iamVjdC5cbiAgICBcbiAgICBZb3UgY2FuIHJlZ2lzdGVyIGFuIGV2ZW50IGhhbmRsZXIgbGlrZSB0aGlzOlxuICAgIFxuICAgICAgICBkcm9wem9uZS5vbihcImRyYWdFbnRlclwiLCBmdW5jdGlvbigpIHsgfSk7XG4gICAgICovXG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZXZlbnRzID0gW1wiZHJvcFwiLCBcImRyYWdzdGFydFwiLCBcImRyYWdlbmRcIiwgXCJkcmFnZW50ZXJcIiwgXCJkcmFnb3ZlclwiLCBcImRyYWdsZWF2ZVwiLCBcImFkZGVkZmlsZVwiLCBcImFkZGVkZmlsZXNcIiwgXCJyZW1vdmVkZmlsZVwiLCBcInRodW1ibmFpbFwiLCBcImVycm9yXCIsIFwiZXJyb3JtdWx0aXBsZVwiLCBcInByb2Nlc3NpbmdcIiwgXCJwcm9jZXNzaW5nbXVsdGlwbGVcIiwgXCJ1cGxvYWRwcm9ncmVzc1wiLCBcInRvdGFsdXBsb2FkcHJvZ3Jlc3NcIiwgXCJzZW5kaW5nXCIsIFwic2VuZGluZ211bHRpcGxlXCIsIFwic3VjY2Vzc1wiLCBcInN1Y2Nlc3NtdWx0aXBsZVwiLCBcImNhbmNlbGVkXCIsIFwiY2FuY2VsZWRtdWx0aXBsZVwiLCBcImNvbXBsZXRlXCIsIFwiY29tcGxldGVtdWx0aXBsZVwiLCBcInJlc2V0XCIsIFwibWF4ZmlsZXNleGNlZWRlZFwiLCBcIm1heGZpbGVzcmVhY2hlZFwiLCBcInF1ZXVlY29tcGxldGVcIl07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICB1cmw6IG51bGwsXG4gICAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgICAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZSxcbiAgICAgIHBhcmFsbGVsVXBsb2FkczogMixcbiAgICAgIHVwbG9hZE11bHRpcGxlOiBmYWxzZSxcbiAgICAgIG1heEZpbGVzaXplOiAyNTYsXG4gICAgICBwYXJhbU5hbWU6IFwiZmlsZVwiLFxuICAgICAgY3JlYXRlSW1hZ2VUaHVtYm5haWxzOiB0cnVlLFxuICAgICAgbWF4VGh1bWJuYWlsRmlsZXNpemU6IDEwLFxuICAgICAgdGh1bWJuYWlsV2lkdGg6IDEyMCxcbiAgICAgIHRodW1ibmFpbEhlaWdodDogMTIwLFxuICAgICAgZmlsZXNpemVCYXNlOiAxMDAwLFxuICAgICAgbWF4RmlsZXM6IG51bGwsXG4gICAgICBwYXJhbXM6IHt9LFxuICAgICAgY2xpY2thYmxlOiB0cnVlLFxuICAgICAgaWdub3JlSGlkZGVuRmlsZXM6IHRydWUsXG4gICAgICBhY2NlcHRlZEZpbGVzOiBudWxsLFxuICAgICAgYWNjZXB0ZWRNaW1lVHlwZXM6IG51bGwsXG4gICAgICBhdXRvUHJvY2Vzc1F1ZXVlOiB0cnVlLFxuICAgICAgYXV0b1F1ZXVlOiB0cnVlLFxuICAgICAgYWRkUmVtb3ZlTGlua3M6IGZhbHNlLFxuICAgICAgcHJldmlld3NDb250YWluZXI6IG51bGwsXG4gICAgICBoaWRkZW5JbnB1dENvbnRhaW5lcjogXCJib2R5XCIsXG4gICAgICBjYXB0dXJlOiBudWxsLFxuICAgICAgcmVuYW1lRmlsZW5hbWU6IG51bGwsXG4gICAgICBkaWN0RGVmYXVsdE1lc3NhZ2U6IFwiRHJvcCBmaWxlcyBoZXJlIHRvIHVwbG9hZFwiLFxuICAgICAgZGljdEZhbGxiYWNrTWVzc2FnZTogXCJZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBkcmFnJ24nZHJvcCBmaWxlIHVwbG9hZHMuXCIsXG4gICAgICBkaWN0RmFsbGJhY2tUZXh0OiBcIlBsZWFzZSB1c2UgdGhlIGZhbGxiYWNrIGZvcm0gYmVsb3cgdG8gdXBsb2FkIHlvdXIgZmlsZXMgbGlrZSBpbiB0aGUgb2xkZW4gZGF5cy5cIixcbiAgICAgIGRpY3RGaWxlVG9vQmlnOiBcIkZpbGUgaXMgdG9vIGJpZyAoe3tmaWxlc2l6ZX19TWlCKS4gTWF4IGZpbGVzaXplOiB7e21heEZpbGVzaXplfX1NaUIuXCIsXG4gICAgICBkaWN0SW52YWxpZEZpbGVUeXBlOiBcIllvdSBjYW4ndCB1cGxvYWQgZmlsZXMgb2YgdGhpcyB0eXBlLlwiLFxuICAgICAgZGljdFJlc3BvbnNlRXJyb3I6IFwiU2VydmVyIHJlc3BvbmRlZCB3aXRoIHt7c3RhdHVzQ29kZX19IGNvZGUuXCIsXG4gICAgICBkaWN0Q2FuY2VsVXBsb2FkOiBcIkNhbmNlbCB1cGxvYWRcIixcbiAgICAgIGRpY3RDYW5jZWxVcGxvYWRDb25maXJtYXRpb246IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGNhbmNlbCB0aGlzIHVwbG9hZD9cIixcbiAgICAgIGRpY3RSZW1vdmVGaWxlOiBcIlJlbW92ZSBmaWxlXCIsXG4gICAgICBkaWN0UmVtb3ZlRmlsZUNvbmZpcm1hdGlvbjogbnVsbCxcbiAgICAgIGRpY3RNYXhGaWxlc0V4Y2VlZGVkOiBcIllvdSBjYW4gbm90IHVwbG9hZCBhbnkgbW9yZSBmaWxlcy5cIixcbiAgICAgIGFjY2VwdDogZnVuY3Rpb24oZmlsZSwgZG9uZSkge1xuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSxcbiAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICAgIH0sXG4gICAgICBmb3JjZUZhbGxiYWNrOiBmYWxzZSxcbiAgICAgIGZhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoaWxkLCBtZXNzYWdlRWxlbWVudCwgc3BhbiwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPSBcIlwiICsgdGhpcy5lbGVtZW50LmNsYXNzTmFtZSArIFwiIGR6LWJyb3dzZXItbm90LXN1cHBvcnRlZFwiO1xuICAgICAgICBfcmVmID0gdGhpcy5lbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiZGl2XCIpO1xuICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBjaGlsZCA9IF9yZWZbX2ldO1xuICAgICAgICAgIGlmICgvKF58IClkei1tZXNzYWdlKCR8ICkvLnRlc3QoY2hpbGQuY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgbWVzc2FnZUVsZW1lbnQgPSBjaGlsZDtcbiAgICAgICAgICAgIGNoaWxkLmNsYXNzTmFtZSA9IFwiZHotbWVzc2FnZVwiO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghbWVzc2FnZUVsZW1lbnQpIHtcbiAgICAgICAgICBtZXNzYWdlRWxlbWVudCA9IERyb3B6b25lLmNyZWF0ZUVsZW1lbnQoXCI8ZGl2IGNsYXNzPVxcXCJkei1tZXNzYWdlXFxcIj48c3Bhbj48L3NwYW4+PC9kaXY+XCIpO1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgc3BhbiA9IG1lc3NhZ2VFbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3BhblwiKVswXTtcbiAgICAgICAgaWYgKHNwYW4pIHtcbiAgICAgICAgICBpZiAoc3Bhbi50ZXh0Q29udGVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBzcGFuLnRleHRDb250ZW50ID0gdGhpcy5vcHRpb25zLmRpY3RGYWxsYmFja01lc3NhZ2U7XG4gICAgICAgICAgfSBlbHNlIGlmIChzcGFuLmlubmVyVGV4dCAhPSBudWxsKSB7XG4gICAgICAgICAgICBzcGFuLmlubmVyVGV4dCA9IHRoaXMub3B0aW9ucy5kaWN0RmFsbGJhY2tNZXNzYWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZ2V0RmFsbGJhY2tGb3JtKCkpO1xuICAgICAgfSxcbiAgICAgIHJlc2l6ZTogZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICB2YXIgaW5mbywgc3JjUmF0aW8sIHRyZ1JhdGlvO1xuICAgICAgICBpbmZvID0ge1xuICAgICAgICAgIHNyY1g6IDAsXG4gICAgICAgICAgc3JjWTogMCxcbiAgICAgICAgICBzcmNXaWR0aDogZmlsZS53aWR0aCxcbiAgICAgICAgICBzcmNIZWlnaHQ6IGZpbGUuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgICAgIHNyY1JhdGlvID0gZmlsZS53aWR0aCAvIGZpbGUuaGVpZ2h0O1xuICAgICAgICBpbmZvLm9wdFdpZHRoID0gdGhpcy5vcHRpb25zLnRodW1ibmFpbFdpZHRoO1xuICAgICAgICBpbmZvLm9wdEhlaWdodCA9IHRoaXMub3B0aW9ucy50aHVtYm5haWxIZWlnaHQ7XG4gICAgICAgIGlmICgoaW5mby5vcHRXaWR0aCA9PSBudWxsKSAmJiAoaW5mby5vcHRIZWlnaHQgPT0gbnVsbCkpIHtcbiAgICAgICAgICBpbmZvLm9wdFdpZHRoID0gaW5mby5zcmNXaWR0aDtcbiAgICAgICAgICBpbmZvLm9wdEhlaWdodCA9IGluZm8uc3JjSGVpZ2h0O1xuICAgICAgICB9IGVsc2UgaWYgKGluZm8ub3B0V2lkdGggPT0gbnVsbCkge1xuICAgICAgICAgIGluZm8ub3B0V2lkdGggPSBzcmNSYXRpbyAqIGluZm8ub3B0SGVpZ2h0O1xuICAgICAgICB9IGVsc2UgaWYgKGluZm8ub3B0SGVpZ2h0ID09IG51bGwpIHtcbiAgICAgICAgICBpbmZvLm9wdEhlaWdodCA9ICgxIC8gc3JjUmF0aW8pICogaW5mby5vcHRXaWR0aDtcbiAgICAgICAgfVxuICAgICAgICB0cmdSYXRpbyA9IGluZm8ub3B0V2lkdGggLyBpbmZvLm9wdEhlaWdodDtcbiAgICAgICAgaWYgKGZpbGUuaGVpZ2h0IDwgaW5mby5vcHRIZWlnaHQgfHwgZmlsZS53aWR0aCA8IGluZm8ub3B0V2lkdGgpIHtcbiAgICAgICAgICBpbmZvLnRyZ0hlaWdodCA9IGluZm8uc3JjSGVpZ2h0O1xuICAgICAgICAgIGluZm8udHJnV2lkdGggPSBpbmZvLnNyY1dpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzcmNSYXRpbyA+IHRyZ1JhdGlvKSB7XG4gICAgICAgICAgICBpbmZvLnNyY0hlaWdodCA9IGZpbGUuaGVpZ2h0O1xuICAgICAgICAgICAgaW5mby5zcmNXaWR0aCA9IGluZm8uc3JjSGVpZ2h0ICogdHJnUmF0aW87XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZm8uc3JjV2lkdGggPSBmaWxlLndpZHRoO1xuICAgICAgICAgICAgaW5mby5zcmNIZWlnaHQgPSBpbmZvLnNyY1dpZHRoIC8gdHJnUmF0aW87XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGluZm8uc3JjWCA9IChmaWxlLndpZHRoIC0gaW5mby5zcmNXaWR0aCkgLyAyO1xuICAgICAgICBpbmZvLnNyY1kgPSAoZmlsZS5oZWlnaHQgLSBpbmZvLnNyY0hlaWdodCkgLyAyO1xuICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICBUaG9zZSBmdW5jdGlvbnMgcmVnaXN0ZXIgdGhlbXNlbHZlcyB0byB0aGUgZXZlbnRzIG9uIGluaXQgYW5kIGhhbmRsZSBhbGxcbiAgICAgIHRoZSB1c2VyIGludGVyZmFjZSBzcGVjaWZpYyBzdHVmZi4gT3ZlcndyaXRpbmcgdGhlbSB3b24ndCBicmVhayB0aGUgdXBsb2FkXG4gICAgICBidXQgY2FuIGJyZWFrIHRoZSB3YXkgaXQncyBkaXNwbGF5ZWQuXG4gICAgICBZb3UgY2FuIG92ZXJ3cml0ZSB0aGVtIGlmIHlvdSBkb24ndCBsaWtlIHRoZSBkZWZhdWx0IGJlaGF2aW9yLiBJZiB5b3UganVzdFxuICAgICAgd2FudCB0byBhZGQgYW4gYWRkaXRpb25hbCBldmVudCBoYW5kbGVyLCByZWdpc3RlciBpdCBvbiB0aGUgZHJvcHpvbmUgb2JqZWN0XG4gICAgICBhbmQgZG9uJ3Qgb3ZlcndyaXRlIHRob3NlIG9wdGlvbnMuXG4gICAgICAgKi9cbiAgICAgIGRyb3A6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHotZHJhZy1ob3ZlclwiKTtcbiAgICAgIH0sXG4gICAgICBkcmFnc3RhcnQ6IG5vb3AsXG4gICAgICBkcmFnZW5kOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImR6LWRyYWctaG92ZXJcIik7XG4gICAgICB9LFxuICAgICAgZHJhZ2VudGVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImR6LWRyYWctaG92ZXJcIik7XG4gICAgICB9LFxuICAgICAgZHJhZ292ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotZHJhZy1ob3ZlclwiKTtcbiAgICAgIH0sXG4gICAgICBkcmFnbGVhdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHotZHJhZy1ob3ZlclwiKTtcbiAgICAgIH0sXG4gICAgICBwYXN0ZTogbm9vcCxcbiAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHotc3RhcnRlZFwiKTtcbiAgICAgIH0sXG4gICAgICBhZGRlZGZpbGU6IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgdmFyIG5vZGUsIHJlbW92ZUZpbGVFdmVudCwgcmVtb3ZlTGluaywgX2ksIF9qLCBfaywgX2xlbiwgX2xlbjEsIF9sZW4yLCBfcmVmLCBfcmVmMSwgX3JlZjIsIF9yZXN1bHRzO1xuICAgICAgICBpZiAodGhpcy5lbGVtZW50ID09PSB0aGlzLnByZXZpZXdzQ29udGFpbmVyKSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1zdGFydGVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByZXZpZXdzQ29udGFpbmVyKSB7XG4gICAgICAgICAgZmlsZS5wcmV2aWV3RWxlbWVudCA9IERyb3B6b25lLmNyZWF0ZUVsZW1lbnQodGhpcy5vcHRpb25zLnByZXZpZXdUZW1wbGF0ZS50cmltKCkpO1xuICAgICAgICAgIGZpbGUucHJldmlld1RlbXBsYXRlID0gZmlsZS5wcmV2aWV3RWxlbWVudDtcbiAgICAgICAgICB0aGlzLnByZXZpZXdzQ29udGFpbmVyLmFwcGVuZENoaWxkKGZpbGUucHJldmlld0VsZW1lbnQpO1xuICAgICAgICAgIF9yZWYgPSBmaWxlLnByZXZpZXdFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1kei1uYW1lXVwiKTtcbiAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgIG5vZGUgPSBfcmVmW19pXTtcbiAgICAgICAgICAgIG5vZGUudGV4dENvbnRlbnQgPSB0aGlzLl9yZW5hbWVGaWxlbmFtZShmaWxlLm5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfcmVmMSA9IGZpbGUucHJldmlld0VsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWR6LXNpemVdXCIpO1xuICAgICAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IF9yZWYxLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICAgICAgbm9kZSA9IF9yZWYxW19qXTtcbiAgICAgICAgICAgIG5vZGUuaW5uZXJIVE1MID0gdGhpcy5maWxlc2l6ZShmaWxlLnNpemUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFkZFJlbW92ZUxpbmtzKSB7XG4gICAgICAgICAgICBmaWxlLl9yZW1vdmVMaW5rID0gRHJvcHpvbmUuY3JlYXRlRWxlbWVudChcIjxhIGNsYXNzPVxcXCJkei1yZW1vdmVcXFwiIGhyZWY9XFxcImphdmFzY3JpcHQ6dW5kZWZpbmVkO1xcXCIgZGF0YS1kei1yZW1vdmU+XCIgKyB0aGlzLm9wdGlvbnMuZGljdFJlbW92ZUZpbGUgKyBcIjwvYT5cIik7XG4gICAgICAgICAgICBmaWxlLnByZXZpZXdFbGVtZW50LmFwcGVuZENoaWxkKGZpbGUuX3JlbW92ZUxpbmspO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZW1vdmVGaWxlRXZlbnQgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgaWYgKGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5VUExPQURJTkcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRHJvcHpvbmUuY29uZmlybShfdGhpcy5vcHRpb25zLmRpY3RDYW5jZWxVcGxvYWRDb25maXJtYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnJlbW92ZUZpbGUoZmlsZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMuZGljdFJlbW92ZUZpbGVDb25maXJtYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBEcm9wem9uZS5jb25maXJtKF90aGlzLm9wdGlvbnMuZGljdFJlbW92ZUZpbGVDb25maXJtYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMucmVtb3ZlRmlsZShmaWxlKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMucmVtb3ZlRmlsZShmaWxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcyk7XG4gICAgICAgICAgX3JlZjIgPSBmaWxlLnByZXZpZXdFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1kei1yZW1vdmVdXCIpO1xuICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChfayA9IDAsIF9sZW4yID0gX3JlZjIubGVuZ3RoOyBfayA8IF9sZW4yOyBfaysrKSB7XG4gICAgICAgICAgICByZW1vdmVMaW5rID0gX3JlZjJbX2tdO1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChyZW1vdmVMaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByZW1vdmVGaWxlRXZlbnQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVtb3ZlZGZpbGU6IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgIGlmIChmaWxlLnByZXZpZXdFbGVtZW50KSB7XG4gICAgICAgICAgaWYgKChfcmVmID0gZmlsZS5wcmV2aWV3RWxlbWVudCkgIT0gbnVsbCkge1xuICAgICAgICAgICAgX3JlZi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGZpbGUucHJldmlld0VsZW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fdXBkYXRlTWF4RmlsZXNSZWFjaGVkQ2xhc3MoKTtcbiAgICAgIH0sXG4gICAgICB0aHVtYm5haWw6IGZ1bmN0aW9uKGZpbGUsIGRhdGFVcmwpIHtcbiAgICAgICAgdmFyIHRodW1ibmFpbEVsZW1lbnQsIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgICBpZiAoZmlsZS5wcmV2aWV3RWxlbWVudCkge1xuICAgICAgICAgIGZpbGUucHJldmlld0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImR6LWZpbGUtcHJldmlld1wiKTtcbiAgICAgICAgICBfcmVmID0gZmlsZS5wcmV2aWV3RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtZHotdGh1bWJuYWlsXVwiKTtcbiAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgIHRodW1ibmFpbEVsZW1lbnQgPSBfcmVmW19pXTtcbiAgICAgICAgICAgIHRodW1ibmFpbEVsZW1lbnQuYWx0ID0gZmlsZS5uYW1lO1xuICAgICAgICAgICAgdGh1bWJuYWlsRWxlbWVudC5zcmMgPSBkYXRhVXJsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc2V0VGltZW91dCgoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmaWxlLnByZXZpZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1pbWFnZS1wcmV2aWV3XCIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSh0aGlzKSksIDEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKGZpbGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIG5vZGUsIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgICAgaWYgKGZpbGUucHJldmlld0VsZW1lbnQpIHtcbiAgICAgICAgICBmaWxlLnByZXZpZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1lcnJvclwiKTtcbiAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgIT09IFwiU3RyaW5nXCIgJiYgbWVzc2FnZS5lcnJvcikge1xuICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UuZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIF9yZWYgPSBmaWxlLnByZXZpZXdFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1kei1lcnJvcm1lc3NhZ2VdXCIpO1xuICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICBub2RlID0gX3JlZltfaV07XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKG5vZGUudGV4dENvbnRlbnQgPSBtZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZXJyb3JtdWx0aXBsZTogbm9vcCxcbiAgICAgIHByb2Nlc3Npbmc6IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgaWYgKGZpbGUucHJldmlld0VsZW1lbnQpIHtcbiAgICAgICAgICBmaWxlLnByZXZpZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1wcm9jZXNzaW5nXCIpO1xuICAgICAgICAgIGlmIChmaWxlLl9yZW1vdmVMaW5rKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZS5fcmVtb3ZlTGluay50ZXh0Q29udGVudCA9IHRoaXMub3B0aW9ucy5kaWN0Q2FuY2VsVXBsb2FkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHByb2Nlc3NpbmdtdWx0aXBsZTogbm9vcCxcbiAgICAgIHVwbG9hZHByb2dyZXNzOiBmdW5jdGlvbihmaWxlLCBwcm9ncmVzcywgYnl0ZXNTZW50KSB7XG4gICAgICAgIHZhciBub2RlLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgIGlmIChmaWxlLnByZXZpZXdFbGVtZW50KSB7XG4gICAgICAgICAgX3JlZiA9IGZpbGUucHJldmlld0VsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWR6LXVwbG9hZHByb2dyZXNzXVwiKTtcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgbm9kZSA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICdQUk9HUkVTUycpIHtcbiAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChub2RlLnZhbHVlID0gcHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChub2RlLnN0eWxlLndpZHRoID0gXCJcIiArIHByb2dyZXNzICsgXCIlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0b3RhbHVwbG9hZHByb2dyZXNzOiBub29wLFxuICAgICAgc2VuZGluZzogbm9vcCxcbiAgICAgIHNlbmRpbmdtdWx0aXBsZTogbm9vcCxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgaWYgKGZpbGUucHJldmlld0VsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gZmlsZS5wcmV2aWV3RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotc3VjY2Vzc1wiKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3NtdWx0aXBsZTogbm9vcCxcbiAgICAgIGNhbmNlbGVkOiBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVtaXQoXCJlcnJvclwiLCBmaWxlLCBcIlVwbG9hZCBjYW5jZWxlZC5cIik7XG4gICAgICB9LFxuICAgICAgY2FuY2VsZWRtdWx0aXBsZTogbm9vcCxcbiAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIGlmIChmaWxlLl9yZW1vdmVMaW5rKSB7XG4gICAgICAgICAgZmlsZS5fcmVtb3ZlTGluay50ZXh0Q29udGVudCA9IHRoaXMub3B0aW9ucy5kaWN0UmVtb3ZlRmlsZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsZS5wcmV2aWV3RWxlbWVudCkge1xuICAgICAgICAgIHJldHVybiBmaWxlLnByZXZpZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1jb21wbGV0ZVwiKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbXBsZXRlbXVsdGlwbGU6IG5vb3AsXG4gICAgICBtYXhmaWxlc2V4Y2VlZGVkOiBub29wLFxuICAgICAgbWF4ZmlsZXNyZWFjaGVkOiBub29wLFxuICAgICAgcXVldWVjb21wbGV0ZTogbm9vcCxcbiAgICAgIGFkZGVkZmlsZXM6IG5vb3AsXG4gICAgICBwcmV2aWV3VGVtcGxhdGU6IFwiPGRpdiBjbGFzcz1cXFwiZHotcHJldmlldyBkei1maWxlLXByZXZpZXdcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwiZHotaW1hZ2VcXFwiPjxpbWcgZGF0YS1kei10aHVtYm5haWwgLz48L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImR6LWRldGFpbHNcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJkei1zaXplXFxcIj48c3BhbiBkYXRhLWR6LXNpemU+PC9zcGFuPjwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJkei1maWxlbmFtZVxcXCI+PHNwYW4gZGF0YS1kei1uYW1lPjwvc3Bhbj48L2Rpdj5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiZHotcHJvZ3Jlc3NcXFwiPjxzcGFuIGNsYXNzPVxcXCJkei11cGxvYWRcXFwiIGRhdGEtZHotdXBsb2FkcHJvZ3Jlc3M+PC9zcGFuPjwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiZHotZXJyb3ItbWVzc2FnZVxcXCI+PHNwYW4gZGF0YS1kei1lcnJvcm1lc3NhZ2U+PC9zcGFuPjwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiZHotc3VjY2Vzcy1tYXJrXFxcIj5cXG4gICAgPHN2ZyB3aWR0aD1cXFwiNTRweFxcXCIgaGVpZ2h0PVxcXCI1NHB4XFxcIiB2aWV3Qm94PVxcXCIwIDAgNTQgNTRcXFwiIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgeG1sbnM6c2tldGNoPVxcXCJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnNcXFwiPlxcbiAgICAgIDx0aXRsZT5DaGVjazwvdGl0bGU+XFxuICAgICAgPGRlZnM+PC9kZWZzPlxcbiAgICAgIDxnIGlkPVxcXCJQYWdlLTFcXFwiIHN0cm9rZT1cXFwibm9uZVxcXCIgc3Ryb2tlLXdpZHRoPVxcXCIxXFxcIiBmaWxsPVxcXCJub25lXFxcIiBmaWxsLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIHNrZXRjaDp0eXBlPVxcXCJNU1BhZ2VcXFwiPlxcbiAgICAgICAgPHBhdGggZD1cXFwiTTIzLjUsMzEuODQzMTQ1OCBMMTcuNTg1MjQxOSwyNS45MjgzODc3IEMxNi4wMjQ4MjUzLDI0LjM2Nzk3MTEgMTMuNDkxMDI5NCwyNC4zNjY4MzUgMTEuOTI4OTMyMiwyNS45Mjg5MzIyIEMxMC4zNzAwMTM2LDI3LjQ4Nzg1MDggMTAuMzY2NTkxMiwzMC4wMjM0NDU1IDExLjkyODM4NzcsMzEuNTg1MjQxOSBMMjAuNDE0NzU4MSw0MC4wNzE2MTIzIEMyMC41MTMzOTk5LDQwLjE3MDI1NDEgMjAuNjE1OTMxNSw0MC4yNjI2NjQ5IDIwLjcyMTg2MTUsNDAuMzQ4ODQzNSBDMjIuMjgzNTY2OSw0MS44NzI1NjUxIDI0Ljc5NDIzNCw0MS44NjI2MjAyIDI2LjM0NjE1NjQsNDAuMzEwNjk3OCBMNDMuMzEwNjk3OCwyMy4zNDYxNTY0IEM0NC44NzcxMDIxLDIxLjc3OTc1MjEgNDQuODc1ODA1NywxOS4yNDgzODg3IDQzLjMxMzcwODUsMTcuNjg2MjkxNSBDNDEuNzU0Nzg5OSwxNi4xMjczNzI5IDM5LjIxNzYwMzUsMTYuMTI1NTQyMiAzNy42NTM4NDM2LDE3LjY4OTMwMjIgTDIzLjUsMzEuODQzMTQ1OCBaIE0yNyw1MyBDNDEuMzU5NDAzNSw1MyA1Myw0MS4zNTk0MDM1IDUzLDI3IEM1MywxMi42NDA1OTY1IDQxLjM1OTQwMzUsMSAyNywxIEMxMi42NDA1OTY1LDEgMSwxMi42NDA1OTY1IDEsMjcgQzEsNDEuMzU5NDAzNSAxMi42NDA1OTY1LDUzIDI3LDUzIFpcXFwiIGlkPVxcXCJPdmFsLTJcXFwiIHN0cm9rZS1vcGFjaXR5PVxcXCIwLjE5ODc5NDE1OFxcXCIgc3Ryb2tlPVxcXCIjNzQ3NDc0XFxcIiBmaWxsLW9wYWNpdHk9XFxcIjAuODE2NTE5NDc1XFxcIiBmaWxsPVxcXCIjRkZGRkZGXFxcIiBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIj48L3BhdGg+XFxuICAgICAgPC9nPlxcbiAgICA8L3N2Zz5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiZHotZXJyb3ItbWFya1xcXCI+XFxuICAgIDxzdmcgd2lkdGg9XFxcIjU0cHhcXFwiIGhlaWdodD1cXFwiNTRweFxcXCIgdmlld0JveD1cXFwiMCAwIDU0IDU0XFxcIiB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIj5cXG4gICAgICA8dGl0bGU+RXJyb3I8L3RpdGxlPlxcbiAgICAgIDxkZWZzPjwvZGVmcz5cXG4gICAgICA8ZyBpZD1cXFwiUGFnZS0xXFxcIiBzdHJva2U9XFxcIm5vbmVcXFwiIHN0cm9rZS13aWR0aD1cXFwiMVxcXCIgZmlsbD1cXFwibm9uZVxcXCIgZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBza2V0Y2g6dHlwZT1cXFwiTVNQYWdlXFxcIj5cXG4gICAgICAgIDxnIGlkPVxcXCJDaGVjay0rLU92YWwtMlxcXCIgc2tldGNoOnR5cGU9XFxcIk1TTGF5ZXJHcm91cFxcXCIgc3Ryb2tlPVxcXCIjNzQ3NDc0XFxcIiBzdHJva2Utb3BhY2l0eT1cXFwiMC4xOTg3OTQxNThcXFwiIGZpbGw9XFxcIiNGRkZGRkZcXFwiIGZpbGwtb3BhY2l0eT1cXFwiMC44MTY1MTk0NzVcXFwiPlxcbiAgICAgICAgICA8cGF0aCBkPVxcXCJNMzIuNjU2ODU0MiwyOSBMMzguMzEwNjk3OCwyMy4zNDYxNTY0IEMzOS44NzcxMDIxLDIxLjc3OTc1MjEgMzkuODc1ODA1NywxOS4yNDgzODg3IDM4LjMxMzcwODUsMTcuNjg2MjkxNSBDMzYuNzU0Nzg5OSwxNi4xMjczNzI5IDM0LjIxNzYwMzUsMTYuMTI1NTQyMiAzMi42NTM4NDM2LDE3LjY4OTMwMjIgTDI3LDIzLjM0MzE0NTggTDIxLjM0NjE1NjQsMTcuNjg5MzAyMiBDMTkuNzgyMzk2NSwxNi4xMjU1NDIyIDE3LjI0NTIxMDEsMTYuMTI3MzcyOSAxNS42ODYyOTE1LDE3LjY4NjI5MTUgQzE0LjEyNDE5NDMsMTkuMjQ4Mzg4NyAxNC4xMjI4OTc5LDIxLjc3OTc1MjEgMTUuNjg5MzAyMiwyMy4zNDYxNTY0IEwyMS4zNDMxNDU4LDI5IEwxNS42ODkzMDIyLDM0LjY1Mzg0MzYgQzE0LjEyMjg5NzksMzYuMjIwMjQ3OSAxNC4xMjQxOTQzLDM4Ljc1MTYxMTMgMTUuNjg2MjkxNSw0MC4zMTM3MDg1IEMxNy4yNDUyMTAxLDQxLjg3MjYyNzEgMTkuNzgyMzk2NSw0MS44NzQ0NTc4IDIxLjM0NjE1NjQsNDAuMzEwNjk3OCBMMjcsMzQuNjU2ODU0MiBMMzIuNjUzODQzNiw0MC4zMTA2OTc4IEMzNC4yMTc2MDM1LDQxLjg3NDQ1NzggMzYuNzU0Nzg5OSw0MS44NzI2MjcxIDM4LjMxMzcwODUsNDAuMzEzNzA4NSBDMzkuODc1ODA1NywzOC43NTE2MTEzIDM5Ljg3NzEwMjEsMzYuMjIwMjQ3OSAzOC4zMTA2OTc4LDM0LjY1Mzg0MzYgTDMyLjY1Njg1NDIsMjkgWiBNMjcsNTMgQzQxLjM1OTQwMzUsNTMgNTMsNDEuMzU5NDAzNSA1MywyNyBDNTMsMTIuNjQwNTk2NSA0MS4zNTk0MDM1LDEgMjcsMSBDMTIuNjQwNTk2NSwxIDEsMTIuNjQwNTk2NSAxLDI3IEMxLDQxLjM1OTQwMzUgMTIuNjQwNTk2NSw1MyAyNyw1MyBaXFxcIiBpZD1cXFwiT3ZhbC0yXFxcIiBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIj48L3BhdGg+XFxuICAgICAgICA8L2c+XFxuICAgICAgPC9nPlxcbiAgICA8L3N2Zz5cXG4gIDwvZGl2PlxcbjwvZGl2PlwiXG4gICAgfTtcblxuICAgIGV4dGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGtleSwgb2JqZWN0LCBvYmplY3RzLCB0YXJnZXQsIHZhbCwgX2ksIF9sZW47XG4gICAgICB0YXJnZXQgPSBhcmd1bWVudHNbMF0sIG9iamVjdHMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBvYmplY3RzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIG9iamVjdCA9IG9iamVjdHNbX2ldO1xuICAgICAgICBmb3IgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICB2YWwgPSBvYmplY3Rba2V5XTtcbiAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gRHJvcHpvbmUoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgdmFyIGVsZW1lbnRPcHRpb25zLCBmYWxsYmFjaywgX3JlZjtcbiAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLnZlcnNpb24gPSBEcm9wem9uZS52ZXJzaW9uO1xuICAgICAgdGhpcy5kZWZhdWx0T3B0aW9ucy5wcmV2aWV3VGVtcGxhdGUgPSB0aGlzLmRlZmF1bHRPcHRpb25zLnByZXZpZXdUZW1wbGF0ZS5yZXBsYWNlKC9cXG4qL2csIFwiXCIpO1xuICAgICAgdGhpcy5jbGlja2FibGVFbGVtZW50cyA9IFtdO1xuICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICAgIHRoaXMuZmlsZXMgPSBbXTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5lbGVtZW50ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5lbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIGlmICghKHRoaXMuZWxlbWVudCAmJiAodGhpcy5lbGVtZW50Lm5vZGVUeXBlICE9IG51bGwpKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGRyb3B6b25lIGVsZW1lbnQuXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZWxlbWVudC5kcm9wem9uZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEcm9wem9uZSBhbHJlYWR5IGF0dGFjaGVkLlwiKTtcbiAgICAgIH1cbiAgICAgIERyb3B6b25lLmluc3RhbmNlcy5wdXNoKHRoaXMpO1xuICAgICAgdGhpcy5lbGVtZW50LmRyb3B6b25lID0gdGhpcztcbiAgICAgIGVsZW1lbnRPcHRpb25zID0gKF9yZWYgPSBEcm9wem9uZS5vcHRpb25zRm9yRWxlbWVudCh0aGlzLmVsZW1lbnQpKSAhPSBudWxsID8gX3JlZiA6IHt9O1xuICAgICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHt9LCB0aGlzLmRlZmF1bHRPcHRpb25zLCBlbGVtZW50T3B0aW9ucywgb3B0aW9ucyAhPSBudWxsID8gb3B0aW9ucyA6IHt9KTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VGYWxsYmFjayB8fCAhRHJvcHpvbmUuaXNCcm93c2VyU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5mYWxsYmFjay5jYWxsKHRoaXMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cmwgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMudXJsID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImFjdGlvblwiKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5vcHRpb25zLnVybCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBVUkwgcHJvdmlkZWQuXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hY2NlcHRlZEZpbGVzICYmIHRoaXMub3B0aW9ucy5hY2NlcHRlZE1pbWVUeXBlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgY2FuJ3QgcHJvdmlkZSBib3RoICdhY2NlcHRlZEZpbGVzJyBhbmQgJ2FjY2VwdGVkTWltZVR5cGVzJy4gJ2FjY2VwdGVkTWltZVR5cGVzJyBpcyBkZXByZWNhdGVkLlwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWNjZXB0ZWRNaW1lVHlwZXMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLmFjY2VwdGVkRmlsZXMgPSB0aGlzLm9wdGlvbnMuYWNjZXB0ZWRNaW1lVHlwZXM7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbnMuYWNjZXB0ZWRNaW1lVHlwZXM7XG4gICAgICB9XG4gICAgICB0aGlzLm9wdGlvbnMubWV0aG9kID0gdGhpcy5vcHRpb25zLm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICAgICAgaWYgKChmYWxsYmFjayA9IHRoaXMuZ2V0RXhpc3RpbmdGYWxsYmFjaygpKSAmJiBmYWxsYmFjay5wYXJlbnROb2RlKSB7XG4gICAgICAgIGZhbGxiYWNrLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZmFsbGJhY2spO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wcmV2aWV3c0NvbnRhaW5lciAhPT0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wcmV2aWV3c0NvbnRhaW5lcikge1xuICAgICAgICAgIHRoaXMucHJldmlld3NDb250YWluZXIgPSBEcm9wem9uZS5nZXRFbGVtZW50KHRoaXMub3B0aW9ucy5wcmV2aWV3c0NvbnRhaW5lciwgXCJwcmV2aWV3c0NvbnRhaW5lclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnByZXZpZXdzQ29udGFpbmVyID0gdGhpcy5lbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNsaWNrYWJsZSkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsaWNrYWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuY2xpY2thYmxlRWxlbWVudHMgPSBbdGhpcy5lbGVtZW50XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNsaWNrYWJsZUVsZW1lbnRzID0gRHJvcHpvbmUuZ2V0RWxlbWVudHModGhpcy5vcHRpb25zLmNsaWNrYWJsZSwgXCJjbGlja2FibGVcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5nZXRBY2NlcHRlZEZpbGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3JlZiA9IHRoaXMuZmlsZXM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBfcmVmW19pXTtcbiAgICAgICAgaWYgKGZpbGUuYWNjZXB0ZWQpIHtcbiAgICAgICAgICBfcmVzdWx0cy5wdXNoKGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5nZXRSZWplY3RlZEZpbGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3JlZiA9IHRoaXMuZmlsZXM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBfcmVmW19pXTtcbiAgICAgICAgaWYgKCFmaWxlLmFjY2VwdGVkKSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChmaWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZ2V0RmlsZXNXaXRoU3RhdHVzID0gZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3JlZiA9IHRoaXMuZmlsZXM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBfcmVmW19pXTtcbiAgICAgICAgaWYgKGZpbGUuc3RhdHVzID09PSBzdGF0dXMpIHtcbiAgICAgICAgICBfcmVzdWx0cy5wdXNoKGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5nZXRRdWV1ZWRGaWxlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsZXNXaXRoU3RhdHVzKERyb3B6b25lLlFVRVVFRCk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5nZXRVcGxvYWRpbmdGaWxlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsZXNXaXRoU3RhdHVzKERyb3B6b25lLlVQTE9BRElORyk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5nZXRBZGRlZEZpbGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGaWxlc1dpdGhTdGF0dXMoRHJvcHpvbmUuQURERUQpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZ2V0QWN0aXZlRmlsZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmaWxlLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVmID0gdGhpcy5maWxlcztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgZmlsZSA9IF9yZWZbX2ldO1xuICAgICAgICBpZiAoZmlsZS5zdGF0dXMgPT09IERyb3B6b25lLlVQTE9BRElORyB8fCBmaWxlLnN0YXR1cyA9PT0gRHJvcHpvbmUuUVVFVUVEKSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChmaWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGV2ZW50TmFtZSwgbm9Qcm9wYWdhdGlvbiwgc2V0dXBIaWRkZW5GaWxlSW5wdXQsIF9pLCBfbGVuLCBfcmVmLCBfcmVmMTtcbiAgICAgIGlmICh0aGlzLmVsZW1lbnQudGFnTmFtZSA9PT0gXCJmb3JtXCIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImVuY3R5cGVcIiwgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKSAmJiAhdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHotbWVzc2FnZVwiKSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoRHJvcHpvbmUuY3JlYXRlRWxlbWVudChcIjxkaXYgY2xhc3M9XFxcImR6LWRlZmF1bHQgZHotbWVzc2FnZVxcXCI+PHNwYW4+XCIgKyB0aGlzLm9wdGlvbnMuZGljdERlZmF1bHRNZXNzYWdlICsgXCI8L3NwYW4+PC9kaXY+XCIpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNsaWNrYWJsZUVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBzZXR1cEhpZGRlbkZpbGVJbnB1dCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5oaWRkZW5GaWxlSW5wdXQpIHtcbiAgICAgICAgICAgICAgX3RoaXMuaGlkZGVuRmlsZUlucHV0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoX3RoaXMuaGlkZGVuRmlsZUlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiZmlsZVwiKTtcbiAgICAgICAgICAgIGlmICgoX3RoaXMub3B0aW9ucy5tYXhGaWxlcyA9PSBudWxsKSB8fCBfdGhpcy5vcHRpb25zLm1heEZpbGVzID4gMSkge1xuICAgICAgICAgICAgICBfdGhpcy5oaWRkZW5GaWxlSW5wdXQuc2V0QXR0cmlidXRlKFwibXVsdGlwbGVcIiwgXCJtdWx0aXBsZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5jbGFzc05hbWUgPSBcImR6LWhpZGRlbi1pbnB1dFwiO1xuICAgICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMuYWNjZXB0ZWRGaWxlcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5zZXRBdHRyaWJ1dGUoXCJhY2NlcHRcIiwgX3RoaXMub3B0aW9ucy5hY2NlcHRlZEZpbGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmNhcHR1cmUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfdGhpcy5oaWRkZW5GaWxlSW5wdXQuc2V0QXR0cmlidXRlKFwiY2FwdHVyZVwiLCBfdGhpcy5vcHRpb25zLmNhcHR1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMuaGlkZGVuRmlsZUlucHV0LnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgICAgICAgX3RoaXMuaGlkZGVuRmlsZUlucHV0LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgICAgICAgICAgX3RoaXMuaGlkZGVuRmlsZUlucHV0LnN0eWxlLnRvcCA9IFwiMFwiO1xuICAgICAgICAgICAgX3RoaXMuaGlkZGVuRmlsZUlucHV0LnN0eWxlLmxlZnQgPSBcIjBcIjtcbiAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5zdHlsZS5oZWlnaHQgPSBcIjBcIjtcbiAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5zdHlsZS53aWR0aCA9IFwiMFwiO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihfdGhpcy5vcHRpb25zLmhpZGRlbklucHV0Q29udGFpbmVyKS5hcHBlbmRDaGlsZChfdGhpcy5oaWRkZW5GaWxlSW5wdXQpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgZmlsZSwgZmlsZXMsIF9pLCBfbGVuO1xuICAgICAgICAgICAgICBmaWxlcyA9IF90aGlzLmhpZGRlbkZpbGVJbnB1dC5maWxlcztcbiAgICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZmlsZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgIGZpbGUgPSBmaWxlc1tfaV07XG4gICAgICAgICAgICAgICAgICBfdGhpcy5hZGRGaWxlKGZpbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBfdGhpcy5lbWl0KFwiYWRkZWRmaWxlc1wiLCBmaWxlcyk7XG4gICAgICAgICAgICAgIHJldHVybiBzZXR1cEhpZGRlbkZpbGVJbnB1dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcyk7XG4gICAgICAgIHNldHVwSGlkZGVuRmlsZUlucHV0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLlVSTCA9IChfcmVmID0gd2luZG93LlVSTCkgIT0gbnVsbCA/IF9yZWYgOiB3aW5kb3cud2Via2l0VVJMO1xuICAgICAgX3JlZjEgPSB0aGlzLmV2ZW50cztcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZjEubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgZXZlbnROYW1lID0gX3JlZjFbX2ldO1xuICAgICAgICB0aGlzLm9uKGV2ZW50TmFtZSwgdGhpcy5vcHRpb25zW2V2ZW50TmFtZV0pO1xuICAgICAgfVxuICAgICAgdGhpcy5vbihcInVwbG9hZHByb2dyZXNzXCIsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnVwZGF0ZVRvdGFsVXBsb2FkUHJvZ3Jlc3MoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMub24oXCJyZW1vdmVkZmlsZVwiLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy51cGRhdGVUb3RhbFVwbG9hZFByb2dyZXNzKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICB0aGlzLm9uKFwiY2FuY2VsZWRcIiwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmVtaXQoXCJjb21wbGV0ZVwiLCBmaWxlKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMub24oXCJjb21wbGV0ZVwiLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuZ2V0QWRkZWRGaWxlcygpLmxlbmd0aCA9PT0gMCAmJiBfdGhpcy5nZXRVcGxvYWRpbmdGaWxlcygpLmxlbmd0aCA9PT0gMCAmJiBfdGhpcy5nZXRRdWV1ZWRGaWxlcygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZW1pdChcInF1ZXVlY29tcGxldGVcIik7XG4gICAgICAgICAgICB9KSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgbm9Qcm9wYWdhdGlvbiA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICByZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBlLnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLmxpc3RlbmVycyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgIFwiZHJhZ3N0YXJ0XCI6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5lbWl0KFwiZHJhZ3N0YXJ0XCIsIGUpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkodGhpcyksXG4gICAgICAgICAgICBcImRyYWdlbnRlclwiOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBub1Byb3BhZ2F0aW9uKGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5lbWl0KFwiZHJhZ2VudGVyXCIsIGUpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkodGhpcyksXG4gICAgICAgICAgICBcImRyYWdvdmVyXCI6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciBlZmN0O1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBlZmN0ID0gZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHt9XG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJyA9PT0gZWZjdCB8fCAnbGlua01vdmUnID09PSBlZmN0ID8gJ21vdmUnIDogJ2NvcHknO1xuICAgICAgICAgICAgICAgIG5vUHJvcGFnYXRpb24oZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmVtaXQoXCJkcmFnb3ZlclwiLCBlKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKHRoaXMpLFxuICAgICAgICAgICAgXCJkcmFnbGVhdmVcIjogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmVtaXQoXCJkcmFnbGVhdmVcIiwgZSk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSh0aGlzKSxcbiAgICAgICAgICAgIFwiZHJvcFwiOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBub1Byb3BhZ2F0aW9uKGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5kcm9wKGUpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkodGhpcyksXG4gICAgICAgICAgICBcImRyYWdlbmRcIjogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmVtaXQoXCJkcmFnZW5kXCIsIGUpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkodGhpcylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF07XG4gICAgICB0aGlzLmNsaWNrYWJsZUVsZW1lbnRzLmZvckVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihjbGlja2FibGVFbGVtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmxpc3RlbmVycy5wdXNoKHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IGNsaWNrYWJsZUVsZW1lbnQsXG4gICAgICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICAgXCJjbGlja1wiOiBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGNsaWNrYWJsZUVsZW1lbnQgIT09IF90aGlzLmVsZW1lbnQpIHx8IChldnQudGFyZ2V0ID09PSBfdGhpcy5lbGVtZW50IHx8IERyb3B6b25lLmVsZW1lbnRJbnNpZGUoZXZ0LnRhcmdldCwgX3RoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmR6LW1lc3NhZ2VcIikpKSkge1xuICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZGVuRmlsZUlucHV0LmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICB0aGlzLmVuYWJsZSgpO1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5pbml0LmNhbGwodGhpcyk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgX3JlZjtcbiAgICAgIHRoaXMuZGlzYWJsZSgpO1xuICAgICAgdGhpcy5yZW1vdmVBbGxGaWxlcyh0cnVlKTtcbiAgICAgIGlmICgoX3JlZiA9IHRoaXMuaGlkZGVuRmlsZUlucHV0KSAhPSBudWxsID8gX3JlZi5wYXJlbnROb2RlIDogdm9pZCAwKSB7XG4gICAgICAgIHRoaXMuaGlkZGVuRmlsZUlucHV0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5oaWRkZW5GaWxlSW5wdXQpO1xuICAgICAgICB0aGlzLmhpZGRlbkZpbGVJbnB1dCA9IG51bGw7XG4gICAgICB9XG4gICAgICBkZWxldGUgdGhpcy5lbGVtZW50LmRyb3B6b25lO1xuICAgICAgcmV0dXJuIERyb3B6b25lLmluc3RhbmNlcy5zcGxpY2UoRHJvcHpvbmUuaW5zdGFuY2VzLmluZGV4T2YodGhpcyksIDEpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUudXBkYXRlVG90YWxVcGxvYWRQcm9ncmVzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFjdGl2ZUZpbGVzLCBmaWxlLCB0b3RhbEJ5dGVzLCB0b3RhbEJ5dGVzU2VudCwgdG90YWxVcGxvYWRQcm9ncmVzcywgX2ksIF9sZW4sIF9yZWY7XG4gICAgICB0b3RhbEJ5dGVzU2VudCA9IDA7XG4gICAgICB0b3RhbEJ5dGVzID0gMDtcbiAgICAgIGFjdGl2ZUZpbGVzID0gdGhpcy5nZXRBY3RpdmVGaWxlcygpO1xuICAgICAgaWYgKGFjdGl2ZUZpbGVzLmxlbmd0aCkge1xuICAgICAgICBfcmVmID0gdGhpcy5nZXRBY3RpdmVGaWxlcygpO1xuICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBmaWxlID0gX3JlZltfaV07XG4gICAgICAgICAgdG90YWxCeXRlc1NlbnQgKz0gZmlsZS51cGxvYWQuYnl0ZXNTZW50O1xuICAgICAgICAgIHRvdGFsQnl0ZXMgKz0gZmlsZS51cGxvYWQudG90YWw7XG4gICAgICAgIH1cbiAgICAgICAgdG90YWxVcGxvYWRQcm9ncmVzcyA9IDEwMCAqIHRvdGFsQnl0ZXNTZW50IC8gdG90YWxCeXRlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvdGFsVXBsb2FkUHJvZ3Jlc3MgPSAxMDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5lbWl0KFwidG90YWx1cGxvYWRwcm9ncmVzc1wiLCB0b3RhbFVwbG9hZFByb2dyZXNzLCB0b3RhbEJ5dGVzLCB0b3RhbEJ5dGVzU2VudCk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5fZ2V0UGFyYW1OYW1lID0gZnVuY3Rpb24obikge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMucGFyYW1OYW1lID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJhbU5hbWUobik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIiArIHRoaXMub3B0aW9ucy5wYXJhbU5hbWUgKyAodGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlID8gXCJbXCIgKyBuICsgXCJdXCIgOiBcIlwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLl9yZW5hbWVGaWxlbmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLnJlbmFtZUZpbGVuYW1lICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnJlbmFtZUZpbGVuYW1lKG5hbWUpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZ2V0RmFsbGJhY2tGb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZXhpc3RpbmdGYWxsYmFjaywgZmllbGRzLCBmaWVsZHNTdHJpbmcsIGZvcm07XG4gICAgICBpZiAoZXhpc3RpbmdGYWxsYmFjayA9IHRoaXMuZ2V0RXhpc3RpbmdGYWxsYmFjaygpKSB7XG4gICAgICAgIHJldHVybiBleGlzdGluZ0ZhbGxiYWNrO1xuICAgICAgfVxuICAgICAgZmllbGRzU3RyaW5nID0gXCI8ZGl2IGNsYXNzPVxcXCJkei1mYWxsYmFja1xcXCI+XCI7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRpY3RGYWxsYmFja1RleHQpIHtcbiAgICAgICAgZmllbGRzU3RyaW5nICs9IFwiPHA+XCIgKyB0aGlzLm9wdGlvbnMuZGljdEZhbGxiYWNrVGV4dCArIFwiPC9wPlwiO1xuICAgICAgfVxuICAgICAgZmllbGRzU3RyaW5nICs9IFwiPGlucHV0IHR5cGU9XFxcImZpbGVcXFwiIG5hbWU9XFxcIlwiICsgKHRoaXMuX2dldFBhcmFtTmFtZSgwKSkgKyBcIlxcXCIgXCIgKyAodGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlID8gJ211bHRpcGxlPVwibXVsdGlwbGVcIicgOiB2b2lkIDApICsgXCIgLz48aW5wdXQgdHlwZT1cXFwic3VibWl0XFxcIiB2YWx1ZT1cXFwiVXBsb2FkIVxcXCI+PC9kaXY+XCI7XG4gICAgICBmaWVsZHMgPSBEcm9wem9uZS5jcmVhdGVFbGVtZW50KGZpZWxkc1N0cmluZyk7XG4gICAgICBpZiAodGhpcy5lbGVtZW50LnRhZ05hbWUgIT09IFwiRk9STVwiKSB7XG4gICAgICAgIGZvcm0gPSBEcm9wem9uZS5jcmVhdGVFbGVtZW50KFwiPGZvcm0gYWN0aW9uPVxcXCJcIiArIHRoaXMub3B0aW9ucy51cmwgKyBcIlxcXCIgZW5jdHlwZT1cXFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVxcXCIgbWV0aG9kPVxcXCJcIiArIHRoaXMub3B0aW9ucy5tZXRob2QgKyBcIlxcXCI+PC9mb3JtPlwiKTtcbiAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChmaWVsZHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImVuY3R5cGVcIiwgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwibWV0aG9kXCIsIHRoaXMub3B0aW9ucy5tZXRob2QpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZvcm0gIT0gbnVsbCA/IGZvcm0gOiBmaWVsZHM7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5nZXRFeGlzdGluZ0ZhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmFsbGJhY2ssIGdldEZhbGxiYWNrLCB0YWdOYW1lLCBfaSwgX2xlbiwgX3JlZjtcbiAgICAgIGdldEZhbGxiYWNrID0gZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICAgICAgdmFyIGVsLCBfaSwgX2xlbjtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBlbGVtZW50cy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIGVsID0gZWxlbWVudHNbX2ldO1xuICAgICAgICAgIGlmICgvKF58IClmYWxsYmFjaygkfCApLy50ZXN0KGVsLmNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBfcmVmID0gW1wiZGl2XCIsIFwiZm9ybVwiXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICB0YWdOYW1lID0gX3JlZltfaV07XG4gICAgICAgIGlmIChmYWxsYmFjayA9IGdldEZhbGxiYWNrKHRoaXMuZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsbGJhY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnNldHVwRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbGVtZW50TGlzdGVuZXJzLCBldmVudCwgbGlzdGVuZXIsIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZWYgPSB0aGlzLmxpc3RlbmVycztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgZWxlbWVudExpc3RlbmVycyA9IF9yZWZbX2ldO1xuICAgICAgICBfcmVzdWx0cy5wdXNoKChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX3JlZjEsIF9yZXN1bHRzMTtcbiAgICAgICAgICBfcmVmMSA9IGVsZW1lbnRMaXN0ZW5lcnMuZXZlbnRzO1xuICAgICAgICAgIF9yZXN1bHRzMSA9IFtdO1xuICAgICAgICAgIGZvciAoZXZlbnQgaW4gX3JlZjEpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gX3JlZjFbZXZlbnRdO1xuICAgICAgICAgICAgX3Jlc3VsdHMxLnB1c2goZWxlbWVudExpc3RlbmVycy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyLCBmYWxzZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHMxO1xuICAgICAgICB9KSgpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWxlbWVudExpc3RlbmVycywgZXZlbnQsIGxpc3RlbmVyLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVmID0gdGhpcy5saXN0ZW5lcnM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGVsZW1lbnRMaXN0ZW5lcnMgPSBfcmVmW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9yZWYxLCBfcmVzdWx0czE7XG4gICAgICAgICAgX3JlZjEgPSBlbGVtZW50TGlzdGVuZXJzLmV2ZW50cztcbiAgICAgICAgICBfcmVzdWx0czEgPSBbXTtcbiAgICAgICAgICBmb3IgKGV2ZW50IGluIF9yZWYxKSB7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IF9yZWYxW2V2ZW50XTtcbiAgICAgICAgICAgIF9yZXN1bHRzMS5wdXNoKGVsZW1lbnRMaXN0ZW5lcnMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lciwgZmFsc2UpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIF9yZXN1bHRzMTtcbiAgICAgICAgfSkoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgdGhpcy5jbGlja2FibGVFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImR6LWNsaWNrYWJsZVwiKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgICAgX3JlZiA9IHRoaXMuZmlsZXM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBfcmVmW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCh0aGlzLmNhbmNlbFVwbG9hZChmaWxlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2xpY2thYmxlRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1jbGlja2FibGVcIik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmZpbGVzaXplID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgdmFyIGN1dG9mZiwgaSwgc2VsZWN0ZWRTaXplLCBzZWxlY3RlZFVuaXQsIHVuaXQsIHVuaXRzLCBfaSwgX2xlbjtcbiAgICAgIHNlbGVjdGVkU2l6ZSA9IDA7XG4gICAgICBzZWxlY3RlZFVuaXQgPSBcImJcIjtcbiAgICAgIGlmIChzaXplID4gMCkge1xuICAgICAgICB1bml0cyA9IFsnVEInLCAnR0InLCAnTUInLCAnS0InLCAnYiddO1xuICAgICAgICBmb3IgKGkgPSBfaSA9IDAsIF9sZW4gPSB1bml0cy5sZW5ndGg7IF9pIDwgX2xlbjsgaSA9ICsrX2kpIHtcbiAgICAgICAgICB1bml0ID0gdW5pdHNbaV07XG4gICAgICAgICAgY3V0b2ZmID0gTWF0aC5wb3codGhpcy5vcHRpb25zLmZpbGVzaXplQmFzZSwgNCAtIGkpIC8gMTA7XG4gICAgICAgICAgaWYgKHNpemUgPj0gY3V0b2ZmKSB7XG4gICAgICAgICAgICBzZWxlY3RlZFNpemUgPSBzaXplIC8gTWF0aC5wb3codGhpcy5vcHRpb25zLmZpbGVzaXplQmFzZSwgNCAtIGkpO1xuICAgICAgICAgICAgc2VsZWN0ZWRVbml0ID0gdW5pdDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZWxlY3RlZFNpemUgPSBNYXRoLnJvdW5kKDEwICogc2VsZWN0ZWRTaXplKSAvIDEwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwiPHN0cm9uZz5cIiArIHNlbGVjdGVkU2l6ZSArIFwiPC9zdHJvbmc+IFwiICsgc2VsZWN0ZWRVbml0O1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuX3VwZGF0ZU1heEZpbGVzUmVhY2hlZENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoKHRoaXMub3B0aW9ucy5tYXhGaWxlcyAhPSBudWxsKSAmJiB0aGlzLmdldEFjY2VwdGVkRmlsZXMoKS5sZW5ndGggPj0gdGhpcy5vcHRpb25zLm1heEZpbGVzKSB7XG4gICAgICAgIGlmICh0aGlzLmdldEFjY2VwdGVkRmlsZXMoKS5sZW5ndGggPT09IHRoaXMub3B0aW9ucy5tYXhGaWxlcykge1xuICAgICAgICAgIHRoaXMuZW1pdCgnbWF4ZmlsZXNyZWFjaGVkJywgdGhpcy5maWxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotbWF4LWZpbGVzLXJlYWNoZWRcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkei1tYXgtZmlsZXMtcmVhY2hlZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmRyb3AgPSBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgZmlsZXMsIGl0ZW1zO1xuICAgICAgaWYgKCFlLmRhdGFUcmFuc2Zlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoXCJkcm9wXCIsIGUpO1xuICAgICAgZmlsZXMgPSBlLmRhdGFUcmFuc2Zlci5maWxlcztcbiAgICAgIHRoaXMuZW1pdChcImFkZGVkZmlsZXNcIiwgZmlsZXMpO1xuICAgICAgaWYgKGZpbGVzLmxlbmd0aCkge1xuICAgICAgICBpdGVtcyA9IGUuZGF0YVRyYW5zZmVyLml0ZW1zO1xuICAgICAgICBpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoICYmIChpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5ICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5fYWRkRmlsZXNGcm9tSXRlbXMoaXRlbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuaGFuZGxlRmlsZXMoZmlsZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5wYXN0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBpdGVtcywgX3JlZjtcbiAgICAgIGlmICgoZSAhPSBudWxsID8gKF9yZWYgPSBlLmNsaXBib2FyZERhdGEpICE9IG51bGwgPyBfcmVmLml0ZW1zIDogdm9pZCAwIDogdm9pZCAwKSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdChcInBhc3RlXCIsIGUpO1xuICAgICAgaXRlbXMgPSBlLmNsaXBib2FyZERhdGEuaXRlbXM7XG4gICAgICBpZiAoaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRGaWxlc0Zyb21JdGVtcyhpdGVtcyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5oYW5kbGVGaWxlcyA9IGZ1bmN0aW9uKGZpbGVzKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZmlsZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgZmlsZSA9IGZpbGVzW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCh0aGlzLmFkZEZpbGUoZmlsZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuX2FkZEZpbGVzRnJvbUl0ZW1zID0gZnVuY3Rpb24oaXRlbXMpIHtcbiAgICAgIHZhciBlbnRyeSwgaXRlbSwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gaXRlbXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgaXRlbSA9IGl0ZW1zW19pXTtcbiAgICAgICAgaWYgKChpdGVtLndlYmtpdEdldEFzRW50cnkgIT0gbnVsbCkgJiYgKGVudHJ5ID0gaXRlbS53ZWJraXRHZXRBc0VudHJ5KCkpKSB7XG4gICAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSkge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh0aGlzLmFkZEZpbGUoaXRlbS5nZXRBc0ZpbGUoKSkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godGhpcy5fYWRkRmlsZXNGcm9tRGlyZWN0b3J5KGVudHJ5LCBlbnRyeS5uYW1lKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbS5nZXRBc0ZpbGUgIT0gbnVsbCkge1xuICAgICAgICAgIGlmICgoaXRlbS5raW5kID09IG51bGwpIHx8IGl0ZW0ua2luZCA9PT0gXCJmaWxlXCIpIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godGhpcy5hZGRGaWxlKGl0ZW0uZ2V0QXNGaWxlKCkpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLl9hZGRGaWxlc0Zyb21EaXJlY3RvcnkgPSBmdW5jdGlvbihkaXJlY3RvcnksIHBhdGgpIHtcbiAgICAgIHZhciBkaXJSZWFkZXIsIGVycm9ySGFuZGxlciwgcmVhZEVudHJpZXM7XG4gICAgICBkaXJSZWFkZXIgPSBkaXJlY3RvcnkuY3JlYXRlUmVhZGVyKCk7XG4gICAgICBlcnJvckhhbmRsZXIgPSBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiYgY29uc29sZSAhPT0gbnVsbCA/IHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gXCJmdW5jdGlvblwiID8gY29uc29sZS5sb2coZXJyb3IpIDogdm9pZCAwIDogdm9pZCAwO1xuICAgICAgfTtcbiAgICAgIHJlYWRFbnRyaWVzID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZGlyUmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uKGVudHJpZXMpIHtcbiAgICAgICAgICAgIHZhciBlbnRyeSwgX2ksIF9sZW47XG4gICAgICAgICAgICBpZiAoZW50cmllcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZW50cmllcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICAgIGVudHJ5ID0gZW50cmllc1tfaV07XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSkge1xuICAgICAgICAgICAgICAgICAgZW50cnkuZmlsZShmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmlnbm9yZUhpZGRlbkZpbGVzICYmIGZpbGUubmFtZS5zdWJzdHJpbmcoMCwgMSkgPT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaWxlLmZ1bGxQYXRoID0gXCJcIiArIHBhdGggKyBcIi9cIiArIGZpbGUubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmFkZEZpbGUoZmlsZSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICAgICAgICBfdGhpcy5fYWRkRmlsZXNGcm9tRGlyZWN0b3J5KGVudHJ5LCBcIlwiICsgcGF0aCArIFwiL1wiICsgZW50cnkubmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlYWRFbnRyaWVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9LCBlcnJvckhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICByZXR1cm4gcmVhZEVudHJpZXMoKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKGZpbGUsIGRvbmUpIHtcbiAgICAgIGlmIChmaWxlLnNpemUgPiB0aGlzLm9wdGlvbnMubWF4RmlsZXNpemUgKiAxMDI0ICogMTAyNCkge1xuICAgICAgICByZXR1cm4gZG9uZSh0aGlzLm9wdGlvbnMuZGljdEZpbGVUb29CaWcucmVwbGFjZShcInt7ZmlsZXNpemV9fVwiLCBNYXRoLnJvdW5kKGZpbGUuc2l6ZSAvIDEwMjQgLyAxMC4yNCkgLyAxMDApLnJlcGxhY2UoXCJ7e21heEZpbGVzaXplfX1cIiwgdGhpcy5vcHRpb25zLm1heEZpbGVzaXplKSk7XG4gICAgICB9IGVsc2UgaWYgKCFEcm9wem9uZS5pc1ZhbGlkRmlsZShmaWxlLCB0aGlzLm9wdGlvbnMuYWNjZXB0ZWRGaWxlcykpIHtcbiAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5vcHRpb25zLmRpY3RJbnZhbGlkRmlsZVR5cGUpO1xuICAgICAgfSBlbHNlIGlmICgodGhpcy5vcHRpb25zLm1heEZpbGVzICE9IG51bGwpICYmIHRoaXMuZ2V0QWNjZXB0ZWRGaWxlcygpLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMubWF4RmlsZXMpIHtcbiAgICAgICAgZG9uZSh0aGlzLm9wdGlvbnMuZGljdE1heEZpbGVzRXhjZWVkZWQucmVwbGFjZShcInt7bWF4RmlsZXN9fVwiLCB0aGlzLm9wdGlvbnMubWF4RmlsZXMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW1pdChcIm1heGZpbGVzZXhjZWVkZWRcIiwgZmlsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmFjY2VwdC5jYWxsKHRoaXMsIGZpbGUsIGRvbmUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuYWRkRmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgIGZpbGUudXBsb2FkID0ge1xuICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgdG90YWw6IGZpbGUuc2l6ZSxcbiAgICAgICAgYnl0ZXNTZW50OiAwXG4gICAgICB9O1xuICAgICAgdGhpcy5maWxlcy5wdXNoKGZpbGUpO1xuICAgICAgZmlsZS5zdGF0dXMgPSBEcm9wem9uZS5BRERFRDtcbiAgICAgIHRoaXMuZW1pdChcImFkZGVkZmlsZVwiLCBmaWxlKTtcbiAgICAgIHRoaXMuX2VucXVldWVUaHVtYm5haWwoZmlsZSk7XG4gICAgICByZXR1cm4gdGhpcy5hY2NlcHQoZmlsZSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgZmlsZS5hY2NlcHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgX3RoaXMuX2Vycm9yUHJvY2Vzc2luZyhbZmlsZV0sIGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsZS5hY2NlcHRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5hdXRvUXVldWUpIHtcbiAgICAgICAgICAgICAgX3RoaXMuZW5xdWV1ZUZpbGUoZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfdGhpcy5fdXBkYXRlTWF4RmlsZXNSZWFjaGVkQ2xhc3MoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmVucXVldWVGaWxlcyA9IGZ1bmN0aW9uKGZpbGVzKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW47XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGZpbGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBmaWxlc1tfaV07XG4gICAgICAgIHRoaXMuZW5xdWV1ZUZpbGUoZmlsZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmVucXVldWVGaWxlID0gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgaWYgKGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5BRERFRCAmJiBmaWxlLmFjY2VwdGVkID09PSB0cnVlKSB7XG4gICAgICAgIGZpbGUuc3RhdHVzID0gRHJvcHpvbmUuUVVFVUVEO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9Qcm9jZXNzUXVldWUpIHtcbiAgICAgICAgICByZXR1cm4gc2V0VGltZW91dCgoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy5wcm9jZXNzUXVldWUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcykpLCAwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBmaWxlIGNhbid0IGJlIHF1ZXVlZCBiZWNhdXNlIGl0IGhhcyBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkIG9yIHdhcyByZWplY3RlZC5cIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5fdGh1bWJuYWlsUXVldWUgPSBbXTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5fcHJvY2Vzc2luZ1RodW1ibmFpbCA9IGZhbHNlO1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLl9lbnF1ZXVlVGh1bWJuYWlsID0gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5jcmVhdGVJbWFnZVRodW1ibmFpbHMgJiYgZmlsZS50eXBlLm1hdGNoKC9pbWFnZS4qLykgJiYgZmlsZS5zaXplIDw9IHRoaXMub3B0aW9ucy5tYXhUaHVtYm5haWxGaWxlc2l6ZSAqIDEwMjQgKiAxMDI0KSB7XG4gICAgICAgIHRoaXMuX3RodW1ibmFpbFF1ZXVlLnB1c2goZmlsZSk7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuX3Byb2Nlc3NUaHVtYm5haWxRdWV1ZSgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpKSwgMCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5fcHJvY2Vzc1RodW1ibmFpbFF1ZXVlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fcHJvY2Vzc2luZ1RodW1ibmFpbCB8fCB0aGlzLl90aHVtYm5haWxRdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fcHJvY2Vzc2luZ1RodW1ibmFpbCA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVUaHVtYm5haWwodGhpcy5fdGh1bWJuYWlsUXVldWUuc2hpZnQoKSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5fcHJvY2Vzc2luZ1RodW1ibmFpbCA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fcHJvY2Vzc1RodW1ibmFpbFF1ZXVlKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5yZW1vdmVGaWxlID0gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgaWYgKGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5VUExPQURJTkcpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxVcGxvYWQoZmlsZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmZpbGVzID0gd2l0aG91dCh0aGlzLmZpbGVzLCBmaWxlKTtcbiAgICAgIHRoaXMuZW1pdChcInJlbW92ZWRmaWxlXCIsIGZpbGUpO1xuICAgICAgaWYgKHRoaXMuZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVtaXQoXCJyZXNldFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnJlbW92ZUFsbEZpbGVzID0gZnVuY3Rpb24oY2FuY2VsSWZOZWNlc3NhcnkpIHtcbiAgICAgIHZhciBmaWxlLCBfaSwgX2xlbiwgX3JlZjtcbiAgICAgIGlmIChjYW5jZWxJZk5lY2Vzc2FyeSA9PSBudWxsKSB7XG4gICAgICAgIGNhbmNlbElmTmVjZXNzYXJ5ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBfcmVmID0gdGhpcy5maWxlcy5zbGljZSgpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBfcmVmW19pXTtcbiAgICAgICAgaWYgKGZpbGUuc3RhdHVzICE9PSBEcm9wem9uZS5VUExPQURJTkcgfHwgY2FuY2VsSWZOZWNlc3NhcnkpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUZpbGUoZmlsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuY3JlYXRlVGh1bWJuYWlsID0gZnVuY3Rpb24oZmlsZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBmaWxlUmVhZGVyO1xuICAgICAgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyO1xuICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChmaWxlLnR5cGUgPT09IFwiaW1hZ2Uvc3ZnK3htbFwiKSB7XG4gICAgICAgICAgICBfdGhpcy5lbWl0KFwidGh1bWJuYWlsXCIsIGZpbGUsIGZpbGVSZWFkZXIucmVzdWx0KTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfdGhpcy5jcmVhdGVUaHVtYm5haWxGcm9tVXJsKGZpbGUsIGZpbGVSZWFkZXIucmVzdWx0LCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIHJldHVybiBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5jcmVhdGVUaHVtYm5haWxGcm9tVXJsID0gZnVuY3Rpb24oZmlsZSwgaW1hZ2VVcmwsIGNhbGxiYWNrLCBjcm9zc09yaWdpbikge1xuICAgICAgdmFyIGltZztcbiAgICAgIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICBpZiAoY3Jvc3NPcmlnaW4pIHtcbiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gY3Jvc3NPcmlnaW47XG4gICAgICB9XG4gICAgICBpbWcub25sb2FkID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgY2FudmFzLCBjdHgsIHJlc2l6ZUluZm8sIHRodW1ibmFpbCwgX3JlZiwgX3JlZjEsIF9yZWYyLCBfcmVmMztcbiAgICAgICAgICBmaWxlLndpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICAgIGZpbGUuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgICByZXNpemVJbmZvID0gX3RoaXMub3B0aW9ucy5yZXNpemUuY2FsbChfdGhpcywgZmlsZSk7XG4gICAgICAgICAgaWYgKHJlc2l6ZUluZm8udHJnV2lkdGggPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzaXplSW5mby50cmdXaWR0aCA9IHJlc2l6ZUluZm8ub3B0V2lkdGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyZXNpemVJbmZvLnRyZ0hlaWdodCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXNpemVJbmZvLnRyZ0hlaWdodCA9IHJlc2l6ZUluZm8ub3B0SGVpZ2h0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgICAgY2FudmFzLndpZHRoID0gcmVzaXplSW5mby50cmdXaWR0aDtcbiAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gcmVzaXplSW5mby50cmdIZWlnaHQ7XG4gICAgICAgICAgZHJhd0ltYWdlSU9TRml4KGN0eCwgaW1nLCAoX3JlZiA9IHJlc2l6ZUluZm8uc3JjWCkgIT0gbnVsbCA/IF9yZWYgOiAwLCAoX3JlZjEgPSByZXNpemVJbmZvLnNyY1kpICE9IG51bGwgPyBfcmVmMSA6IDAsIHJlc2l6ZUluZm8uc3JjV2lkdGgsIHJlc2l6ZUluZm8uc3JjSGVpZ2h0LCAoX3JlZjIgPSByZXNpemVJbmZvLnRyZ1gpICE9IG51bGwgPyBfcmVmMiA6IDAsIChfcmVmMyA9IHJlc2l6ZUluZm8udHJnWSkgIT0gbnVsbCA/IF9yZWYzIDogMCwgcmVzaXplSW5mby50cmdXaWR0aCwgcmVzaXplSW5mby50cmdIZWlnaHQpO1xuICAgICAgICAgIHRodW1ibmFpbCA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICAgICAgX3RoaXMuZW1pdChcInRodW1ibmFpbFwiLCBmaWxlLCB0aHVtYm5haWwpO1xuICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIGltZy5vbmVycm9yID0gY2FsbGJhY2s7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW1nLnNyYyA9IGltYWdlVXJsO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUucHJvY2Vzc1F1ZXVlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSwgcGFyYWxsZWxVcGxvYWRzLCBwcm9jZXNzaW5nTGVuZ3RoLCBxdWV1ZWRGaWxlcztcbiAgICAgIHBhcmFsbGVsVXBsb2FkcyA9IHRoaXMub3B0aW9ucy5wYXJhbGxlbFVwbG9hZHM7XG4gICAgICBwcm9jZXNzaW5nTGVuZ3RoID0gdGhpcy5nZXRVcGxvYWRpbmdGaWxlcygpLmxlbmd0aDtcbiAgICAgIGkgPSBwcm9jZXNzaW5nTGVuZ3RoO1xuICAgICAgaWYgKHByb2Nlc3NpbmdMZW5ndGggPj0gcGFyYWxsZWxVcGxvYWRzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHF1ZXVlZEZpbGVzID0gdGhpcy5nZXRRdWV1ZWRGaWxlcygpO1xuICAgICAgaWYgKCEocXVldWVkRmlsZXMubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGxvYWRNdWx0aXBsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzRmlsZXMocXVldWVkRmlsZXMuc2xpY2UoMCwgcGFyYWxsZWxVcGxvYWRzIC0gcHJvY2Vzc2luZ0xlbmd0aCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2hpbGUgKGkgPCBwYXJhbGxlbFVwbG9hZHMpIHtcbiAgICAgICAgICBpZiAoIXF1ZXVlZEZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnByb2Nlc3NGaWxlKHF1ZXVlZEZpbGVzLnNoaWZ0KCkpO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUucHJvY2Vzc0ZpbGUgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9jZXNzRmlsZXMoW2ZpbGVdKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnByb2Nlc3NGaWxlcyA9IGZ1bmN0aW9uKGZpbGVzKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW47XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGZpbGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBmaWxlc1tfaV07XG4gICAgICAgIGZpbGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgIGZpbGUuc3RhdHVzID0gRHJvcHpvbmUuVVBMT0FESU5HO1xuICAgICAgICB0aGlzLmVtaXQoXCJwcm9jZXNzaW5nXCIsIGZpbGUpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGxvYWRNdWx0aXBsZSkge1xuICAgICAgICB0aGlzLmVtaXQoXCJwcm9jZXNzaW5nbXVsdGlwbGVcIiwgZmlsZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudXBsb2FkRmlsZXMoZmlsZXMpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuX2dldEZpbGVzV2l0aFhociA9IGZ1bmN0aW9uKHhocikge1xuICAgICAgdmFyIGZpbGUsIGZpbGVzO1xuICAgICAgcmV0dXJuIGZpbGVzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgICBfcmVmID0gdGhpcy5maWxlcztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgZmlsZSA9IF9yZWZbX2ldO1xuICAgICAgICAgIGlmIChmaWxlLnhociA9PT0geGhyKSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKGZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9KS5jYWxsKHRoaXMpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuY2FuY2VsVXBsb2FkID0gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgdmFyIGdyb3VwZWRGaWxlLCBncm91cGVkRmlsZXMsIF9pLCBfaiwgX2xlbiwgX2xlbjEsIF9yZWY7XG4gICAgICBpZiAoZmlsZS5zdGF0dXMgPT09IERyb3B6b25lLlVQTE9BRElORykge1xuICAgICAgICBncm91cGVkRmlsZXMgPSB0aGlzLl9nZXRGaWxlc1dpdGhYaHIoZmlsZS54aHIpO1xuICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGdyb3VwZWRGaWxlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIGdyb3VwZWRGaWxlID0gZ3JvdXBlZEZpbGVzW19pXTtcbiAgICAgICAgICBncm91cGVkRmlsZS5zdGF0dXMgPSBEcm9wem9uZS5DQU5DRUxFRDtcbiAgICAgICAgfVxuICAgICAgICBmaWxlLnhoci5hYm9ydCgpO1xuICAgICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBncm91cGVkRmlsZXMubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgICAgZ3JvdXBlZEZpbGUgPSBncm91cGVkRmlsZXNbX2pdO1xuICAgICAgICAgIHRoaXMuZW1pdChcImNhbmNlbGVkXCIsIGdyb3VwZWRGaWxlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KFwiY2FuY2VsZWRtdWx0aXBsZVwiLCBncm91cGVkRmlsZXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKChfcmVmID0gZmlsZS5zdGF0dXMpID09PSBEcm9wem9uZS5BRERFRCB8fCBfcmVmID09PSBEcm9wem9uZS5RVUVVRUQpIHtcbiAgICAgICAgZmlsZS5zdGF0dXMgPSBEcm9wem9uZS5DQU5DRUxFRDtcbiAgICAgICAgdGhpcy5lbWl0KFwiY2FuY2VsZWRcIiwgZmlsZSk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoXCJjYW5jZWxlZG11bHRpcGxlXCIsIFtmaWxlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1Byb2Nlc3NRdWV1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzUXVldWUoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzb2x2ZU9wdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MsIG9wdGlvbjtcbiAgICAgIG9wdGlvbiA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IF9fc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gb3B0aW9uLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnVwbG9hZEZpbGUgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgICByZXR1cm4gdGhpcy51cGxvYWRGaWxlcyhbZmlsZV0pO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUudXBsb2FkRmlsZXMgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICAgdmFyIGZpbGUsIGZvcm1EYXRhLCBoYW5kbGVFcnJvciwgaGVhZGVyTmFtZSwgaGVhZGVyVmFsdWUsIGhlYWRlcnMsIGksIGlucHV0LCBpbnB1dE5hbWUsIGlucHV0VHlwZSwga2V5LCBtZXRob2QsIG9wdGlvbiwgcHJvZ3Jlc3NPYmosIHJlc3BvbnNlLCB1cGRhdGVQcm9ncmVzcywgdXJsLCB2YWx1ZSwgeGhyLCBfaSwgX2osIF9rLCBfbCwgX2xlbiwgX2xlbjEsIF9sZW4yLCBfbGVuMywgX20sIF9yZWYsIF9yZWYxLCBfcmVmMiwgX3JlZjMsIF9yZWY0LCBfcmVmNTtcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBmaWxlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBmaWxlID0gZmlsZXNbX2ldO1xuICAgICAgICBmaWxlLnhociA9IHhocjtcbiAgICAgIH1cbiAgICAgIG1ldGhvZCA9IHJlc29sdmVPcHRpb24odGhpcy5vcHRpb25zLm1ldGhvZCwgZmlsZXMpO1xuICAgICAgdXJsID0gcmVzb2x2ZU9wdGlvbih0aGlzLm9wdGlvbnMudXJsLCBmaWxlcyk7XG4gICAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gISF0aGlzLm9wdGlvbnMud2l0aENyZWRlbnRpYWxzO1xuICAgICAgcmVzcG9uc2UgPSBudWxsO1xuICAgICAgaGFuZGxlRXJyb3IgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfaiwgX2xlbjEsIF9yZXN1bHRzO1xuICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gZmlsZXMubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgICAgICBmaWxlID0gZmlsZXNbX2pdO1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChfdGhpcy5fZXJyb3JQcm9jZXNzaW5nKGZpbGVzLCByZXNwb25zZSB8fCBfdGhpcy5vcHRpb25zLmRpY3RSZXNwb25zZUVycm9yLnJlcGxhY2UoXCJ7e3N0YXR1c0NvZGV9fVwiLCB4aHIuc3RhdHVzKSwgeGhyKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgdXBkYXRlUHJvZ3Jlc3MgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICB2YXIgYWxsRmlsZXNGaW5pc2hlZCwgcHJvZ3Jlc3MsIF9qLCBfaywgX2wsIF9sZW4xLCBfbGVuMiwgX2xlbjMsIF9yZXN1bHRzO1xuICAgICAgICAgIGlmIChlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHByb2dyZXNzID0gMTAwICogZS5sb2FkZWQgLyBlLnRvdGFsO1xuICAgICAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gZmlsZXMubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgICAgICAgIGZpbGUgPSBmaWxlc1tfal07XG4gICAgICAgICAgICAgIGZpbGUudXBsb2FkID0ge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBwcm9ncmVzcyxcbiAgICAgICAgICAgICAgICB0b3RhbDogZS50b3RhbCxcbiAgICAgICAgICAgICAgICBieXRlc1NlbnQ6IGUubG9hZGVkXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsbEZpbGVzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgcHJvZ3Jlc3MgPSAxMDA7XG4gICAgICAgICAgICBmb3IgKF9rID0gMCwgX2xlbjIgPSBmaWxlcy5sZW5ndGg7IF9rIDwgX2xlbjI7IF9rKyspIHtcbiAgICAgICAgICAgICAgZmlsZSA9IGZpbGVzW19rXTtcbiAgICAgICAgICAgICAgaWYgKCEoZmlsZS51cGxvYWQucHJvZ3Jlc3MgPT09IDEwMCAmJiBmaWxlLnVwbG9hZC5ieXRlc1NlbnQgPT09IGZpbGUudXBsb2FkLnRvdGFsKSkge1xuICAgICAgICAgICAgICAgIGFsbEZpbGVzRmluaXNoZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBmaWxlLnVwbG9hZC5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICAgICAgICBmaWxlLnVwbG9hZC5ieXRlc1NlbnQgPSBmaWxlLnVwbG9hZC50b3RhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhbGxGaWxlc0ZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKF9sID0gMCwgX2xlbjMgPSBmaWxlcy5sZW5ndGg7IF9sIDwgX2xlbjM7IF9sKyspIHtcbiAgICAgICAgICAgIGZpbGUgPSBmaWxlc1tfbF07XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKF90aGlzLmVtaXQoXCJ1cGxvYWRwcm9ncmVzc1wiLCBmaWxlLCBwcm9ncmVzcywgZmlsZS51cGxvYWQuYnl0ZXNTZW50KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgeGhyLm9ubG9hZCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgIGlmIChmaWxlc1swXS5zdGF0dXMgPT09IERyb3B6b25lLkNBTkNFTEVEKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgaWYgKHhoci5nZXRSZXNwb25zZUhlYWRlcihcImNvbnRlbnQtdHlwZVwiKSAmJiB+eGhyLmdldFJlc3BvbnNlSGVhZGVyKFwiY29udGVudC10eXBlXCIpLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9qc29uXCIpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgICAgICAgIGUgPSBfZXJyb3I7XG4gICAgICAgICAgICAgIHJlc3BvbnNlID0gXCJJbnZhbGlkIEpTT04gcmVzcG9uc2UgZnJvbSBzZXJ2ZXIuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHVwZGF0ZVByb2dyZXNzKCk7XG4gICAgICAgICAgaWYgKCEoKDIwMCA8PSAoX3JlZiA9IHhoci5zdGF0dXMpICYmIF9yZWYgPCAzMDApKSkge1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5fZmluaXNoZWQoZmlsZXMsIHJlc3BvbnNlLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIHhoci5vbmVycm9yID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoZmlsZXNbMF0uc3RhdHVzID09PSBEcm9wem9uZS5DQU5DRUxFRCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgcHJvZ3Jlc3NPYmogPSAoX3JlZiA9IHhoci51cGxvYWQpICE9IG51bGwgPyBfcmVmIDogeGhyO1xuICAgICAgcHJvZ3Jlc3NPYmoub25wcm9ncmVzcyA9IHVwZGF0ZVByb2dyZXNzO1xuICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgXCJBY2NlcHRcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIFwiQ2FjaGUtQ29udHJvbFwiOiBcIm5vLWNhY2hlXCIsXG4gICAgICAgIFwiWC1SZXF1ZXN0ZWQtV2l0aFwiOiBcIlhNTEh0dHBSZXF1ZXN0XCJcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgZXh0ZW5kKGhlYWRlcnMsIHRoaXMub3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgIH1cbiAgICAgIGZvciAoaGVhZGVyTmFtZSBpbiBoZWFkZXJzKSB7XG4gICAgICAgIGhlYWRlclZhbHVlID0gaGVhZGVyc1toZWFkZXJOYW1lXTtcbiAgICAgICAgaWYgKGhlYWRlclZhbHVlKSB7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyTmFtZSwgaGVhZGVyVmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYXJhbXMpIHtcbiAgICAgICAgX3JlZjEgPSB0aGlzLm9wdGlvbnMucGFyYW1zO1xuICAgICAgICBmb3IgKGtleSBpbiBfcmVmMSkge1xuICAgICAgICAgIHZhbHVlID0gX3JlZjFba2V5XTtcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IGZpbGVzLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICBmaWxlID0gZmlsZXNbX2pdO1xuICAgICAgICB0aGlzLmVtaXQoXCJzZW5kaW5nXCIsIGZpbGUsIHhociwgZm9ybURhdGEpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGxvYWRNdWx0aXBsZSkge1xuICAgICAgICB0aGlzLmVtaXQoXCJzZW5kaW5nbXVsdGlwbGVcIiwgZmlsZXMsIHhociwgZm9ybURhdGEpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZWxlbWVudC50YWdOYW1lID09PSBcIkZPUk1cIikge1xuICAgICAgICBfcmVmMiA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QsIGJ1dHRvblwiKTtcbiAgICAgICAgZm9yIChfayA9IDAsIF9sZW4yID0gX3JlZjIubGVuZ3RoOyBfayA8IF9sZW4yOyBfaysrKSB7XG4gICAgICAgICAgaW5wdXQgPSBfcmVmMltfa107XG4gICAgICAgICAgaW5wdXROYW1lID0gaW5wdXQuZ2V0QXR0cmlidXRlKFwibmFtZVwiKTtcbiAgICAgICAgICBpbnB1dFR5cGUgPSBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpO1xuICAgICAgICAgIGlmIChpbnB1dC50YWdOYW1lID09PSBcIlNFTEVDVFwiICYmIGlucHV0Lmhhc0F0dHJpYnV0ZShcIm11bHRpcGxlXCIpKSB7XG4gICAgICAgICAgICBfcmVmMyA9IGlucHV0Lm9wdGlvbnM7XG4gICAgICAgICAgICBmb3IgKF9sID0gMCwgX2xlbjMgPSBfcmVmMy5sZW5ndGg7IF9sIDwgX2xlbjM7IF9sKyspIHtcbiAgICAgICAgICAgICAgb3B0aW9uID0gX3JlZjNbX2xdO1xuICAgICAgICAgICAgICBpZiAob3B0aW9uLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKGlucHV0TmFtZSwgb3B0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoIWlucHV0VHlwZSB8fCAoKF9yZWY0ID0gaW5wdXRUeXBlLnRvTG93ZXJDYXNlKCkpICE9PSBcImNoZWNrYm94XCIgJiYgX3JlZjQgIT09IFwicmFkaW9cIikgfHwgaW5wdXQuY2hlY2tlZCkge1xuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKGlucHV0TmFtZSwgaW5wdXQudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yIChpID0gX20gPSAwLCBfcmVmNSA9IGZpbGVzLmxlbmd0aCAtIDE7IDAgPD0gX3JlZjUgPyBfbSA8PSBfcmVmNSA6IF9tID49IF9yZWY1OyBpID0gMCA8PSBfcmVmNSA/ICsrX20gOiAtLV9tKSB7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCh0aGlzLl9nZXRQYXJhbU5hbWUoaSksIGZpbGVzW2ldLCB0aGlzLl9yZW5hbWVGaWxlbmFtZShmaWxlc1tpXS5uYW1lKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zdWJtaXRSZXF1ZXN0KHhociwgZm9ybURhdGEsIGZpbGVzKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnN1Ym1pdFJlcXVlc3QgPSBmdW5jdGlvbih4aHIsIGZvcm1EYXRhLCBmaWxlcykge1xuICAgICAgcmV0dXJuIHhoci5zZW5kKGZvcm1EYXRhKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLl9maW5pc2hlZCA9IGZ1bmN0aW9uKGZpbGVzLCByZXNwb25zZVRleHQsIGUpIHtcbiAgICAgIHZhciBmaWxlLCBfaSwgX2xlbjtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZmlsZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgZmlsZSA9IGZpbGVzW19pXTtcbiAgICAgICAgZmlsZS5zdGF0dXMgPSBEcm9wem9uZS5TVUNDRVNTO1xuICAgICAgICB0aGlzLmVtaXQoXCJzdWNjZXNzXCIsIGZpbGUsIHJlc3BvbnNlVGV4dCwgZSk7XG4gICAgICAgIHRoaXMuZW1pdChcImNvbXBsZXRlXCIsIGZpbGUpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGxvYWRNdWx0aXBsZSkge1xuICAgICAgICB0aGlzLmVtaXQoXCJzdWNjZXNzbXVsdGlwbGVcIiwgZmlsZXMsIHJlc3BvbnNlVGV4dCwgZSk7XG4gICAgICAgIHRoaXMuZW1pdChcImNvbXBsZXRlbXVsdGlwbGVcIiwgZmlsZXMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUHJvY2Vzc1F1ZXVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NRdWV1ZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuX2Vycm9yUHJvY2Vzc2luZyA9IGZ1bmN0aW9uKGZpbGVzLCBtZXNzYWdlLCB4aHIpIHtcbiAgICAgIHZhciBmaWxlLCBfaSwgX2xlbjtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZmlsZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgZmlsZSA9IGZpbGVzW19pXTtcbiAgICAgICAgZmlsZS5zdGF0dXMgPSBEcm9wem9uZS5FUlJPUjtcbiAgICAgICAgdGhpcy5lbWl0KFwiZXJyb3JcIiwgZmlsZSwgbWVzc2FnZSwgeGhyKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiY29tcGxldGVcIiwgZmlsZSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlKSB7XG4gICAgICAgIHRoaXMuZW1pdChcImVycm9ybXVsdGlwbGVcIiwgZmlsZXMsIG1lc3NhZ2UsIHhocik7XG4gICAgICAgIHRoaXMuZW1pdChcImNvbXBsZXRlbXVsdGlwbGVcIiwgZmlsZXMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUHJvY2Vzc1F1ZXVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NRdWV1ZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gRHJvcHpvbmU7XG5cbiAgfSkoRW1pdHRlcik7XG5cbiAgRHJvcHpvbmUudmVyc2lvbiA9IFwiNC4zLjBcIjtcblxuICBEcm9wem9uZS5vcHRpb25zID0ge307XG5cbiAgRHJvcHpvbmUub3B0aW9uc0ZvckVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiaWRcIikpIHtcbiAgICAgIHJldHVybiBEcm9wem9uZS5vcHRpb25zW2NhbWVsaXplKGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiaWRcIikpXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG4gIH07XG5cbiAgRHJvcHpvbmUuaW5zdGFuY2VzID0gW107XG5cbiAgRHJvcHpvbmUuZm9yRWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpO1xuICAgIH1cbiAgICBpZiAoKGVsZW1lbnQgIT0gbnVsbCA/IGVsZW1lbnQuZHJvcHpvbmUgOiB2b2lkIDApID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIERyb3B6b25lIGZvdW5kIGZvciBnaXZlbiBlbGVtZW50LiBUaGlzIGlzIHByb2JhYmx5IGJlY2F1c2UgeW91J3JlIHRyeWluZyB0byBhY2Nlc3MgaXQgYmVmb3JlIERyb3B6b25lIGhhZCB0aGUgdGltZSB0byBpbml0aWFsaXplLiBVc2UgdGhlIGBpbml0YCBvcHRpb24gdG8gc2V0dXAgYW55IGFkZGl0aW9uYWwgb2JzZXJ2ZXJzIG9uIHlvdXIgRHJvcHpvbmUuXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudC5kcm9wem9uZTtcbiAgfTtcblxuICBEcm9wem9uZS5hdXRvRGlzY292ZXIgPSB0cnVlO1xuXG4gIERyb3B6b25lLmRpc2NvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNoZWNrRWxlbWVudHMsIGRyb3B6b25lLCBkcm9wem9uZXMsIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgZHJvcHpvbmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wem9uZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJvcHpvbmVzID0gW107XG4gICAgICBjaGVja0VsZW1lbnRzID0gZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICAgICAgdmFyIGVsLCBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZWxlbWVudHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBlbCA9IGVsZW1lbnRzW19pXTtcbiAgICAgICAgICBpZiAoLyhefCApZHJvcHpvbmUoJHwgKS8udGVzdChlbC5jbGFzc05hbWUpKSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKGRyb3B6b25lcy5wdXNoKGVsKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfTtcbiAgICAgIGNoZWNrRWxlbWVudHMoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkaXZcIikpO1xuICAgICAgY2hlY2tFbGVtZW50cyhkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImZvcm1cIikpO1xuICAgIH1cbiAgICBfcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZHJvcHpvbmVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBkcm9wem9uZSA9IGRyb3B6b25lc1tfaV07XG4gICAgICBpZiAoRHJvcHpvbmUub3B0aW9uc0ZvckVsZW1lbnQoZHJvcHpvbmUpICE9PSBmYWxzZSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKG5ldyBEcm9wem9uZShkcm9wem9uZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3Jlc3VsdHM7XG4gIH07XG5cbiAgRHJvcHpvbmUuYmxhY2tsaXN0ZWRCcm93c2VycyA9IFsvb3BlcmEuKk1hY2ludG9zaC4qdmVyc2lvblxcLzEyL2ldO1xuXG4gIERyb3B6b25lLmlzQnJvd3NlclN1cHBvcnRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYXBhYmxlQnJvd3NlciwgcmVnZXgsIF9pLCBfbGVuLCBfcmVmO1xuICAgIGNhcGFibGVCcm93c2VyID0gdHJ1ZTtcbiAgICBpZiAod2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iICYmIHdpbmRvdy5Gb3JtRGF0YSAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKSB7XG4gICAgICBpZiAoIShcImNsYXNzTGlzdFwiIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpKSkge1xuICAgICAgICBjYXBhYmxlQnJvd3NlciA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3JlZiA9IERyb3B6b25lLmJsYWNrbGlzdGVkQnJvd3NlcnM7XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIHJlZ2V4ID0gX3JlZltfaV07XG4gICAgICAgICAgaWYgKHJlZ2V4LnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcbiAgICAgICAgICAgIGNhcGFibGVCcm93c2VyID0gZmFsc2U7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2FwYWJsZUJyb3dzZXIgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGNhcGFibGVCcm93c2VyO1xuICB9O1xuXG4gIHdpdGhvdXQgPSBmdW5jdGlvbihsaXN0LCByZWplY3RlZEl0ZW0pIHtcbiAgICB2YXIgaXRlbSwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgIF9yZXN1bHRzID0gW107XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBsaXN0Lmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBpdGVtID0gbGlzdFtfaV07XG4gICAgICBpZiAoaXRlbSAhPT0gcmVqZWN0ZWRJdGVtKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfcmVzdWx0cztcbiAgfTtcblxuICBjYW1lbGl6ZSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvW1xcLV9dKFxcdykvZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMSkudG9VcHBlckNhc2UoKTtcbiAgICB9KTtcbiAgfTtcblxuICBEcm9wem9uZS5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIGRpdjtcbiAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdi5pbm5lckhUTUwgPSBzdHJpbmc7XG4gICAgcmV0dXJuIGRpdi5jaGlsZE5vZGVzWzBdO1xuICB9O1xuXG4gIERyb3B6b25lLmVsZW1lbnRJbnNpZGUgPSBmdW5jdGlvbihlbGVtZW50LCBjb250YWluZXIpIHtcbiAgICBpZiAoZWxlbWVudCA9PT0gY29udGFpbmVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgd2hpbGUgKGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIGlmIChlbGVtZW50ID09PSBjb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBEcm9wem9uZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24oZWwsIG5hbWUpIHtcbiAgICB2YXIgZWxlbWVudDtcbiAgICBpZiAodHlwZW9mIGVsID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCk7XG4gICAgfSBlbHNlIGlmIChlbC5ub2RlVHlwZSAhPSBudWxsKSB7XG4gICAgICBlbGVtZW50ID0gZWw7XG4gICAgfVxuICAgIGlmIChlbGVtZW50ID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYFwiICsgbmFtZSArIFwiYCBvcHRpb24gcHJvdmlkZWQuIFBsZWFzZSBwcm92aWRlIGEgQ1NTIHNlbGVjdG9yIG9yIGEgcGxhaW4gSFRNTCBlbGVtZW50LlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH07XG5cbiAgRHJvcHpvbmUuZ2V0RWxlbWVudHMgPSBmdW5jdGlvbihlbHMsIG5hbWUpIHtcbiAgICB2YXIgZSwgZWwsIGVsZW1lbnRzLCBfaSwgX2osIF9sZW4sIF9sZW4xLCBfcmVmO1xuICAgIGlmIChlbHMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZWxlbWVudHMgPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZWxzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgZWwgPSBlbHNbX2ldO1xuICAgICAgICAgIGVsZW1lbnRzLnB1c2godGhpcy5nZXRFbGVtZW50KGVsLCBuYW1lKSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICBlID0gX2Vycm9yO1xuICAgICAgICBlbGVtZW50cyA9IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZWxzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBlbGVtZW50cyA9IFtdO1xuICAgICAgX3JlZiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxzKTtcbiAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IF9yZWYubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgIGVsID0gX3JlZltfal07XG4gICAgICAgIGVsZW1lbnRzLnB1c2goZWwpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZWxzLm5vZGVUeXBlICE9IG51bGwpIHtcbiAgICAgIGVsZW1lbnRzID0gW2Vsc107XG4gICAgfVxuICAgIGlmICghKChlbGVtZW50cyAhPSBudWxsKSAmJiBlbGVtZW50cy5sZW5ndGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGBcIiArIG5hbWUgKyBcImAgb3B0aW9uIHByb3ZpZGVkLiBQbGVhc2UgcHJvdmlkZSBhIENTUyBzZWxlY3RvciwgYSBwbGFpbiBIVE1MIGVsZW1lbnQgb3IgYSBsaXN0IG9mIHRob3NlLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnRzO1xuICB9O1xuXG4gIERyb3B6b25lLmNvbmZpcm0gPSBmdW5jdGlvbihxdWVzdGlvbiwgYWNjZXB0ZWQsIHJlamVjdGVkKSB7XG4gICAgaWYgKHdpbmRvdy5jb25maXJtKHF1ZXN0aW9uKSkge1xuICAgICAgcmV0dXJuIGFjY2VwdGVkKCk7XG4gICAgfSBlbHNlIGlmIChyZWplY3RlZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gcmVqZWN0ZWQoKTtcbiAgICB9XG4gIH07XG5cbiAgRHJvcHpvbmUuaXNWYWxpZEZpbGUgPSBmdW5jdGlvbihmaWxlLCBhY2NlcHRlZEZpbGVzKSB7XG4gICAgdmFyIGJhc2VNaW1lVHlwZSwgbWltZVR5cGUsIHZhbGlkVHlwZSwgX2ksIF9sZW47XG4gICAgaWYgKCFhY2NlcHRlZEZpbGVzKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYWNjZXB0ZWRGaWxlcyA9IGFjY2VwdGVkRmlsZXMuc3BsaXQoXCIsXCIpO1xuICAgIG1pbWVUeXBlID0gZmlsZS50eXBlO1xuICAgIGJhc2VNaW1lVHlwZSA9IG1pbWVUeXBlLnJlcGxhY2UoL1xcLy4qJC8sIFwiXCIpO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gYWNjZXB0ZWRGaWxlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgdmFsaWRUeXBlID0gYWNjZXB0ZWRGaWxlc1tfaV07XG4gICAgICB2YWxpZFR5cGUgPSB2YWxpZFR5cGUudHJpbSgpO1xuICAgICAgaWYgKHZhbGlkVHlwZS5jaGFyQXQoMCkgPT09IFwiLlwiKSB7XG4gICAgICAgIGlmIChmaWxlLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbGlkVHlwZS50b0xvd2VyQ2FzZSgpLCBmaWxlLm5hbWUubGVuZ3RoIC0gdmFsaWRUeXBlLmxlbmd0aCkgIT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoL1xcL1xcKiQvLnRlc3QodmFsaWRUeXBlKSkge1xuICAgICAgICBpZiAoYmFzZU1pbWVUeXBlID09PSB2YWxpZFR5cGUucmVwbGFjZSgvXFwvLiokLywgXCJcIikpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG1pbWVUeXBlID09PSB2YWxpZFR5cGUpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBqUXVlcnkgIT09IFwidW5kZWZpbmVkXCIgJiYgalF1ZXJ5ICE9PSBudWxsKSB7XG4gICAgalF1ZXJ5LmZuLmRyb3B6b25lID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEcm9wem9uZSh0aGlzLCBvcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERyb3B6b25lO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5Ecm9wem9uZSA9IERyb3B6b25lO1xuICB9XG5cbiAgRHJvcHpvbmUuQURERUQgPSBcImFkZGVkXCI7XG5cbiAgRHJvcHpvbmUuUVVFVUVEID0gXCJxdWV1ZWRcIjtcblxuICBEcm9wem9uZS5BQ0NFUFRFRCA9IERyb3B6b25lLlFVRVVFRDtcblxuICBEcm9wem9uZS5VUExPQURJTkcgPSBcInVwbG9hZGluZ1wiO1xuXG4gIERyb3B6b25lLlBST0NFU1NJTkcgPSBEcm9wem9uZS5VUExPQURJTkc7XG5cbiAgRHJvcHpvbmUuQ0FOQ0VMRUQgPSBcImNhbmNlbGVkXCI7XG5cbiAgRHJvcHpvbmUuRVJST1IgPSBcImVycm9yXCI7XG5cbiAgRHJvcHpvbmUuU1VDQ0VTUyA9IFwic3VjY2Vzc1wiO1xuXG5cbiAgLypcbiAgXG4gIEJ1Z2ZpeCBmb3IgaU9TIDYgYW5kIDdcbiAgU291cmNlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExOTI5MDk5L2h0bWw1LWNhbnZhcy1kcmF3aW1hZ2UtcmF0aW8tYnVnLWlvc1xuICBiYXNlZCBvbiB0aGUgd29yayBvZiBodHRwczovL2dpdGh1Yi5jb20vc3RvbWl0YS9pb3MtaW1hZ2VmaWxlLW1lZ2FwaXhlbFxuICAgKi9cblxuICBkZXRlY3RWZXJ0aWNhbFNxdWFzaCA9IGZ1bmN0aW9uKGltZykge1xuICAgIHZhciBhbHBoYSwgY2FudmFzLCBjdHgsIGRhdGEsIGV5LCBpaCwgaXcsIHB5LCByYXRpbywgc3k7XG4gICAgaXcgPSBpbWcubmF0dXJhbFdpZHRoO1xuICAgIGloID0gaW1nLm5hdHVyYWxIZWlnaHQ7XG4gICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICBjYW52YXMud2lkdGggPSAxO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBpaDtcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgICBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCAxLCBpaCkuZGF0YTtcbiAgICBzeSA9IDA7XG4gICAgZXkgPSBpaDtcbiAgICBweSA9IGloO1xuICAgIHdoaWxlIChweSA+IHN5KSB7XG4gICAgICBhbHBoYSA9IGRhdGFbKHB5IC0gMSkgKiA0ICsgM107XG4gICAgICBpZiAoYWxwaGEgPT09IDApIHtcbiAgICAgICAgZXkgPSBweTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN5ID0gcHk7XG4gICAgICB9XG4gICAgICBweSA9IChleSArIHN5KSA+PiAxO1xuICAgIH1cbiAgICByYXRpbyA9IHB5IC8gaWg7XG4gICAgaWYgKHJhdGlvID09PSAwKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJhdGlvO1xuICAgIH1cbiAgfTtcblxuICBkcmF3SW1hZ2VJT1NGaXggPSBmdW5jdGlvbihjdHgsIGltZywgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoKSB7XG4gICAgdmFyIHZlcnRTcXVhc2hSYXRpbztcbiAgICB2ZXJ0U3F1YXNoUmF0aW8gPSBkZXRlY3RWZXJ0aWNhbFNxdWFzaChpbWcpO1xuICAgIHJldHVybiBjdHguZHJhd0ltYWdlKGltZywgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoIC8gdmVydFNxdWFzaFJhdGlvKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIGNvbnRlbnRsb2FkZWQuanNcbiAgICpcbiAgICogQXV0aG9yOiBEaWVnbyBQZXJpbmkgKGRpZWdvLnBlcmluaSBhdCBnbWFpbC5jb20pXG4gICAqIFN1bW1hcnk6IGNyb3NzLWJyb3dzZXIgd3JhcHBlciBmb3IgRE9NQ29udGVudExvYWRlZFxuICAgKiBVcGRhdGVkOiAyMDEwMTAyMFxuICAgKiBMaWNlbnNlOiBNSVRcbiAgICogVmVyc2lvbjogMS4yXG4gICAqXG4gICAqIFVSTDpcbiAgICogaHR0cDovL2phdmFzY3JpcHQubndib3guY29tL0NvbnRlbnRMb2FkZWQvXG4gICAqIGh0dHA6Ly9qYXZhc2NyaXB0Lm53Ym94LmNvbS9Db250ZW50TG9hZGVkL01JVC1MSUNFTlNFXG4gICAqL1xuXG4gIGNvbnRlbnRMb2FkZWQgPSBmdW5jdGlvbih3aW4sIGZuKSB7XG4gICAgdmFyIGFkZCwgZG9jLCBkb25lLCBpbml0LCBwb2xsLCBwcmUsIHJlbSwgcm9vdCwgdG9wO1xuICAgIGRvbmUgPSBmYWxzZTtcbiAgICB0b3AgPSB0cnVlO1xuICAgIGRvYyA9IHdpbi5kb2N1bWVudDtcbiAgICByb290ID0gZG9jLmRvY3VtZW50RWxlbWVudDtcbiAgICBhZGQgPSAoZG9jLmFkZEV2ZW50TGlzdGVuZXIgPyBcImFkZEV2ZW50TGlzdGVuZXJcIiA6IFwiYXR0YWNoRXZlbnRcIik7XG4gICAgcmVtID0gKGRvYy5hZGRFdmVudExpc3RlbmVyID8gXCJyZW1vdmVFdmVudExpc3RlbmVyXCIgOiBcImRldGFjaEV2ZW50XCIpO1xuICAgIHByZSA9IChkb2MuYWRkRXZlbnRMaXN0ZW5lciA/IFwiXCIgOiBcIm9uXCIpO1xuICAgIGluaXQgPSBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS50eXBlID09PSBcInJlYWR5c3RhdGVjaGFuZ2VcIiAmJiBkb2MucmVhZHlTdGF0ZSAhPT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIChlLnR5cGUgPT09IFwibG9hZFwiID8gd2luIDogZG9jKVtyZW1dKHByZSArIGUudHlwZSwgaW5pdCwgZmFsc2UpO1xuICAgICAgaWYgKCFkb25lICYmIChkb25lID0gdHJ1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwod2luLCBlLnR5cGUgfHwgZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBwb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJvb3QuZG9TY3JvbGwoXCJsZWZ0XCIpO1xuICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgIGUgPSBfZXJyb3I7XG4gICAgICAgIHNldFRpbWVvdXQocG9sbCwgNTApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5pdChcInBvbGxcIik7XG4gICAgfTtcbiAgICBpZiAoZG9jLnJlYWR5U3RhdGUgIT09IFwiY29tcGxldGVcIikge1xuICAgICAgaWYgKGRvYy5jcmVhdGVFdmVudE9iamVjdCAmJiByb290LmRvU2Nyb2xsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdG9wID0gIXdpbi5mcmFtZUVsZW1lbnQ7XG4gICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge31cbiAgICAgICAgaWYgKHRvcCkge1xuICAgICAgICAgIHBvbGwoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZG9jW2FkZF0ocHJlICsgXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQsIGZhbHNlKTtcbiAgICAgIGRvY1thZGRdKHByZSArIFwicmVhZHlzdGF0ZWNoYW5nZVwiLCBpbml0LCBmYWxzZSk7XG4gICAgICByZXR1cm4gd2luW2FkZF0ocHJlICsgXCJsb2FkXCIsIGluaXQsIGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgRHJvcHpvbmUuX2F1dG9EaXNjb3ZlckZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKERyb3B6b25lLmF1dG9EaXNjb3Zlcikge1xuICAgICAgcmV0dXJuIERyb3B6b25lLmRpc2NvdmVyKCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnRlbnRMb2FkZWQod2luZG93LCBEcm9wem9uZS5fYXV0b0Rpc2NvdmVyRnVuY3Rpb24pO1xuXG59KS5jYWxsKHRoaXMpO1xuIl0sImZpbGUiOiJyYWRpby9kcm9wem9uZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
