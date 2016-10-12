import * as $ from 'jquery';
import {AJAX} from '../services/requestOptions.service';
import * as notie from 'notie';

module Login{
    class LoginComponent{
        private form:JQuery;
        private button:JQuery;
        private loginURL: string;
        constructor(){
            this.form =  $("form");
            this.button = this.form.find('button:submit');
            this.loginURL = this.form.attr('action');
            this.initEvents();
        }
        private initEvents(){
            this.form.on("submit", (e:JQueryEventObject) => {
                this.submit(e);
            });
        }

        private success(response){
            notie.alert("success", response.message, 3);
            setTimeout(() => {
                window.location.href = response.redirectURL
            }, 1000);

        }
        private fail(response){
            switch(response.status){
                case 422:
                    notie.alert("error", response.responseJSON.message, 3);
                    break;
                case 429:
                    notie.alert("error", response.responseText, 3);
            }
        }


        public submit(e:JQueryEventObject) : void{
            e.preventDefault();
            new AJAX(this.loginURL)
                .setData(this.form.serialize())
                .start()
                .then(this.success, this.fail)
        }

    }
    new LoginComponent();
}
