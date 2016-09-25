
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvcmFkaW8vZHJvcHpvbmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXG4vKlxuICpcbiAqIE1vcmUgaW5mbyBhdCBbd3d3LmRyb3B6b25lanMuY29tXShodHRwOi8vd3d3LmRyb3B6b25lanMuY29tKVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiwgTWF0aWFzIE1lbm9cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBEcm9wem9uZSwgRW1pdHRlciwgY2FtZWxpemUsIGNvbnRlbnRMb2FkZWQsIGRldGVjdFZlcnRpY2FsU3F1YXNoLCBkcmF3SW1hZ2VJT1NGaXgsIG5vb3AsIHdpdGhvdXQsXG4gICAgX19zbGljZSA9IFtdLnNsaWNlLFxuICAgIF9faGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5LFxuICAgIF9fZXh0ZW5kcyA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9O1xuXG4gIG5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG4gIEVtaXR0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gRW1pdHRlcigpIHt9XG5cbiAgICBFbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gRW1pdHRlci5wcm90b3R5cGUub247XG5cbiAgICBFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBmbikge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAgICAgaWYgKCF0aGlzLl9jYWxsYmFja3NbZXZlbnRdKSB7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NhbGxiYWNrc1tldmVudF0ucHVzaChmbik7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MsIGNhbGxiYWNrLCBjYWxsYmFja3MsIGV2ZW50LCBfaSwgX2xlbjtcbiAgICAgIGV2ZW50ID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgICAgIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFja3NbX2ldO1xuICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBFbWl0dGVyLnByb3RvdHlwZS5vZmY7XG5cbiAgICBFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBFbWl0dGVyLnByb3RvdHlwZS5vZmY7XG5cbiAgICBFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gRW1pdHRlci5wcm90b3R5cGUub2ZmO1xuXG4gICAgRW1pdHRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZXZlbnQsIGZuKSB7XG4gICAgICB2YXIgY2FsbGJhY2ssIGNhbGxiYWNrcywgaSwgX2ksIF9sZW47XG4gICAgICBpZiAoIXRoaXMuX2NhbGxiYWNrcyB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgICBpZiAoIWNhbGxiYWNrcykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX2xlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IF9pIDwgX2xlbjsgaSA9ICsrX2kpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFja3NbaV07XG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gZm4pIHtcbiAgICAgICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIEVtaXR0ZXI7XG5cbiAgfSkoKTtcblxuICBEcm9wem9uZSA9IChmdW5jdGlvbihfc3VwZXIpIHtcbiAgICB2YXIgZXh0ZW5kLCByZXNvbHZlT3B0aW9uO1xuXG4gICAgX19leHRlbmRzKERyb3B6b25lLCBfc3VwZXIpO1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLkVtaXR0ZXIgPSBFbWl0dGVyO1xuXG5cbiAgICAvKlxuICAgIFRoaXMgaXMgYSBsaXN0IG9mIGFsbCBhdmFpbGFibGUgZXZlbnRzIHlvdSBjYW4gcmVnaXN0ZXIgb24gYSBkcm9wem9uZSBvYmplY3QuXG4gICAgXG4gICAgWW91IGNhbiByZWdpc3RlciBhbiBldmVudCBoYW5kbGVyIGxpa2UgdGhpczpcbiAgICBcbiAgICAgICAgZHJvcHpvbmUub24oXCJkcmFnRW50ZXJcIiwgZnVuY3Rpb24oKSB7IH0pO1xuICAgICAqL1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmV2ZW50cyA9IFtcImRyb3BcIiwgXCJkcmFnc3RhcnRcIiwgXCJkcmFnZW5kXCIsIFwiZHJhZ2VudGVyXCIsIFwiZHJhZ292ZXJcIiwgXCJkcmFnbGVhdmVcIiwgXCJhZGRlZGZpbGVcIiwgXCJhZGRlZGZpbGVzXCIsIFwicmVtb3ZlZGZpbGVcIiwgXCJ0aHVtYm5haWxcIiwgXCJlcnJvclwiLCBcImVycm9ybXVsdGlwbGVcIiwgXCJwcm9jZXNzaW5nXCIsIFwicHJvY2Vzc2luZ211bHRpcGxlXCIsIFwidXBsb2FkcHJvZ3Jlc3NcIiwgXCJ0b3RhbHVwbG9hZHByb2dyZXNzXCIsIFwic2VuZGluZ1wiLCBcInNlbmRpbmdtdWx0aXBsZVwiLCBcInN1Y2Nlc3NcIiwgXCJzdWNjZXNzbXVsdGlwbGVcIiwgXCJjYW5jZWxlZFwiLCBcImNhbmNlbGVkbXVsdGlwbGVcIiwgXCJjb21wbGV0ZVwiLCBcImNvbXBsZXRlbXVsdGlwbGVcIiwgXCJyZXNldFwiLCBcIm1heGZpbGVzZXhjZWVkZWRcIiwgXCJtYXhmaWxlc3JlYWNoZWRcIiwgXCJxdWV1ZWNvbXBsZXRlXCJdO1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgdXJsOiBudWxsLFxuICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gICAgICBwYXJhbGxlbFVwbG9hZHM6IDIsXG4gICAgICB1cGxvYWRNdWx0aXBsZTogZmFsc2UsXG4gICAgICBtYXhGaWxlc2l6ZTogMjU2LFxuICAgICAgcGFyYW1OYW1lOiBcImZpbGVcIixcbiAgICAgIGNyZWF0ZUltYWdlVGh1bWJuYWlsczogdHJ1ZSxcbiAgICAgIG1heFRodW1ibmFpbEZpbGVzaXplOiAxMCxcbiAgICAgIHRodW1ibmFpbFdpZHRoOiAxMjAsXG4gICAgICB0aHVtYm5haWxIZWlnaHQ6IDEyMCxcbiAgICAgIGZpbGVzaXplQmFzZTogMTAwMCxcbiAgICAgIG1heEZpbGVzOiBudWxsLFxuICAgICAgcGFyYW1zOiB7fSxcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZSxcbiAgICAgIGlnbm9yZUhpZGRlbkZpbGVzOiB0cnVlLFxuICAgICAgYWNjZXB0ZWRGaWxlczogbnVsbCxcbiAgICAgIGFjY2VwdGVkTWltZVR5cGVzOiBudWxsLFxuICAgICAgYXV0b1Byb2Nlc3NRdWV1ZTogdHJ1ZSxcbiAgICAgIGF1dG9RdWV1ZTogdHJ1ZSxcbiAgICAgIGFkZFJlbW92ZUxpbmtzOiBmYWxzZSxcbiAgICAgIHByZXZpZXdzQ29udGFpbmVyOiBudWxsLFxuICAgICAgaGlkZGVuSW5wdXRDb250YWluZXI6IFwiYm9keVwiLFxuICAgICAgY2FwdHVyZTogbnVsbCxcbiAgICAgIHJlbmFtZUZpbGVuYW1lOiBudWxsLFxuICAgICAgZGljdERlZmF1bHRNZXNzYWdlOiBcIkRyb3AgZmlsZXMgaGVyZSB0byB1cGxvYWRcIixcbiAgICAgIGRpY3RGYWxsYmFja01lc3NhZ2U6IFwiWW91ciBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgZHJhZyduJ2Ryb3AgZmlsZSB1cGxvYWRzLlwiLFxuICAgICAgZGljdEZhbGxiYWNrVGV4dDogXCJQbGVhc2UgdXNlIHRoZSBmYWxsYmFjayBmb3JtIGJlbG93IHRvIHVwbG9hZCB5b3VyIGZpbGVzIGxpa2UgaW4gdGhlIG9sZGVuIGRheXMuXCIsXG4gICAgICBkaWN0RmlsZVRvb0JpZzogXCJGaWxlIGlzIHRvbyBiaWcgKHt7ZmlsZXNpemV9fU1pQikuIE1heCBmaWxlc2l6ZToge3ttYXhGaWxlc2l6ZX19TWlCLlwiLFxuICAgICAgZGljdEludmFsaWRGaWxlVHlwZTogXCJZb3UgY2FuJ3QgdXBsb2FkIGZpbGVzIG9mIHRoaXMgdHlwZS5cIixcbiAgICAgIGRpY3RSZXNwb25zZUVycm9yOiBcIlNlcnZlciByZXNwb25kZWQgd2l0aCB7e3N0YXR1c0NvZGV9fSBjb2RlLlwiLFxuICAgICAgZGljdENhbmNlbFVwbG9hZDogXCJDYW5jZWwgdXBsb2FkXCIsXG4gICAgICBkaWN0Q2FuY2VsVXBsb2FkQ29uZmlybWF0aW9uOiBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBjYW5jZWwgdGhpcyB1cGxvYWQ/XCIsXG4gICAgICBkaWN0UmVtb3ZlRmlsZTogXCJSZW1vdmUgZmlsZVwiLFxuICAgICAgZGljdFJlbW92ZUZpbGVDb25maXJtYXRpb246IG51bGwsXG4gICAgICBkaWN0TWF4RmlsZXNFeGNlZWRlZDogXCJZb3UgY2FuIG5vdCB1cGxvYWQgYW55IG1vcmUgZmlsZXMuXCIsXG4gICAgICBhY2NlcHQ6IGZ1bmN0aW9uKGZpbGUsIGRvbmUpIHtcbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0sXG4gICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgICB9LFxuICAgICAgZm9yY2VGYWxsYmFjazogZmFsc2UsXG4gICAgICBmYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaGlsZCwgbWVzc2FnZUVsZW1lbnQsIHNwYW4sIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gXCJcIiArIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgKyBcIiBkei1icm93c2VyLW5vdC1zdXBwb3J0ZWRcIjtcbiAgICAgICAgX3JlZiA9IHRoaXMuZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgY2hpbGQgPSBfcmVmW19pXTtcbiAgICAgICAgICBpZiAoLyhefCApZHotbWVzc2FnZSgkfCApLy50ZXN0KGNoaWxkLmNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VFbGVtZW50ID0gY2hpbGQ7XG4gICAgICAgICAgICBjaGlsZC5jbGFzc05hbWUgPSBcImR6LW1lc3NhZ2VcIjtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1lc3NhZ2VFbGVtZW50KSB7XG4gICAgICAgICAgbWVzc2FnZUVsZW1lbnQgPSBEcm9wem9uZS5jcmVhdGVFbGVtZW50KFwiPGRpdiBjbGFzcz1cXFwiZHotbWVzc2FnZVxcXCI+PHNwYW4+PC9zcGFuPjwvZGl2PlwiKTtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHNwYW4gPSBtZXNzYWdlRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNwYW5cIilbMF07XG4gICAgICAgIGlmIChzcGFuKSB7XG4gICAgICAgICAgaWYgKHNwYW4udGV4dENvbnRlbnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgc3Bhbi50ZXh0Q29udGVudCA9IHRoaXMub3B0aW9ucy5kaWN0RmFsbGJhY2tNZXNzYWdlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3Bhbi5pbm5lclRleHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgc3Bhbi5pbm5lclRleHQgPSB0aGlzLm9wdGlvbnMuZGljdEZhbGxiYWNrTWVzc2FnZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmdldEZhbGxiYWNrRm9ybSgpKTtcbiAgICAgIH0sXG4gICAgICByZXNpemU6IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgdmFyIGluZm8sIHNyY1JhdGlvLCB0cmdSYXRpbztcbiAgICAgICAgaW5mbyA9IHtcbiAgICAgICAgICBzcmNYOiAwLFxuICAgICAgICAgIHNyY1k6IDAsXG4gICAgICAgICAgc3JjV2lkdGg6IGZpbGUud2lkdGgsXG4gICAgICAgICAgc3JjSGVpZ2h0OiBmaWxlLmhlaWdodFxuICAgICAgICB9O1xuICAgICAgICBzcmNSYXRpbyA9IGZpbGUud2lkdGggLyBmaWxlLmhlaWdodDtcbiAgICAgICAgaW5mby5vcHRXaWR0aCA9IHRoaXMub3B0aW9ucy50aHVtYm5haWxXaWR0aDtcbiAgICAgICAgaW5mby5vcHRIZWlnaHQgPSB0aGlzLm9wdGlvbnMudGh1bWJuYWlsSGVpZ2h0O1xuICAgICAgICBpZiAoKGluZm8ub3B0V2lkdGggPT0gbnVsbCkgJiYgKGluZm8ub3B0SGVpZ2h0ID09IG51bGwpKSB7XG4gICAgICAgICAgaW5mby5vcHRXaWR0aCA9IGluZm8uc3JjV2lkdGg7XG4gICAgICAgICAgaW5mby5vcHRIZWlnaHQgPSBpbmZvLnNyY0hlaWdodDtcbiAgICAgICAgfSBlbHNlIGlmIChpbmZvLm9wdFdpZHRoID09IG51bGwpIHtcbiAgICAgICAgICBpbmZvLm9wdFdpZHRoID0gc3JjUmF0aW8gKiBpbmZvLm9wdEhlaWdodDtcbiAgICAgICAgfSBlbHNlIGlmIChpbmZvLm9wdEhlaWdodCA9PSBudWxsKSB7XG4gICAgICAgICAgaW5mby5vcHRIZWlnaHQgPSAoMSAvIHNyY1JhdGlvKSAqIGluZm8ub3B0V2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgdHJnUmF0aW8gPSBpbmZvLm9wdFdpZHRoIC8gaW5mby5vcHRIZWlnaHQ7XG4gICAgICAgIGlmIChmaWxlLmhlaWdodCA8IGluZm8ub3B0SGVpZ2h0IHx8IGZpbGUud2lkdGggPCBpbmZvLm9wdFdpZHRoKSB7XG4gICAgICAgICAgaW5mby50cmdIZWlnaHQgPSBpbmZvLnNyY0hlaWdodDtcbiAgICAgICAgICBpbmZvLnRyZ1dpZHRoID0gaW5mby5zcmNXaWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc3JjUmF0aW8gPiB0cmdSYXRpbykge1xuICAgICAgICAgICAgaW5mby5zcmNIZWlnaHQgPSBmaWxlLmhlaWdodDtcbiAgICAgICAgICAgIGluZm8uc3JjV2lkdGggPSBpbmZvLnNyY0hlaWdodCAqIHRyZ1JhdGlvO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmZvLnNyY1dpZHRoID0gZmlsZS53aWR0aDtcbiAgICAgICAgICAgIGluZm8uc3JjSGVpZ2h0ID0gaW5mby5zcmNXaWR0aCAvIHRyZ1JhdGlvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpbmZvLnNyY1ggPSAoZmlsZS53aWR0aCAtIGluZm8uc3JjV2lkdGgpIC8gMjtcbiAgICAgICAgaW5mby5zcmNZID0gKGZpbGUuaGVpZ2h0IC0gaW5mby5zcmNIZWlnaHQpIC8gMjtcbiAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgVGhvc2UgZnVuY3Rpb25zIHJlZ2lzdGVyIHRoZW1zZWx2ZXMgdG8gdGhlIGV2ZW50cyBvbiBpbml0IGFuZCBoYW5kbGUgYWxsXG4gICAgICB0aGUgdXNlciBpbnRlcmZhY2Ugc3BlY2lmaWMgc3R1ZmYuIE92ZXJ3cml0aW5nIHRoZW0gd29uJ3QgYnJlYWsgdGhlIHVwbG9hZFxuICAgICAgYnV0IGNhbiBicmVhayB0aGUgd2F5IGl0J3MgZGlzcGxheWVkLlxuICAgICAgWW91IGNhbiBvdmVyd3JpdGUgdGhlbSBpZiB5b3UgZG9uJ3QgbGlrZSB0aGUgZGVmYXVsdCBiZWhhdmlvci4gSWYgeW91IGp1c3RcbiAgICAgIHdhbnQgdG8gYWRkIGFuIGFkZGl0aW9uYWwgZXZlbnQgaGFuZGxlciwgcmVnaXN0ZXIgaXQgb24gdGhlIGRyb3B6b25lIG9iamVjdFxuICAgICAgYW5kIGRvbid0IG92ZXJ3cml0ZSB0aG9zZSBvcHRpb25zLlxuICAgICAgICovXG4gICAgICBkcm9wOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImR6LWRyYWctaG92ZXJcIik7XG4gICAgICB9LFxuICAgICAgZHJhZ3N0YXJ0OiBub29wLFxuICAgICAgZHJhZ2VuZDogZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkei1kcmFnLWhvdmVyXCIpO1xuICAgICAgfSxcbiAgICAgIGRyYWdlbnRlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1kcmFnLWhvdmVyXCIpO1xuICAgICAgfSxcbiAgICAgIGRyYWdvdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImR6LWRyYWctaG92ZXJcIik7XG4gICAgICB9LFxuICAgICAgZHJhZ2xlYXZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImR6LWRyYWctaG92ZXJcIik7XG4gICAgICB9LFxuICAgICAgcGFzdGU6IG5vb3AsXG4gICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImR6LXN0YXJ0ZWRcIik7XG4gICAgICB9LFxuICAgICAgYWRkZWRmaWxlOiBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIHZhciBub2RlLCByZW1vdmVGaWxlRXZlbnQsIHJlbW92ZUxpbmssIF9pLCBfaiwgX2ssIF9sZW4sIF9sZW4xLCBfbGVuMiwgX3JlZiwgX3JlZjEsIF9yZWYyLCBfcmVzdWx0cztcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudCA9PT0gdGhpcy5wcmV2aWV3c0NvbnRhaW5lcikge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotc3RhcnRlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcmV2aWV3c0NvbnRhaW5lcikge1xuICAgICAgICAgIGZpbGUucHJldmlld0VsZW1lbnQgPSBEcm9wem9uZS5jcmVhdGVFbGVtZW50KHRoaXMub3B0aW9ucy5wcmV2aWV3VGVtcGxhdGUudHJpbSgpKTtcbiAgICAgICAgICBmaWxlLnByZXZpZXdUZW1wbGF0ZSA9IGZpbGUucHJldmlld0VsZW1lbnQ7XG4gICAgICAgICAgdGhpcy5wcmV2aWV3c0NvbnRhaW5lci5hcHBlbmRDaGlsZChmaWxlLnByZXZpZXdFbGVtZW50KTtcbiAgICAgICAgICBfcmVmID0gZmlsZS5wcmV2aWV3RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtZHotbmFtZV1cIik7XG4gICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICBub2RlID0gX3JlZltfaV07XG4gICAgICAgICAgICBub2RlLnRleHRDb250ZW50ID0gdGhpcy5fcmVuYW1lRmlsZW5hbWUoZmlsZS5uYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3JlZjEgPSBmaWxlLnByZXZpZXdFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1kei1zaXplXVwiKTtcbiAgICAgICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMS5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICAgIG5vZGUgPSBfcmVmMVtfal07XG4gICAgICAgICAgICBub2RlLmlubmVySFRNTCA9IHRoaXMuZmlsZXNpemUoZmlsZS5zaXplKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hZGRSZW1vdmVMaW5rcykge1xuICAgICAgICAgICAgZmlsZS5fcmVtb3ZlTGluayA9IERyb3B6b25lLmNyZWF0ZUVsZW1lbnQoXCI8YSBjbGFzcz1cXFwiZHotcmVtb3ZlXFxcIiBocmVmPVxcXCJqYXZhc2NyaXB0OnVuZGVmaW5lZDtcXFwiIGRhdGEtZHotcmVtb3ZlPlwiICsgdGhpcy5vcHRpb25zLmRpY3RSZW1vdmVGaWxlICsgXCI8L2E+XCIpO1xuICAgICAgICAgICAgZmlsZS5wcmV2aWV3RWxlbWVudC5hcHBlbmRDaGlsZChmaWxlLl9yZW1vdmVMaW5rKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVtb3ZlRmlsZUV2ZW50ID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgIGlmIChmaWxlLnN0YXR1cyA9PT0gRHJvcHpvbmUuVVBMT0FESU5HKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIERyb3B6b25lLmNvbmZpcm0oX3RoaXMub3B0aW9ucy5kaWN0Q2FuY2VsVXBsb2FkQ29uZmlybWF0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5yZW1vdmVGaWxlKGZpbGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmRpY3RSZW1vdmVGaWxlQ29uZmlybWF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gRHJvcHpvbmUuY29uZmlybShfdGhpcy5vcHRpb25zLmRpY3RSZW1vdmVGaWxlQ29uZmlybWF0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnJlbW92ZUZpbGUoZmlsZSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnJlbW92ZUZpbGUoZmlsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKHRoaXMpO1xuICAgICAgICAgIF9yZWYyID0gZmlsZS5wcmV2aWV3RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtZHotcmVtb3ZlXVwiKTtcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2sgPSAwLCBfbGVuMiA9IF9yZWYyLmxlbmd0aDsgX2sgPCBfbGVuMjsgX2srKykge1xuICAgICAgICAgICAgcmVtb3ZlTGluayA9IF9yZWYyW19rXTtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2gocmVtb3ZlTGluay5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgcmVtb3ZlRmlsZUV2ZW50KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJlbW92ZWRmaWxlOiBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIHZhciBfcmVmO1xuICAgICAgICBpZiAoZmlsZS5wcmV2aWV3RWxlbWVudCkge1xuICAgICAgICAgIGlmICgoX3JlZiA9IGZpbGUucHJldmlld0VsZW1lbnQpICE9IG51bGwpIHtcbiAgICAgICAgICAgIF9yZWYucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChmaWxlLnByZXZpZXdFbGVtZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZU1heEZpbGVzUmVhY2hlZENsYXNzKCk7XG4gICAgICB9LFxuICAgICAgdGh1bWJuYWlsOiBmdW5jdGlvbihmaWxlLCBkYXRhVXJsKSB7XG4gICAgICAgIHZhciB0aHVtYm5haWxFbGVtZW50LCBfaSwgX2xlbiwgX3JlZjtcbiAgICAgICAgaWYgKGZpbGUucHJldmlld0VsZW1lbnQpIHtcbiAgICAgICAgICBmaWxlLnByZXZpZXdFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkei1maWxlLXByZXZpZXdcIik7XG4gICAgICAgICAgX3JlZiA9IGZpbGUucHJldmlld0VsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWR6LXRodW1ibmFpbF1cIik7XG4gICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICB0aHVtYm5haWxFbGVtZW50ID0gX3JlZltfaV07XG4gICAgICAgICAgICB0aHVtYm5haWxFbGVtZW50LmFsdCA9IGZpbGUubmFtZTtcbiAgICAgICAgICAgIHRodW1ibmFpbEVsZW1lbnQuc3JjID0gZGF0YVVybDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZmlsZS5wcmV2aWV3RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotaW1hZ2UtcHJldmlld1wiKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcykpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbihmaWxlLCBtZXNzYWdlKSB7XG4gICAgICAgIHZhciBub2RlLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgIGlmIChmaWxlLnByZXZpZXdFbGVtZW50KSB7XG4gICAgICAgICAgZmlsZS5wcmV2aWV3RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotZXJyb3JcIik7XG4gICAgICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSBcIlN0cmluZ1wiICYmIG1lc3NhZ2UuZXJyb3IpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLmVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfcmVmID0gZmlsZS5wcmV2aWV3RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtZHotZXJyb3JtZXNzYWdlXVwiKTtcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgbm9kZSA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChub2RlLnRleHRDb250ZW50ID0gbWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGVycm9ybXVsdGlwbGU6IG5vb3AsXG4gICAgICBwcm9jZXNzaW5nOiBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIGlmIChmaWxlLnByZXZpZXdFbGVtZW50KSB7XG4gICAgICAgICAgZmlsZS5wcmV2aWV3RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotcHJvY2Vzc2luZ1wiKTtcbiAgICAgICAgICBpZiAoZmlsZS5fcmVtb3ZlTGluaykge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGUuX3JlbW92ZUxpbmsudGV4dENvbnRlbnQgPSB0aGlzLm9wdGlvbnMuZGljdENhbmNlbFVwbG9hZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBwcm9jZXNzaW5nbXVsdGlwbGU6IG5vb3AsXG4gICAgICB1cGxvYWRwcm9ncmVzczogZnVuY3Rpb24oZmlsZSwgcHJvZ3Jlc3MsIGJ5dGVzU2VudCkge1xuICAgICAgICB2YXIgbm9kZSwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgICBpZiAoZmlsZS5wcmV2aWV3RWxlbWVudCkge1xuICAgICAgICAgIF9yZWYgPSBmaWxlLnByZXZpZXdFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1kei11cGxvYWRwcm9ncmVzc11cIik7XG4gICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgIG5vZGUgPSBfcmVmW19pXTtcbiAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAnUFJPR1JFU1MnKSB7XG4gICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2gobm9kZS52YWx1ZSA9IHByb2dyZXNzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2gobm9kZS5zdHlsZS53aWR0aCA9IFwiXCIgKyBwcm9ncmVzcyArIFwiJVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdG90YWx1cGxvYWRwcm9ncmVzczogbm9vcCxcbiAgICAgIHNlbmRpbmc6IG5vb3AsXG4gICAgICBzZW5kaW5nbXVsdGlwbGU6IG5vb3AsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIGlmIChmaWxlLnByZXZpZXdFbGVtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIGZpbGUucHJldmlld0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcImR6LXN1Y2Nlc3NcIik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzdWNjZXNzbXVsdGlwbGU6IG5vb3AsXG4gICAgICBjYW5jZWxlZDogZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbWl0KFwiZXJyb3JcIiwgZmlsZSwgXCJVcGxvYWQgY2FuY2VsZWQuXCIpO1xuICAgICAgfSxcbiAgICAgIGNhbmNlbGVkbXVsdGlwbGU6IG5vb3AsXG4gICAgICBjb21wbGV0ZTogZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICBpZiAoZmlsZS5fcmVtb3ZlTGluaykge1xuICAgICAgICAgIGZpbGUuX3JlbW92ZUxpbmsudGV4dENvbnRlbnQgPSB0aGlzLm9wdGlvbnMuZGljdFJlbW92ZUZpbGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbGUucHJldmlld0VsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gZmlsZS5wcmV2aWV3RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotY29tcGxldGVcIik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb21wbGV0ZW11bHRpcGxlOiBub29wLFxuICAgICAgbWF4ZmlsZXNleGNlZWRlZDogbm9vcCxcbiAgICAgIG1heGZpbGVzcmVhY2hlZDogbm9vcCxcbiAgICAgIHF1ZXVlY29tcGxldGU6IG5vb3AsXG4gICAgICBhZGRlZGZpbGVzOiBub29wLFxuICAgICAgcHJldmlld1RlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImR6LXByZXZpZXcgZHotZmlsZS1wcmV2aWV3XFxcIj5cXG4gIDxkaXYgY2xhc3M9XFxcImR6LWltYWdlXFxcIj48aW1nIGRhdGEtZHotdGh1bWJuYWlsIC8+PC9kaXY+XFxuICA8ZGl2IGNsYXNzPVxcXCJkei1kZXRhaWxzXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiZHotc2l6ZVxcXCI+PHNwYW4gZGF0YS1kei1zaXplPjwvc3Bhbj48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiZHotZmlsZW5hbWVcXFwiPjxzcGFuIGRhdGEtZHotbmFtZT48L3NwYW4+PC9kaXY+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImR6LXByb2dyZXNzXFxcIj48c3BhbiBjbGFzcz1cXFwiZHotdXBsb2FkXFxcIiBkYXRhLWR6LXVwbG9hZHByb2dyZXNzPjwvc3Bhbj48L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImR6LWVycm9yLW1lc3NhZ2VcXFwiPjxzcGFuIGRhdGEtZHotZXJyb3JtZXNzYWdlPjwvc3Bhbj48L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImR6LXN1Y2Nlc3MtbWFya1xcXCI+XFxuICAgIDxzdmcgd2lkdGg9XFxcIjU0cHhcXFwiIGhlaWdodD1cXFwiNTRweFxcXCIgdmlld0JveD1cXFwiMCAwIDU0IDU0XFxcIiB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIj5cXG4gICAgICA8dGl0bGU+Q2hlY2s8L3RpdGxlPlxcbiAgICAgIDxkZWZzPjwvZGVmcz5cXG4gICAgICA8ZyBpZD1cXFwiUGFnZS0xXFxcIiBzdHJva2U9XFxcIm5vbmVcXFwiIHN0cm9rZS13aWR0aD1cXFwiMVxcXCIgZmlsbD1cXFwibm9uZVxcXCIgZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBza2V0Y2g6dHlwZT1cXFwiTVNQYWdlXFxcIj5cXG4gICAgICAgIDxwYXRoIGQ9XFxcIk0yMy41LDMxLjg0MzE0NTggTDE3LjU4NTI0MTksMjUuOTI4Mzg3NyBDMTYuMDI0ODI1MywyNC4zNjc5NzExIDEzLjQ5MTAyOTQsMjQuMzY2ODM1IDExLjkyODkzMjIsMjUuOTI4OTMyMiBDMTAuMzcwMDEzNiwyNy40ODc4NTA4IDEwLjM2NjU5MTIsMzAuMDIzNDQ1NSAxMS45MjgzODc3LDMxLjU4NTI0MTkgTDIwLjQxNDc1ODEsNDAuMDcxNjEyMyBDMjAuNTEzMzk5OSw0MC4xNzAyNTQxIDIwLjYxNTkzMTUsNDAuMjYyNjY0OSAyMC43MjE4NjE1LDQwLjM0ODg0MzUgQzIyLjI4MzU2NjksNDEuODcyNTY1MSAyNC43OTQyMzQsNDEuODYyNjIwMiAyNi4zNDYxNTY0LDQwLjMxMDY5NzggTDQzLjMxMDY5NzgsMjMuMzQ2MTU2NCBDNDQuODc3MTAyMSwyMS43Nzk3NTIxIDQ0Ljg3NTgwNTcsMTkuMjQ4Mzg4NyA0My4zMTM3MDg1LDE3LjY4NjI5MTUgQzQxLjc1NDc4OTksMTYuMTI3MzcyOSAzOS4yMTc2MDM1LDE2LjEyNTU0MjIgMzcuNjUzODQzNiwxNy42ODkzMDIyIEwyMy41LDMxLjg0MzE0NTggWiBNMjcsNTMgQzQxLjM1OTQwMzUsNTMgNTMsNDEuMzU5NDAzNSA1MywyNyBDNTMsMTIuNjQwNTk2NSA0MS4zNTk0MDM1LDEgMjcsMSBDMTIuNjQwNTk2NSwxIDEsMTIuNjQwNTk2NSAxLDI3IEMxLDQxLjM1OTQwMzUgMTIuNjQwNTk2NSw1MyAyNyw1MyBaXFxcIiBpZD1cXFwiT3ZhbC0yXFxcIiBzdHJva2Utb3BhY2l0eT1cXFwiMC4xOTg3OTQxNThcXFwiIHN0cm9rZT1cXFwiIzc0NzQ3NFxcXCIgZmlsbC1vcGFjaXR5PVxcXCIwLjgxNjUxOTQ3NVxcXCIgZmlsbD1cXFwiI0ZGRkZGRlxcXCIgc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCI+PC9wYXRoPlxcbiAgICAgIDwvZz5cXG4gICAgPC9zdmc+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImR6LWVycm9yLW1hcmtcXFwiPlxcbiAgICA8c3ZnIHdpZHRoPVxcXCI1NHB4XFxcIiBoZWlnaHQ9XFxcIjU0cHhcXFwiIHZpZXdCb3g9XFxcIjAgMCA1NCA1NFxcXCIgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCI+XFxuICAgICAgPHRpdGxlPkVycm9yPC90aXRsZT5cXG4gICAgICA8ZGVmcz48L2RlZnM+XFxuICAgICAgPGcgaWQ9XFxcIlBhZ2UtMVxcXCIgc3Ryb2tlPVxcXCJub25lXFxcIiBzdHJva2Utd2lkdGg9XFxcIjFcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgc2tldGNoOnR5cGU9XFxcIk1TUGFnZVxcXCI+XFxuICAgICAgICA8ZyBpZD1cXFwiQ2hlY2stKy1PdmFsLTJcXFwiIHNrZXRjaDp0eXBlPVxcXCJNU0xheWVyR3JvdXBcXFwiIHN0cm9rZT1cXFwiIzc0NzQ3NFxcXCIgc3Ryb2tlLW9wYWNpdHk9XFxcIjAuMTk4Nzk0MTU4XFxcIiBmaWxsPVxcXCIjRkZGRkZGXFxcIiBmaWxsLW9wYWNpdHk9XFxcIjAuODE2NTE5NDc1XFxcIj5cXG4gICAgICAgICAgPHBhdGggZD1cXFwiTTMyLjY1Njg1NDIsMjkgTDM4LjMxMDY5NzgsMjMuMzQ2MTU2NCBDMzkuODc3MTAyMSwyMS43Nzk3NTIxIDM5Ljg3NTgwNTcsMTkuMjQ4Mzg4NyAzOC4zMTM3MDg1LDE3LjY4NjI5MTUgQzM2Ljc1NDc4OTksMTYuMTI3MzcyOSAzNC4yMTc2MDM1LDE2LjEyNTU0MjIgMzIuNjUzODQzNiwxNy42ODkzMDIyIEwyNywyMy4zNDMxNDU4IEwyMS4zNDYxNTY0LDE3LjY4OTMwMjIgQzE5Ljc4MjM5NjUsMTYuMTI1NTQyMiAxNy4yNDUyMTAxLDE2LjEyNzM3MjkgMTUuNjg2MjkxNSwxNy42ODYyOTE1IEMxNC4xMjQxOTQzLDE5LjI0ODM4ODcgMTQuMTIyODk3OSwyMS43Nzk3NTIxIDE1LjY4OTMwMjIsMjMuMzQ2MTU2NCBMMjEuMzQzMTQ1OCwyOSBMMTUuNjg5MzAyMiwzNC42NTM4NDM2IEMxNC4xMjI4OTc5LDM2LjIyMDI0NzkgMTQuMTI0MTk0MywzOC43NTE2MTEzIDE1LjY4NjI5MTUsNDAuMzEzNzA4NSBDMTcuMjQ1MjEwMSw0MS44NzI2MjcxIDE5Ljc4MjM5NjUsNDEuODc0NDU3OCAyMS4zNDYxNTY0LDQwLjMxMDY5NzggTDI3LDM0LjY1Njg1NDIgTDMyLjY1Mzg0MzYsNDAuMzEwNjk3OCBDMzQuMjE3NjAzNSw0MS44NzQ0NTc4IDM2Ljc1NDc4OTksNDEuODcyNjI3MSAzOC4zMTM3MDg1LDQwLjMxMzcwODUgQzM5Ljg3NTgwNTcsMzguNzUxNjExMyAzOS44NzcxMDIxLDM2LjIyMDI0NzkgMzguMzEwNjk3OCwzNC42NTM4NDM2IEwzMi42NTY4NTQyLDI5IFogTTI3LDUzIEM0MS4zNTk0MDM1LDUzIDUzLDQxLjM1OTQwMzUgNTMsMjcgQzUzLDEyLjY0MDU5NjUgNDEuMzU5NDAzNSwxIDI3LDEgQzEyLjY0MDU5NjUsMSAxLDEyLjY0MDU5NjUgMSwyNyBDMSw0MS4zNTk0MDM1IDEyLjY0MDU5NjUsNTMgMjcsNTMgWlxcXCIgaWQ9XFxcIk92YWwtMlxcXCIgc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCI+PC9wYXRoPlxcbiAgICAgICAgPC9nPlxcbiAgICAgIDwvZz5cXG4gICAgPC9zdmc+XFxuICA8L2Rpdj5cXG48L2Rpdj5cIlxuICAgIH07XG5cbiAgICBleHRlbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBrZXksIG9iamVjdCwgb2JqZWN0cywgdGFyZ2V0LCB2YWwsIF9pLCBfbGVuO1xuICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWzBdLCBvYmplY3RzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gb2JqZWN0cy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBvYmplY3QgPSBvYmplY3RzW19pXTtcbiAgICAgICAgZm9yIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgdmFsID0gb2JqZWN0W2tleV07XG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIERyb3B6b25lKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBlbGVtZW50T3B0aW9ucywgZmFsbGJhY2ssIF9yZWY7XG4gICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy52ZXJzaW9uID0gRHJvcHpvbmUudmVyc2lvbjtcbiAgICAgIHRoaXMuZGVmYXVsdE9wdGlvbnMucHJldmlld1RlbXBsYXRlID0gdGhpcy5kZWZhdWx0T3B0aW9ucy5wcmV2aWV3VGVtcGxhdGUucmVwbGFjZSgvXFxuKi9nLCBcIlwiKTtcbiAgICAgIHRoaXMuY2xpY2thYmxlRWxlbWVudHMgPSBbXTtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gICAgICB0aGlzLmZpbGVzID0gW107XG4gICAgICBpZiAodHlwZW9mIHRoaXMuZWxlbWVudCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuZWxlbWVudCk7XG4gICAgICB9XG4gICAgICBpZiAoISh0aGlzLmVsZW1lbnQgJiYgKHRoaXMuZWxlbWVudC5ub2RlVHlwZSAhPSBudWxsKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBkcm9wem9uZSBlbGVtZW50LlwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVsZW1lbnQuZHJvcHpvbmUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHJvcHpvbmUgYWxyZWFkeSBhdHRhY2hlZC5cIik7XG4gICAgICB9XG4gICAgICBEcm9wem9uZS5pbnN0YW5jZXMucHVzaCh0aGlzKTtcbiAgICAgIHRoaXMuZWxlbWVudC5kcm9wem9uZSA9IHRoaXM7XG4gICAgICBlbGVtZW50T3B0aW9ucyA9IChfcmVmID0gRHJvcHpvbmUub3B0aW9uc0ZvckVsZW1lbnQodGhpcy5lbGVtZW50KSkgIT0gbnVsbCA/IF9yZWYgOiB7fTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh7fSwgdGhpcy5kZWZhdWx0T3B0aW9ucywgZWxlbWVudE9wdGlvbnMsIG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMgOiB7fSk7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlRmFsbGJhY2sgfHwgIURyb3B6b25lLmlzQnJvd3NlclN1cHBvcnRlZCgpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZmFsbGJhY2suY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXJsID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLnVybCA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJhY3Rpb25cIik7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy51cmwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gVVJMIHByb3ZpZGVkLlwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWNjZXB0ZWRGaWxlcyAmJiB0aGlzLm9wdGlvbnMuYWNjZXB0ZWRNaW1lVHlwZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbid0IHByb3ZpZGUgYm90aCAnYWNjZXB0ZWRGaWxlcycgYW5kICdhY2NlcHRlZE1pbWVUeXBlcycuICdhY2NlcHRlZE1pbWVUeXBlcycgaXMgZGVwcmVjYXRlZC5cIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFjY2VwdGVkTWltZVR5cGVzKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5hY2NlcHRlZEZpbGVzID0gdGhpcy5vcHRpb25zLmFjY2VwdGVkTWltZVR5cGVzO1xuICAgICAgICBkZWxldGUgdGhpcy5vcHRpb25zLmFjY2VwdGVkTWltZVR5cGVzO1xuICAgICAgfVxuICAgICAgdGhpcy5vcHRpb25zLm1ldGhvZCA9IHRoaXMub3B0aW9ucy5tZXRob2QudG9VcHBlckNhc2UoKTtcbiAgICAgIGlmICgoZmFsbGJhY2sgPSB0aGlzLmdldEV4aXN0aW5nRmFsbGJhY2soKSkgJiYgZmFsbGJhY2sucGFyZW50Tm9kZSkge1xuICAgICAgICBmYWxsYmFjay5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGZhbGxiYWNrKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJldmlld3NDb250YWluZXIgIT09IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJldmlld3NDb250YWluZXIpIHtcbiAgICAgICAgICB0aGlzLnByZXZpZXdzQ29udGFpbmVyID0gRHJvcHpvbmUuZ2V0RWxlbWVudCh0aGlzLm9wdGlvbnMucHJldmlld3NDb250YWluZXIsIFwicHJldmlld3NDb250YWluZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5wcmV2aWV3c0NvbnRhaW5lciA9IHRoaXMuZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbGlja2FibGUpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbGlja2FibGUgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLmNsaWNrYWJsZUVsZW1lbnRzID0gW3RoaXMuZWxlbWVudF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5jbGlja2FibGVFbGVtZW50cyA9IERyb3B6b25lLmdldEVsZW1lbnRzKHRoaXMub3B0aW9ucy5jbGlja2FibGUsIFwiY2xpY2thYmxlXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZ2V0QWNjZXB0ZWRGaWxlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZpbGUsIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZWYgPSB0aGlzLmZpbGVzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBmaWxlID0gX3JlZltfaV07XG4gICAgICAgIGlmIChmaWxlLmFjY2VwdGVkKSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChmaWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZ2V0UmVqZWN0ZWRGaWxlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZpbGUsIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZWYgPSB0aGlzLmZpbGVzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBmaWxlID0gX3JlZltfaV07XG4gICAgICAgIGlmICghZmlsZS5hY2NlcHRlZCkge1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2goZmlsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmdldEZpbGVzV2l0aFN0YXR1cyA9IGZ1bmN0aW9uKHN0YXR1cykge1xuICAgICAgdmFyIGZpbGUsIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZWYgPSB0aGlzLmZpbGVzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBmaWxlID0gX3JlZltfaV07XG4gICAgICAgIGlmIChmaWxlLnN0YXR1cyA9PT0gc3RhdHVzKSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChmaWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZ2V0UXVldWVkRmlsZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZpbGVzV2l0aFN0YXR1cyhEcm9wem9uZS5RVUVVRUQpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZ2V0VXBsb2FkaW5nRmlsZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZpbGVzV2l0aFN0YXR1cyhEcm9wem9uZS5VUExPQURJTkcpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZ2V0QWRkZWRGaWxlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsZXNXaXRoU3RhdHVzKERyb3B6b25lLkFEREVEKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmdldEFjdGl2ZUZpbGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3JlZiA9IHRoaXMuZmlsZXM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBfcmVmW19pXTtcbiAgICAgICAgaWYgKGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5VUExPQURJTkcgfHwgZmlsZS5zdGF0dXMgPT09IERyb3B6b25lLlFVRVVFRCkge1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2goZmlsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBldmVudE5hbWUsIG5vUHJvcGFnYXRpb24sIHNldHVwSGlkZGVuRmlsZUlucHV0LCBfaSwgX2xlbiwgX3JlZiwgX3JlZjE7XG4gICAgICBpZiAodGhpcy5lbGVtZW50LnRhZ05hbWUgPT09IFwiZm9ybVwiKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJlbmN0eXBlXCIsIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIikgJiYgIXRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmR6LW1lc3NhZ2VcIikpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKERyb3B6b25lLmNyZWF0ZUVsZW1lbnQoXCI8ZGl2IGNsYXNzPVxcXCJkei1kZWZhdWx0IGR6LW1lc3NhZ2VcXFwiPjxzcGFuPlwiICsgdGhpcy5vcHRpb25zLmRpY3REZWZhdWx0TWVzc2FnZSArIFwiPC9zcGFuPjwvZGl2PlwiKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5jbGlja2FibGVFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgc2V0dXBIaWRkZW5GaWxlSW5wdXQgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMuaGlkZGVuRmlsZUlucHV0KSB7XG4gICAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKF90aGlzLmhpZGRlbkZpbGVJbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5oaWRkZW5GaWxlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICBfdGhpcy5oaWRkZW5GaWxlSW5wdXQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImZpbGVcIik7XG4gICAgICAgICAgICBpZiAoKF90aGlzLm9wdGlvbnMubWF4RmlsZXMgPT0gbnVsbCkgfHwgX3RoaXMub3B0aW9ucy5tYXhGaWxlcyA+IDEpIHtcbiAgICAgICAgICAgICAgX3RoaXMuaGlkZGVuRmlsZUlucHV0LnNldEF0dHJpYnV0ZShcIm11bHRpcGxlXCIsIFwibXVsdGlwbGVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5oaWRkZW5GaWxlSW5wdXQuY2xhc3NOYW1lID0gXCJkei1oaWRkZW4taW5wdXRcIjtcbiAgICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmFjY2VwdGVkRmlsZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfdGhpcy5oaWRkZW5GaWxlSW5wdXQuc2V0QXR0cmlidXRlKFwiYWNjZXB0XCIsIF90aGlzLm9wdGlvbnMuYWNjZXB0ZWRGaWxlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5jYXB0dXJlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgX3RoaXMuaGlkZGVuRmlsZUlucHV0LnNldEF0dHJpYnV0ZShcImNhcHR1cmVcIiwgX3RoaXMub3B0aW9ucy5jYXB0dXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5zdHlsZS50b3AgPSBcIjBcIjtcbiAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5zdHlsZS5sZWZ0ID0gXCIwXCI7XG4gICAgICAgICAgICBfdGhpcy5oaWRkZW5GaWxlSW5wdXQuc3R5bGUuaGVpZ2h0ID0gXCIwXCI7XG4gICAgICAgICAgICBfdGhpcy5oaWRkZW5GaWxlSW5wdXQuc3R5bGUud2lkdGggPSBcIjBcIjtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoX3RoaXMub3B0aW9ucy5oaWRkZW5JbnB1dENvbnRhaW5lcikuYXBwZW5kQ2hpbGQoX3RoaXMuaGlkZGVuRmlsZUlucHV0KTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5oaWRkZW5GaWxlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIGZpbGUsIGZpbGVzLCBfaSwgX2xlbjtcbiAgICAgICAgICAgICAgZmlsZXMgPSBfdGhpcy5oaWRkZW5GaWxlSW5wdXQuZmlsZXM7XG4gICAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGZpbGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICBmaWxlID0gZmlsZXNbX2ldO1xuICAgICAgICAgICAgICAgICAgX3RoaXMuYWRkRmlsZShmaWxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgX3RoaXMuZW1pdChcImFkZGVkZmlsZXNcIiwgZmlsZXMpO1xuICAgICAgICAgICAgICByZXR1cm4gc2V0dXBIaWRkZW5GaWxlSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpO1xuICAgICAgICBzZXR1cEhpZGRlbkZpbGVJbnB1dCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5VUkwgPSAoX3JlZiA9IHdpbmRvdy5VUkwpICE9IG51bGwgPyBfcmVmIDogd2luZG93LndlYmtpdFVSTDtcbiAgICAgIF9yZWYxID0gdGhpcy5ldmVudHM7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYxLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGV2ZW50TmFtZSA9IF9yZWYxW19pXTtcbiAgICAgICAgdGhpcy5vbihldmVudE5hbWUsIHRoaXMub3B0aW9uc1tldmVudE5hbWVdKTtcbiAgICAgIH1cbiAgICAgIHRoaXMub24oXCJ1cGxvYWRwcm9ncmVzc1wiLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy51cGRhdGVUb3RhbFVwbG9hZFByb2dyZXNzKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICB0aGlzLm9uKFwicmVtb3ZlZGZpbGVcIiwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMudXBkYXRlVG90YWxVcGxvYWRQcm9ncmVzcygpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy5vbihcImNhbmNlbGVkXCIsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5lbWl0KFwiY29tcGxldGVcIiwgZmlsZSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICB0aGlzLm9uKFwiY29tcGxldGVcIiwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgaWYgKF90aGlzLmdldEFkZGVkRmlsZXMoKS5sZW5ndGggPT09IDAgJiYgX3RoaXMuZ2V0VXBsb2FkaW5nRmlsZXMoKS5sZW5ndGggPT09IDAgJiYgX3RoaXMuZ2V0UXVldWVkRmlsZXMoKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmVtaXQoXCJxdWV1ZWNvbXBsZXRlXCIpO1xuICAgICAgICAgICAgfSksIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIG5vUHJvcGFnYXRpb24gPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICBcImRyYWdzdGFydFwiOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZW1pdChcImRyYWdzdGFydFwiLCBlKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKHRoaXMpLFxuICAgICAgICAgICAgXCJkcmFnZW50ZXJcIjogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgbm9Qcm9wYWdhdGlvbihlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZW1pdChcImRyYWdlbnRlclwiLCBlKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKHRoaXMpLFxuICAgICAgICAgICAgXCJkcmFnb3ZlclwiOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWZjdDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgZWZjdCA9IGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQ7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7fVxuICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZScgPT09IGVmY3QgfHwgJ2xpbmtNb3ZlJyA9PT0gZWZjdCA/ICdtb3ZlJyA6ICdjb3B5JztcbiAgICAgICAgICAgICAgICBub1Byb3BhZ2F0aW9uKGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5lbWl0KFwiZHJhZ292ZXJcIiwgZSk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSh0aGlzKSxcbiAgICAgICAgICAgIFwiZHJhZ2xlYXZlXCI6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5lbWl0KFwiZHJhZ2xlYXZlXCIsIGUpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkodGhpcyksXG4gICAgICAgICAgICBcImRyb3BcIjogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgbm9Qcm9wYWdhdGlvbihlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZHJvcChlKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKHRoaXMpLFxuICAgICAgICAgICAgXCJkcmFnZW5kXCI6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5lbWl0KFwiZHJhZ2VuZFwiLCBlKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKHRoaXMpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdO1xuICAgICAgdGhpcy5jbGlja2FibGVFbGVtZW50cy5mb3JFYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oY2xpY2thYmxlRWxlbWVudCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5saXN0ZW5lcnMucHVzaCh7XG4gICAgICAgICAgICBlbGVtZW50OiBjbGlja2FibGVFbGVtZW50LFxuICAgICAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAgIFwiY2xpY2tcIjogZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICAgICAgaWYgKChjbGlja2FibGVFbGVtZW50ICE9PSBfdGhpcy5lbGVtZW50KSB8fCAoZXZ0LnRhcmdldCA9PT0gX3RoaXMuZWxlbWVudCB8fCBEcm9wem9uZS5lbGVtZW50SW5zaWRlKGV2dC50YXJnZXQsIF90aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5kei1tZXNzYWdlXCIpKSkpIHtcbiAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGRlbkZpbGVJbnB1dC5jbGljaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy5lbmFibGUoKTtcbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaW5pdC5jYWxsKHRoaXMpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF9yZWY7XG4gICAgICB0aGlzLmRpc2FibGUoKTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsRmlsZXModHJ1ZSk7XG4gICAgICBpZiAoKF9yZWYgPSB0aGlzLmhpZGRlbkZpbGVJbnB1dCkgIT0gbnVsbCA/IF9yZWYucGFyZW50Tm9kZSA6IHZvaWQgMCkge1xuICAgICAgICB0aGlzLmhpZGRlbkZpbGVJbnB1dC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuaGlkZGVuRmlsZUlucHV0KTtcbiAgICAgICAgdGhpcy5oaWRkZW5GaWxlSW5wdXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgZGVsZXRlIHRoaXMuZWxlbWVudC5kcm9wem9uZTtcbiAgICAgIHJldHVybiBEcm9wem9uZS5pbnN0YW5jZXMuc3BsaWNlKERyb3B6b25lLmluc3RhbmNlcy5pbmRleE9mKHRoaXMpLCAxKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnVwZGF0ZVRvdGFsVXBsb2FkUHJvZ3Jlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhY3RpdmVGaWxlcywgZmlsZSwgdG90YWxCeXRlcywgdG90YWxCeXRlc1NlbnQsIHRvdGFsVXBsb2FkUHJvZ3Jlc3MsIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgdG90YWxCeXRlc1NlbnQgPSAwO1xuICAgICAgdG90YWxCeXRlcyA9IDA7XG4gICAgICBhY3RpdmVGaWxlcyA9IHRoaXMuZ2V0QWN0aXZlRmlsZXMoKTtcbiAgICAgIGlmIChhY3RpdmVGaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgX3JlZiA9IHRoaXMuZ2V0QWN0aXZlRmlsZXMoKTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgZmlsZSA9IF9yZWZbX2ldO1xuICAgICAgICAgIHRvdGFsQnl0ZXNTZW50ICs9IGZpbGUudXBsb2FkLmJ5dGVzU2VudDtcbiAgICAgICAgICB0b3RhbEJ5dGVzICs9IGZpbGUudXBsb2FkLnRvdGFsO1xuICAgICAgICB9XG4gICAgICAgIHRvdGFsVXBsb2FkUHJvZ3Jlc3MgPSAxMDAgKiB0b3RhbEJ5dGVzU2VudCAvIHRvdGFsQnl0ZXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b3RhbFVwbG9hZFByb2dyZXNzID0gMTAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZW1pdChcInRvdGFsdXBsb2FkcHJvZ3Jlc3NcIiwgdG90YWxVcGxvYWRQcm9ncmVzcywgdG90YWxCeXRlcywgdG90YWxCeXRlc1NlbnQpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuX2dldFBhcmFtTmFtZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLnBhcmFtTmFtZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMucGFyYW1OYW1lKG4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiXCIgKyB0aGlzLm9wdGlvbnMucGFyYW1OYW1lICsgKHRoaXMub3B0aW9ucy51cGxvYWRNdWx0aXBsZSA/IFwiW1wiICsgbiArIFwiXVwiIDogXCJcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5fcmVuYW1lRmlsZW5hbWUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5yZW5hbWVGaWxlbmFtZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5yZW5hbWVGaWxlbmFtZShuYW1lKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmdldEZhbGxiYWNrRm9ybSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGV4aXN0aW5nRmFsbGJhY2ssIGZpZWxkcywgZmllbGRzU3RyaW5nLCBmb3JtO1xuICAgICAgaWYgKGV4aXN0aW5nRmFsbGJhY2sgPSB0aGlzLmdldEV4aXN0aW5nRmFsbGJhY2soKSkge1xuICAgICAgICByZXR1cm4gZXhpc3RpbmdGYWxsYmFjaztcbiAgICAgIH1cbiAgICAgIGZpZWxkc1N0cmluZyA9IFwiPGRpdiBjbGFzcz1cXFwiZHotZmFsbGJhY2tcXFwiPlwiO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaWN0RmFsbGJhY2tUZXh0KSB7XG4gICAgICAgIGZpZWxkc1N0cmluZyArPSBcIjxwPlwiICsgdGhpcy5vcHRpb25zLmRpY3RGYWxsYmFja1RleHQgKyBcIjwvcD5cIjtcbiAgICAgIH1cbiAgICAgIGZpZWxkc1N0cmluZyArPSBcIjxpbnB1dCB0eXBlPVxcXCJmaWxlXFxcIiBuYW1lPVxcXCJcIiArICh0aGlzLl9nZXRQYXJhbU5hbWUoMCkpICsgXCJcXFwiIFwiICsgKHRoaXMub3B0aW9ucy51cGxvYWRNdWx0aXBsZSA/ICdtdWx0aXBsZT1cIm11bHRpcGxlXCInIDogdm9pZCAwKSArIFwiIC8+PGlucHV0IHR5cGU9XFxcInN1Ym1pdFxcXCIgdmFsdWU9XFxcIlVwbG9hZCFcXFwiPjwvZGl2PlwiO1xuICAgICAgZmllbGRzID0gRHJvcHpvbmUuY3JlYXRlRWxlbWVudChmaWVsZHNTdHJpbmcpO1xuICAgICAgaWYgKHRoaXMuZWxlbWVudC50YWdOYW1lICE9PSBcIkZPUk1cIikge1xuICAgICAgICBmb3JtID0gRHJvcHpvbmUuY3JlYXRlRWxlbWVudChcIjxmb3JtIGFjdGlvbj1cXFwiXCIgKyB0aGlzLm9wdGlvbnMudXJsICsgXCJcXFwiIGVuY3R5cGU9XFxcIm11bHRpcGFydC9mb3JtLWRhdGFcXFwiIG1ldGhvZD1cXFwiXCIgKyB0aGlzLm9wdGlvbnMubWV0aG9kICsgXCJcXFwiPjwvZm9ybT5cIik7XG4gICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQoZmllbGRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJlbmN0eXBlXCIsIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcIm1ldGhvZFwiLCB0aGlzLm9wdGlvbnMubWV0aG9kKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmb3JtICE9IG51bGwgPyBmb3JtIDogZmllbGRzO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZ2V0RXhpc3RpbmdGYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZhbGxiYWNrLCBnZXRGYWxsYmFjaywgdGFnTmFtZSwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICBnZXRGYWxsYmFjayA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgIHZhciBlbCwgX2ksIF9sZW47XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZWxlbWVudHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBlbCA9IGVsZW1lbnRzW19pXTtcbiAgICAgICAgICBpZiAoLyhefCApZmFsbGJhY2soJHwgKS8udGVzdChlbC5jbGFzc05hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgX3JlZiA9IFtcImRpdlwiLCBcImZvcm1cIl07XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgdGFnTmFtZSA9IF9yZWZbX2ldO1xuICAgICAgICBpZiAoZmFsbGJhY2sgPSBnZXRGYWxsYmFjayh0aGlzLmVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSkpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5zZXR1cEV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWxlbWVudExpc3RlbmVycywgZXZlbnQsIGxpc3RlbmVyLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVmID0gdGhpcy5saXN0ZW5lcnM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGVsZW1lbnRMaXN0ZW5lcnMgPSBfcmVmW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9yZWYxLCBfcmVzdWx0czE7XG4gICAgICAgICAgX3JlZjEgPSBlbGVtZW50TGlzdGVuZXJzLmV2ZW50cztcbiAgICAgICAgICBfcmVzdWx0czEgPSBbXTtcbiAgICAgICAgICBmb3IgKGV2ZW50IGluIF9yZWYxKSB7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IF9yZWYxW2V2ZW50XTtcbiAgICAgICAgICAgIF9yZXN1bHRzMS5wdXNoKGVsZW1lbnRMaXN0ZW5lcnMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lciwgZmFsc2UpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIF9yZXN1bHRzMTtcbiAgICAgICAgfSkoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVsZW1lbnRMaXN0ZW5lcnMsIGV2ZW50LCBsaXN0ZW5lciwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3JlZiA9IHRoaXMubGlzdGVuZXJzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBlbGVtZW50TGlzdGVuZXJzID0gX3JlZltfaV07XG4gICAgICAgIF9yZXN1bHRzLnB1c2goKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfcmVmMSwgX3Jlc3VsdHMxO1xuICAgICAgICAgIF9yZWYxID0gZWxlbWVudExpc3RlbmVycy5ldmVudHM7XG4gICAgICAgICAgX3Jlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChldmVudCBpbiBfcmVmMSkge1xuICAgICAgICAgICAgbGlzdGVuZXIgPSBfcmVmMVtldmVudF07XG4gICAgICAgICAgICBfcmVzdWx0czEucHVzaChlbGVtZW50TGlzdGVuZXJzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIsIGZhbHNlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfcmVzdWx0czE7XG4gICAgICAgIH0pKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZpbGUsIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIHRoaXMuY2xpY2thYmxlRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkei1jbGlja2FibGVcIik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIF9yZWYgPSB0aGlzLmZpbGVzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBmaWxlID0gX3JlZltfaV07XG4gICAgICAgIF9yZXN1bHRzLnB1c2godGhpcy5jYW5jZWxVcGxvYWQoZmlsZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmNsaWNrYWJsZUVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotY2xpY2thYmxlXCIpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5zZXR1cEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5maWxlc2l6ZSA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgIHZhciBjdXRvZmYsIGksIHNlbGVjdGVkU2l6ZSwgc2VsZWN0ZWRVbml0LCB1bml0LCB1bml0cywgX2ksIF9sZW47XG4gICAgICBzZWxlY3RlZFNpemUgPSAwO1xuICAgICAgc2VsZWN0ZWRVbml0ID0gXCJiXCI7XG4gICAgICBpZiAoc2l6ZSA+IDApIHtcbiAgICAgICAgdW5pdHMgPSBbJ1RCJywgJ0dCJywgJ01CJywgJ0tCJywgJ2InXTtcbiAgICAgICAgZm9yIChpID0gX2kgPSAwLCBfbGVuID0gdW5pdHMubGVuZ3RoOyBfaSA8IF9sZW47IGkgPSArK19pKSB7XG4gICAgICAgICAgdW5pdCA9IHVuaXRzW2ldO1xuICAgICAgICAgIGN1dG9mZiA9IE1hdGgucG93KHRoaXMub3B0aW9ucy5maWxlc2l6ZUJhc2UsIDQgLSBpKSAvIDEwO1xuICAgICAgICAgIGlmIChzaXplID49IGN1dG9mZikge1xuICAgICAgICAgICAgc2VsZWN0ZWRTaXplID0gc2l6ZSAvIE1hdGgucG93KHRoaXMub3B0aW9ucy5maWxlc2l6ZUJhc2UsIDQgLSBpKTtcbiAgICAgICAgICAgIHNlbGVjdGVkVW5pdCA9IHVuaXQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0ZWRTaXplID0gTWF0aC5yb3VuZCgxMCAqIHNlbGVjdGVkU2l6ZSkgLyAxMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIjxzdHJvbmc+XCIgKyBzZWxlY3RlZFNpemUgKyBcIjwvc3Ryb25nPiBcIiArIHNlbGVjdGVkVW5pdDtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLl91cGRhdGVNYXhGaWxlc1JlYWNoZWRDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCh0aGlzLm9wdGlvbnMubWF4RmlsZXMgIT0gbnVsbCkgJiYgdGhpcy5nZXRBY2NlcHRlZEZpbGVzKCkubGVuZ3RoID49IHRoaXMub3B0aW9ucy5tYXhGaWxlcykge1xuICAgICAgICBpZiAodGhpcy5nZXRBY2NlcHRlZEZpbGVzKCkubGVuZ3RoID09PSB0aGlzLm9wdGlvbnMubWF4RmlsZXMpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ21heGZpbGVzcmVhY2hlZCcsIHRoaXMuZmlsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImR6LW1heC1maWxlcy1yZWFjaGVkXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHotbWF4LWZpbGVzLXJlYWNoZWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5kcm9wID0gZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGZpbGVzLCBpdGVtcztcbiAgICAgIGlmICghZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5lbWl0KFwiZHJvcFwiLCBlKTtcbiAgICAgIGZpbGVzID0gZS5kYXRhVHJhbnNmZXIuZmlsZXM7XG4gICAgICB0aGlzLmVtaXQoXCJhZGRlZGZpbGVzXCIsIGZpbGVzKTtcbiAgICAgIGlmIChmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaXRlbXMgPSBlLmRhdGFUcmFuc2Zlci5pdGVtcztcbiAgICAgICAgaWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCAmJiAoaXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuX2FkZEZpbGVzRnJvbUl0ZW1zKGl0ZW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZUZpbGVzKGZpbGVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUucGFzdGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgaXRlbXMsIF9yZWY7XG4gICAgICBpZiAoKGUgIT0gbnVsbCA/IChfcmVmID0gZS5jbGlwYm9hcmREYXRhKSAhPSBudWxsID8gX3JlZi5pdGVtcyA6IHZvaWQgMCA6IHZvaWQgMCkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoXCJwYXN0ZVwiLCBlKTtcbiAgICAgIGl0ZW1zID0gZS5jbGlwYm9hcmREYXRhLml0ZW1zO1xuICAgICAgaWYgKGl0ZW1zLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkRmlsZXNGcm9tSXRlbXMoaXRlbXMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuaGFuZGxlRmlsZXMgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICAgdmFyIGZpbGUsIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGZpbGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBmaWxlc1tfaV07XG4gICAgICAgIF9yZXN1bHRzLnB1c2godGhpcy5hZGRGaWxlKGZpbGUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLl9hZGRGaWxlc0Zyb21JdGVtcyA9IGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgICB2YXIgZW50cnksIGl0ZW0sIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGl0ZW1zLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBpdGVtc1tfaV07XG4gICAgICAgIGlmICgoaXRlbS53ZWJraXRHZXRBc0VudHJ5ICE9IG51bGwpICYmIChlbnRyeSA9IGl0ZW0ud2Via2l0R2V0QXNFbnRyeSgpKSkge1xuICAgICAgICAgIGlmIChlbnRyeS5pc0ZpbGUpIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godGhpcy5hZGRGaWxlKGl0ZW0uZ2V0QXNGaWxlKCkpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHRoaXMuX2FkZEZpbGVzRnJvbURpcmVjdG9yeShlbnRyeSwgZW50cnkubmFtZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uZ2V0QXNGaWxlICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAoKGl0ZW0ua2luZCA9PSBudWxsKSB8fCBpdGVtLmtpbmQgPT09IFwiZmlsZVwiKSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHRoaXMuYWRkRmlsZShpdGVtLmdldEFzRmlsZSgpKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5fYWRkRmlsZXNGcm9tRGlyZWN0b3J5ID0gZnVuY3Rpb24oZGlyZWN0b3J5LCBwYXRoKSB7XG4gICAgICB2YXIgZGlyUmVhZGVyLCBlcnJvckhhbmRsZXIsIHJlYWRFbnRyaWVzO1xuICAgICAgZGlyUmVhZGVyID0gZGlyZWN0b3J5LmNyZWF0ZVJlYWRlcigpO1xuICAgICAgZXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIGNvbnNvbGUgIT09IG51bGwgPyB0eXBlb2YgY29uc29sZS5sb2cgPT09IFwiZnVuY3Rpb25cIiA/IGNvbnNvbGUubG9nKGVycm9yKSA6IHZvaWQgMCA6IHZvaWQgMDtcbiAgICAgIH07XG4gICAgICByZWFkRW50cmllcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGRpclJlYWRlci5yZWFkRW50cmllcyhmdW5jdGlvbihlbnRyaWVzKSB7XG4gICAgICAgICAgICB2YXIgZW50cnksIF9pLCBfbGVuO1xuICAgICAgICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGVudHJpZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICBlbnRyeSA9IGVudHJpZXNbX2ldO1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5pc0ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIGVudHJ5LmZpbGUoZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5pZ25vcmVIaWRkZW5GaWxlcyAmJiBmaWxlLm5hbWUuc3Vic3RyaW5nKDAsIDEpID09PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmlsZS5mdWxsUGF0aCA9IFwiXCIgKyBwYXRoICsgXCIvXCIgKyBmaWxlLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5hZGRGaWxlKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0RpcmVjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgX3RoaXMuX2FkZEZpbGVzRnJvbURpcmVjdG9yeShlbnRyeSwgXCJcIiArIHBhdGggKyBcIi9cIiArIGVudHJ5Lm5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZWFkRW50cmllcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfSwgZXJyb3JIYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgcmV0dXJuIHJlYWRFbnRyaWVzKCk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbihmaWxlLCBkb25lKSB7XG4gICAgICBpZiAoZmlsZS5zaXplID4gdGhpcy5vcHRpb25zLm1heEZpbGVzaXplICogMTAyNCAqIDEwMjQpIHtcbiAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5vcHRpb25zLmRpY3RGaWxlVG9vQmlnLnJlcGxhY2UoXCJ7e2ZpbGVzaXplfX1cIiwgTWF0aC5yb3VuZChmaWxlLnNpemUgLyAxMDI0IC8gMTAuMjQpIC8gMTAwKS5yZXBsYWNlKFwie3ttYXhGaWxlc2l6ZX19XCIsIHRoaXMub3B0aW9ucy5tYXhGaWxlc2l6ZSkpO1xuICAgICAgfSBlbHNlIGlmICghRHJvcHpvbmUuaXNWYWxpZEZpbGUoZmlsZSwgdGhpcy5vcHRpb25zLmFjY2VwdGVkRmlsZXMpKSB7XG4gICAgICAgIHJldHVybiBkb25lKHRoaXMub3B0aW9ucy5kaWN0SW52YWxpZEZpbGVUeXBlKTtcbiAgICAgIH0gZWxzZSBpZiAoKHRoaXMub3B0aW9ucy5tYXhGaWxlcyAhPSBudWxsKSAmJiB0aGlzLmdldEFjY2VwdGVkRmlsZXMoKS5sZW5ndGggPj0gdGhpcy5vcHRpb25zLm1heEZpbGVzKSB7XG4gICAgICAgIGRvbmUodGhpcy5vcHRpb25zLmRpY3RNYXhGaWxlc0V4Y2VlZGVkLnJlcGxhY2UoXCJ7e21heEZpbGVzfX1cIiwgdGhpcy5vcHRpb25zLm1heEZpbGVzKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmVtaXQoXCJtYXhmaWxlc2V4Y2VlZGVkXCIsIGZpbGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hY2NlcHQuY2FsbCh0aGlzLCBmaWxlLCBkb25lKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmFkZEZpbGUgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgICBmaWxlLnVwbG9hZCA9IHtcbiAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgIHRvdGFsOiBmaWxlLnNpemUsXG4gICAgICAgIGJ5dGVzU2VudDogMFxuICAgICAgfTtcbiAgICAgIHRoaXMuZmlsZXMucHVzaChmaWxlKTtcbiAgICAgIGZpbGUuc3RhdHVzID0gRHJvcHpvbmUuQURERUQ7XG4gICAgICB0aGlzLmVtaXQoXCJhZGRlZGZpbGVcIiwgZmlsZSk7XG4gICAgICB0aGlzLl9lbnF1ZXVlVGh1bWJuYWlsKGZpbGUpO1xuICAgICAgcmV0dXJuIHRoaXMuYWNjZXB0KGZpbGUsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGZpbGUuYWNjZXB0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF90aGlzLl9lcnJvclByb2Nlc3NpbmcoW2ZpbGVdLCBlcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbGUuYWNjZXB0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMuYXV0b1F1ZXVlKSB7XG4gICAgICAgICAgICAgIF90aGlzLmVucXVldWVGaWxlKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3RoaXMuX3VwZGF0ZU1heEZpbGVzUmVhY2hlZENsYXNzKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5lbnF1ZXVlRmlsZXMgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICAgdmFyIGZpbGUsIF9pLCBfbGVuO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBmaWxlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBmaWxlID0gZmlsZXNbX2ldO1xuICAgICAgICB0aGlzLmVucXVldWVGaWxlKGZpbGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5lbnF1ZXVlRmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgIGlmIChmaWxlLnN0YXR1cyA9PT0gRHJvcHpvbmUuQURERUQgJiYgZmlsZS5hY2NlcHRlZCA9PT0gdHJ1ZSkge1xuICAgICAgICBmaWxlLnN0YXR1cyA9IERyb3B6b25lLlFVRVVFRDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUHJvY2Vzc1F1ZXVlKSB7XG4gICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMucHJvY2Vzc1F1ZXVlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKHRoaXMpKSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgZmlsZSBjYW4ndCBiZSBxdWV1ZWQgYmVjYXVzZSBpdCBoYXMgYWxyZWFkeSBiZWVuIHByb2Nlc3NlZCBvciB3YXMgcmVqZWN0ZWQuXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuX3RodW1ibmFpbFF1ZXVlID0gW107XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuX3Byb2Nlc3NpbmdUaHVtYm5haWwgPSBmYWxzZTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5fZW5xdWV1ZVRodW1ibmFpbCA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3JlYXRlSW1hZ2VUaHVtYm5haWxzICYmIGZpbGUudHlwZS5tYXRjaCgvaW1hZ2UuKi8pICYmIGZpbGUuc2l6ZSA8PSB0aGlzLm9wdGlvbnMubWF4VGh1bWJuYWlsRmlsZXNpemUgKiAxMDI0ICogMTAyNCkge1xuICAgICAgICB0aGlzLl90aHVtYm5haWxRdWV1ZS5wdXNoKGZpbGUpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dCgoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLl9wcm9jZXNzVGh1bWJuYWlsUXVldWUoKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKSksIDApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuX3Byb2Nlc3NUaHVtYm5haWxRdWV1ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX3Byb2Nlc3NpbmdUaHVtYm5haWwgfHwgdGhpcy5fdGh1bWJuYWlsUXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3Byb2Nlc3NpbmdUaHVtYm5haWwgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVGh1bWJuYWlsKHRoaXMuX3RodW1ibmFpbFF1ZXVlLnNoaWZ0KCksIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuX3Byb2Nlc3NpbmdUaHVtYm5haWwgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuX3Byb2Nlc3NUaHVtYm5haWxRdWV1ZSgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUucmVtb3ZlRmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgIGlmIChmaWxlLnN0YXR1cyA9PT0gRHJvcHpvbmUuVVBMT0FESU5HKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsVXBsb2FkKGZpbGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5maWxlcyA9IHdpdGhvdXQodGhpcy5maWxlcywgZmlsZSk7XG4gICAgICB0aGlzLmVtaXQoXCJyZW1vdmVkZmlsZVwiLCBmaWxlKTtcbiAgICAgIGlmICh0aGlzLmZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbWl0KFwicmVzZXRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5yZW1vdmVBbGxGaWxlcyA9IGZ1bmN0aW9uKGNhbmNlbElmTmVjZXNzYXJ5KSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICBpZiAoY2FuY2VsSWZOZWNlc3NhcnkgPT0gbnVsbCkge1xuICAgICAgICBjYW5jZWxJZk5lY2Vzc2FyeSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgX3JlZiA9IHRoaXMuZmlsZXMuc2xpY2UoKTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBmaWxlID0gX3JlZltfaV07XG4gICAgICAgIGlmIChmaWxlLnN0YXR1cyAhPT0gRHJvcHpvbmUuVVBMT0FESU5HIHx8IGNhbmNlbElmTmVjZXNzYXJ5KSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVGaWxlKGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmNyZWF0ZVRodW1ibmFpbCA9IGZ1bmN0aW9uKGZpbGUsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgZmlsZVJlYWRlcjtcbiAgICAgIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcjtcbiAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoZmlsZS50eXBlID09PSBcImltYWdlL3N2Zyt4bWxcIikge1xuICAgICAgICAgICAgX3RoaXMuZW1pdChcInRodW1ibmFpbFwiLCBmaWxlLCBmaWxlUmVhZGVyLnJlc3VsdCk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3RoaXMuY3JlYXRlVGh1bWJuYWlsRnJvbVVybChmaWxlLCBmaWxlUmVhZGVyLnJlc3VsdCwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICByZXR1cm4gZmlsZVJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgIH07XG5cbiAgICBEcm9wem9uZS5wcm90b3R5cGUuY3JlYXRlVGh1bWJuYWlsRnJvbVVybCA9IGZ1bmN0aW9uKGZpbGUsIGltYWdlVXJsLCBjYWxsYmFjaywgY3Jvc3NPcmlnaW4pIHtcbiAgICAgIHZhciBpbWc7XG4gICAgICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgaWYgKGNyb3NzT3JpZ2luKSB7XG4gICAgICAgIGltZy5jcm9zc09yaWdpbiA9IGNyb3NzT3JpZ2luO1xuICAgICAgfVxuICAgICAgaW1nLm9ubG9hZCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGNhbnZhcywgY3R4LCByZXNpemVJbmZvLCB0aHVtYm5haWwsIF9yZWYsIF9yZWYxLCBfcmVmMiwgX3JlZjM7XG4gICAgICAgICAgZmlsZS53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgICBmaWxlLmhlaWdodCA9IGltZy5oZWlnaHQ7XG4gICAgICAgICAgcmVzaXplSW5mbyA9IF90aGlzLm9wdGlvbnMucmVzaXplLmNhbGwoX3RoaXMsIGZpbGUpO1xuICAgICAgICAgIGlmIChyZXNpemVJbmZvLnRyZ1dpZHRoID09IG51bGwpIHtcbiAgICAgICAgICAgIHJlc2l6ZUluZm8udHJnV2lkdGggPSByZXNpemVJbmZvLm9wdFdpZHRoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocmVzaXplSW5mby50cmdIZWlnaHQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzaXplSW5mby50cmdIZWlnaHQgPSByZXNpemVJbmZvLm9wdEhlaWdodDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHJlc2l6ZUluZm8udHJnV2lkdGg7XG4gICAgICAgICAgY2FudmFzLmhlaWdodCA9IHJlc2l6ZUluZm8udHJnSGVpZ2h0O1xuICAgICAgICAgIGRyYXdJbWFnZUlPU0ZpeChjdHgsIGltZywgKF9yZWYgPSByZXNpemVJbmZvLnNyY1gpICE9IG51bGwgPyBfcmVmIDogMCwgKF9yZWYxID0gcmVzaXplSW5mby5zcmNZKSAhPSBudWxsID8gX3JlZjEgOiAwLCByZXNpemVJbmZvLnNyY1dpZHRoLCByZXNpemVJbmZvLnNyY0hlaWdodCwgKF9yZWYyID0gcmVzaXplSW5mby50cmdYKSAhPSBudWxsID8gX3JlZjIgOiAwLCAoX3JlZjMgPSByZXNpemVJbmZvLnRyZ1kpICE9IG51bGwgPyBfcmVmMyA6IDAsIHJlc2l6ZUluZm8udHJnV2lkdGgsIHJlc2l6ZUluZm8udHJnSGVpZ2h0KTtcbiAgICAgICAgICB0aHVtYm5haWwgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgICAgIF90aGlzLmVtaXQoXCJ0aHVtYm5haWxcIiwgZmlsZSwgdGh1bWJuYWlsKTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICBpbWcub25lcnJvciA9IGNhbGxiYWNrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGltZy5zcmMgPSBpbWFnZVVybDtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnByb2Nlc3NRdWV1ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGksIHBhcmFsbGVsVXBsb2FkcywgcHJvY2Vzc2luZ0xlbmd0aCwgcXVldWVkRmlsZXM7XG4gICAgICBwYXJhbGxlbFVwbG9hZHMgPSB0aGlzLm9wdGlvbnMucGFyYWxsZWxVcGxvYWRzO1xuICAgICAgcHJvY2Vzc2luZ0xlbmd0aCA9IHRoaXMuZ2V0VXBsb2FkaW5nRmlsZXMoKS5sZW5ndGg7XG4gICAgICBpID0gcHJvY2Vzc2luZ0xlbmd0aDtcbiAgICAgIGlmIChwcm9jZXNzaW5nTGVuZ3RoID49IHBhcmFsbGVsVXBsb2Fkcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBxdWV1ZWRGaWxlcyA9IHRoaXMuZ2V0UXVldWVkRmlsZXMoKTtcbiAgICAgIGlmICghKHF1ZXVlZEZpbGVzLmxlbmd0aCA+IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0ZpbGVzKHF1ZXVlZEZpbGVzLnNsaWNlKDAsIHBhcmFsbGVsVXBsb2FkcyAtIHByb2Nlc3NpbmdMZW5ndGgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChpIDwgcGFyYWxsZWxVcGxvYWRzKSB7XG4gICAgICAgICAgaWYgKCFxdWV1ZWRGaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wcm9jZXNzRmlsZShxdWV1ZWRGaWxlcy5zaGlmdCgpKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnByb2Nlc3NGaWxlID0gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0ZpbGVzKFtmaWxlXSk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5wcm9jZXNzRmlsZXMgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICAgdmFyIGZpbGUsIF9pLCBfbGVuO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBmaWxlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBmaWxlID0gZmlsZXNbX2ldO1xuICAgICAgICBmaWxlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICBmaWxlLnN0YXR1cyA9IERyb3B6b25lLlVQTE9BRElORztcbiAgICAgICAgdGhpcy5lbWl0KFwicHJvY2Vzc2luZ1wiLCBmaWxlKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy5lbWl0KFwicHJvY2Vzc2luZ211bHRpcGxlXCIsIGZpbGVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnVwbG9hZEZpbGVzKGZpbGVzKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLl9nZXRGaWxlc1dpdGhYaHIgPSBmdW5jdGlvbih4aHIpIHtcbiAgICAgIHZhciBmaWxlLCBmaWxlcztcbiAgICAgIHJldHVybiBmaWxlcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgICAgX3JlZiA9IHRoaXMuZmlsZXM7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIGZpbGUgPSBfcmVmW19pXTtcbiAgICAgICAgICBpZiAoZmlsZS54aHIgPT09IHhocikge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChmaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfSkuY2FsbCh0aGlzKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLmNhbmNlbFVwbG9hZCA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgIHZhciBncm91cGVkRmlsZSwgZ3JvdXBlZEZpbGVzLCBfaSwgX2osIF9sZW4sIF9sZW4xLCBfcmVmO1xuICAgICAgaWYgKGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5VUExPQURJTkcpIHtcbiAgICAgICAgZ3JvdXBlZEZpbGVzID0gdGhpcy5fZ2V0RmlsZXNXaXRoWGhyKGZpbGUueGhyKTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBncm91cGVkRmlsZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBncm91cGVkRmlsZSA9IGdyb3VwZWRGaWxlc1tfaV07XG4gICAgICAgICAgZ3JvdXBlZEZpbGUuc3RhdHVzID0gRHJvcHpvbmUuQ0FOQ0VMRUQ7XG4gICAgICAgIH1cbiAgICAgICAgZmlsZS54aHIuYWJvcnQoKTtcbiAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gZ3JvdXBlZEZpbGVzLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICAgIGdyb3VwZWRGaWxlID0gZ3JvdXBlZEZpbGVzW19qXTtcbiAgICAgICAgICB0aGlzLmVtaXQoXCJjYW5jZWxlZFwiLCBncm91cGVkRmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGxvYWRNdWx0aXBsZSkge1xuICAgICAgICAgIHRoaXMuZW1pdChcImNhbmNlbGVkbXVsdGlwbGVcIiwgZ3JvdXBlZEZpbGVzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICgoX3JlZiA9IGZpbGUuc3RhdHVzKSA9PT0gRHJvcHpvbmUuQURERUQgfHwgX3JlZiA9PT0gRHJvcHpvbmUuUVVFVUVEKSB7XG4gICAgICAgIGZpbGUuc3RhdHVzID0gRHJvcHpvbmUuQ0FOQ0VMRUQ7XG4gICAgICAgIHRoaXMuZW1pdChcImNhbmNlbGVkXCIsIGZpbGUpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KFwiY2FuY2VsZWRtdWx0aXBsZVwiLCBbZmlsZV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9Qcm9jZXNzUXVldWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc1F1ZXVlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc29sdmVPcHRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzLCBvcHRpb247XG4gICAgICBvcHRpb24gPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvcHRpb247XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS51cGxvYWRGaWxlID0gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgcmV0dXJuIHRoaXMudXBsb2FkRmlsZXMoW2ZpbGVdKTtcbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLnVwbG9hZEZpbGVzID0gZnVuY3Rpb24oZmlsZXMpIHtcbiAgICAgIHZhciBmaWxlLCBmb3JtRGF0YSwgaGFuZGxlRXJyb3IsIGhlYWRlck5hbWUsIGhlYWRlclZhbHVlLCBoZWFkZXJzLCBpLCBpbnB1dCwgaW5wdXROYW1lLCBpbnB1dFR5cGUsIGtleSwgbWV0aG9kLCBvcHRpb24sIHByb2dyZXNzT2JqLCByZXNwb25zZSwgdXBkYXRlUHJvZ3Jlc3MsIHVybCwgdmFsdWUsIHhociwgX2ksIF9qLCBfaywgX2wsIF9sZW4sIF9sZW4xLCBfbGVuMiwgX2xlbjMsIF9tLCBfcmVmLCBfcmVmMSwgX3JlZjIsIF9yZWYzLCBfcmVmNCwgX3JlZjU7XG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZmlsZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgZmlsZSA9IGZpbGVzW19pXTtcbiAgICAgICAgZmlsZS54aHIgPSB4aHI7XG4gICAgICB9XG4gICAgICBtZXRob2QgPSByZXNvbHZlT3B0aW9uKHRoaXMub3B0aW9ucy5tZXRob2QsIGZpbGVzKTtcbiAgICAgIHVybCA9IHJlc29sdmVPcHRpb24odGhpcy5vcHRpb25zLnVybCwgZmlsZXMpO1xuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9ICEhdGhpcy5vcHRpb25zLndpdGhDcmVkZW50aWFscztcbiAgICAgIHJlc3BvbnNlID0gbnVsbDtcbiAgICAgIGhhbmRsZUVycm9yID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX2osIF9sZW4xLCBfcmVzdWx0cztcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IGZpbGVzLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICAgICAgZmlsZSA9IGZpbGVzW19qXTtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goX3RoaXMuX2Vycm9yUHJvY2Vzc2luZyhmaWxlcywgcmVzcG9uc2UgfHwgX3RoaXMub3B0aW9ucy5kaWN0UmVzcG9uc2VFcnJvci5yZXBsYWNlKFwie3tzdGF0dXNDb2RlfX1cIiwgeGhyLnN0YXR1cyksIHhocikpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIHVwZGF0ZVByb2dyZXNzID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIGFsbEZpbGVzRmluaXNoZWQsIHByb2dyZXNzLCBfaiwgX2ssIF9sLCBfbGVuMSwgX2xlbjIsIF9sZW4zLCBfcmVzdWx0cztcbiAgICAgICAgICBpZiAoZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBwcm9ncmVzcyA9IDEwMCAqIGUubG9hZGVkIC8gZS50b3RhbDtcbiAgICAgICAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IGZpbGVzLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICAgICAgICBmaWxlID0gZmlsZXNbX2pdO1xuICAgICAgICAgICAgICBmaWxlLnVwbG9hZCA9IHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogcHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgdG90YWw6IGUudG90YWwsXG4gICAgICAgICAgICAgICAgYnl0ZXNTZW50OiBlLmxvYWRlZFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbGxGaWxlc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHByb2dyZXNzID0gMTAwO1xuICAgICAgICAgICAgZm9yIChfayA9IDAsIF9sZW4yID0gZmlsZXMubGVuZ3RoOyBfayA8IF9sZW4yOyBfaysrKSB7XG4gICAgICAgICAgICAgIGZpbGUgPSBmaWxlc1tfa107XG4gICAgICAgICAgICAgIGlmICghKGZpbGUudXBsb2FkLnByb2dyZXNzID09PSAxMDAgJiYgZmlsZS51cGxvYWQuYnl0ZXNTZW50ID09PSBmaWxlLnVwbG9hZC50b3RhbCkpIHtcbiAgICAgICAgICAgICAgICBhbGxGaWxlc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZmlsZS51cGxvYWQucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgZmlsZS51cGxvYWQuYnl0ZXNTZW50ID0gZmlsZS51cGxvYWQudG90YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWxsRmlsZXNGaW5pc2hlZCkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChfbCA9IDAsIF9sZW4zID0gZmlsZXMubGVuZ3RoOyBfbCA8IF9sZW4zOyBfbCsrKSB7XG4gICAgICAgICAgICBmaWxlID0gZmlsZXNbX2xdO1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChfdGhpcy5lbWl0KFwidXBsb2FkcHJvZ3Jlc3NcIiwgZmlsZSwgcHJvZ3Jlc3MsIGZpbGUudXBsb2FkLmJ5dGVzU2VudCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIHhoci5vbmxvYWQgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICBpZiAoZmlsZXNbMF0uc3RhdHVzID09PSBEcm9wem9uZS5DQU5DRUxFRCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgIGlmICh4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJjb250ZW50LXR5cGVcIikgJiYgfnhoci5nZXRSZXNwb25zZUhlYWRlcihcImNvbnRlbnQtdHlwZVwiKS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICAgICAgICBlID0gX2Vycm9yO1xuICAgICAgICAgICAgICByZXNwb25zZSA9IFwiSW52YWxpZCBKU09OIHJlc3BvbnNlIGZyb20gc2VydmVyLlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB1cGRhdGVQcm9ncmVzcygpO1xuICAgICAgICAgIGlmICghKCgyMDAgPD0gKF9yZWYgPSB4aHIuc3RhdHVzKSAmJiBfcmVmIDwgMzAwKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcigpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuX2ZpbmlzaGVkKGZpbGVzLCByZXNwb25zZSwgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICB4aHIub25lcnJvciA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGZpbGVzWzBdLnN0YXR1cyA9PT0gRHJvcHpvbmUuQ0FOQ0VMRUQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIHByb2dyZXNzT2JqID0gKF9yZWYgPSB4aHIudXBsb2FkKSAhPSBudWxsID8gX3JlZiA6IHhocjtcbiAgICAgIHByb2dyZXNzT2JqLm9ucHJvZ3Jlc3MgPSB1cGRhdGVQcm9ncmVzcztcbiAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgIFwiQWNjZXB0XCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICBcIkNhY2hlLUNvbnRyb2xcIjogXCJuby1jYWNoZVwiLFxuICAgICAgICBcIlgtUmVxdWVzdGVkLVdpdGhcIjogXCJYTUxIdHRwUmVxdWVzdFwiXG4gICAgICB9O1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIGV4dGVuZChoZWFkZXJzLCB0aGlzLm9wdGlvbnMuaGVhZGVycyk7XG4gICAgICB9XG4gICAgICBmb3IgKGhlYWRlck5hbWUgaW4gaGVhZGVycykge1xuICAgICAgICBoZWFkZXJWYWx1ZSA9IGhlYWRlcnNbaGVhZGVyTmFtZV07XG4gICAgICAgIGlmIChoZWFkZXJWYWx1ZSkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlck5hbWUsIGhlYWRlclZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFyYW1zKSB7XG4gICAgICAgIF9yZWYxID0gdGhpcy5vcHRpb25zLnBhcmFtcztcbiAgICAgICAgZm9yIChrZXkgaW4gX3JlZjEpIHtcbiAgICAgICAgICB2YWx1ZSA9IF9yZWYxW2tleV07XG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBmaWxlcy5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgZmlsZSA9IGZpbGVzW19qXTtcbiAgICAgICAgdGhpcy5lbWl0KFwic2VuZGluZ1wiLCBmaWxlLCB4aHIsIGZvcm1EYXRhKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy5lbWl0KFwic2VuZGluZ211bHRpcGxlXCIsIGZpbGVzLCB4aHIsIGZvcm1EYXRhKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVsZW1lbnQudGFnTmFtZSA9PT0gXCJGT1JNXCIpIHtcbiAgICAgICAgX3JlZjIgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBidXR0b25cIik7XG4gICAgICAgIGZvciAoX2sgPSAwLCBfbGVuMiA9IF9yZWYyLmxlbmd0aDsgX2sgPCBfbGVuMjsgX2srKykge1xuICAgICAgICAgIGlucHV0ID0gX3JlZjJbX2tdO1xuICAgICAgICAgIGlucHV0TmFtZSA9IGlucHV0LmdldEF0dHJpYnV0ZShcIm5hbWVcIik7XG4gICAgICAgICAgaW5wdXRUeXBlID0gaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKTtcbiAgICAgICAgICBpZiAoaW5wdXQudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIiAmJiBpbnB1dC5oYXNBdHRyaWJ1dGUoXCJtdWx0aXBsZVwiKSkge1xuICAgICAgICAgICAgX3JlZjMgPSBpbnB1dC5vcHRpb25zO1xuICAgICAgICAgICAgZm9yIChfbCA9IDAsIF9sZW4zID0gX3JlZjMubGVuZ3RoOyBfbCA8IF9sZW4zOyBfbCsrKSB7XG4gICAgICAgICAgICAgIG9wdGlvbiA9IF9yZWYzW19sXTtcbiAgICAgICAgICAgICAgaWYgKG9wdGlvbi5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChpbnB1dE5hbWUsIG9wdGlvbi52YWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCFpbnB1dFR5cGUgfHwgKChfcmVmNCA9IGlucHV0VHlwZS50b0xvd2VyQ2FzZSgpKSAhPT0gXCJjaGVja2JveFwiICYmIF9yZWY0ICE9PSBcInJhZGlvXCIpIHx8IGlucHV0LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChpbnB1dE5hbWUsIGlucHV0LnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IF9tID0gMCwgX3JlZjUgPSBmaWxlcy5sZW5ndGggLSAxOyAwIDw9IF9yZWY1ID8gX20gPD0gX3JlZjUgOiBfbSA+PSBfcmVmNTsgaSA9IDAgPD0gX3JlZjUgPyArK19tIDogLS1fbSkge1xuICAgICAgICBmb3JtRGF0YS5hcHBlbmQodGhpcy5fZ2V0UGFyYW1OYW1lKGkpLCBmaWxlc1tpXSwgdGhpcy5fcmVuYW1lRmlsZW5hbWUoZmlsZXNbaV0ubmFtZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc3VibWl0UmVxdWVzdCh4aHIsIGZvcm1EYXRhLCBmaWxlcyk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5zdWJtaXRSZXF1ZXN0ID0gZnVuY3Rpb24oeGhyLCBmb3JtRGF0YSwgZmlsZXMpIHtcbiAgICAgIHJldHVybiB4aHIuc2VuZChmb3JtRGF0YSk7XG4gICAgfTtcblxuICAgIERyb3B6b25lLnByb3RvdHlwZS5fZmluaXNoZWQgPSBmdW5jdGlvbihmaWxlcywgcmVzcG9uc2VUZXh0LCBlKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW47XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGZpbGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBmaWxlc1tfaV07XG4gICAgICAgIGZpbGUuc3RhdHVzID0gRHJvcHpvbmUuU1VDQ0VTUztcbiAgICAgICAgdGhpcy5lbWl0KFwic3VjY2Vzc1wiLCBmaWxlLCByZXNwb25zZVRleHQsIGUpO1xuICAgICAgICB0aGlzLmVtaXQoXCJjb21wbGV0ZVwiLCBmaWxlKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy5lbWl0KFwic3VjY2Vzc211bHRpcGxlXCIsIGZpbGVzLCByZXNwb25zZVRleHQsIGUpO1xuICAgICAgICB0aGlzLmVtaXQoXCJjb21wbGV0ZW11bHRpcGxlXCIsIGZpbGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1Byb2Nlc3NRdWV1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzUXVldWUoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRHJvcHpvbmUucHJvdG90eXBlLl9lcnJvclByb2Nlc3NpbmcgPSBmdW5jdGlvbihmaWxlcywgbWVzc2FnZSwgeGhyKSB7XG4gICAgICB2YXIgZmlsZSwgX2ksIF9sZW47XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGZpbGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGZpbGUgPSBmaWxlc1tfaV07XG4gICAgICAgIGZpbGUuc3RhdHVzID0gRHJvcHpvbmUuRVJST1I7XG4gICAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIGZpbGUsIG1lc3NhZ2UsIHhocik7XG4gICAgICAgIHRoaXMuZW1pdChcImNvbXBsZXRlXCIsIGZpbGUpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGxvYWRNdWx0aXBsZSkge1xuICAgICAgICB0aGlzLmVtaXQoXCJlcnJvcm11bHRpcGxlXCIsIGZpbGVzLCBtZXNzYWdlLCB4aHIpO1xuICAgICAgICB0aGlzLmVtaXQoXCJjb21wbGV0ZW11bHRpcGxlXCIsIGZpbGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1Byb2Nlc3NRdWV1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzUXVldWUoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIERyb3B6b25lO1xuXG4gIH0pKEVtaXR0ZXIpO1xuXG4gIERyb3B6b25lLnZlcnNpb24gPSBcIjQuMy4wXCI7XG5cbiAgRHJvcHpvbmUub3B0aW9ucyA9IHt9O1xuXG4gIERyb3B6b25lLm9wdGlvbnNGb3JFbGVtZW50ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LmdldEF0dHJpYnV0ZShcImlkXCIpKSB7XG4gICAgICByZXR1cm4gRHJvcHpvbmUub3B0aW9uc1tjYW1lbGl6ZShlbGVtZW50LmdldEF0dHJpYnV0ZShcImlkXCIpKV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuICB9O1xuXG4gIERyb3B6b25lLmluc3RhbmNlcyA9IFtdO1xuXG4gIERyb3B6b25lLmZvckVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKChlbGVtZW50ICE9IG51bGwgPyBlbGVtZW50LmRyb3B6b25lIDogdm9pZCAwKSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBEcm9wem9uZSBmb3VuZCBmb3IgZ2l2ZW4gZWxlbWVudC4gVGhpcyBpcyBwcm9iYWJseSBiZWNhdXNlIHlvdSdyZSB0cnlpbmcgdG8gYWNjZXNzIGl0IGJlZm9yZSBEcm9wem9uZSBoYWQgdGhlIHRpbWUgdG8gaW5pdGlhbGl6ZS4gVXNlIHRoZSBgaW5pdGAgb3B0aW9uIHRvIHNldHVwIGFueSBhZGRpdGlvbmFsIG9ic2VydmVycyBvbiB5b3VyIERyb3B6b25lLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQuZHJvcHpvbmU7XG4gIH07XG5cbiAgRHJvcHpvbmUuYXV0b0Rpc2NvdmVyID0gdHJ1ZTtcblxuICBEcm9wem9uZS5kaXNjb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjaGVja0VsZW1lbnRzLCBkcm9wem9uZSwgZHJvcHpvbmVzLCBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICAgIGRyb3B6b25lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcHpvbmVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRyb3B6b25lcyA9IFtdO1xuICAgICAgY2hlY2tFbGVtZW50cyA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgIHZhciBlbCwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGVsZW1lbnRzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgZWwgPSBlbGVtZW50c1tfaV07XG4gICAgICAgICAgaWYgKC8oXnwgKWRyb3B6b25lKCR8ICkvLnRlc3QoZWwuY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChkcm9wem9uZXMucHVzaChlbCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH07XG4gICAgICBjaGVja0VsZW1lbnRzKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiZGl2XCIpKTtcbiAgICAgIGNoZWNrRWxlbWVudHMoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJmb3JtXCIpKTtcbiAgICB9XG4gICAgX3Jlc3VsdHMgPSBbXTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGRyb3B6b25lcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgZHJvcHpvbmUgPSBkcm9wem9uZXNbX2ldO1xuICAgICAgaWYgKERyb3B6b25lLm9wdGlvbnNGb3JFbGVtZW50KGRyb3B6b25lKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChuZXcgRHJvcHpvbmUoZHJvcHpvbmUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9yZXN1bHRzO1xuICB9O1xuXG4gIERyb3B6b25lLmJsYWNrbGlzdGVkQnJvd3NlcnMgPSBbL29wZXJhLipNYWNpbnRvc2guKnZlcnNpb25cXC8xMi9pXTtcblxuICBEcm9wem9uZS5pc0Jyb3dzZXJTdXBwb3J0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2FwYWJsZUJyb3dzZXIsIHJlZ2V4LCBfaSwgX2xlbiwgX3JlZjtcbiAgICBjYXBhYmxlQnJvd3NlciA9IHRydWU7XG4gICAgaWYgKHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiAmJiB3aW5kb3cuRm9ybURhdGEgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcikge1xuICAgICAgaWYgKCEoXCJjbGFzc0xpc3RcIiBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKSkpIHtcbiAgICAgICAgY2FwYWJsZUJyb3dzZXIgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9yZWYgPSBEcm9wem9uZS5ibGFja2xpc3RlZEJyb3dzZXJzO1xuICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICByZWdleCA9IF9yZWZbX2ldO1xuICAgICAgICAgIGlmIChyZWdleC50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG4gICAgICAgICAgICBjYXBhYmxlQnJvd3NlciA9IGZhbHNlO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhcGFibGVCcm93c2VyID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBjYXBhYmxlQnJvd3NlcjtcbiAgfTtcblxuICB3aXRob3V0ID0gZnVuY3Rpb24obGlzdCwgcmVqZWN0ZWRJdGVtKSB7XG4gICAgdmFyIGl0ZW0sIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICBfcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gbGlzdC5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgaXRlbSA9IGxpc3RbX2ldO1xuICAgICAgaWYgKGl0ZW0gIT09IHJlamVjdGVkSXRlbSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKGl0ZW0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3Jlc3VsdHM7XG4gIH07XG5cbiAgY2FtZWxpemUgPSBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1tcXC1fXShcXHcpL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWF0Y2guY2hhckF0KDEpLnRvVXBwZXJDYXNlKCk7XG4gICAgfSk7XG4gIH07XG5cbiAgRHJvcHpvbmUuY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHZhciBkaXY7XG4gICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gc3RyaW5nO1xuICAgIHJldHVybiBkaXYuY2hpbGROb2Rlc1swXTtcbiAgfTtcblxuICBEcm9wem9uZS5lbGVtZW50SW5zaWRlID0gZnVuY3Rpb24oZWxlbWVudCwgY29udGFpbmVyKSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IGNvbnRhaW5lcikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHdoaWxlIChlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICBpZiAoZWxlbWVudCA9PT0gY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgRHJvcHpvbmUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uKGVsLCBuYW1lKSB7XG4gICAgdmFyIGVsZW1lbnQ7XG4gICAgaWYgKHR5cGVvZiBlbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpO1xuICAgIH0gZWxzZSBpZiAoZWwubm9kZVR5cGUgIT0gbnVsbCkge1xuICAgICAgZWxlbWVudCA9IGVsO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGBcIiArIG5hbWUgKyBcImAgb3B0aW9uIHByb3ZpZGVkLiBQbGVhc2UgcHJvdmlkZSBhIENTUyBzZWxlY3RvciBvciBhIHBsYWluIEhUTUwgZWxlbWVudC5cIik7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50O1xuICB9O1xuXG4gIERyb3B6b25lLmdldEVsZW1lbnRzID0gZnVuY3Rpb24oZWxzLCBuYW1lKSB7XG4gICAgdmFyIGUsIGVsLCBlbGVtZW50cywgX2ksIF9qLCBfbGVuLCBfbGVuMSwgX3JlZjtcbiAgICBpZiAoZWxzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGVsZW1lbnRzID0gW107XG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGVscy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIGVsID0gZWxzW19pXTtcbiAgICAgICAgICBlbGVtZW50cy5wdXNoKHRoaXMuZ2V0RWxlbWVudChlbCwgbmFtZSkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgZSA9IF9lcnJvcjtcbiAgICAgICAgZWxlbWVudHMgPSBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVscyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgZWxlbWVudHMgPSBbXTtcbiAgICAgIF9yZWYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGVscyk7XG4gICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICBlbCA9IF9yZWZbX2pdO1xuICAgICAgICBlbGVtZW50cy5wdXNoKGVsKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGVscy5ub2RlVHlwZSAhPSBudWxsKSB7XG4gICAgICBlbGVtZW50cyA9IFtlbHNdO1xuICAgIH1cbiAgICBpZiAoISgoZWxlbWVudHMgIT0gbnVsbCkgJiYgZWxlbWVudHMubGVuZ3RoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBgXCIgKyBuYW1lICsgXCJgIG9wdGlvbiBwcm92aWRlZC4gUGxlYXNlIHByb3ZpZGUgYSBDU1Mgc2VsZWN0b3IsIGEgcGxhaW4gSFRNTCBlbGVtZW50IG9yIGEgbGlzdCBvZiB0aG9zZS5cIik7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50cztcbiAgfTtcblxuICBEcm9wem9uZS5jb25maXJtID0gZnVuY3Rpb24ocXVlc3Rpb24sIGFjY2VwdGVkLCByZWplY3RlZCkge1xuICAgIGlmICh3aW5kb3cuY29uZmlybShxdWVzdGlvbikpIHtcbiAgICAgIHJldHVybiBhY2NlcHRlZCgpO1xuICAgIH0gZWxzZSBpZiAocmVqZWN0ZWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJlamVjdGVkKCk7XG4gICAgfVxuICB9O1xuXG4gIERyb3B6b25lLmlzVmFsaWRGaWxlID0gZnVuY3Rpb24oZmlsZSwgYWNjZXB0ZWRGaWxlcykge1xuICAgIHZhciBiYXNlTWltZVR5cGUsIG1pbWVUeXBlLCB2YWxpZFR5cGUsIF9pLCBfbGVuO1xuICAgIGlmICghYWNjZXB0ZWRGaWxlcykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGFjY2VwdGVkRmlsZXMgPSBhY2NlcHRlZEZpbGVzLnNwbGl0KFwiLFwiKTtcbiAgICBtaW1lVHlwZSA9IGZpbGUudHlwZTtcbiAgICBiYXNlTWltZVR5cGUgPSBtaW1lVHlwZS5yZXBsYWNlKC9cXC8uKiQvLCBcIlwiKTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGFjY2VwdGVkRmlsZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIHZhbGlkVHlwZSA9IGFjY2VwdGVkRmlsZXNbX2ldO1xuICAgICAgdmFsaWRUeXBlID0gdmFsaWRUeXBlLnRyaW0oKTtcbiAgICAgIGlmICh2YWxpZFR5cGUuY2hhckF0KDApID09PSBcIi5cIikge1xuICAgICAgICBpZiAoZmlsZS5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWxpZFR5cGUudG9Mb3dlckNhc2UoKSwgZmlsZS5uYW1lLmxlbmd0aCAtIHZhbGlkVHlwZS5sZW5ndGgpICE9PSAtMSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKC9cXC9cXCokLy50ZXN0KHZhbGlkVHlwZSkpIHtcbiAgICAgICAgaWYgKGJhc2VNaW1lVHlwZSA9PT0gdmFsaWRUeXBlLnJlcGxhY2UoL1xcLy4qJC8sIFwiXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChtaW1lVHlwZSA9PT0gdmFsaWRUeXBlKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIGlmICh0eXBlb2YgalF1ZXJ5ICE9PSBcInVuZGVmaW5lZFwiICYmIGpRdWVyeSAhPT0gbnVsbCkge1xuICAgIGpRdWVyeS5mbi5kcm9wem9uZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgRHJvcHpvbmUodGhpcywgb3B0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEcm9wem9uZTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cuRHJvcHpvbmUgPSBEcm9wem9uZTtcbiAgfVxuXG4gIERyb3B6b25lLkFEREVEID0gXCJhZGRlZFwiO1xuXG4gIERyb3B6b25lLlFVRVVFRCA9IFwicXVldWVkXCI7XG5cbiAgRHJvcHpvbmUuQUNDRVBURUQgPSBEcm9wem9uZS5RVUVVRUQ7XG5cbiAgRHJvcHpvbmUuVVBMT0FESU5HID0gXCJ1cGxvYWRpbmdcIjtcblxuICBEcm9wem9uZS5QUk9DRVNTSU5HID0gRHJvcHpvbmUuVVBMT0FESU5HO1xuXG4gIERyb3B6b25lLkNBTkNFTEVEID0gXCJjYW5jZWxlZFwiO1xuXG4gIERyb3B6b25lLkVSUk9SID0gXCJlcnJvclwiO1xuXG4gIERyb3B6b25lLlNVQ0NFU1MgPSBcInN1Y2Nlc3NcIjtcblxuXG4gIC8qXG4gIFxuICBCdWdmaXggZm9yIGlPUyA2IGFuZCA3XG4gIFNvdXJjZTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTkyOTA5OS9odG1sNS1jYW52YXMtZHJhd2ltYWdlLXJhdGlvLWJ1Zy1pb3NcbiAgYmFzZWQgb24gdGhlIHdvcmsgb2YgaHR0cHM6Ly9naXRodWIuY29tL3N0b21pdGEvaW9zLWltYWdlZmlsZS1tZWdhcGl4ZWxcbiAgICovXG5cbiAgZGV0ZWN0VmVydGljYWxTcXVhc2ggPSBmdW5jdGlvbihpbWcpIHtcbiAgICB2YXIgYWxwaGEsIGNhbnZhcywgY3R4LCBkYXRhLCBleSwgaWgsIGl3LCBweSwgcmF0aW8sIHN5O1xuICAgIGl3ID0gaW1nLm5hdHVyYWxXaWR0aDtcbiAgICBpaCA9IGltZy5uYXR1cmFsSGVpZ2h0O1xuICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgY2FudmFzLndpZHRoID0gMTtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaWg7XG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgZGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgMSwgaWgpLmRhdGE7XG4gICAgc3kgPSAwO1xuICAgIGV5ID0gaWg7XG4gICAgcHkgPSBpaDtcbiAgICB3aGlsZSAocHkgPiBzeSkge1xuICAgICAgYWxwaGEgPSBkYXRhWyhweSAtIDEpICogNCArIDNdO1xuICAgICAgaWYgKGFscGhhID09PSAwKSB7XG4gICAgICAgIGV5ID0gcHk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzeSA9IHB5O1xuICAgICAgfVxuICAgICAgcHkgPSAoZXkgKyBzeSkgPj4gMTtcbiAgICB9XG4gICAgcmF0aW8gPSBweSAvIGloO1xuICAgIGlmIChyYXRpbyA9PT0gMCkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByYXRpbztcbiAgICB9XG4gIH07XG5cbiAgZHJhd0ltYWdlSU9TRml4ID0gZnVuY3Rpb24oY3R4LCBpbWcsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCkge1xuICAgIHZhciB2ZXJ0U3F1YXNoUmF0aW87XG4gICAgdmVydFNxdWFzaFJhdGlvID0gZGV0ZWN0VmVydGljYWxTcXVhc2goaW1nKTtcbiAgICByZXR1cm4gY3R4LmRyYXdJbWFnZShpbWcsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCAvIHZlcnRTcXVhc2hSYXRpbyk7XG4gIH07XG5cblxuICAvKlxuICAgKiBjb250ZW50bG9hZGVkLmpzXG4gICAqXG4gICAqIEF1dGhvcjogRGllZ28gUGVyaW5pIChkaWVnby5wZXJpbmkgYXQgZ21haWwuY29tKVxuICAgKiBTdW1tYXJ5OiBjcm9zcy1icm93c2VyIHdyYXBwZXIgZm9yIERPTUNvbnRlbnRMb2FkZWRcbiAgICogVXBkYXRlZDogMjAxMDEwMjBcbiAgICogTGljZW5zZTogTUlUXG4gICAqIFZlcnNpb246IDEuMlxuICAgKlxuICAgKiBVUkw6XG4gICAqIGh0dHA6Ly9qYXZhc2NyaXB0Lm53Ym94LmNvbS9Db250ZW50TG9hZGVkL1xuICAgKiBodHRwOi8vamF2YXNjcmlwdC5ud2JveC5jb20vQ29udGVudExvYWRlZC9NSVQtTElDRU5TRVxuICAgKi9cblxuICBjb250ZW50TG9hZGVkID0gZnVuY3Rpb24od2luLCBmbikge1xuICAgIHZhciBhZGQsIGRvYywgZG9uZSwgaW5pdCwgcG9sbCwgcHJlLCByZW0sIHJvb3QsIHRvcDtcbiAgICBkb25lID0gZmFsc2U7XG4gICAgdG9wID0gdHJ1ZTtcbiAgICBkb2MgPSB3aW4uZG9jdW1lbnQ7XG4gICAgcm9vdCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgYWRkID0gKGRvYy5hZGRFdmVudExpc3RlbmVyID8gXCJhZGRFdmVudExpc3RlbmVyXCIgOiBcImF0dGFjaEV2ZW50XCIpO1xuICAgIHJlbSA9IChkb2MuYWRkRXZlbnRMaXN0ZW5lciA/IFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiIDogXCJkZXRhY2hFdmVudFwiKTtcbiAgICBwcmUgPSAoZG9jLmFkZEV2ZW50TGlzdGVuZXIgPyBcIlwiIDogXCJvblwiKTtcbiAgICBpbml0ID0gZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGUudHlwZSA9PT0gXCJyZWFkeXN0YXRlY2hhbmdlXCIgJiYgZG9jLnJlYWR5U3RhdGUgIT09IFwiY29tcGxldGVcIikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAoZS50eXBlID09PSBcImxvYWRcIiA/IHdpbiA6IGRvYylbcmVtXShwcmUgKyBlLnR5cGUsIGluaXQsIGZhbHNlKTtcbiAgICAgIGlmICghZG9uZSAmJiAoZG9uZSA9IHRydWUpKSB7XG4gICAgICAgIHJldHVybiBmbi5jYWxsKHdpbiwgZS50eXBlIHx8IGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgcG9sbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGU7XG4gICAgICB0cnkge1xuICAgICAgICByb290LmRvU2Nyb2xsKFwibGVmdFwiKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICBlID0gX2Vycm9yO1xuICAgICAgICBzZXRUaW1lb3V0KHBvbGwsIDUwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGluaXQoXCJwb2xsXCIpO1xuICAgIH07XG4gICAgaWYgKGRvYy5yZWFkeVN0YXRlICE9PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgIGlmIChkb2MuY3JlYXRlRXZlbnRPYmplY3QgJiYgcm9vdC5kb1Njcm9sbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRvcCA9ICF3aW4uZnJhbWVFbGVtZW50O1xuICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHt9XG4gICAgICAgIGlmICh0b3ApIHtcbiAgICAgICAgICBwb2xsKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRvY1thZGRdKHByZSArIFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0LCBmYWxzZSk7XG4gICAgICBkb2NbYWRkXShwcmUgKyBcInJlYWR5c3RhdGVjaGFuZ2VcIiwgaW5pdCwgZmFsc2UpO1xuICAgICAgcmV0dXJuIHdpblthZGRdKHByZSArIFwibG9hZFwiLCBpbml0LCBmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIERyb3B6b25lLl9hdXRvRGlzY292ZXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChEcm9wem9uZS5hdXRvRGlzY292ZXIpIHtcbiAgICAgIHJldHVybiBEcm9wem9uZS5kaXNjb3ZlcigpO1xuICAgIH1cbiAgfTtcblxuICBjb250ZW50TG9hZGVkKHdpbmRvdywgRHJvcHpvbmUuX2F1dG9EaXNjb3ZlckZ1bmN0aW9uKTtcblxufSkuY2FsbCh0aGlzKTtcbiJdLCJmaWxlIjoiZGFzaGJvYXJkL3JhZGlvL2Ryb3B6b25lLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
