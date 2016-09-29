<?php

namespace App\Services;
use Illuminate\Support\Facades\Lang;

class RadioService{
    private $data;
    public function turnOn(){
        ProcessService::startProcess(config('radio.script.run.icecast'));
        ProcessService::startBackgroundProcess(config('radio.script.run.ezstream'));
        return $this;
    }
    public function turnOff(){
        ProcessService::startProcess(config('radio.script.shutdown.ezstream'));
        ProcessService::startProcess(config('radio.script.shutdown.icecast'));
        return $this;
    }
    public function refresh(){
        ProcessService::startProcess(config('radio.script.refresh'));
        return $this;
    }
    public function nextTrack(){
        ProcessService::startProcess(config('radio.script.next'));
        return $this;
    }
    public function getData(){
        $this->getStatus();
        return array_get($this->data, 'icestats', Lang::get('dashboard.stats.empty'));
    }
    public function getStatus(){
        $data_url = "localhost:" . config('radio.icecast.port') . '/status-json.xsl';
        $ch = curl_init($data_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $this->data = json_decode($result, true);
        curl_close($ch);

        if($httpCode>=200 && $httpCode<300) {
            return array_get($this->data, 'icestats.source') != null;
        }
        return false;
    }
}