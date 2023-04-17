var openChat,
    userAvatar,
    ngrok = window.location.protocol + "//" + window.location.host+"/public/",
    C;
require(["chatAPI",ngrok+"js/jquery.js",ngrok+"js/NebulaPM.js"],function(chatAPI) {
    require([ngrok+"js/NebulaAPI.js",ngrok+"js/materialize.min.js"],function(api) {
        var post = new SecurePost();
        require(["emojis"],function() {
            $("#message").emojioneArea();
        });
        $("#imagesModal").modal();
        post.post("getUsername","key2");
        post.once("usernameGotten","key2",function(data) {
            user = data.username;
            chatAPI.init(post,user,function() {
                $("#newChat").click(function() {
                    api.type({header:C.newChat,displayText:C.typeUsername},function(USER,clicked) {
                        if(clicked) {
                            chatAPI.createChat(USER,post,api);
                        }
                    });
                });

                $(document.body).on("click",".chat",function() {
                    $(".side-nav").addClass("toHide");
                    $(".chat").removeClass("selected");
                    $(this).addClass("selected");
                    $(this).find(".new.badge").addClass("hide");
                    var _this = this;
                    var tchat = $(this).attr("data-chat");
                    chatAPI.getTexts(tchat,post,$(this).find(".name").css("backgroundImage"));
                });
                $(document.body).on("click",".chat i",function(e) {
                    var _this = this;
                    e.stopPropagation();
                    chatAPI.deleteChat(_this,api,post);
                });

                $("#send").click(function() {
                    $("#message").focus();
                    var user = $("#gIUser").text();
                    user = user.substr(15,user.length);
                    chatAPI.sendMessage(post,user);
                    $("#mssgSender").css("height","20vh");
                });
                $("#clear").click(function() {
                    $("#message")[0].emojioneArea.setText("");
                });
                $("#loadMore").click(function() {
                    chatAPI.loadMoreTexts();
                });

                $("#images").click(function() {
                    chatAPI.loadImages(post);
                });


                $(document.body).on("mousedown",".name",function() {
                    var _this = $(this).find("i");
                    _this.removeClass("hide");
                    var interval = setInterval(function() {
                        if(!_this.hasClass("clicked")) {
                            _this.addClass("hide");
                            clearInterval(interval);
                        }
                    },5000)
                });
                $(document.body).on("click",".name i",function() {
                    var _this = this;
                    $(this).addClass("clicked")
                    chatAPI.deleteMessage(_this,post,api);
                });
                $(document.body).on("click",".viewImages",function() {
                    chatAPI.getImages(this);
                });
                $(document.body).on("click",".imgX",function() {
                    $(this).parent().remove();
                    if($("#imgsToSnd .img").length == 0) {
                        $("#messages").removeClass("smaller")
                        $("#mssgSender").css("height","10vh");
                        $("#imgsToSnd").hide();
                        $("#mssgSender").css("height","20vh");
                    }
                });

                $("#back").click(function() {
                    $(".side-nav").removeClass("toHide");
                    $(".chat").removeClass("selected");
                    $(".chat a").removeClass("white-text");
                    $("#mssgGroup").removeClass("animMGroup");
                    $("#gIUser").text("");
                    $("#mssgGroup").attr("data-chat","");
                    canClick = true;
                });
            });
        });
    });
});
