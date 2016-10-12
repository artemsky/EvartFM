export module DomHelper{
    interface DOMObject{
        tag: string,
        className: string,
        id: string
        attr: {
            name: string,
            value : string|number
        }
    }
    export class DOM{
        private elements: Array<Element>;
        constructor(selectorOrElement?:string|Element){
            if(typeof selectorOrElement !== "undefined"){
                if(selectorOrElement instanceof Element){
                    this.elements = [selectorOrElement];
                }
                else if(typeof selectorOrElement === 'string'){
                    this.elements = this.toArray(document.querySelectorAll(selectorOrElement));
                }
                else if(typeof selectorOrElement === "object"){
                    this.elements = [this.createElement(selectorOrElement)];
                }
            }
            else{
                this.elements = [];
            }
        }

        private toArray(elementList: NodeListOf<Element>) : Array<Element>{
            return Array.prototype.slice.call(elementList);
        }

        private createElement(element: string) : Element{
            return document.createElement(element);
        }

        public forEach(callback : (value:Element, index:number) => void) : DOM {
            this.elements.forEach((value, index) => {
                callback(value, index);
            });
            return this;
        }

        public append(html:string): DOM {
            if(this.elements.length === 1){
                this.elements[0].insertAdjacentHTML("beforeend", html)
            }else{
                this.elements.forEach((e)=>{
                    e.insertAdjacentHTML("beforeend", html)
                })
            }
            return this;
        }



        public first() : DOM{
            if(this.elements.length === 1)
                return this;
            return new DOM(this.elements[0]);
        }

        public html(html:string) : DOM {
            this.elements.forEach((element) => {
                element.innerHTML = html;
            });
            return this;
        }


        public attr(name:string, value:string|number) : void|string|DOM {
                if(typeof value !== "undefined") {
                    this.elements.forEach((element) => {
                        element.setAttribute(name, value.toString());
                    });
                }else {
                    return this.elements[0].getAttribute(name);
                }
            return this;

        }
    }
}

export let d = (selector?:string) => {
    return new DomHelper.DOM(selector);
};
