var ngrok = window.location.protocol + "//" + window.location.host+"/public/"
require([ngrok+"js/NebulaAPI.js",ngrok+"js/NebulaPM.js",ngrok+"js/jquery.js"],function(api) {
    require([ngrok+"uiElementDefaults/ui.js"]);
    var post = new SecurePost();
    post.post("ready","NebMedPlayKey0",null);
    post.once("openFile","NebMedPlayKey0",function(data) {
        post.post("getContents","NebMedPlayKey1",null,{path:data.path});
        post.once("contentsGotten","NebMedPlayKey1",function(src) {
            if(typeof src === "object") {
                $("#img").show().css("backgroundImage","url('"+src.contents+"')");
                $("#media-video").hide();
                $("#media-wrapper").show();
            }else {
                mediaPlayer.src =  src;
            }
        });
    });
    $("#open").click(function() {
        post.post("openFile","NebMedPlayKey2",null,{supExts:[".mp4",".webm",".png",".jpg"]});
        post.once("fileOpened","NebMedPlayKey2",function(data) {
            console.log(data)
            if(typeof data === "string" && (data.endsWith(".mp4") || data.endsWith(".webm"))) {
                $("#media-controls").css("bottom",0)
                $("#media-wrapper,#media-video").show();
                $("#img").hide();
                mediaPlayer.src = data;
            }else {
                $("#img").show().css("backgroundImage","url('"+data.contents+"')");
                $("#media-video").hide();
                $("#media-wrapper").show();
            }
        });
    });
});
