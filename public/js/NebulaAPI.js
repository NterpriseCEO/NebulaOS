define([window.location.protocol + "//" + window.location.host+"/public/js/NebulaPM.js"],function() {
    var post = new SecurePost();
    var user;
    post.init(function() {
        post.post("getUsername","NAPIKey1",null);
        post.once("usernameGotten","NAPIKey1",function(data) {
            user = data.username;
        });
    });

    return {
        notification:function(text) {
            post.post("notificationAlert","NAPIKey2",null,text);
        },
        type:function(options,callback) {
            post.post("typeAlert","NAPIKey3",null,{header:options.header,displayText:options.displayText,cancel:options.cancel,ok:options.ok});
            post.once("typedDone","NAPIKey3",function(data) {
                return callback(data.input,data.clicked);
            });
        },
        confirm:function(options,callback) {
            post.post("confirmAlert","NAPIKey4",null,
                       {header:options.header,displayText:options.displayText,cancel:options.cancel,ok:options.ok});
            post.once("confirmDone","NAPIKey4",function(data) {
                return callback(data);
            });
        }
    }
});
