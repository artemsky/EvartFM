function onErrorLoader(obj, link){
    if(obj.tagName != "SCRIPT")
        obj.href = link;
    else
        obj.src = link;

    obj.crossorigin = false;
    obj.integrity = false;
    obj.href = link;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvbkVycm9yTG9hZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIG9uRXJyb3JMb2FkZXIob2JqLCBsaW5rKXtcclxuICAgIGlmKG9iai50YWdOYW1lICE9IFwiU0NSSVBUXCIpXHJcbiAgICAgICAgb2JqLmhyZWYgPSBsaW5rO1xyXG4gICAgZWxzZVxyXG4gICAgICAgIG9iai5zcmMgPSBsaW5rO1xyXG5cclxuICAgIG9iai5jcm9zc29yaWdpbiA9IGZhbHNlO1xyXG4gICAgb2JqLmludGVncml0eSA9IGZhbHNlO1xyXG4gICAgb2JqLmhyZWYgPSBsaW5rO1xyXG59XHJcbiJdLCJmaWxlIjoib25FcnJvckxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
