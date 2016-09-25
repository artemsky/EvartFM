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
        'welcome' => 'Добро пожаловать в Панель Управления Evart.FM',
        'navigation' => [
            'online' => 'Слушать радио Evart',
            'title' => 'Панель управления',
            'users' => [
                'title' => 'Пользователи',
                'all' => 'Список пользователей',
                'add' => 'Добавить пользователя'
            ],
            'schedule' => 'Расписание',
            'content' => [
                'title' => 'Управления контентом',
                'news' => 'Новости',
                'components' => 'Компоненты'
            ],
            'broadcast' => 'Управления Трансляцией',
            'language' => 'Язык',
            'logout' => 'Выход',
        ],
        'buttons' => [
            'delete' => 'Удалить',
            'close' => 'Закрыть',
            'save' => 'Сохранить изменения',
        ]
    ],
    'components' => [
        'scheduler' => [
            'event' => [
                'day' => 'События сегодня',
                'month' => 'События в этом месяце',
                'edit' => 'Редактировать',
                'highlight' => 'Подсветить'
            ],
            'modal' => [
                'modalTitle' => 'Добавить новое событие',
                'title' => 'Заголовок',
                'titleTip' => "Заголовок не может быть пустым",
                'desc' => 'Описание',
                'playlist' => 'Выбрать плейлист',
                'emptyPlaylist' => 'Нет плейлиста',
                'datetime' => 'Дата / Время',
                'repeat' => [
                    'everyDay' => 'Каждый день',
                    'everyWeek' => 'Каждую неделю по',
                    'weeks' => [
                        'mon' => 'Пн',
                        'tue' => 'Вт',
                        'wed' => 'Ср',
                        'thu' => 'Чт',
                        'fri' => 'Пт',
                        'sat' => 'Сб',
                        'sun' => 'Вск',
                    ],
                ],
            ]
        ],
        'slider' => 'Слайдер',
        'blockquote' => 'Цитаты',
        'events' => 'События',
        'video' => 'Видео',
        'new' => [
            'blockquote' => 'Новая цитата',
            'event' => 'Новое событие',
            'slider' => 'Новый слайд',
            'video' => 'Новый видео слайд',
        ],
        'modal' => [
            'order' => 'Порядковый номер',
            'title' => 'Заголовок',
            'name' => 'Имя',
            'desc' => 'Описание',
            'url' => 'ссылка',
            'date' => 'Дата',
            'dateDesc' => 'Нажмите что-бы, выбрать дату',
            'image' => 'Выбрать изображение',
            'imageDesc' => 'PNG, JPEG, JPG и размер не более чем 2МБ.',
        ]
    ],
    'news' => [
        'new' => 'Добавть новость',
        'sort' => [
            'asc' => 'Возрастанию',
            'desc' => 'Убыванию',
            'order' => 'Сортировать по',
            'id' => 'Индификатор',
            'created' => 'Дата создания',
            'updated' => 'Дата обновления',
            'titleLong' => 'Длинный заголовок',
            'titleShort' => 'Короткий заголовок',
        ],
        'modal' => [
            'id' => 'Индификатор',
            'length' => 'Максимальная длинна',
            'image' => 'Выбрать изображение',
            'imageDesc' => 'PNG, JPEG, JPG размером не более чем 2MB.',
            'text' => 'Текст новости'

        ]
    ],
    'radio' => [
        'files' => [
            'title' => 'Управление файлами',
            'desc' => 'Загрузка на сервер и удаление файлов с сервера',
            'delete' => 'Удалить файлы',
            'select' => 'Жамите что бы выбрать',
            'selectDesc' => '<strong>CTRL+Правая кнопка мыши</strong> или <strong>выделяйте с помощью зажатой правой кнопки мыши</strong> как в обычном файловом менеджере что бы выбрать больше одного',
            'upload' => [
                'title' => 'Загрузить файлы',
                'select' => 'Перетащите файлы в это окно, или нажмите <strong>Добавить файлы</strong> для загрузки',
                'selectDesc' => '(Только <strong>mp3</strong> файлы. Размер не больше чем <strong>300Мб</strong>)',
                'add' => 'Добавить файлы...',
                'start' => 'Начать загрузку',
                'cancel' => 'Отменить загрузку',
                'startSingle' => 'Начать',
                'cancelSingle' => 'Отменить',
                'deleteSingle' => 'Удалить',

            ]
        ],
        'playlist' => [
            'title' => 'Управление плейлистами',
            'desc' => 'Создать новый, редактировать старый, или назначить расписание',
            'playlists' => "Плейлисты",
            'schedule' => 'Расписание',
            'playlist' => [
                'title' => 'Плейлист',
                'select' => 'Выбрать плейлист',
            ],
            'files' => [
                'title' => 'Файлы',
                'titleDesc' => '<strong>Перетащите файлы</strong> в <strong>плейлист</strong> слева'
            ],
            'new' => 'Новый плейлист',
            'delete' => 'Удалить этот плейлист'

        ],
        'broadcast' => [
            'title' => 'Управление вещанием',
            'desc' => 'Включить, выключить вещание, обновить плейлист, или переключить песню',
            'on' => "Включить",
            'off' => 'Выключить',
            'refresh' => 'Перезагрузить плейлист',
            'next' => 'Следующая песня',
        ],

    ],
    'users' => [
        'login' => 'Логин',
        'loginPlaceholder' => 'Введите логин',
        'password' => 'Пароль',
        'passwordPlaceholder' => 'Мин: 6 - Макс: 32 символа',
        'passwordRepeat' => 'Повторите',
        'passwordRepeatPlaceholder' => 'Повторите пароль',
        'email' => 'Почта',
        'emailPlaceholder' => 'Введите почту',
        'name' => 'Имя',
        'namePlaceholder' => 'Введите ваше имя',
        'role' => 'Роль',
        'add' => 'Добавить пользователя',
    ],
    'login' => [
        'title' => 'Панель администрирования',
        'username' => 'Имя пользователя',
        'password' => 'Пароль',
        'enter' => 'Войти',
    ]

];
