
import * as $ from 'jquery';
import 'bootstrap';
import {AJAX} from '../services/requestOptions.service';
import {Modal} from '../services/modal.service';
import * as notie from 'notie';

module Users{
    type User = "id" | "login" | "password" | "role" | "name" | "email";
    class UserListComponent{
        public static readonly tableUserList:JQuery = $('.table-striped tbody tr');
        public static readonly modal:Modal = new Modal($('#edit'));
        private currentEditableElement:JQuery;
        private user: Map<User,string|number>;
        constructor(){

            this.initEvents();

        }

        private static parseUser(user: JQuery) : Map<User,string|number>{
            let userObject: Map<User,string|number> = new Map();
            userObject.set('id', parseInt(user.attr('data-id')) );
            userObject.set('login', user.attr('data-login') );
            userObject.set('role', user.attr('data-role') );
            userObject.set('name', user.attr('data-name') );
            userObject.set('email', user.attr('data-email') );

            return userObject;
        }
        private updateUser(){
            this.user.set('name', $("#user-name").val().trim());
            this.user.set('email', $("#user-email").val().trim());
            this.user.set('role', $("#user-role").val());
        }
        private changePassword(value?:string){
            if(value){
                if(value.length >= 6 || value.length <= 32){
                    notie.input({
                        type: 'password',
                        autocorrect: "off",
                        spellcheck: false,
                        autofocus: true,
                        placeholder: "6-32 symbols length"
                    }, 'Please repeat password:', 'Change', 'Cancel', valueEntered => {
                        if(value !== valueEntered){
                            notie.force("error", 'Values does not match', 'Try again', () => {
                                this.changePassword();
                            });
                        }
                        else{
                            this.user.set('password', valueEntered);
                            UserListComponent.modal.show(true);
                            notie.alert("success", 'Successfully changed', 1);
                        }
                    }, () => {
                        UserListComponent.modal.show(true);
                        notie.alert("info", 'Nothing changed', 1);
                    })
                }
                else{
                    notie.force("error", 'Password should be 6-32 symbols length', 'Try again', () => {
                        this.changePassword();
                    });
                }

            }else{
                notie.input({
                    type: 'password',
                    autocorrect: "off",
                    spellcheck: false,
                    autofocus: true,
                    placeholder: "6-32 symbols length"
                }, 'Please enter new password:', 'Confirm', 'Cancel', valueEntered => {
                    this.changePassword(valueEntered);
                }, () => {
                    UserListComponent.modal.show(true);
                    notie.alert("info", 'Nothing changed', 1);
                })
            }

        }
        private updateUserView(){
            if(!this.user) return;
            this.user.forEach((value, key)=>{
                this.currentEditableElement.attr(`data-${key}`, value);
                this.currentEditableElement.find(`.user-${key}`).text(value);
            });
            this.currentEditableElement.attr("aria-editable", 'false');
        }

        private toJSON(map: Map<User,string|number>){
            let obj = Object.create(null);
            map.forEach((value, key) => {
                obj[key] = value;
            });
            return obj;
        }

        private initEvents(): void{
            UserListComponent.modal.on('hide.bs.modal', () => {
                this.updateUserView();
                this.user = null;
            });

            UserListComponent.tableUserList.on('click', e => {
                this.currentEditableElement = $(e.target).parent();

                this.currentEditableElement.attr("aria-editable", 'true');
                this.user = UserListComponent.parseUser(this.currentEditableElement);

                UserListComponent.modal.reset();
                this.user.forEach((value, key)=>{
                    UserListComponent.modal.fill(`#user-${key}`, value);
                });
                UserListComponent.modal.show();
            });

            $("#user-password").on("click", ()=>{
                UserListComponent.modal.hide(true);
                this.changePassword()
            });

            $("#user-save").on("click", (e) => {
                this.updateUser();
                new AJAX($(e.target).attr('data-url'))
                    .setData(this.toJSON(this.user))
                    .start()
                    .then(success=>{
                        notie.alert("success", success.message, 2);
                        UserListComponent.modal.hide();
                    }, error => {
                        notie.alert("error", error.message, 2);
                        UserListComponent.modal.hide();
                    });
                UserListComponent.modal.hide();
            });

            $("#user-delete").on("click", (e) => {
                new AJAX($(e.target).attr('data-url'), "DELETE")
                    .setData({id: this.user.get("id")})
                    .start()
                    .then(success =>{
                        notie.alert("warning", success.message, 2);
                        this.currentEditableElement.remove();
                        UserListComponent.modal.hide();
                    }, error => {
                        notie.alert("error", error.message, 2);
                        UserListComponent.modal.hide();
                    })
            });
        }

    }
    new UserListComponent();
}