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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpb3cvc2NyaXB0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcclxuXHJcbiAgICB2YXIgdWwgPSAkKCcjdXBsb2FkIHVsJyk7XHJcblxyXG4gICAgJCgnI2Ryb3AgYScpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy8gU2ltdWxhdGUgYSBjbGljayBvbiB0aGUgZmlsZSBpbnB1dCBidXR0b25cclxuICAgICAgICAvLyB0byBzaG93IHRoZSBmaWxlIGJyb3dzZXIgZGlhbG9nXHJcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCdpbnB1dCcpLmNsaWNrKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHRoZSBqUXVlcnkgRmlsZSBVcGxvYWQgcGx1Z2luXHJcbiAgICAkKCcjdXBsb2FkJykuZmlsZXVwbG9hZCh7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgZWxlbWVudCB3aWxsIGFjY2VwdCBmaWxlIGRyYWcvZHJvcCB1cGxvYWRpbmdcclxuICAgICAgICBkcm9wWm9uZTogJCgnI2Ryb3AnKSxcclxuXHJcbiAgICAgICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiBhIGZpbGUgaXMgYWRkZWQgdG8gdGhlIHF1ZXVlO1xyXG4gICAgICAgIC8vIGVpdGhlciB2aWEgdGhlIGJyb3dzZSBidXR0b24sIG9yIHZpYSBkcmFnL2Ryb3A6XHJcbiAgICAgICAgYWRkOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHRwbCA9ICQoJzxsaSBjbGFzcz1cIndvcmtpbmdcIj48aW5wdXQgdHlwZT1cInRleHRcIiB2YWx1ZT1cIjBcIiBkYXRhLXdpZHRoPVwiNDhcIiBkYXRhLWhlaWdodD1cIjQ4XCInK1xyXG4gICAgICAgICAgICAgICAgJyBkYXRhLWZnQ29sb3I9XCIjMDc4OGE1XCIgZGF0YS1yZWFkT25seT1cIjFcIiBkYXRhLWJnQ29sb3I9XCIjM2U0MDQzXCIgLz48cD48L3A+PHNwYW4+PC9zcGFuPjwvbGk+Jyk7XHJcblxyXG4gICAgICAgICAgICAvLyBBcHBlbmQgdGhlIGZpbGUgbmFtZSBhbmQgZmlsZSBzaXplXHJcbiAgICAgICAgICAgIHRwbC5maW5kKCdwJykudGV4dChkYXRhLmZpbGVzWzBdLm5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCc8aT4nICsgZm9ybWF0RmlsZVNpemUoZGF0YS5maWxlc1swXS5zaXplKSArICc8L2k+Jyk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIEhUTUwgdG8gdGhlIFVMIGVsZW1lbnRcclxuICAgICAgICAgICAgZGF0YS5jb250ZXh0ID0gdHBsLmFwcGVuZFRvKHVsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGtub2IgcGx1Z2luXHJcbiAgICAgICAgICAgIHRwbC5maW5kKCdpbnB1dCcpLmtub2IoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2tzIG9uIHRoZSBjYW5jZWwgaWNvblxyXG4gICAgICAgICAgICB0cGwuZmluZCgnc3BhbicpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodHBsLmhhc0NsYXNzKCd3b3JraW5nJykpe1xyXG4gICAgICAgICAgICAgICAgICAgIGpxWEhSLmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdHBsLmZhZGVPdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICB0cGwucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gQXV0b21hdGljYWxseSB1cGxvYWQgdGhlIGZpbGUgb25jZSBpdCBpcyBhZGRlZCB0byB0aGUgcXVldWVcclxuICAgICAgICAgICAgdmFyIGpxWEhSID0gZGF0YS5zdWJtaXQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwcm9ncmVzczogZnVuY3Rpb24oZSwgZGF0YSl7XHJcblxyXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbXBsZXRpb24gcGVyY2VudGFnZSBvZiB0aGUgdXBsb2FkXHJcbiAgICAgICAgICAgIHZhciBwcm9ncmVzcyA9IHBhcnNlSW50KGRhdGEubG9hZGVkIC8gZGF0YS50b3RhbCAqIDEwMCwgMTApO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBoaWRkZW4gaW5wdXQgZmllbGQgYW5kIHRyaWdnZXIgYSBjaGFuZ2VcclxuICAgICAgICAgICAgLy8gc28gdGhhdCB0aGUgalF1ZXJ5IGtub2IgcGx1Z2luIGtub3dzIHRvIHVwZGF0ZSB0aGUgZGlhbFxyXG4gICAgICAgICAgICBkYXRhLmNvbnRleHQuZmluZCgnaW5wdXQnKS52YWwocHJvZ3Jlc3MpLmNoYW5nZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYocHJvZ3Jlc3MgPT0gMTAwKXtcclxuICAgICAgICAgICAgICAgIGRhdGEuY29udGV4dC5yZW1vdmVDbGFzcygnd29ya2luZycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZmFpbDpmdW5jdGlvbihlLCBkYXRhKXtcclxuICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcyBnb25lIHdyb25nIVxyXG4gICAgICAgICAgICBkYXRhLmNvbnRleHQuYWRkQ2xhc3MoJ2Vycm9yJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAvLyBQcmV2ZW50IHRoZSBkZWZhdWx0IGFjdGlvbiB3aGVuIGEgZmlsZSBpcyBkcm9wcGVkIG9uIHRoZSB3aW5kb3dcclxuICAgICQoZG9jdW1lbnQpLm9uKCdkcm9wIGRyYWdvdmVyJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCBmb3JtYXRzIHRoZSBmaWxlIHNpemVzXHJcbiAgICBmdW5jdGlvbiBmb3JtYXRGaWxlU2l6ZShieXRlcykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYnl0ZXMgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChieXRlcyA+PSAxMDAwMDAwMDAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYnl0ZXMgLyAxMDAwMDAwMDAwKS50b0ZpeGVkKDIpICsgJyBHQic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYnl0ZXMgPj0gMTAwMDAwMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKGJ5dGVzIC8gMTAwMDAwMCkudG9GaXhlZCgyKSArICcgTUInO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIChieXRlcyAvIDEwMDApLnRvRml4ZWQoMikgKyAnIEtCJztcclxuICAgIH1cclxuXHJcbn0pOyJdLCJmaWxlIjoicmFkaW93L3NjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
