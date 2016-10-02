<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Языковые ресурсы напоминания пароля
    |--------------------------------------------------------------------------
    |
    | Последующие языковые строки возвращаются брокером паролей на неудачные
    | попытки обновления пароля в таких случаях, как ошибочный код сброса
    | пароля или неверный новый пароль.
    |
    */

    'contacts' => [
        'title' => 'Evart.FM',
        'description' => 'You can use the contact information below to communicate with the company.',
        'form' => [
            'title' => 'Live Support',
            'name' => 'Name',
            'phone' => 'Phone',
            'country' => 'Country',
            'message' => 'Message',
            'email' => 'E-mail',
            'status' => [
                'success' => ' Your message has been delivered!',
                'error' => 'Error! Try again later...',
            ]
        ]
    ]

];
