interface ItemslideOptions{
    duration?: number,
    swipe_sensitivity?: number,
    disable_slide?: boolean,
    disable_clicktoslide?: boolean,
    disable_autowidth?: boolean,
    disable_scroll?: boolean,
    start?: number,
    pan_threshold?: number,
    one_item?: boolean,
    parent_width?: boolean,
    swipe_out?: boolean,
    left_sided?: boolean
}

interface Itemslide{
    itemslide(options?: ItemslideOptions): JQuery;
    getActiveIndex: () => number;
    getCurrentPos: () => number;
    next: () => void;
    previous: () => void;
    gotoSlide: (index: number) => void;
    reload: () => void;
    addSlide: (html:string) => void;
    removeSlide: (index:number) => void;
}


interface JQuery extends Itemslide{

}