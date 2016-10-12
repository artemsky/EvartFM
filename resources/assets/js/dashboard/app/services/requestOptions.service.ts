import * as $ from 'jquery';

type TRequest = 'POST' | 'GET' | 'DELETE';
interface IRequest extends JQueryAjaxSettings{
    type: TRequest,
    headers: {
        'X-CSRF-TOKEN': string
    }
}
export class AJAX{
    private requestOptions: IRequest;
    constructor(url:string, type:TRequest = "POST"){
        this.requestOptions = {
            type: type,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: url
        };
    }
    public setData(json): AJAX{
        this.requestOptions.data = json;
        return this;
    }
    public start(): JQueryPromise<any> {
        return $.when($.ajax(this.requestOptions))
    }
}
