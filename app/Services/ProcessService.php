<?php

namespace App\Services;

use Symfony\Component\Process\Process;

class Envoy
{

    public function run($task, $live = false)
    {

        $process = new Process('/vagrant/vendor/bin/envoy run '. $task);
        $process->setTimeout(null);
        $process->setIdleTimeout(null);
        $process->setWorkingDirectory(base_path());
        $process->start();

        return $process;
    }
}