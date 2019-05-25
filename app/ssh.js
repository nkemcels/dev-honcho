const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
let connectionArgs = {
    host: '52.25.188.203',
    username: 'ubuntu',
    privateKey: '/home/nkemcels/Desktop/web-dev-app.pem'
};

function connectToServer(options, callback){
    connectionArgs = options;
    return ssh.connect(options).then(function(){
        if(callback && callback instanceof Function){
            callback(true);
        }
    }).catch(function(err){
        if(callback && callback instanceof Function){
            console.log("error: ", err)
            callback(false, err.toString());
        }
    });
}

function runCommand(command, cwd, responseCallback, retryCount=2){
    return ssh.execCommand(command, { cwd:cwd ? cwd:'~' }).then(function(result) {
        if(responseCallback && responseCallback instanceof Function){
            responseCallback(true, result.stdout, result.stderr);
        }
    }).catch(function(err){
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
    runCommand("ls -l", directory, responseCallback, retryCount)
}

module.exports = {
    connectToServer,
    runCommand,
    listFiles
}