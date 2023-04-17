define(function() {
    var user = $("#usernameDisplay").text(),
        chats = [],
        SENDER;
    socket.emit("getContents",{path:user+"/data/MarathonMessengerData/chats.data",isFolder:false});
    socket.once("contentsGotten",function(data) {
        if((data.error == null || data.error.code != "ENOENT")) {
            var chatsList = JSON.parse(data.contents);
            for(var i = 0; i < chatsList.length; i++) {
                chats[i] = chatsList[i][0];
                socket.emit("createRoom",{room:chatsList[i][0],name:user});
            }
        }else {
            socket.emit("createRoom",{room:user,name:user});
        }
    });
    return {
        message:function(callback) {
            var _this = this;
            socket.on("message",function(data) {
                return callback({message:data.message,title:data.user,app:"Marathon Messenger",persistent:true,whenOpen:true});
            });
        },
        open:function(user,APP) {
            require(["Desktop/applications"],function(app) {
                var chatToOpen;
                for(var i = 0; i <chats.length;i++) {
                    var c = chats[i];
                    if(c.indexOf(user) >-1) {
                        chatToOpen = chats[i];
                        break;
                    }
                }
                if(APP.length == 0) {
                    app.app({src:"../Applications/MarathonMessenger.app/",title:"Marathon Messenger"});
                    post.once("ready","MarathonKey0",function(data,key,sender) {
                        SENDER = sender;
                        post.post("appEvent",key,sender,{chat:chatToOpen});
                    });
                }else {
                    var iframe = $(".embed").eq(APP.index())
                    console.log(iframe[0])
                    post.post("appEvent","MarathonKey0",iframe[0],{chat:chatToOpen});
                }
            });
        }
    }
});
