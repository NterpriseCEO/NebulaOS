function SecurePost() {
    if(window.top !== window.self) {
        this.toParent = true;
    }else {
        this.toParent = false;
    }
    this.terminated = false;
}
SecurePost.prototype.init = function(callback) {
    var interval = setInterval(function() {
        if(document.readyState === 'complete') {
            clearInterval(interval)
            return callback();
        }
    },100);
}
SecurePost.prototype.post = function(eventType,key,sender,data,toIframe) {
    var post = {eventType:eventType,key:key,data:data};
    if(this.toParent && !toIframe) {
        parent.postMessage(post,"*");
    }else {
        var iframes = document.getElementsByTagName("iframe");
        for(var i =0; i < iframes.length;i++) {
            if(iframes[i].contentWindow == sender.contentWindow) {
                iframes[i].contentWindow.postMessage(post,"*");
                break;
            }
        }
    }
    return;
}
SecurePost.prototype.on = function(eventType,key,callback,exists) {
    var _this = this;
    if(exists == undefined) {
        window.addEventListener("message",event,false);
        function event(e) {
            if(!_this.terminated) {
                var KEY = key;
                if(KEY == "all") {
                    KEY = e.data.key;
                }
                if(e.data.eventType == eventType && e.data.key == KEY) {
                    if(!_this.toParent) {
                        var iframes = document.getElementsByTagName("iframe");
                        for(var i =0; i < iframes.length;i++) {
                            if(iframes[i].contentWindow == e.source) {
                                _this.on(eventType,callback,true);
                                return callback(e.data.data,e.data.key,iframes[i]);
                            }
                        }
                    }else if(_this.toParent){
                        _this.on(eventType,callback,true);
                        return callback(e.data.data);
                    }
                }
            }else {
                e.target.removeEventListener(e.type,arguments.callee);
            }
        }
    }
}
SecurePost.prototype.once = function(eventType,key,callback,fromIframe) {
    var _this = this;
    window.addEventListener("message",onceMessage);
    function onceMessage(e) {
        var KEY = key;
        if(KEY == "all") {
            KEY = e.data.key;
        }
        if(e.data.eventType == eventType && e.data.key == KEY) {
            if(!_this.toParent && !fromIframe) {
                var iframes = document.getElementsByTagName("iframe");
                for(var i =0; i < iframes.length;i++) {
                    if(iframes[i].contentWindow == e.source) {
                        e.target.removeEventListener(e.type,arguments.callee);
                        return callback(e.data.data,e.data.key,iframes[i]);
                    }
                }
            }else {
                e.target.removeEventListener(e.type,arguments.callee);
                return callback(e.data.data,e.data.key,e.data.sender);
            }
        }
    }
}
SecurePost.prototype.disconnect = function() {
    this.terminated = true;
}
