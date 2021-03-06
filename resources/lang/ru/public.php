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
        'description' => 'Что-бы связаться с компанией, вы можете использовать эту контактную информацию.',
        'form' => [
            'title' => 'Служба Поддержки',
            'name' => 'Ф.И.О',
            'phone' => 'Номер телефона',
            'country' => 'Страна',
            'message' => 'Сообщение',
            'email' => 'Введите электронный адрес',
            'status' => [
                'success' => 'Ваше сообщение было доставлено',
                'error' => 'Ошибка, попробуйте позже',
            ]
        ]
    ]

];
