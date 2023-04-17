define(function() {
    return {
        app:function(options,callback) {
            //src,title,appIcon,path
            var w = (100/document.documentElement.clientWidth),
                h = (100/document.documentElement.clientHeight),
                appCoordsSize = {width:0,height:0,x:0,y:0},
                isFSMode = false,
                isDragging = false,
                dragged = false,
                isHalf = false;
            window.openNumber++;
            var opnmbr = window.openNumber;
            src = options.src+"/app/";
            $("#tabs .row").append('\
                <div class = "application-frame" data-OpenNumber="'+opnmbr+'">\
                    <div class = "tabTitle"><i class = "right closeTab material-icons">close</i></div>\
                    <div class ="wrap_around blur">\
                        <div class = "buttons-box">\
                            <div class = "exit-button bb-button">\
                            </div>\
                            <div class = "minimize-button bb-button">\
                            </div>\
                            <div class = "fullscreen-button bb-button">\
                            </div>\
                            <div class = "title">\
                            </div>\
                        </div>\
                        <div class = "content">\
                            <iframe class = "embed" src="'+src+'" style="margin-left:0vw;" sandbox="allow-forms allow-scripts allow-pointer-lock allow-modals">\
                            </iframe>\
                        </div>\
                    </div>\
                </div>'
            );//allowfullscreen
            var len = $(".application-frame").length;
            $(".application-frame:last").css("order",len).attr("data-order",len);
            if($(".application-frame[data-openNumber='"+opnmbr+"'] .embed").attr("src").endsWith("MarathonMessenger.app/")) {
                $(".application-frame[data-openNumber='"+opnmbr+"'] .embed").attr("sandbox","allow-forms allow-scripts allow-pointer-lock allow-modals allow-same-origin")
            }
            var icons;
            if (options.path === undefined) {
                icons = "Desktop/icons";
            }else {
                icons = options.path+"js/Desktop/icons";
            }


            require(["Desktop/icons"],function(icon,lapi) {
                $.getJSON(options.src+"/app.json",function(result) {
                    if(forceQuit != undefined) {
                        post.post("appOpened","ForceCode0",forceQuit,{title:result.title,openNumber:opnmbr,icon:window.location.protocol + "//" + window.location.host+"/Applications/"+options.src+"/images/icon.png"});
                    }
                    require(["InfoPane/tabs"],function(tabs) {
                        if(result.menuBarColor) {
                            $(".application-frame[data-OpenNumber='"+opnmbr+"'] .buttons-box")
                            .css("backgroundColor",result.menuBarColor);
                        }
                        if(result.noMenuBar) {
                            $(".application-frame[data-OpenNumber='"+opnmbr+"'] .buttons-box").addClass("noMenuBar");
                            $(".application-frame[data-OpenNumber='"+opnmbr+"'] .content")
                            .css({"display":"block","height":"100%","position":"absolute"});
                            $(".application-frame[data-OpenNumber='"+opnmbr+"'] .title").hide();
                        }
                        $(".application-frame[data-OpenNumber='"+opnmbr+"']").find(".title").html(result.title);
                        $(".application-frame[data-OpenNumber='"+opnmbr+"'] .tabTitle").prepend(result.title);
                        var ICON;
                        if(!options.pinned || options.pinned === undefined) {
                            if(options.inApp == undefined) {
                                icon.addTaskbarIcon({src:options.src,openNumber:opnmbr,title:result.title});
                                ICON = $(".ti[data-OpenNumber='"+opnmbr+"']");
                            }
                        }
                        //icon.addTaskbarTab({title:result.title,openNumber:opnmbr});
                        icon.tiClicked(function(c,num) {
                            if(c) {
                                show(num);
                            }
                        });
                        isFSMode = result.isFullscreen || false;
                        appCoordsSize.x=result.xPos;
                        appCoordsSize.y=result.yPos;
                        appCoordsSize.width=result.width;
                        appCoordsSize.height=result.height;
                        if(!result.canFullscreen) {
                            $(".application-frame[data-OpenNumber='"+opnmbr+"'] .fullscreen-button")
                            .remove();
                        }
                        if(!options.isPositioned || $(".application-frame[data-OpenNumber='"+opnmbr+"'] .fullscreen-button").length === 0) {
                            $(".application-frame[data-OpenNumber='"+opnmbr+"']").animate({left:appCoordsSize.x+"vw",top:appCoordsSize.y+"vh",
                                                                                width:appCoordsSize.width+"vw",height:appCoordsSize.height+"vh"});
                        }
                        $(".exit-button").click(function(e) {
                            onClick(this,result.clickX);
                            //e.stopImmediatePropagation();
                        });
                        $(".minimize-button").click(function(e) {
                            onClick(this,result.clickMin);
                            //e.stopImmediatePropagation();
                        });
                        $(".fullscreen-button").click(function(e) {
                            onClick(this,result.clickFs);
                            isHalf = false;
                            //e.stopPropagation();
                        });
                        var sel = options.icon||ICON;
                        function onClick(_this,clickType) {
                            if(clickType == "exitOnClick" || $(_this).is(".exit-button")) {
                                if(forceQuit != undefined) {
                                    post.post("appClosed","ForceCode0",forceQuit,{openNumber:opnmbr});
                                }
                                $(_this).parent().parent().parent().animate({width:0,height:0},function() {
                                    $(this).remove();
                                });
                                if(icon.get(sel,"data-pinned") == "true") {
                                    $(sel).parent().removeClass("open")
                                    icon.unset(sel,"data-OpenNumber");
                                    if($(sel).find(".appTabs").children().length == 1) {
                                        $(sel).find(".appTabs").remove();
                                    }else {
                                        $(sel).find(".appTabs div[data-openNumber='"+$(_this).parent().parent().parent().attr("data-OpenNumber")+"']").remove();
                                    }
                                }else {
                                    icon.removeTaskbarIcon({openNumber:$(_this).parent().parent().parent().attr("data-OpenNumber"),title:$(_this).parent().parent().parent().find(".title").text()});
                                }
                                tabs.removeTab(opnmbr);
                            }else if(clickType == "hideOnClick" || $(_this).is(".minimize-button")) {
                                if(!isFSMode) {
                                    $(_this).parent().parent().parent().hide();
                                }else {
                                    $(_this).parent().parent().parent().hide();
                                }
                            }else if(clickType == "restoreOnClick" || $(_this).is(".fullscreen-button")){
                                if(result.canFullscreen) {
                                    if(isFSMode) {
                                        $(_this).parent().parent().parent().animate({top:appCoordsSize.y+"vh",left:appCoordsSize.x+"vw",width:appCoordsSize.width+"vw",height:appCoordsSize.height+"vh"});
                                        $(".infoPane").show();
                                    }else {
                                        $(_this).parent().parent().parent().animate({top:0,left:0,width:"100vw",height:"93vh"});
                                    }
                                    isFSMode = !isFSMode;
                                }
                            }
                        }
                        $(".application-frame[data-OpenNumber='"+opnmbr+"']").css("zIndex",opnmbr+2)
                        .draggable({handle:".buttons-box",scroll:false,
                            drag:function(e,ui) {
                                console.log("Hello")
                                var _this = this;
                                if(e.pageY > 50 && isFSMode) {
                                    isFSMode = false;
                                    $(_this).animate({top:appCoordsSize.y+"vh",left:appCoordsSize.x+"vw",
                                               width:appCoordsSize.width+"vw",height:appCoordsSize.height+"vh"});
                                    $(".infoPane").show();
                                }
                            },
                            start:function() {
                                dragged = true;
                                $(this).removeClass("positioned");
                                $(".Applications").removeClass("halfTabs").css("marginLeft",0);
                                $("#tabs").css({"background":"","padding-left":0});
                                $("#tabs").removeClass("tabsVisible halfTabs noColor");
                                $("#showApps").addClass("hide");
                                $(".tab").show().removeClass("selectedTab tab smallTab");
                            },
                            stop:function() {
                                dragged = false;
                            },
                            distance:10
                        })
                        .mouseup(function(e) {
                            if(!isFSMode && dragged) {
                                appCoordsSize.x = parseInt($(this).css("left"))*w;
                                appCoordsSize.y = parseInt($(this).css("top"))*h;
                                appCoordsSize.width = parseInt($(this).css("width"))*w;
                                appCoordsSize.height = parseInt($(this).css("height"))*h;
                            }
                            var _this = this;
                            if(result.canResize || result.canResize === undefined && $(e.target).hasClass("buttons-box")) {
                                $(".infoPane").show();
                                if(e.pageX <50) {
                                    if(!isDragging && dragged) {
                                        isHalf = true;
                                        $(_this).animate({top:"4vh",left:0,width:"50vw",height:"89vh"});
                                        isDragging = false;
                                        if($(".positioned").length === 0) {
                                            tabs.position("right",opnmbr);
                                        }else {
                                            $(this).addClass("positioned");
                                        }
                                    }
                                }else if(e.pageX >$("#frameAsWhole").width()-50) {
                                    if(!isDragging) {
                                        isHalf = true;
                                        $(_this).animate({top:"4vh",left:"50vw",width:"50vw",height:"89vh"});
                                        isDragging = false;
                                        if($(".positioned").length === 0) {
                                            tabs.position("left",opnmbr);
                                        }else {
                                            $(this).addClass("positioned");
                                        }
                                    }
                                }else if(e.pageY < 50 && dragged) {
                                    if(e.pageX >1 && e.pageX <$("#frameAsWhole").width()-1) {
                                        isFSMode = true;
                                    }
                                    $(_this).animate({top:0,left:0,width:"100vw",height:"93vh"});
                                    $(".infoPane").hide();
                                }
                                $(_this).resizable({disabled:isFSMode});
                            }
                        });
                        if(result.canResize || result.canResize === undefined) {
                            $(".application-frame[data-OpenNumber='"+opnmbr+"']")
                            .resizable({
                                minWidth:300,
                                minHeight:300,
                                handles: "n, e, s, w",
                                resize: function(e) {
                                    if(e.pageX <50 || e.pageX >$("#frameAsWhole").width()-50) {
                                        if(isHalf) {
                                            $(this).animate({top:0,left:0,width:"100vw",height:"93vh"});
                                            $(".infoPane").hide();
                                            isFSMode = true;
                                        }
                                    }
                                    isDragging = true;
                                },
                                start: function(){
                                    ifr = $('iframe');
                                    var d = $('<div></div>');

                                    $(this).append(d[0]);
                                    d[0].id = 'resizer';
                                },
                                stop: function(){
                                    $('#resizer').remove();
                                }
                            });
                        }
                    });
                });
                function show(num) {
                    var zIndex = 0;
                    $(".application-frame").each(function() {
                        if(zIndex < parseInt($(this).css("zIndex"))) {
                            zIndex = parseInt($(this).css("zIndex"));
                        }
                    });
                    $(".application-frame[data-OpenNumber='"+num+"']").show()
                    .css("zIndex",zIndex+1);
                }
            });
            return {
                onClose:function(callback) {
                    $(".application-frame[data-OpenNumber='"+opnmbr+"'] .exit-button").click(function() {
                        return callback(true);
                    });
                },
                openNumber:function() {
                    return opnmbr;
                },
                close:function() {
                    $(".application-frame[data-OpenNumber='"+opnmbr+"']").remove();
                    require(["Desktop/icons","InfoPane/tabs"],function(icon,tabs) {
                        if(icon.get($(".icon[data-OpenNumber='"+opnmbr+"']"),"data-pinned") == "true") {
                            $(".icon[data-OpenNumber='"+opnmbr+"']").parent().removeClass("open")
                            icon.unset($(".icon[data-OpenNumber='"+opnmbr+"']"),"data-OpenNumber");
                        }else {
                            icon.removeTaskbarIcon({openNumber:$(".icon[data-OpenNumber='"+opnmbr+"']").attr("data-OpenNumber")});
                        }
                        tabs.removeTab(opnmbr);
                    });
                },
                onLoad:function(callback) {
                    $(".application-frame[data-OpenNumber='"+opnmbr+"'] iframe")[0]
                    .onload = function() {
                        return callback(true);
                    }
                }
            }
        },
        close:function(openNumber) {
            $(".application-frame[data-OpenNumber='"+openNumber+"']").remove();
            require(["Desktop/icons","InfoPane/tabs"],function(icon,tabs) {
                if(icon.get($(".icon[data-OpenNumber='"+openNumber+"']"),"data-pinned") == "true") {
                    $(".icon[data-OpenNumber='"+openNumber+"']").parent().removeClass("open")
                    icon.unset($(".icon[data-OpenNumber='"+openNumber+"']"),"data-OpenNumber");
                }else {
                    icon.removeTaskbarIcon({openNumber:$(".icon[data-OpenNumber='"+openNumber+"']").attr("data-OpenNumber")});
                }
                tabs.removeTab(openNumber);
            });
        },
        show:function(openNumber) {
            var zIndex = 0;
            $(".application-frame").each(function() {
                if(zIndex < parseInt($(this).css("zIndex"))) {
                    zIndex = parseInt($(this).css("zIndex"));
                }
            });
            $(".application-frame[data-OpenNumber='"+openNumber+"']").show()
            .css("zIndex",zIndex+1);
        },
        position:function(openNumber,position) {
            if(position != "") {
                var frame = $(".application-frame[data-OpenNumber='"+openNumber+"']"),
                    zIndex = 0;
                setTimeout(function() {
                    var canFullscreen = frame.find(".fullscreen-button").length?true:false;
                    if(canFullscreen) {
                        frame.animate({"width":"50vw","height":"89vh","top":"4vh"});
                    }else {
                        frame.animate({"top":(($("#data-holder").height()/2)-(frame.height()/2))});
                    }
                    $(".application-frame").each(function() {
                        if(zIndex < parseInt($(this).css("zIndex"))) {
                            zIndex = parseInt($(this).css("zIndex"));
                        }
                    });
                    frame.show().animate("zIndex",zIndex+1);
                    if(position == "left") {
                        frame.animate({left:0});
                    }else if(position == "right") {
                        if(canFullscreen) {
                            frame.animate({left:"50vw"});
                        }else {
                            frame.animate({left:($(window).width()*0.75)-(frame.width()/2)});
                        }
                    }
                    frame.addClass("positioned");
                },200)
            }
        }
    }
});
