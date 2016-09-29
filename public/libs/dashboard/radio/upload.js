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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvcmFkaW8vdXBsb2FkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHByZXZpZXdOb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZVwiKTtcclxuICAgIHByZXZpZXdOb2RlLmlkID0gXCJcIjtcclxuICAgIHZhciBwcmV2aWV3VGVtcGxhdGUgPSBwcmV2aWV3Tm9kZS5wYXJlbnROb2RlLmlubmVySFRNTDtcclxuICAgIHByZXZpZXdOb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJldmlld05vZGUpO1xyXG4gICAgdmFyIHRvdGFsUHJvZ3Jlc3MgPSAkKFwiI3RvdGFsLXByb2dyZXNzXCIpO1xyXG4gICAgdmFyIG15RHJvcHpvbmUgPSBuZXcgRHJvcHpvbmUoJCgnaHRtbCcpLmdldCgwKSwgeyAvLyBNYWtlIHRoZSB3aG9sZSBib2R5IGEgZHJvcHpvbmVcclxuICAgICAgICB1cmw6IHByZXZpZXdOb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKSwgLy8gU2V0IHRoZSB1cmxcclxuICAgICAgICBtYXhGaWxlc2l6ZTogMzAwLCAvLyBNQlxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRodW1ibmFpbFdpZHRoOiA4MCxcclxuICAgICAgICB0aHVtYm5haWxIZWlnaHQ6IDgwLFxyXG4gICAgICAgIGFjY2VwdGVkRmlsZXM6ICcubXAzJyxcclxuICAgICAgICBwYXJhbGxlbFVwbG9hZHM6IDIwLFxyXG4gICAgICAgIHByZXZpZXdUZW1wbGF0ZTogcHJldmlld1RlbXBsYXRlLFxyXG4gICAgICAgIGF1dG9RdWV1ZTogZmFsc2UsIC8vIE1ha2Ugc3VyZSB0aGUgZmlsZXMgYXJlbid0IHF1ZXVlZCB1bnRpbCBtYW51YWxseSBhZGRlZFxyXG4gICAgICAgIHByZXZpZXdzQ29udGFpbmVyOiBcIiNwcmV2aWV3c1wiLCAvLyBEZWZpbmUgdGhlIGNvbnRhaW5lciB0byBkaXNwbGF5IHRoZSBwcmV2aWV3c1xyXG4gICAgICAgIGNsaWNrYWJsZTogXCIuZmlsZWlucHV0LWJ1dHRvblwiIC8vIERlZmluZSB0aGUgZWxlbWVudCB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIGNsaWNrIHRyaWdnZXIgdG8gc2VsZWN0IGZpbGVzLlxyXG4gICAgfSk7XHJcblxyXG4gICAgbXlEcm9wem9uZS5vbihcImFkZGVkZmlsZVwiLCBmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgLy8gSG9va3VwIHRoZSBzdGFydCBidXR0b25cclxuICAgICAgICAkKGZpbGUucHJldmlld0VsZW1lbnQpLmZpbmQoJy5zdGFydCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBteURyb3B6b25lLmVucXVldWVGaWxlKGZpbGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4vLyBVcGRhdGUgdGhlIHRvdGFsIHByb2dyZXNzIGJhclxyXG4gICAgbXlEcm9wem9uZS5vbihcInRvdGFsdXBsb2FkcHJvZ3Jlc3NcIiwgZnVuY3Rpb24ocHJvZ3Jlc3MpIHtcclxuICAgICAgICAkKFwiLnByb2dyZXNzLXN0cmlwZWRcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7XHJcbiAgICAgICAgdG90YWxQcm9ncmVzcy5maW5kKFwiLnByb2dyZXNzLWJhclwiKS5jc3MoXCJ3aWR0aFwiLCBwcm9ncmVzcyArIFwiJVwiKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG15RHJvcHpvbmUub24oXCJzZW5kaW5nXCIsIGZ1bmN0aW9uKGZpbGUpIHtcclxuICAgICAgICAvLyBTaG93IHRoZSB0b3RhbCBwcm9ncmVzcyBiYXIgd2hlbiB1cGxvYWQgc3RhcnRzXHJcbiAgICAgICAgdG90YWxQcm9ncmVzcy5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG4gICAgICAgIC8vIEFuZCBkaXNhYmxlIHRoZSBzdGFydCBidXR0b25cclxuICAgICAgICBmaWxlLnByZXZpZXdFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3RhcnRcIikuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcclxuICAgIH0pO1xyXG5cclxuLy8gSGlkZSB0aGUgdG90YWwgcHJvZ3Jlc3MgYmFyIHdoZW4gbm90aGluZydzIHVwbG9hZGluZyBhbnltb3JlXHJcbiAgICBteURyb3B6b25lLm9uKFwicXVldWVjb21wbGV0ZVwiLCBmdW5jdGlvbihwcm9ncmVzcykge1xyXG4gICAgICAgIHRvdGFsUHJvZ3Jlc3MuY3NzKCdvcGFjaXR5JywgJzAnKTtcclxuICAgICAgICB0b3RhbFByb2dyZXNzLmZpbmQoXCIucHJvZ3Jlc3MtYmFyXCIpLmNzcyhcIndpZHRoXCIsIFwiMCVcIik7XHJcbiAgICB9KTsgXHJcbiAgICBcclxuICAgIG15RHJvcHpvbmUub24oXCJzdWNjZXNzXCIsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgdmFyIGVsID0gJChyZXNwb25zZS5wcmV2aWV3RWxlbWVudCk7XHJcbiAgICAgICAgZWwuY3NzKHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiNjNGYxYzRcIixcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiBcIjVweFwiLFxyXG4gICAgICAgICAgICBwYWRkaW5nOiBcIjVweCAxZW0gMFwiXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZWwuZmluZChcIi5wcm9ncmVzc1wiKS5wYXJlbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICBlbC5maW5kKFwiLnByZXZpZXdcIikuaHRtbCgnJykuYWRkQ2xhc3MoJ2dseXBoaWNvbiBnbHlwaGljb24tb2sgdGV4dC1zdWNjZXNzJykucmVtb3ZlQ2xhc3MoJ3ByZXZpZXcnKTtcclxuICAgICAgICBlbC5maW5kKFwiYnV0dG9uXCIpLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4vLyBTZXR1cCB0aGUgYnV0dG9ucyBmb3IgYWxsIHRyYW5zZmVyc1xyXG4vLyBUaGUgXCJhZGQgZmlsZXNcIiBidXR0b24gZG9lc24ndCBuZWVkIHRvIGJlIHNldHVwIGJlY2F1c2UgdGhlIGNvbmZpZ1xyXG4vLyBgY2xpY2thYmxlYCBoYXMgYWxyZWFkeSBiZWVuIHNwZWNpZmllZC5cclxuICAgICQoJyNhY3Rpb25zIC5zdGFydCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbXlEcm9wem9uZS5lbnF1ZXVlRmlsZXMobXlEcm9wem9uZS5nZXRGaWxlc1dpdGhTdGF0dXMoRHJvcHpvbmUuQURERUQpKTtcclxuICAgIH0pO1xyXG4gICAgJCgnI2FjdGlvbnMgLmNhbmNlbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbXlEcm9wem9uZS5yZW1vdmVBbGxGaWxlcyh0cnVlKTtcclxuICAgIH0pO1xyXG59KTsiXSwiZmlsZSI6ImRhc2hib2FyZC9yYWRpby91cGxvYWQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
