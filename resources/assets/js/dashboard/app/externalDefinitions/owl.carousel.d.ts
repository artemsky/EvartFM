interface IowlCarouselEvent extends JQueryEventObject{
    target:Element;
    type:string;
    namespace:string;
    item:{
        count: number;
        index: number
    };
    page:{
        count: number;
        index: number;
        size: number;
    }
}

interface IowlCarouselCallback{
    onInitialize?: (event:IowlCarouselEvent) => void;
    onInitialized?: (event:IowlCarouselEvent) => void;
    onResize?: (event:IowlCarouselEvent) => void;
    onResized?: (event:IowlCarouselEvent) => void;
    onRefresh?: (event:IowlCarouselEvent, speed: number) => void;
    onRefreshed?: (event:IowlCarouselEvent) => void;
    onDrag?: (event:IowlCarouselEvent) => void;
    onDragged?: (event:IowlCarouselEvent) => void;
    onTranslate?: (event:IowlCarouselEvent) => void;
    onTranslated?: (event:IowlCarouselEvent) => void;
    onChange?: (property:any) => void;
    onChanged?: (property:any) => void;
    onLoadLazy?: (event:IowlCarouselEvent) => void;
    onLoadedLazy?: (event:IowlCarouselEvent) => void;
    onStopVideo?: (event:IowlCarouselEvent) => void;
    onPlayVideo?: (event:IowlCarouselEvent) => void;
}

interface IowlCarouselClasses{
    themeClass?: string
    baseClass?: string
    itemClass?: string
    centerClass?: string
    activeClass?: string
    navContainerClass?: string
    navClass?: string
    controlsClass?: string
    dotClass?: string
    dotsClass?: string
    autoHeightClass?: string
}


interface IowlCarouselOptions extends IowlCarouselCallback, IowlCarouselClasses{
    items?: number;
    margin?: number;
    loop?: boolean;
    center?: boolean;
    mouseDrag?: boolean;
    touchDrag?: boolean;
    pullDrag?: boolean;
    freeDrag?: boolean;
    stagePadding?: number;
    merge?: boolean;
    mergeFit?: boolean;
    autoWidth?: boolean;
    startPosition?: number|string;
    URLhashListener?: boolean;
    nav?: boolean;
    navRewind?: boolean;
    navText?: Array<string>;
    slideBy?: number|string;
    dots?: boolean;
    dotsEach?: number|boolean;
    dotData?: boolean;
    lazyLoad?: boolean;
    lazyContent?: boolean;
    autoplay?: boolean;
    autoplayTimeout?: number;
    autoplayHoverPause?: boolean;
    smartSpeed?: number;
    fluidSpeed?: boolean;
    autoplaySpeed?: number|boolean;
    navSpeed?: number|boolean;
    dotsSpeed?: number|boolean;
    dragEndSpeed?: number|boolean;
    callbacks?: boolean;
    responsive?: Object;
    responsiveRefreshRate?: number;
    responsiveBaseElement?: Element;
    responsiveClass?: boolean;
    video?: boolean;
    videoHeight?: number|boolean;
    videoWidth?: number|boolean;
    animateOut?: string|boolean;
    animateIn?: string|boolean;
    fallbackEasing?: string;
    info?: (data: Object, owl: Element) => void;
    nestedItemSelector?: string;
    itemElement?: string;
    stageElement?: string;
    navContainer?: string|boolean;
    dotsContainer?: string|boolean;
}

interface JQuery {
    owlCarousel(options?:IowlCarouselOptions)
    next(speed?:number)
    prev(speed?:number)
    to(position:number, speed?:number)
    destroy()
    replace(data:any)
    add(data:any, position:number)
    remove(position:number)
    play(timeout:number, speed:number)
    stop()
}

