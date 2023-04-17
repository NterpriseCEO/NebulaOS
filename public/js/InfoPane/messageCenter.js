if(!notifsDisabled) {
    var notifSound = new Audio("sounds/received.mp3"),
        app,
        title,
        messageNumber = 0;
    if($("#messages").find(".message").length > 0) {
        $("#hasMessage").show();
        $("#noMessages").hide();
    }
    socket.emit("getContents",{path:$("#usernameDisplay").text()+"/data/messages.data"});
    socket.once("contentsGotten",function(data) {
        var exists = (data.error == null || data.error.code != "ENOENT");
        if(exists) {
            var messages = JSON.parse(data.contents);
            for(var i = 0; i <messages.length;i++) {
                $("#messages").append('<div class = "message" data-app="'+messages[i][0]+'">\
                                            <div class = "mssgIconW">\
                                                <img src = "'+messages[i][1]+'" width="100%">\
                                            </div>\
                                            <div class = "mssgContents">\
                                                <div class = "mssgAppName" data-title="'+messages[i][2]+'">'+messages[i][3]+'</div>\
                                                <div class = "mssg">'+messages[i][4]+'</div>\
                                            </div>\
                                            <div class = "mssgRX">X</div>\
                                        </div>');
                var first;
                if(i == 0) {
                    first = '<div class = "message" data-app="'+messages[i][0]+'">\
                                                <div class = "mssgIconW">\
                                                    <img src = "'+messages[i][1]+'" width="100%">\
                                                </div>\
                                                <div class = "mssgContents">\
                                                    <div class = "mssgAppName" data-title="'+messages[i][2]+'">'+messages[i][2]+'</div>\
                                                    <div class = "mssg">'+messages[i][4]+'</div>\
                                                </div>\
                                                <div class = "mssgRX">X</div>\
                                            </div>';
                }
                var l = $("#messages > .message[data-app='"+messages[i][0]+"']:not('.messageStack')");
                console.log(l.length);
                if(l.length > 1) {
                    if($(".messageStack[data-app='"+messages[i][0]+"']").length == 0) {
                        $("#messages").append("<div class = 'messageStack message' data-app='"+messages[i][0]+"'>\
                                                    <div class = 'mssgIconW'>\
                                                        <img src = '"+messages[i][1]+"' width='100%'>\
                                                    </div>\
                                                    <div class = 'mssgContents'>\
                                                        <div class = 'mssg'>"+messages[i][0]+" ("+l.length+")</div>\
                                                    </div>\
                                                </div>");
                        $(".messageStack[data-app ='"+messages[i][0]+"']").append(first);
                    }
                    $(".messageStack[data-app ='"+messages[i][0]+"'] > .mssgContents .mssg").text(messages[i][0]+" ("+l.length+")");
                    $(".messageStack[data-app ='"+messages[i][0]+"']").append('<div class = "message" data-app="'+messages[i][0]+'">\
                                                <div class = "mssgContents">\
                                                    <div class = "mssgAppName" data-title="'+messages[i][2]+'">'+messages[i][2]+'</div>\
                                                    <div class = "mssg">'+messages[i][4]+'</div>\
                                                </div>\
                                                <div class = "mssgRX">X</div>\
                                            </div>');
                    if(i == messages.length-1) {
                        l.remove();
                    }
                }
            }
            if($("#messages").find(".message").length > 0) {
                $("#hasMessage").show();
                $("#noMessages").hide();
            }
        }
    });
    $("#mssgCntr").click(function() {
        $("#messageCenter").animate({"left":"70vw"},"fast");
        $(".desktop-box,.infoPane,.taskbar-wrap").animate({"marginLeft":"-30vw"},"fast");
        $(".folder-view").addClass("hidden");
    });
    $("#mssgX").click(function() {
        $("#messageCenter").animate({"left":"100vw"},"fast");
        $(".desktop-box,.infoPane,.taskbar-wrap").animate({"marginLeft":"0"},"fast",function() {
            $(".folder-view").removeClass("hidden");
        });
    });
    $(document.body).on("click",".mssgRX",function(e) {
        e.stopPropagation();
        if($(this).parent().parent().is(".messageStack")) {
            if($(this).parent().parent().find(".message").length == 1) {
                $(this).parent().parent().remove();
            }else {
                $(this).parent().parent().find(".mssg:first").text($(this).parent().attr("data-app")+" ("+($(this).parent().parent().find(".message").length-1)+")");
            }
        }
        $(".message[data-messageNumber='"+$(this).parent().attr("data-messageNumber")+"']").each(function() {
            $(this).remove();
            $(".messageStack:not(:has(.message))").remove();
        });
        var toSave = [];
        $("#messages .message:not(.messageStack)").each(function(i) {
            var img = $(this).parent().is(".messageStack")?$(this).parent().find("img:first").attr("src"):$(this).find("img").attr("src");
            toSave[i] = [$(this).attr("data-app"),
                         img,
                         $(this).find(".mssgAppName").attr("data-title"),
                         $(this).find(".mssgAppName").text(),
                         $(this).find(".mssg").text()];
        });
        socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/messages.data",contents:JSON.stringify(toSave)});
        if($("#messages").find(".message").length == 0) {
            $("#hasMessage").hide();
            $("#noMessages").show();
        }
    });
    $.getJSON("userData/"+$("#usernameDisplay").text()+"/data/appsThatNotify.json",function(result) {
        for(var n = 0; n <result.apps.length;n++) {
            new messages(result.apps[n]);
        }
        function messages(o) {
            var M;
            require([o[0]+"/osMessages/index"],function(m) {
                M = m;
                var first;
                if(o[2]) {
                    m.message(function(data) {
                        app = data.app;
                        title = data.title;
                        if($(".application-frame .title:contains("+app+")").length == 0 || data.whenOpen == true) {
                            messageNumber++;
                            var message = '<div class = "message" data-app="'+app+'" data-messageNumber="'+messageNumber+'">\
                                                        <div class = "mssgIconW">\
                                                            <img src = "'+o[0]+'/images/icon.png" width="100%">\
                                                        </div>\
                                                        <div class = "mssgContents">\
                                                            <div class = "mssgAppName" data-title="'+data.title+'">'+app+' - '+data.title+'</div>\
                                                            <div class = "mssg">'+data.message+'</div>\
                                                        </div>\
                                                        <div class = "mssgRX">X</div>\
                                                    </div>';
                            $("#messages").append(message);
                            if($("#newestMessages").children().length == 3) {
                                $("#newestMessages .message:last").remove();
                            }
                            var toSave = [];
                            $("#messages .message:not('.messageStack')").each(function(i) {
                                toSave[i] = [$(this).attr("data-app"),
                                $(this).find("img").attr("src"),
                                $(this).find(".mssgAppName").attr("data-title"),
                                $(this).find(".mssgAppName").text(),
                                $(this).find(".mssg").text()];
                            });
                            var l = $("#messages .message[data-app='"+app+"']:not('.messageStack')");
                            if(l.length == 1) {
                                first = '<div class = "message" data-app="'+app+'" data-messageNumber="'+messageNumber+'">\
                                                                                    <div class = "mssgContents">\
                                                                                        <div class = "mssgAppName" data-title="'+data.title+'">'+data.title+'</div>\
                                                                                        <div class = "mssg">'+data.message+'</div>\
                                                                                    </div>\
                                                                                    <div class = "mssgRX">X</div>\
                                                                                </div>';
                            }else if(l.length > 1) {
                                if($(".messageStack[data-app='"+app+"']").length == 0) {
                                    $("#messages").append("<div class = 'messageStack message' data-app='"+app+"'>\
                                                                <div class = 'mssgIconW'>\
                                                                    <img src = '"+o[0]+"/images/icon.png' width='100%'>\
                                                                </div>\
                                                                <div class = 'mssgContents'>\
                                                                    <div class = 'mssg'>"+app+" ("+l.length+")</div>\
                                                                </div>\
                                                            </div>");
                                    $(".messageStack[data-app ='"+app+"']").append(first);
                                }
                                $(".messageStack[data-app ='"+app+"'] > .mssgContents > .mssg").text(app+" ("+l.length+")");
                                $(".messageStack[data-app ='"+app+"']").append('<div class = "message" data-app="'+app+'" data-messageNumber="'+messageNumber+'">\
                                                                                    <div class = "mssgContents">\
                                                                                        <div class = "mssgAppName" data-title="'+data.title+'">'+data.title+'</div>\
                                                                                        <div class = "mssg">'+data.message+'</div>\
                                                                                    </div>\
                                                                                    <div class = "mssgRX">X</div>\
                                                                                </div>');
                                $("#messages > .message[data-app='"+app+"']:not('.messageStack')").remove();
                                if($(".messageStack[data-app ='"+app+"'] > .message").is(":visible")) {
                                    $(".messageStack[data-app ='"+app+"'] > .message").show();
                                }
                            }
                            $("#newestMessages").prepend(message);
                            notifSound.play();
                            $("#noMessages").hide();
                            $("#hasMessage").show();
                            socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/messages.data",contents:JSON.stringify(toSave)});
                        }
                    });
                    $(document.body).on("click",".message:not(.messageStack)",function(e) {
                        e.stopPropagation();
                        M.open($(this).find(".mssgAppName").attr("data-title"),$(".application-frame .title:contains("+app+")").parent());
                        if($(this).parent().is(".messageStack")) {
                            if($(this).parent().find(".message").length == 1) {
                                $(this).parent().remove();
                            }else {
                                $(this).parent().find(".mssg:first").text($(this).attr("data-app")+" ("+($(this).parent().find(".message").length-1)+")");
                            }
                        }
                        $(".message[data-messageNumber='"+$(this).attr("data-messageNumber")+"']").each(function() {
                            $(this).remove();
                            $(".messageStack:not(:has(.message))").remove();
                        });


                        $(this).remove();
                        var toSave = [];
                        $("#messages .message:not(.messageStack)").each(function(i) {
                            var img = $(this).parent().is(".messageStack")?$(this).parent().find("img:first").attr("src"):$(this).find("img").attr("src");
                            toSave[i] = [$(this).attr("data-app"),
                                         img,
                                         $(this).find(".mssgAppName").attr("data-title"),
                                         $(this).find(".mssgAppName").text(),
                                         $(this).find(".mssg").text()];
                        });
                        socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/messages.data",contents:JSON.stringify(toSave)});
                        if($("#messages").find(".message").length == 0) {
                            $("#hasMessage").hide();
                            $("#noMessages").show();
                            $(".desktop-box,.infoPane,.taskbar-wrap").animate({"marginLeft":"0"},"fast");
                            $("#messageCenter").animate({"left":"100vw"},"fast");
                        }
                    });
                }
            });
        }
        $(document.body).on("click",".messageStack",function() {
            $(this).find(".message").slideToggle();
        });
    });
}
