$(function(){

    var ul = $('#upload ul');

    $('#drop a').click(function(){
        // Simulate a click on the file input button
        // to show the file browser dialog
        $(this).parent().find('input').click();
    });

    // Initialize the jQuery File Upload plugin
    $('#upload').fileupload({

        // This element will accept file drag/drop uploading
        dropZone: $('#drop'),

        // This function is called when a file is added to the queue;
        // either via the browse button, or via drag/drop:
        add: function (e, data) {

            var tpl = $('<li class="working"><input type="text" value="0" data-width="48" data-height="48"'+
                ' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>');

            // Append the file name and file size
            tpl.find('p').text(data.files[0].name)
                         .append('<i>' + formatFileSize(data.files[0].size) + '</i>');

            // Add the HTML to the UL element
            data.context = tpl.appendTo(ul);

            // Initialize the knob plugin
            tpl.find('input').knob();

            // Listen for clicks on the cancel icon
            tpl.find('span').click(function(){

                if(tpl.hasClass('working')){
                    jqXHR.abort();
                }

                tpl.fadeOut(function(){
                    tpl.remove();
                });

            });

            // Automatically upload the file once it is added to the queue
            var jqXHR = data.submit();
        },

        progress: function(e, data){

            // Calculate the completion percentage of the upload
            var progress = parseInt(data.loaded / data.total * 100, 10);

            // Update the hidden input field and trigger a change
            // so that the jQuery knob plugin knows to update the dial
            data.context.find('input').val(progress).change();

            if(progress == 100){
                data.context.removeClass('working');
            }
        },

        fail:function(e, data){
            // Something has gone wrong!
            data.context.addClass('error');
        }

    });


    // Prevent the default action when a file is dropped on the window
    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });

    // Helper function that formats the file sizes
    function formatFileSize(bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }

        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }

        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }

        return (bytes / 1000).toFixed(2) + ' KB';
    }

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby9zY3JpcHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xyXG5cclxuICAgIHZhciB1bCA9ICQoJyN1cGxvYWQgdWwnKTtcclxuXHJcbiAgICAkKCcjZHJvcCBhJykuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICAvLyBTaW11bGF0ZSBhIGNsaWNrIG9uIHRoZSBmaWxlIGlucHV0IGJ1dHRvblxyXG4gICAgICAgIC8vIHRvIHNob3cgdGhlIGZpbGUgYnJvd3NlciBkaWFsb2dcclxuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJ2lucHV0JykuY2xpY2soKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgdGhlIGpRdWVyeSBGaWxlIFVwbG9hZCBwbHVnaW5cclxuICAgICQoJyN1cGxvYWQnKS5maWxldXBsb2FkKHtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBlbGVtZW50IHdpbGwgYWNjZXB0IGZpbGUgZHJhZy9kcm9wIHVwbG9hZGluZ1xyXG4gICAgICAgIGRyb3Bab25lOiAkKCcjZHJvcCcpLFxyXG5cclxuICAgICAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIGEgZmlsZSBpcyBhZGRlZCB0byB0aGUgcXVldWU7XHJcbiAgICAgICAgLy8gZWl0aGVyIHZpYSB0aGUgYnJvd3NlIGJ1dHRvbiwgb3IgdmlhIGRyYWcvZHJvcDpcclxuICAgICAgICBhZGQ6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgdHBsID0gJCgnPGxpIGNsYXNzPVwid29ya2luZ1wiPjxpbnB1dCB0eXBlPVwidGV4dFwiIHZhbHVlPVwiMFwiIGRhdGEtd2lkdGg9XCI0OFwiIGRhdGEtaGVpZ2h0PVwiNDhcIicrXHJcbiAgICAgICAgICAgICAgICAnIGRhdGEtZmdDb2xvcj1cIiMwNzg4YTVcIiBkYXRhLXJlYWRPbmx5PVwiMVwiIGRhdGEtYmdDb2xvcj1cIiMzZTQwNDNcIiAvPjxwPjwvcD48c3Bhbj48L3NwYW4+PC9saT4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFwcGVuZCB0aGUgZmlsZSBuYW1lIGFuZCBmaWxlIHNpemVcclxuICAgICAgICAgICAgdHBsLmZpbmQoJ3AnKS50ZXh0KGRhdGEuZmlsZXNbMF0ubmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJzxpPicgKyBmb3JtYXRGaWxlU2l6ZShkYXRhLmZpbGVzWzBdLnNpemUpICsgJzwvaT4nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgSFRNTCB0byB0aGUgVUwgZWxlbWVudFxyXG4gICAgICAgICAgICBkYXRhLmNvbnRleHQgPSB0cGwuYXBwZW5kVG8odWwpO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUga25vYiBwbHVnaW5cclxuICAgICAgICAgICAgdHBsLmZpbmQoJ2lucHV0Jykua25vYigpO1xyXG5cclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGlja3Mgb24gdGhlIGNhbmNlbCBpY29uXHJcbiAgICAgICAgICAgIHRwbC5maW5kKCdzcGFuJykuY2xpY2soZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih0cGwuaGFzQ2xhc3MoJ3dvcmtpbmcnKSl7XHJcbiAgICAgICAgICAgICAgICAgICAganFYSFIuYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0cGwuZmFkZU91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRwbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBBdXRvbWF0aWNhbGx5IHVwbG9hZCB0aGUgZmlsZSBvbmNlIGl0IGlzIGFkZGVkIHRvIHRoZSBxdWV1ZVxyXG4gICAgICAgICAgICB2YXIganFYSFIgPSBkYXRhLnN1Ym1pdCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHByb2dyZXNzOiBmdW5jdGlvbihlLCBkYXRhKXtcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29tcGxldGlvbiBwZXJjZW50YWdlIG9mIHRoZSB1cGxvYWRcclxuICAgICAgICAgICAgdmFyIHByb2dyZXNzID0gcGFyc2VJbnQoZGF0YS5sb2FkZWQgLyBkYXRhLnRvdGFsICogMTAwLCAxMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGhpZGRlbiBpbnB1dCBmaWVsZCBhbmQgdHJpZ2dlciBhIGNoYW5nZVxyXG4gICAgICAgICAgICAvLyBzbyB0aGF0IHRoZSBqUXVlcnkga25vYiBwbHVnaW4ga25vd3MgdG8gdXBkYXRlIHRoZSBkaWFsXHJcbiAgICAgICAgICAgIGRhdGEuY29udGV4dC5maW5kKCdpbnB1dCcpLnZhbChwcm9ncmVzcykuY2hhbmdlKCk7XHJcblxyXG4gICAgICAgICAgICBpZihwcm9ncmVzcyA9PSAxMDApe1xyXG4gICAgICAgICAgICAgICAgZGF0YS5jb250ZXh0LnJlbW92ZUNsYXNzKCd3b3JraW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBmYWlsOmZ1bmN0aW9uKGUsIGRhdGEpe1xyXG4gICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFzIGdvbmUgd3JvbmchXHJcbiAgICAgICAgICAgIGRhdGEuY29udGV4dC5hZGRDbGFzcygnZXJyb3InKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIC8vIFByZXZlbnQgdGhlIGRlZmF1bHQgYWN0aW9uIHdoZW4gYSBmaWxlIGlzIGRyb3BwZWQgb24gdGhlIHdpbmRvd1xyXG4gICAgJChkb2N1bWVudCkub24oJ2Ryb3AgZHJhZ292ZXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0aGF0IGZvcm1hdHMgdGhlIGZpbGUgc2l6ZXNcclxuICAgIGZ1bmN0aW9uIGZvcm1hdEZpbGVTaXplKGJ5dGVzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBieXRlcyAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGJ5dGVzID49IDEwMDAwMDAwMDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIChieXRlcyAvIDEwMDAwMDAwMDApLnRvRml4ZWQoMikgKyAnIEdCJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChieXRlcyA+PSAxMDAwMDAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYnl0ZXMgLyAxMDAwMDAwKS50b0ZpeGVkKDIpICsgJyBNQic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gKGJ5dGVzIC8gMTAwMCkudG9GaXhlZCgyKSArICcgS0InO1xyXG4gICAgfVxyXG5cclxufSk7Il0sImZpbGUiOiJyYWRpby9zY3JpcHQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
