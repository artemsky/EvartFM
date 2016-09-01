function onErrorLoader(obj, link){
    if(obj.tagName != "SCRIPT")
        obj.href = link;
    else
        obj.src = link;

    obj.crossorigin = false;
    obj.integrity = false;
    obj.href = link;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvbkVycm9yTG9hZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIG9uRXJyb3JMb2FkZXIob2JqLCBsaW5rKXtcbiAgICBpZihvYmoudGFnTmFtZSAhPSBcIlNDUklQVFwiKVxuICAgICAgICBvYmouaHJlZiA9IGxpbms7XG4gICAgZWxzZVxuICAgICAgICBvYmouc3JjID0gbGluaztcblxuICAgIG9iai5jcm9zc29yaWdpbiA9IGZhbHNlO1xuICAgIG9iai5pbnRlZ3JpdHkgPSBmYWxzZTtcbiAgICBvYmouaHJlZiA9IGxpbms7XG59XG4iXSwiZmlsZSI6Im9uRXJyb3JMb2FkZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
