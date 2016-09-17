@servers(['localhost' => '127.0.0.1'])

@task('icecastStart', ['on' => 'localhost'])
icecast2 -c /home/vagrant/icecast.xml
@endtask

@task('icecastStop', ['on' => 'localhost'])
sudo killall icecast2
@endtask

@task('streamStart', ['on' => 'localhost'])
ezstream -c /home/vagrant/ezstream.xml > /dev/null &
@endtask

@task('streamStop', ['on' => 'localhost'])
sudo killall ezstream
@endtask


@task('streamRefresh', ['on' => 'localhost'])
sudo killall -SIGHUP ezstream
sudo killall -SIGUSR1 ezstream
@endtask