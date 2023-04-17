define([window.location.protocol + "//" + window.location.host+"/public/js/NebulaPM.js"],function() {
    var post = new SecurePost();
    return {
        message:function(callback) {
            post.on("timerDone","TimerKey",function() {
                return callback({message:"Timer done!",title:"Timer Complete!",app:"Timer",persistent:false});
            });
            post.on("alarmDone","TimerKey2",function() {
                return callback({message:"Alarm done!",title:"Alarm!!!",app:"Timer",persistent:true,isFullscreen:true});
            });
        },
        open:function() {
            app.app({src:"../Applications/Timer.app/",title:"Timer"});
        }
    }
});
