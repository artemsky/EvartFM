function onErrorLoader(obj, link){
    if(obj.tagName != "SCRIPT")
        obj.href = link;
    else
        obj.src = link;

    obj.crossorigin = false;
    obj.integrity = false;
    obj.href = link;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvb25FcnJvckxvYWRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBvbkVycm9yTG9hZGVyKG9iaiwgbGluayl7XHJcbiAgICBpZihvYmoudGFnTmFtZSAhPSBcIlNDUklQVFwiKVxyXG4gICAgICAgIG9iai5ocmVmID0gbGluaztcclxuICAgIGVsc2VcclxuICAgICAgICBvYmouc3JjID0gbGluaztcclxuXHJcbiAgICBvYmouY3Jvc3NvcmlnaW4gPSBmYWxzZTtcclxuICAgIG9iai5pbnRlZ3JpdHkgPSBmYWxzZTtcclxuICAgIG9iai5ocmVmID0gbGluaztcclxufVxyXG4iXSwiZmlsZSI6ImRhc2hib2FyZC9vbkVycm9yTG9hZGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
