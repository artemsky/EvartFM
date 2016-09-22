<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Языковые ресурсы постраничного вывода
    |--------------------------------------------------------------------------
    |
    | Последующие языковые строки используются библиотекой постраничного вывода
    | для создания простых ссылок на страницы. Вы можете поменять их на любые
    | другие, которые лучше подходят для вашего приложения.
    |
    */
    'core' => [
        'welcome' => 'Welcome to Evart.FM Dashboard',
        'navigation' => [
            'title' => 'Dashboard',
            'users' => [
                'title' => 'Users',
                'all' => 'Users list',
                'add' => 'Add user'
            ],
            'schedule' => 'Schedule',
            'content' => [
                'title' => 'Content management',
                'news' => 'News',
                'components' => 'Components'
            ],
            'broadcast' => 'Broadcast management',
            'language' => 'Language',
            'logout' => 'Logout',
        ],
        'buttons' => [
            'delete' => 'Delete',
            'close' => 'Close',
            'save' => 'Save changes',
        ]
    ],
    'components' => [
        'scheduler' => [
            'event' => [
                'day' => 'EVENT THIS DAY',
                'month' => 'EVENTS THIS MONTH',
                'edit' => 'Edit',
                'highlight' => 'Highlight'
            ],
        ],
        'slider' => 'Slider',
        'blockquote' => 'Blockquote',
        'events' => 'Events',
        'video' => 'Video',
        'new' => [
            'blockquote' => 'New blockquote',
            'event' => 'New event',
            'slider' => 'New slide',
            'video' => 'New video slide',
        ],
        'modal' => [
            'order' => 'Order',
            'title' => 'Title',
            'name' => 'Name',
            'desc' => 'Description',
            'url' => 'url',
            'date' => 'Date',
            'dateDesc' => 'Click to select Date',
            'image' => 'Select Image',
            'imageDesc' => 'PNG, JPEG, JPG and not more than 2MB.',
        ]
    ]


];
