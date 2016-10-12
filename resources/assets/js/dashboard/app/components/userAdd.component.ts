import * as $ from 'jquery';
import {AJAX} from '../services/requestOptions.service';
import * as notie from 'notie';

module Users{
    type User = "id" | "login" | "password" | "password_confirmation" | "role" | "name" | "email";
    class UserAddComponent{
        public static readonly form = $('form').get(0) as HTMLFormElement;
        constructor(){
            this.initEvents();
        }
        private static parseUser() : Map<User,string|number>{
            let userObject: Map<User,string|number> = new Map();
            return userObject.set('login', $("#user-login").val().trim() )
                .set('role', $("#user-role").val() )
                .set('name', $("#user-name").val().trim() )
                .set('email', $("#user-email").val().trim() )
                .set('password', $("#user-password").val() )
                .set('password_confirmation', $("#user-passwordConfirmation").val() );
        }



        private toJSON(map: Map<User,string|number>){
            let obj = Object.create(null);
            map.forEach((value, key) => {
                obj[key] = value;
            });
            return obj;
        }

        private initEvents(): void{
            $("#user-add").on("click", (e) => {
                new AJAX($(e.target).attr('data-url'))
                    .setData(this.toJSON(UserAddComponent.parseUser()))
                    .start()
                    .then(success=>{
                        notie.alert("success", success.msg, 2);
                        UserAddComponent.form.reset();
                    }, error => {
                        if(error.msg)
                            notie.force("error", error.msg, 'OK');
                        else if(error.responseJSON){
                            let message = '';
                            for (let key in error.responseJSON) {
                                message += `${key} : ${error.responseJSON[key]}<br>`;
                            }

                        }
                        UserAddComponent.form.reset();
                    });
            });
        }

    }
    new UserAddComponent();
}