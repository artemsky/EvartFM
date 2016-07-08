function onErrorLoader(obj, link){
    if(obj.tagName != "SCRIPT")
        obj.href = link;
    else
        obj.src = link;

    obj.crossorigin = false;
    obj.integrity = false;
    obj.href = link;
}
