if(!notifsDisabled) {
    var app,
    title,
    notifSound = new Audio(window.location.protocol + "//" + window.location.host+"/public/sounds/received.mp3");
    if($("#messages").find(".message").length > 0) {
        $("#noMessages").hide();
    }
    socket.emit("getContents",{path:$("#usernameDisplay").text()+"/data/messages.data"});
    socket.once("contentsGotten",function(data) {
        var exists = (data.error == null || data.error.code != "ENOENT");
        if(exists) {
            var messages = JSON.parse(data.contents);
            for(var i = 0; i <messages.length;i++) {
                $("#messages").append("<div class = 'message' data-app='"+messages[i][0]+"'>\
                                        <img src = '"+window.location.protocol + "//" + window.location.host+"/public/"+messages[i][1]+"' class = 'mIcon'>\
                                        <div class = 'mContent'>\
                                        <span class = 'mTitle' data-title='"+messages[i][2]+"' data-AppTitle = '"+messages[i][0]+"'>"+messages[i][3]+"</span><br>\
                                        <span class = 'mCntntTxt'>"+messages[i][4]+"</span>\
                                        </div>\
                                        <div class = 'messageX'>X</div>\
                                        </div>");
                var first;
                if(i == 0) {
                    first = '<div class = "message" data-app="'+messages[i][0]+'">\
                                                <div class = "mContent">\
                                                    <div class = "mTitle" data-title="'+messages[i][2]+'" data-AppTitle = "'+messages[i][0]+'">'+messages[i][2]+'</div>\
                                                    <div class = "mCntntTxt">'+messages[i][4]+'</div>\
                                                </div>\
                                                <div class = "messageX">X</div>\
                                            </div>';
                }
                var l = $("#messages > .message[data-app='"+messages[i][0]+"']:not('.messageStack')");
                console.log(l.length);
                if(l.length > 1) {
                    if($(".messageStack[data-app='"+messages[i][0]+"']").length == 0) {
                        $("#messages").append("<div class = 'messageStack message' data-app='"+messages[i][0]+"'>\
                                                    <img src = '"+messages[i][1]+"' class = 'mIcon'>\
                                                    <div class = 'mContent'>\
                                                        <div class = 'mCntntTxt'>"+messages[i][0]+" ("+l.length+")</div>\
                                                    </div>\
                                                </div>");
                        $(".messageStack[data-app ='"+messages[i][0]+"']").append(first);
                    }
                    $(".messageStack[data-app ='"+messages[i][0]+"'] > .mContent .mCntntTxt").text(messages[i][0]+" ("+l.length+")");
                    $(".messageStack[data-app ='"+messages[i][0]+"']").append('<div class = "message" data-app="'+messages[i][0]+'">\
                                                <div class = "mContent">\
                                                    <div class = "mTitle" data-title="'+messages[i][2]+'" data-AppTitle = "'+messages[i][0]+'">'+messages[i][2]+'</div>\
                                                    <div class = "mCntntTxt">'+messages[i][4]+'</div>\
                                                </div>\
                                                <div class = "messageX">X</div>\
                                            </div>');
                    if(i == messages.length-1) {
                        l.remove();
                    }
                }
            }
            if($("#messages").find(".message").length > 0) {
                $("#nBA").show();
                $("#noMessages").hide();
            }
        }
    });

    $.getJSON(window.location.protocol + "//" + window.location.host+"/public/userData/"+$("#usernameDisplay").text()+"/data/appsThatNotify.json",function(result) {
        for(var o = 0; o <result.apps.length;o++) {
            messages(result.apps[o]);
        }
        function messages(o) {
            require([o[0]+"/osMessages/index"],function(m) {
                if(o[2]) {
                    var first;
                    m.message(function(data) {
                        app = data.app;
                        title = data.title;
                        if($(".application-frame[title='"+app+"']:visible").length == 0) {
                            if(data.persistent) {
                                if(data.isFullscreen) {
                                    $(".fullscreenMessage").attr("data-app",app).addClass("fsmShow");
                                    $(".fsmAppTitle").text(app+" - "+title);
                                    $(".fsmAppDescription").text(data.message);
                                }else {
                                    $("#nBA").show();
                                    $("#noMessages").hide();
                                    $("#messages").append("<div class = 'message' data-app='"+app+"'>\
                                        <img src = '"+o[0]+"/images/icon.png' class = 'mIcon'>\
                                        <div class = 'mContent'>\
                                        <span class = 'mTitle' data-title='"+title+"' data-AppTitle='"+o[1]+"'>"+app+" - "+title+"</span><br>\
                                        <span class = 'mCntntTxt'>"+data.message+"</span>\
                                        </div>\
                                        <div class = 'messageX'>X</div>\
                                        </div>");
                                    notifSound.play();
                                    var toSave = [];
                                    $("#messages .message:not(.messageStack)").each(function(i) {
                                        var img = $(this).parent().is(".messageStack")?$(this).parent().find("img:first").attr("src"):$(this).find("img").attr("src");
                                        toSave[i] = [$(this).attr("data-app"),
                                            img,
                                            $(this).find(".mTitle").attr("data-title"),
                                            $(this).find(".mTitle").text(),
                                            $(this).find(".mCntntTxt").text()];
                                    });
                                    var l = $("#messages .message[data-app='"+app+"']:not('.messageStack')");
                                    if(l.length == 1 && $(".messageStack[data-app='"+app+"']").length == 0) {
                                        first = '<div class = "message" data-app="'+app+'">\
                                                                    <div class = "mContent">\
                                                                        <div class = "mTitle" data-title="'+data.title+'" data-AppTitle = "'+o[1]+'">'+data.title+'</div>\
                                                                        <div class = "mCntntTxt">'+data.message+'</div>\
                                                                    </div>\
                                                                    <div class = "messageX">X</div>\
                                                                </div>';
                                    }else if(l.length > 1) {
                                        if($(".messageStack[data-app='"+app+"']").length == 0) {
                                            $("#messages").append("<div class = 'messageStack message' data-app='"+app+"'>\
                                                                        <img src = '"+o[0]+"/images/icon.png' class = 'mIcon'>\
                                                                        <div class = 'mContent'>\
                                                                            <div class = 'mCntntTxt'>"+app+" ("+l.length+")</div>\
                                                                        </div>\
                                                                    </div>");
                                            $(".messageStack[data-app ='"+app+"']").append(first);
                                        }
                                        $(".messageStack[data-app ='"+app+"'] > .mContent .mCntntTxt").text(app+" ("+l.length+")");
                                        $(".messageStack[data-app ='"+app+"']").append('<div class = "message" data-app="'+app+'">\
                                                                    <div class = "mContent">\
                                                                        <div class = "mTitle" data-title="'+app+'" data-AppTitle = "'+app+'">'+data.title+'</div>\
                                                                        <div class = "mCntntTxt">'+data.message+'</div>\
                                                                    </div>\
                                                                    <div class = "messageX">X</div>\
                                                                </div>');
                                        $("#messages > .message[data-app='"+app+"']:not('.messageStack')").remove();
                                        if($(".messageStack[data-app ='"+app+"'] > .message").is(":visible")) {
                                            $(".messageStack[data-app ='"+app+"'] > .message").show();
                                        }
                                    }
                                    socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/messages.data",contents:JSON.stringify(toSave)});
                                    var mssg = $("<div class = 'message topMessage'>\
                                                    <img src = '"+o[0]+"/images/icon.png'class = 'mIcon'>\
                                                    <div class = 'mContent'>\
                                                    <span class = 'mTitle' data-title = '"+title+"' data-AppTitle = '"+o[1]+"'>"+app+" - "+title+"</span><br>\
                                                    <span class = 'mCntntTxt'>"+data.message+"</span>\
                                                    </div>\
                                                    </div>");
                                    $("#osWrap").append(mssg);
                                    setTimeout(function() {
                                        $(mssg).remove();
                                    },6200);
                                }
                            }
                        }
                        $("#messageAction").click(function() {
                            $(".application-frame[title='"+$(".fullscreenMessage").attr("data-app")+"']").fadeIn();
                            $(".fullscreenMessage").removeClass("fsmShow");
                        });
                        $(".messageX").click(function(e) {
                            remove(e,this);
                        });
                        $(".message:not(.messageStack),.topMessage").click(function(e) {
                            show(e,this);
                        });
                    });
                    $(".messageX").click(function(e) {
                        remove(e,this);
                    });
                    $(".message:not(.messageStack),.topMessage").click(function(e) {
                        show(e,this);
                    });
                    function show(e,_this) {
                        e.stopPropagation();
                        if($(".application-frame[title='"+$(_this).find(".mTitle").attr("data-AppTitle")+"']").length == 1) {
                            $(".application-frame[title='"+$(_this).find(".mTitle").attr("data-AppTitle")+"']").fadeIn();
                        }else {
                            m.open($(_this).find(".mTitle").attr("data-title"),$(".application-frame[title='"+app+"']"));
                        }

                        if($(_this).parent().is(".messageStack")) {
                            if($(_this).parent().find(".message").length == 1) {
                                $(_this).parent().remove();
                            }else {
                                $(_this).parent().find(".mCntntTxt:first").text($(this).attr("data-app")+" ("+($(_this).parent().find(".message").length-1)+")");
                            }
                        }
                        $(_this).remove();
                        var toSave = [];
                        $("#messages .message:not(.messageStack)").each(function(i) {
                            var img = $(this).parent().is(".messageStack")?$(this).parent().find("img:first").attr("src"):$(this).find("img").attr("src");
                            toSave[i] = [$(this).attr("data-app"),
                                         img,
                                         $(this).find(".mTitle").attr("data-title"),
                                         $(this).find(".mTitle").text(),
                                         $(this).find(".mCntntTxt").text()];
                        });
                        socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/messages.data",contents:JSON.stringify(toSave)});
                        swiper.slideTo(1);
                        $("#infoPane,#desktopBox,#taskbar").fadeIn("fast");
                        if($("#messages").find(".message").length == 0) {
                            $("#nBA").hide();
                            $("#noMessages").show();
                        }
                    }
                    function remove(e,_this) {
                        e.stopPropagation();
                        if($(_this).parent().parent().is(".messageStack")) {
                            if($(_this).parent().parent().find(".message").length == 1) {
                                $(_this).parent().parent().remove();
                            }else {
                                $(_this).parent().parent().find(".mCntntTxt:first").text($(_this).parent().attr("data-app")+" ("+($(_this).parent().parent().find(".message").length-1)+")");
                            }
                        }
                        $(_this).parent().remove();
                        var toSave = [];
                        $("#messages .message:not(.messageStack)").each(function(i) {
                            var img = $(this).parent().is(".messageStack")?$(this).parent().find("img:first").attr("src"):$(this).find("img").attr("src");
                            toSave[i] = [$(this).attr("data-app"),
                                         img,
                                         $(this).find(".mTitle").attr("data-title"),
                                         $(this).find(".mTitle").text(),
                                         $(this).find(".mCntntTxt").text()];
                        });
                        socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/messages.data",contents:JSON.stringify(toSave)});
                        if($("#messages").find(".message").length == 0) {
                            $("#nBA").hide();
                            $("#noMessages").show();
                        }
                    }
                }
            });
        }
        $(document.body).on("click",".messageStack",function(e) {
            e.stopPropagation();
            $(this).find(".message").slideToggle();
        });
    });
}
