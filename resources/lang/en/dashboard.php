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
            'modal' => [
                'modalTitle' => 'Add new Event',
                'title' => 'Title',
                'titleTip' => "Title can't be empty",
                'desc' => 'Description',
                'playlist' => 'Select Playlist',
                'emptyPlaylist' => 'No Playlist',
                'datetime' => 'Date / Time',
                'repeat' => [
                  'everyDay' => 'Repeat every day',
                  'everyWeek' => 'Repeat every week',
                  'weeks' => [
                      'mon' => 'Mon',
                      'tue' => 'Tue',
                      'wed' => 'Wed',
                      'thu' => 'Thu',
                      'fri' => 'Fri',
                      'sat' => 'Sat',
                      'sun' => 'Sun',
                  ],
                ],
            ]
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
    ],
    'news' => [
        'new' => 'Add new',
        'sort' => [
            'asc' => 'Ascending',
            'desc' => 'Descending',
            'order' => 'Order By',
            'id' => 'Identity',
            'created' => 'Created',
            'updated' => 'Updated',
            'titleLong' => 'Long Title',
            'titleShort' => 'Short Title',
        ],
        'modal' => [
            'id' => 'ID',
            'length' => 'Max length',
            'image' => 'Select Image',
            'imageDesc' => 'PNG, JPEG, JPG and not more than 2MB.',
            'text' => 'News text'

        ]


    ],
    'radio' => [
        'files' => [
            'title' => 'Manage music files',
            'desc' => 'Upload or Delete mp3 files using file manager',
            'delete' => 'Delete files',
            'select' => 'Click to select',
            'selectDesc' => '<strong>CTRL+click</strong> or <strong>click+mouse drag over items</strong> to select many',
            'upload' => [
                'title' => 'Upload files',
                'select' => 'Drop files on the window or click <strong>Add Files</strong> to upload',
                'selectDesc' => '(Only <strong>mp3</strong> files allowed. Size not more than <strong>300M</strong>)',
                'add' => 'Add files...',
                'start' => 'Start upload',
                'cancel' => 'Cancel upload',
                'startSingle' => 'Start',
                'cancelSingle' => 'Cancel',
                'deleteSingle' => 'Delete',

            ]
        ],
        'playlist' => [
            'title' => 'Manage playlist',
            'desc' => 'Create new, edit old and manage schedule',
            'playlists' => "Playlist's",
            'schedule' => 'Schedule',
            'playlist' => [
                'title' => 'Playlist',
                'select' => 'Select Playlist',
            ],
            'files' => [
                'title' => 'Files',
                'titleDesc' => '<strong>Drag files</strong> to the <strong>playlist</strong> on the left'
            ],
            'new' => 'New Playlist',
            'delete' => 'Delete this list'

        ],
        'broadcast' => [
            'title' => 'Manage radio station',
            'desc' => 'Click button to turn ON/OFF broadcasting',
            'on' => "Turn on",
            'off' => 'Turn off',
            'refresh' => 'Refresh Playlist',
            'next' => 'Next track',
        ],

    ],
    'users' => [
        'login' => 'Login',
        'loginPlaceholder' => 'Enter login',
        'password' => 'Password',
        'passwordPlaceholder' => 'Min: 6 - Max: 32',
        'passwordRepeat' => 'Repeat',
        'passwordRepeatPlaceholder' => 'Repeat password',
        'email' => 'Email',
        'emailPlaceholder' => 'Enter e-mail',
        'name' => 'Name',
        'namePlaceholder' => 'Enter username',
        'role' => 'Role',
        'add' => 'Add user',
    ],
    'login' => [
        'title' => 'Admin Panel',
        'username' => 'Username',
        'password' => 'Password',
        'enter' => 'Go',
    ]

];
