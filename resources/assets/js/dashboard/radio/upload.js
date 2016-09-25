$(function(){
    "use strict";
    var previewNode = document.querySelector("#template");
    previewNode.id = "";
    var previewTemplate = previewNode.parentNode.innerHTML;
    previewNode.parentNode.removeChild(previewNode);
    var totalProgress = $("#total-progress");
    var myDropzone = new Dropzone($('html').get(0), { // Make the whole body a dropzone
        url: previewNode.getAttribute('data-url'), // Set the url
        maxFilesize: 300, // MB
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        thumbnailWidth: 80,
        thumbnailHeight: 80,
        acceptedFiles: '.mp3',
        parallelUploads: 20,
        previewTemplate: previewTemplate,
        autoQueue: false, // Make sure the files aren't queued until manually added
        previewsContainer: "#previews", // Define the container to display the previews
        clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
    });

    myDropzone.on("addedfile", function(file) {
        // Hookup the start button
        $(file.previewElement).find('.start').on('click', function() {
            myDropzone.enqueueFile(file);
        });
    });

// Update the total progress bar
    myDropzone.on("totaluploadprogress", function(progress) {
        $(".progress-striped").css("display","block");
        totalProgress.find(".progress-bar").css("width", progress + "%");
    });

    myDropzone.on("sending", function(file) {
        // Show the total progress bar when upload starts
        totalProgress.css('opacity', '1');
        // And disable the start button
        file.previewElement.querySelector(".start").setAttribute("disabled", "disabled");
    });

// Hide the total progress bar when nothing's uploading anymore
    myDropzone.on("queuecomplete", function(progress) {
        totalProgress.css('opacity', '0');
        totalProgress.find(".progress-bar").css("width", "0%");
    }); 
    
    myDropzone.on("success", function(response) {
        var el = $(response.previewElement);
        el.css({
            backgroundColor: "#c4f1c4",
            borderRadius: "5px",
            padding: "5px 1em 0"
        });
        el.find(".progress").parent().remove();
        el.find(".preview").html('').addClass('glyphicon glyphicon-ok text-success').removeClass('preview');
        el.find("button").parent().remove();
    });

// Setup the buttons for all transfers
// The "add files" button doesn't need to be setup because the config
// `clickable` has already been specified.
    $('#actions .start').on('click', function(){
        myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED));
    });
    $('#actions .cancel').on('click', function(){
        myDropzone.removeAllFiles(true);
    });
});