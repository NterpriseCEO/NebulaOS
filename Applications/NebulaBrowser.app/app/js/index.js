var path = window.location.protocol + "//" + window.location.host+"/public/";
require([path+"js/NebulaPM.js",path+"js/jquery.js"],function() {
    var post = new SecurePost();
    $("input").on("keyup",function(e) {
        if(e.keyCode == 13) {
            var _this = this;
            post.post("loadWebpage","AcceleronKey1",null,{url:$(this).val()});
            post.once("pageContents","AcceleronKey1",function(data,key2,sender2) {
                var html = document.createElement("html");
                html.innerHTML = data.html;
                console.log(data.html)
                $(html).find("head").append("<base href='"+$(_this).val()+"'>");
                $("iframe")[0].srcdoc = html.innerHTML;
                /*post.once("pageLoaded","AcceleronKey2",function(data2,key,sender) {
                    post.post("renderPage","AcceleronKey3",sender,data.html,true);
                });*/
                //iframedoc.body.innerHTML = data.html;
            });
            //$("iframe")[0].src = $("iframe")[0].src;
        }
    });
});
