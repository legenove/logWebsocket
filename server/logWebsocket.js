// websocket.js
const spawn = require('child_process').spawn;
const fs = require('fs')

let process_workes = {};

let getCommandInfo = function (dtype, serverName) {
  let fileName, command, first;
  let grep = [];
  if (dtype == 'restart-log') {
    fileName = `/data/app/dev/${serverName}/log/restart.log`

    // fileName = '/data/nginx/logs/access.log'

    command = 'tail'
    first = ["-f", fileName]
  } else if (dtype == 'docker-front') {
    fileName = `${serverName}_live-front_1`
    command = 'docker'
    first = ["logs", "-f", fileName, "--tail", "5"]
  } else if (dtype == 'docker-app') {
    fileName = `${serverName}_live-app_1`
    command = 'docker'
    first = ["logs", "-f", fileName, "--tail", "5"]
  } else if (dtype == 'docker-api') {
    fileName = `${serverName}_live-api_1`
    command = 'docker'
    first = ["logs", "-f", fileName, "--tail", "5"]
  } else if (dtype == 'docker') {
    fileName = `${serverName}`
    command = 'docker'
    first = ["ps", "--format", '"{{.ID}}\t{{.CreatedAt}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"']
    grep = [fileName]
    // first = ["ps", "--format", '"{{.ID}}\t{{.CreatedAt}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"']
    // grep = []
  } else if (dtype == 'version') {
    fileName = `/data/app/dev/${serverName}`
    command = 'ls'
    first = ['-l', fileName]
    grep = ['liveme-new-cms']
    // first = ['-l', '/usr/local/bin/']
    // grep = ['npm']
  }
  return {
    fileName: fileName,
    command: command,
    first: first,
    myGrep: grep
  }
}

let getProcessWorker = function (dtype, serverName) {
  let {fileName, command, first, myGrep} = getCommandInfo(dtype, serverName)
  let tail, grep;
  if (process_workes[fileName] == null){
      tail = spawn(command, first);
      if (myGrep.length > 0) {
        grep = spawn('grep', myGrep)
      }
      if (grep != null) {
        tail.stdout.on('data', function(data){
            grep.stdin.write(data);
        });
        tail.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
          if (grep != null) {
            grep.stdin.end();
          }
        });
        process_workes[fileName] = {
          worker: grep,
          num: 1
        }
        return grep
      }

      process_workes[fileName] = {
        worker: tail,
        num: 1
      }
    } else {
      process_workes[fileName].num ++;
      tail = process_workes[fileName].worker
    }
    return tail
};

let exitProcessWorker = function (fileNames) {
  fileNames.forEach(function (fileName) {
    if (process_workes[fileName] != null) {
      process_workes[fileName].num--;
      if (process_workes[fileName].num <= 0) {
        process.kill(process_workes[fileName].worker.pid)
      }
    }
  })
}

const logWebsocket = function (server, config) {
	var io = require('socket.io').listen(server);
	server.listen(config.port);
	let process_file = [];

	io.on('connection', (socket) => {
    let fileNames = {}
	  socket.emit('welcome', { mssage: 'hello word'})
    socket.on('file', (data) => {
        console.log(data)
        commandInfo = getCommandInfo(data.type, data.serverName)
        let fileName = commandInfo.fileName
        fileNames[fileName] = 1
	      let tail = getProcessWorker(data.type, data.serverName)
        process_file.push(data.fileName);
        socket.emit('cReady', data);
        let connectData = data
        tail.stdout.on("data", function (data) {
          console.log('datareturn', fileName, fileNames, fileNames[fileName] == 1)
          if (fileNames[fileName] == 1){
            console.log(data.toString('utf-8'))
            socket.emit( 'tail', { tail : data.toString('utf-8') , type: connectData.type, serverName: connectData.serverName} )
          }
        });
        tail.stderr.on('data', function (data) {
          console.log('stderr: ');
          if (fileNames[fileName] == 1){
            console.log(data.toString('utf-8'))
            socket.emit( 'tail', { tail : data.toString('utf-8') , type: connectData.type, serverName: connectData.serverName} )
          }
        });
        tail.on('close', function(code){
            if (fileNames[fileName] == 1){
              delete fileNames[fileName]
            }
            console.log('grep exists with code: ' + code);
            delete process_workes[fileName]
            socket.emit('cStop', connectData);
        });
    })
    socket.on('stop', (data) => {
      console.log('stop', data)
      commandInfo = getCommandInfo(data.type, data.serverName)
      exitProcessWorker([commandInfo.fileName])
      if (fileNames[commandInfo.fileName] == 1){
        delete fileNames[commandInfo.fileName]
      }
      socket.emit('cStop', data);
    })
    socket.on('disconnect', function () {
      console.log('user disconnect')
      let _fileNames = []
      for (let k in fileNames) {
        _fileNames.push(k)
      }
      exitProcessWorker(_fileNames)
    });
  })
}




module.exports = function (server, config) {
  return logWebsocket(server, config)
}





	// io.sockets.on('connection',(client)=>{
	//
   //  console.log('Client connected');
   //  let filename = "/data/nginx/logs/access.log";
   //  let tail = spawn("tail", ["-f", filename]);
   //  client.send({ filename : filename } );
	//
   //  tail.stdout.on("data", function (data) {
   //    console.log(data.toString('utf-8'))
   //    client.send( { tail : data.toString('utf-8') } )
   //  });
	// });
	//
	// console.log('服务器运行于：localhost:', config.port);
