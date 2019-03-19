// app.js

const websocket = require('./server/logWebsocket')

var express = require('express');
const config = require('./server/config');

var index = express();
var server = require('http').createServer(index);

websocket(server, config)
//proxy(server, config)

index.use('/', express.static(__dirname + config.staticDir));
