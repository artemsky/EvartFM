<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Radio Storage
    |--------------------------------------------------------------------------
    |
    */
    'icecast' => [
        'port' => 8000
    ],
    'music' => [
        'full' => storage_path('app/broadcast/music'),
        'relative' => 'broadcast/music'
    ],
    'playlist' => [
        'full' => storage_path('app/broadcast/playlist.txt'),
        'relative' => 'broadcast/playlist.txt'
    ],
    'script' => [
        'run' => [
            'icecast' => 'icecast2 -b -c /home/vagrant/icecast.xml',
            'ezstream' => 'ezstream -c /home/vagrant/ezstream.xml'
        ],
        'shutdown' => [
            'icecast' => 'sudo killall icecast2',
            'ezstream' => 'sudo killall ezstream'
        ],
        'refresh' => 'sudo killall -SIGHUP ezstream && sudo killall -SIGUSR1 ezstream',
        'next' => 'sudo killall -SIGUSR1 ezstream'
    ],

];
