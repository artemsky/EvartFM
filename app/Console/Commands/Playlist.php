<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PlaylistService;
use App\Services\ProcessService;

class Playlist extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'playlist:run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check db.events dates and if events have playlist assigned command replace existing one with new one';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle(){
        $playlistService = new PlaylistService();
        if($playlistService->generatePlaylistForNow()){
            ProcessService::startProcess(config('radio.script.refresh'));
        }
    }
}
