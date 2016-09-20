<?php

namespace App\Services;


class ProcessService
{

    public static function startProcess($command){
        exec($command);
        return true;
    }
    public static function startBackgroundProcess(
        $command,
        $stdin = null,
        $redirectStdout = null,
        $redirectStderr = null,
        $cwd = null,
        $env = null,
        $other_options = null
    ) {
        $descriptorspec = array(
            1 => is_string($redirectStdout) ? array('file', $redirectStdout, 'w') : array('pipe', 'w'),
            2 => is_string($redirectStderr) ? array('file', $redirectStderr, 'w') : array('pipe', 'w'),
        );
        if (is_string($stdin)) {
            $descriptorspec[0] = array('pipe', 'r');
        }
        $proc = proc_open($command, $descriptorspec, $pipes, $cwd, $env, $other_options);
        if (!is_resource($proc)) {
            throw new \Exception("Failed to start background process by command: $command");
        }
        if (is_string($stdin)) {
            fwrite($pipes[0], $stdin);
            fclose($pipes[0]);
        }
        if (!is_string($redirectStdout)) {
            fclose($pipes[1]);
        }
        if (!is_string($redirectStderr)) {
            fclose($pipes[2]);
        }
        return $proc;
    }
}