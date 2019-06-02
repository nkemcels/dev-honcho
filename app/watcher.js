const sha1 = require("sha1-file");
function SimpleWatcher(){
    this.watchList = [];
    this.watchIntervalId = null;
    this.genericListeners = []    
}

SimpleWatcher.prototype.addFile = function(file, listener){
    this.watchList.push({
        filename:file,
        checksum: sha1(file),
        listener
    });
}

SimpleWatcher.prototype.startWatcher = function(pollTime=2000){
    if(this.watchIntervalId){
        return;
    }
    this.watchIntervalId = setInterval(() => {
        for(let item of this.watchList){
            const sum = item.checksum;
            const newsum = sha1(item.filename);
            if(newsum!==sum){
                item.checksum = newsum;
                if(item.listener && item.listener instanceof Function){
                    item.listener(item.filename);
                }
                for(let genericListener of this.genericListeners){
                    genericListener(item.filename);
                }
            }
        }
    }, pollTime);
}

SimpleWatcher.prototype.addGenericListener = function(listener){
    if(listener && listener instanceof Function){
        this.genericListeners.push(listener);
    }
}

SimpleWatcher.prototype.stopWatcher = function(){
    if(this.watchIntervalId){
        clearInterval(this.watchIntervalId);
    }
}

module.exports = SimpleWatcher