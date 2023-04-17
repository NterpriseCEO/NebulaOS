var ngrok = window.location.protocol + "//" + window.location.host+"/public/";
var langData = {
    EN:"Close App",
    GA:"Dún an Feidhm"
}
require([ngrok+"js/NebulaPM.js",ngrok+"js/jquery.js"],function() {
    var post = new SecurePost();
    post.post("ready","ForceCode0",null);
    post.once("appEvent","ForceCode0",function(data2) {
        post.post("getOpenAppsData","ForceCode1",null);
        /*for (var prop in c) {
            if(c.hasOwnProperty(prop)) {
                $("*[data-text='"+prop+"']").text(c[prop]);
            }
        }*/
    });
    post.once("appDataGotten","ForceCode1",function(data) {
        for(var i = 0; i <data.apps.length;i++) {
            if(data.apps[i][1] != "Force Quit") {
                $(".collection").append("<li class = 'collection-item avatar' data-OpenNumber='"+data.apps[i][0]+"'>\
                                            <img src = '"+ngrok+data.apps[i][2]+"../images/icon.png' class = 'circle'>\
                                            <span class = 'title'>"+data.apps[i][1]+"</span>\
                                            <p class = 'grey-text'>Data usage<br>More?</p>\
                                            <a href='#!' class='secondary-content red-text'>Close App</a>\
                                         </li>");
            }
        }
    });
    post.on("appOpened","ForceCode2",function(data) {
        if(data.title != "Force Quit") {
            $(".collection").append("<li class = 'collection-item avatar' data-OpenNumber='"+data.openNumber+"'>\
                                         <img src = '"+data.icon+"' class = 'circle'>\
                                         <span class = 'title'>"+data.title+"</span>\
                                         <p class = 'grey-text'>Data usage<br></p>\
                                         <a href='#!' class='secondary-content red-text'>Close App</a>\
                                     </li>");
        }
    });
    post.on("appClosed","ForceCode3",function(data) {
        $(".collection-item[data-OpenNumber='"+data.openNumber+"']").remove();
    });
    $(document.body).on("click",".secondary-content",function() {
        post.post("closeApp","ForceCode4",null,{openNumber:$(this).parent().attr("data-OpenNumber")});
        $(this).parent().remove();
    });
});
