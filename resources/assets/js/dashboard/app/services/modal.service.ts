import 'bootstrap';
type BootsratModalEvents = "show.bs.modal" | "shown.bs.modal" | "hide.bs.modal" | "hidden.bs.modal" | "loaded.bs.modal";
export class Modal{
    private target;
    constructor(modal:JQuery){
        this.target = modal;
    }
    public show(light:boolean = false){
        if(light)
            this.target.show(200);
        else
            this.target.modal('show');
    }
    public hide(light:boolean = false){
        if(light)
            this.target.hide(200);
        else
            this.target.modal('hide');
    }
    public fill(element:string, value: string|number){
        return this.target.find(element).val(value);
    }
    public reset(){
        this.target.find("form").get(0).reset();
    }
    public on(event:BootsratModalEvents, callback: () => void){
        this.target.on(event, callback);
    }
}
