const NodeSSH = require('node-ssh')
const temp = require("tmp");
const fs = require("fs");
const tty = require("tty")
const childProcess = require("child_process");
temp.setGracefulCleanup();
const ssh = new NodeSSH();
let connectionArgs = {/*
    host: '52.25.188.203',
    username: 'ubuntu',
    privateKey: '/home/nkemcels/Desktop/web-dev-app.pem'
*/};

function connectToServer(options, callback){
    options = {...options, readyTimeout:60000}
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
    command = [`cd ${cwd.replace(/\s/, "\\ ")}`, command].join("&&");
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

function createNewFile(filename, directory, responseCallback, retryCount=2){
    runCommand(`touch ${filename.replace(/\s/, "\\ ")} && ls -l --file-type -h -a .`, directory, responseCallback, retryCount);
}

function createNewFolder(foldername, directory, responseCallback, retryCount=2){
    runCommand(`mkdir ${foldername.replace(/\s/, "\\ ")} && ls -l --file-type -h -a .`, directory, responseCallback, retryCount);
}

function deleteItems(items, directory, responseCallback, retryCount=2){
    let deleteFilesCmd = items && items instanceof Array && `rm -r ${items.map(elt=>elt.replace(/\s/, "\\ ")).join(" ")} ; ls -l --file-type -h -a .`;
    runCommand(deleteFilesCmd, directory, responseCallback, retryCount);
}

function renameFileOrFolder(oldName, newName, directory, responseCallback, retryCount=2){
    runCommand(`mv ${oldName.replace(/\s/, "\\ ")} ${newName.replace(/\s/, "\\ ")} && ls -l --file-type -h -a .`, directory, responseCallback, retryCount);
}

function copyPasteFilesOrFolders(files, directory, responseCallback, retryCount=2){
    let command = files instanceof Array && files.reduce((acc, value)=>`cp -r ${value} . ; ${acc}`, "")
    command = `${command} ls -l --file-type -h -a .`
    runCommand(command, directory, responseCallback, retryCount);
}

function cutPasteFilesOrFolders(files, directory, responseCallback, retryCount=2){
    let command = files instanceof Array && files.reduce((acc, value)=>`mv ${value} . ; ${acc}`, "")
    command = `${command} ls -l --file-type -h -a .`
    runCommand(command, directory, responseCallback, retryCount);
}

const tempFiles = {}
function getOrCreateTempFile(key, contentPath, options){
    if(!tempFiles[key]){
        tempFiles[key] = temp.fileSync(options).name;
        if(contentPath){
            fs.copyFileSync(contentPath, tempFiles[key]);
            if(options.mode){
                childProcess.spawnSync(`chmod ${options.mode} ${tempFiles[key]}`, {shell:true, });
            }
        }
    }
    return tempFiles[key];
}

function filesOperation(operation, remoteFiles, target, id, responseCallback,  retryCount=2){
    const pemPath = connectionArgs.privateKey;
    if(pemPath){
        const mappedPemPath = getOrCreateTempFile(pemPath, pemPath, {mode:400});
        const allFiles = remoteFiles.reduce((acc, elt)=>acc+" "+elt.path.replace(/\s/, "\\ "), "").trim()
        const downloadCommand = `scp -o StrictHostKeyChecking=no -i ${mappedPemPath} -r ${connectionArgs.username}@${connectionArgs.host}:"${allFiles}" ${target.replace(/\s/, "\\ ")}`;
        const uploadCommand = `scp -o StrictHostKeyChecking=no -i ${mappedPemPath.replace(/\s/, "\\ ")} -r ${allFiles} ${connectionArgs.username}@${connectionArgs.host}:${target.replace(/\s/, "\\ ")}`;
        const command = operation==="UPLOAD"?uploadCommand:downloadCommand;
        const Proccess = childProcess.spawn(command, {shell:true});
        const callBackIsValid = responseCallback && responseCallback instanceof Function;
        Proccess.stdout.on("data", function(data){
            if(callBackIsValid){
                responseCallback({stdoutChunk: data.toString(), id});
            }
        });
        Proccess.stderr.on("data", function(data){
            if(callBackIsValid){
                responseCallback({stderrChunk: data.toString(), done:false, id});
            }
        });
        Proccess.on("end", function(){
            if(callBackIsValid){
                responseCallback({done:true, success:true, id})
            }
        })
        Proccess.on("exit", function(code){
            if(callBackIsValid){
                responseCallback({done:true, success:code===0, id})
            }
        });
    }
}

function downloadFiles(remoteFiles, localTarget, id, responseCallback,  retryCount=2){
    filesOperation("DOWNLOAD", remoteFiles, localTarget, id, responseCallback,  retryCount)
}

function uploadFiles(localFiles, remoteTarget, id, responseCallback,  retryCount=2){
    filesOperation("UPLOAD", localFiles, remoteTarget, id, responseCallback,  retryCount)
}

module.exports = {
    connectToServer,
    runCommand,
    listFiles,
    createNewFile,
    createNewFolder,
    deleteItems,
    renameFileOrFolder,
    copyPasteFilesOrFolders,
    cutPasteFilesOrFolders,
    downloadFiles,
    uploadFiles
}