const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
let connectionArgs = {/*
    host: '52.25.188.203',
    username: 'ubuntu',
    privateKey: '/home/nkemcels/Desktop/web-dev-app.pem'*/
};

function connectToServer(options, callback){
    options = {...options, keepaliveInterval:1000}
    connectionArgs = options;
    return ssh.connect(options).then(function(){
        if(callback && callback instanceof Function){
            callback(true);
        }
    }).catch(function(err){
        if(callback && callback instanceof Function){
            callback(false, err.toString());
        }
    });
}

function runCommand(command, cwd, responseCallback, retryCount=2){
    cwd = cwd? cwd:"~";
    command = [`cd ${cwd}`, command].join("&&");
    console.log("running command ", command)
    const started = new Date().getTime();
    return ssh.execCommand(command).then(function(result) {
        if(responseCallback && responseCallback instanceof Function){
            console.log("execution time: ", new Date().getTime() - started,"ms")
            responseCallback(true, result.stdout, result.stderr);
        }
    }).catch(function(err){
        console.log("error: ", err)
        if(retryCount>0){
            connectToServer(connectionArgs).then(function(){
                runCommand(command, cwd, responseCallback, retryCount-1);
            }).catch(function(err){
                if(responseCallback && responseCallback instanceof Function){
                    responseCallback(false, err);
                }
            });
        }
        else if(responseCallback && responseCallback instanceof Function){
            responseCallback(false, err);
        }
    });
}

function listFiles(directory, responseCallback, retryCount=2){
    runCommand("ls -l --file-type -h -a .", directory, responseCallback, retryCount)
}

module.exports = {
    connectToServer,
    runCommand,
    listFiles
}