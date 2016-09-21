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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby91cGxvYWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgcHJldmlld05vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIpO1xyXG4gICAgcHJldmlld05vZGUuaWQgPSBcIlwiO1xyXG4gICAgdmFyIHByZXZpZXdUZW1wbGF0ZSA9IHByZXZpZXdOb2RlLnBhcmVudE5vZGUuaW5uZXJIVE1MO1xyXG4gICAgcHJldmlld05vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwcmV2aWV3Tm9kZSk7XHJcbiAgICB2YXIgdG90YWxQcm9ncmVzcyA9ICQoXCIjdG90YWwtcHJvZ3Jlc3NcIik7XHJcbiAgICB2YXIgbXlEcm9wem9uZSA9IG5ldyBEcm9wem9uZSgkKCdodG1sJykuZ2V0KDApLCB7IC8vIE1ha2UgdGhlIHdob2xlIGJvZHkgYSBkcm9wem9uZVxyXG4gICAgICAgIHVybDogcHJldmlld05vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpLCAvLyBTZXQgdGhlIHVybFxyXG4gICAgICAgIG1heEZpbGVzaXplOiAzMDAsIC8vIE1CXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGh1bWJuYWlsV2lkdGg6IDgwLFxyXG4gICAgICAgIHRodW1ibmFpbEhlaWdodDogODAsXHJcbiAgICAgICAgYWNjZXB0ZWRGaWxlczogJy5tcDMnLFxyXG4gICAgICAgIHBhcmFsbGVsVXBsb2FkczogMjAsXHJcbiAgICAgICAgcHJldmlld1RlbXBsYXRlOiBwcmV2aWV3VGVtcGxhdGUsXHJcbiAgICAgICAgYXV0b1F1ZXVlOiBmYWxzZSwgLy8gTWFrZSBzdXJlIHRoZSBmaWxlcyBhcmVuJ3QgcXVldWVkIHVudGlsIG1hbnVhbGx5IGFkZGVkXHJcbiAgICAgICAgcHJldmlld3NDb250YWluZXI6IFwiI3ByZXZpZXdzXCIsIC8vIERlZmluZSB0aGUgY29udGFpbmVyIHRvIGRpc3BsYXkgdGhlIHByZXZpZXdzXHJcbiAgICAgICAgY2xpY2thYmxlOiBcIi5maWxlaW5wdXQtYnV0dG9uXCIgLy8gRGVmaW5lIHRoZSBlbGVtZW50IHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgY2xpY2sgdHJpZ2dlciB0byBzZWxlY3QgZmlsZXMuXHJcbiAgICB9KTtcclxuXHJcbiAgICBteURyb3B6b25lLm9uKFwiYWRkZWRmaWxlXCIsIGZ1bmN0aW9uKGZpbGUpIHtcclxuICAgICAgICAvLyBIb29rdXAgdGhlIHN0YXJ0IGJ1dHRvblxyXG4gICAgICAgICQoZmlsZS5wcmV2aWV3RWxlbWVudCkuZmluZCgnLnN0YXJ0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIG15RHJvcHpvbmUuZW5xdWV1ZUZpbGUoZmlsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbi8vIFVwZGF0ZSB0aGUgdG90YWwgcHJvZ3Jlc3MgYmFyXHJcbiAgICBteURyb3B6b25lLm9uKFwidG90YWx1cGxvYWRwcm9ncmVzc1wiLCBmdW5jdGlvbihwcm9ncmVzcykge1xyXG4gICAgICAgICQoXCIucHJvZ3Jlc3Mtc3RyaXBlZFwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTtcclxuICAgICAgICB0b3RhbFByb2dyZXNzLmZpbmQoXCIucHJvZ3Jlc3MtYmFyXCIpLmNzcyhcIndpZHRoXCIsIHByb2dyZXNzICsgXCIlXCIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbXlEcm9wem9uZS5vbihcInNlbmRpbmdcIiwgZnVuY3Rpb24oZmlsZSkge1xyXG4gICAgICAgIC8vIFNob3cgdGhlIHRvdGFsIHByb2dyZXNzIGJhciB3aGVuIHVwbG9hZCBzdGFydHNcclxuICAgICAgICB0b3RhbFByb2dyZXNzLmNzcygnb3BhY2l0eScsICcxJyk7XHJcbiAgICAgICAgLy8gQW5kIGRpc2FibGUgdGhlIHN0YXJ0IGJ1dHRvblxyXG4gICAgICAgIGZpbGUucHJldmlld0VsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdGFydFwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgfSk7XHJcblxyXG4vLyBIaWRlIHRoZSB0b3RhbCBwcm9ncmVzcyBiYXIgd2hlbiBub3RoaW5nJ3MgdXBsb2FkaW5nIGFueW1vcmVcclxuICAgIG15RHJvcHpvbmUub24oXCJxdWV1ZWNvbXBsZXRlXCIsIGZ1bmN0aW9uKHByb2dyZXNzKSB7XHJcbiAgICAgICAgdG90YWxQcm9ncmVzcy5jc3MoJ29wYWNpdHknLCAnMCcpO1xyXG4gICAgICAgIHRvdGFsUHJvZ3Jlc3MuZmluZChcIi5wcm9ncmVzcy1iYXJcIikuY3NzKFwid2lkdGhcIiwgXCIwJVwiKTtcclxuICAgIH0pOyBcclxuICAgIFxyXG4gICAgbXlEcm9wem9uZS5vbihcInN1Y2Nlc3NcIiwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICB2YXIgZWwgPSAkKHJlc3BvbnNlLnByZXZpZXdFbGVtZW50KTtcclxuICAgICAgICBlbC5jc3Moe1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiI2M0ZjFjNFwiLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IFwiNXB4XCIsXHJcbiAgICAgICAgICAgIHBhZGRpbmc6IFwiNXB4IDFlbSAwXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICBlbC5maW5kKFwiLnByb2dyZXNzXCIpLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgIGVsLmZpbmQoXCIucHJldmlld1wiKS5odG1sKCcnKS5hZGRDbGFzcygnZ2x5cGhpY29uIGdseXBoaWNvbi1vayB0ZXh0LXN1Y2Nlc3MnKS5yZW1vdmVDbGFzcygncHJldmlldycpO1xyXG4gICAgICAgIGVsLmZpbmQoXCJidXR0b25cIikucGFyZW50KCkucmVtb3ZlKCk7XHJcbiAgICB9KTtcclxuXHJcbi8vIFNldHVwIHRoZSBidXR0b25zIGZvciBhbGwgdHJhbnNmZXJzXHJcbi8vIFRoZSBcImFkZCBmaWxlc1wiIGJ1dHRvbiBkb2Vzbid0IG5lZWQgdG8gYmUgc2V0dXAgYmVjYXVzZSB0aGUgY29uZmlnXHJcbi8vIGBjbGlja2FibGVgIGhhcyBhbHJlYWR5IGJlZW4gc3BlY2lmaWVkLlxyXG4gICAgJCgnI2FjdGlvbnMgLnN0YXJ0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBteURyb3B6b25lLmVucXVldWVGaWxlcyhteURyb3B6b25lLmdldEZpbGVzV2l0aFN0YXR1cyhEcm9wem9uZS5BRERFRCkpO1xyXG4gICAgfSk7XHJcbiAgICAkKCcjYWN0aW9ucyAuY2FuY2VsJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBteURyb3B6b25lLnJlbW92ZUFsbEZpbGVzKHRydWUpO1xyXG4gICAgfSk7XHJcbn0pOyJdLCJmaWxlIjoicmFkaW8vdXBsb2FkLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
