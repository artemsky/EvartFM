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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvcmFkaW8vdXBsb2FkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcHJldmlld05vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIpO1xuICAgIHByZXZpZXdOb2RlLmlkID0gXCJcIjtcbiAgICB2YXIgcHJldmlld1RlbXBsYXRlID0gcHJldmlld05vZGUucGFyZW50Tm9kZS5pbm5lckhUTUw7XG4gICAgcHJldmlld05vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwcmV2aWV3Tm9kZSk7XG4gICAgdmFyIHRvdGFsUHJvZ3Jlc3MgPSAkKFwiI3RvdGFsLXByb2dyZXNzXCIpO1xuICAgIHZhciBteURyb3B6b25lID0gbmV3IERyb3B6b25lKCQoJ2h0bWwnKS5nZXQoMCksIHsgLy8gTWFrZSB0aGUgd2hvbGUgYm9keSBhIGRyb3B6b25lXG4gICAgICAgIHVybDogcHJldmlld05vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpLCAvLyBTZXQgdGhlIHVybFxuICAgICAgICBtYXhGaWxlc2l6ZTogMzAwLCAvLyBNQlxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuICAgICAgICB9LFxuICAgICAgICB0aHVtYm5haWxXaWR0aDogODAsXG4gICAgICAgIHRodW1ibmFpbEhlaWdodDogODAsXG4gICAgICAgIGFjY2VwdGVkRmlsZXM6ICcubXAzJyxcbiAgICAgICAgcGFyYWxsZWxVcGxvYWRzOiAyMCxcbiAgICAgICAgcHJldmlld1RlbXBsYXRlOiBwcmV2aWV3VGVtcGxhdGUsXG4gICAgICAgIGF1dG9RdWV1ZTogZmFsc2UsIC8vIE1ha2Ugc3VyZSB0aGUgZmlsZXMgYXJlbid0IHF1ZXVlZCB1bnRpbCBtYW51YWxseSBhZGRlZFxuICAgICAgICBwcmV2aWV3c0NvbnRhaW5lcjogXCIjcHJldmlld3NcIiwgLy8gRGVmaW5lIHRoZSBjb250YWluZXIgdG8gZGlzcGxheSB0aGUgcHJldmlld3NcbiAgICAgICAgY2xpY2thYmxlOiBcIi5maWxlaW5wdXQtYnV0dG9uXCIgLy8gRGVmaW5lIHRoZSBlbGVtZW50IHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgY2xpY2sgdHJpZ2dlciB0byBzZWxlY3QgZmlsZXMuXG4gICAgfSk7XG5cbiAgICBteURyb3B6b25lLm9uKFwiYWRkZWRmaWxlXCIsIGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgLy8gSG9va3VwIHRoZSBzdGFydCBidXR0b25cbiAgICAgICAgJChmaWxlLnByZXZpZXdFbGVtZW50KS5maW5kKCcuc3RhcnQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG15RHJvcHpvbmUuZW5xdWV1ZUZpbGUoZmlsZSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4vLyBVcGRhdGUgdGhlIHRvdGFsIHByb2dyZXNzIGJhclxuICAgIG15RHJvcHpvbmUub24oXCJ0b3RhbHVwbG9hZHByb2dyZXNzXCIsIGZ1bmN0aW9uKHByb2dyZXNzKSB7XG4gICAgICAgICQoXCIucHJvZ3Jlc3Mtc3RyaXBlZFwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTtcbiAgICAgICAgdG90YWxQcm9ncmVzcy5maW5kKFwiLnByb2dyZXNzLWJhclwiKS5jc3MoXCJ3aWR0aFwiLCBwcm9ncmVzcyArIFwiJVwiKTtcbiAgICB9KTtcblxuICAgIG15RHJvcHpvbmUub24oXCJzZW5kaW5nXCIsIGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgdG90YWwgcHJvZ3Jlc3MgYmFyIHdoZW4gdXBsb2FkIHN0YXJ0c1xuICAgICAgICB0b3RhbFByb2dyZXNzLmNzcygnb3BhY2l0eScsICcxJyk7XG4gICAgICAgIC8vIEFuZCBkaXNhYmxlIHRoZSBzdGFydCBidXR0b25cbiAgICAgICAgZmlsZS5wcmV2aWV3RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnN0YXJ0XCIpLnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XG4gICAgfSk7XG5cbi8vIEhpZGUgdGhlIHRvdGFsIHByb2dyZXNzIGJhciB3aGVuIG5vdGhpbmcncyB1cGxvYWRpbmcgYW55bW9yZVxuICAgIG15RHJvcHpvbmUub24oXCJxdWV1ZWNvbXBsZXRlXCIsIGZ1bmN0aW9uKHByb2dyZXNzKSB7XG4gICAgICAgIHRvdGFsUHJvZ3Jlc3MuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiAgICAgICAgdG90YWxQcm9ncmVzcy5maW5kKFwiLnByb2dyZXNzLWJhclwiKS5jc3MoXCJ3aWR0aFwiLCBcIjAlXCIpO1xuICAgIH0pOyBcbiAgICBcbiAgICBteURyb3B6b25lLm9uKFwic3VjY2Vzc1wiLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICB2YXIgZWwgPSAkKHJlc3BvbnNlLnByZXZpZXdFbGVtZW50KTtcbiAgICAgICAgZWwuY3NzKHtcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjYzRmMWM0XCIsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IFwiNXB4XCIsXG4gICAgICAgICAgICBwYWRkaW5nOiBcIjVweCAxZW0gMFwiXG4gICAgICAgIH0pO1xuICAgICAgICBlbC5maW5kKFwiLnByb2dyZXNzXCIpLnBhcmVudCgpLnJlbW92ZSgpO1xuICAgICAgICBlbC5maW5kKFwiLnByZXZpZXdcIikuaHRtbCgnJykuYWRkQ2xhc3MoJ2dseXBoaWNvbiBnbHlwaGljb24tb2sgdGV4dC1zdWNjZXNzJykucmVtb3ZlQ2xhc3MoJ3ByZXZpZXcnKTtcbiAgICAgICAgZWwuZmluZChcImJ1dHRvblwiKS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICB9KTtcblxuLy8gU2V0dXAgdGhlIGJ1dHRvbnMgZm9yIGFsbCB0cmFuc2ZlcnNcbi8vIFRoZSBcImFkZCBmaWxlc1wiIGJ1dHRvbiBkb2Vzbid0IG5lZWQgdG8gYmUgc2V0dXAgYmVjYXVzZSB0aGUgY29uZmlnXG4vLyBgY2xpY2thYmxlYCBoYXMgYWxyZWFkeSBiZWVuIHNwZWNpZmllZC5cbiAgICAkKCcjYWN0aW9ucyAuc3RhcnQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBteURyb3B6b25lLmVucXVldWVGaWxlcyhteURyb3B6b25lLmdldEZpbGVzV2l0aFN0YXR1cyhEcm9wem9uZS5BRERFRCkpO1xuICAgIH0pO1xuICAgICQoJyNhY3Rpb25zIC5jYW5jZWwnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBteURyb3B6b25lLnJlbW92ZUFsbEZpbGVzKHRydWUpO1xuICAgIH0pO1xufSk7Il0sImZpbGUiOiJkYXNoYm9hcmQvcmFkaW8vdXBsb2FkLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
