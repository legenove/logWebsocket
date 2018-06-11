#!/bin/bash
PROJDIR="/data/app/dev/logWebsocket"
APP_EXEC="pm2 start index.js -i 1 --name 'log_api'"

function start_server() {
    cd $PROJDIR
    ulimit -n 65535
    $APP_EXEC
}

function stop_server() {
    pm2 kill
}

case "$1" in
start)
    start_server
;;
stop)
    stop_server
;;
restart)
    stop_server
    start_server
;;
*)
    echo 'Usage: ./log_shell.sh [start|stop|restart]'
esac
