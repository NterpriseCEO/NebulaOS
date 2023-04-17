define(function() {
    return {
        app:function(options,callback) {
            $.getJSON(options.src+"/app.json",function(result) {
                //src,title,appIcon,path
                var src = options.src;
                var w = (100/document.documentElement.clientWidth),
                    h = (100/document.documentElement.clientHeight),
                    appCoordsSize = {width:0,height:0,x:0,y:0},
                    isDragging = false,
                    isHalf = false;
                window.openNumber++;
                var opnmbr = window.openNumber;
                if(options.inApp == true) {
                    opnmbr = "none";
                }
                src = result.hasMobileApp?src+"mobileApp/":src+"/app/";
                $("#osWrap").append('\
                    <div class = "application-frame" data-OpenNumber="'+opnmbr+'" data-inApp = "'+options.inApp+'" title = "'+options.title+'">\
                        <iframe class = "embed" src="'+src+'" style="margin-left:0vw;" allow = "microphone; camera" sandbox="allow-forms allow-scripts allow-pointer-lock allow-modals">\
                        </iframe>\
                    </div>'
                );
                $(".application-frame[data-openNumber='"+opnmbr+"']").animate({width:"100vw",height:"94vh",top:"3vh",left:0,borderRadius:0},500);
                if(options.inApp == true) {
                    $(".application-frame[data-openNumber='none']").css("top","100vh")
                    setTimeout(function() {
                        $(".application-frame[data-openNumber='none']").animate({top:"3vh"});
                    },1)
                }
                if($(".application-frame[data-openNumber='"+opnmbr+"'] .embed").attr("src").endsWith("Camera.app/app/") ||$(".application-frame[data-openNumber='"+opnmbr+"'] .embed").attr("src").endsWith("Camera.app/mobileApp/")) {
                    $(".application-frame[data-openNumber='"+opnmbr+"'] .embed").attr("sandbox","allow-forms allow-scripts allow-pointer-lock allow-modals allow-same-origin")
                }
                var icons;
                if (options.path == undefined) {
                    icons = "Desktop/icons";
                }else {
                    icons = options.path+"js/Desktop/icons";
                }
                require([icons],function(icon) {
                    if(!options.inApp) {
                        $("#appsList").append("<div class = 'openApp' data-OpenNumber='"+opnmbr+"' data-src='"+options.src+"'>"+options.title+"<br><img src = '"+options.src+"/images/icon.png'><div>");
                        icon.set($(".icon[data-src='"+options.src+"']"),"data-OpenNumber",opnmbr);
                        //var outerDragStartPos,start, contentWidth = 0;
                        //var innerDrag = $('.openApp:last');
                        //var outerDrag = $('#appsList');
                        var pos = $(".openApp:last").offset().left,
                            startPos,
                            dist = 0;
                        $(".openApp").draggable({
                            start:function(e) {
                                startPos = e.pageX;
                            },
                            revert:true,
                            drag:function(e, ui) {
                                if(ui.position.top > 0) {
                                    ui.position.top = 0
                                }
                                if(ui.position.left > pos || ui.position.left < pos) {
                                    ui.position.left = pos;
                                }
                                dist = startPos-e.pageX;
                                var scrollLeft = $("#appsList").scrollLeft();
                                console.log(scrollLeft+dist)
                                $("#appsList").scrollLeft(scrollLeft+dist);
                            },
                            stop:function(e,ui) {
                                y2 = ui.position.top;
                                //$(this).css("opacity",y2)
                                //$("#appsList").scrollLeft(dist);
                                if(y2< -($("body").height()/2)){
                                    $(".application-frame[data-openNumber='"+$(this).attr("data-openNumber")+"']").remove();
                                    this.style.height = $(this).height()+ 'px';
                                    $(this).addClass('hide-me');
                                    (function(_this) {
                                        setTimeout(function() {
                                            _this.remove();
                                            if($(".openApp").length == 0) {
                                                $("#openAppsPane").fadeOut();
                                            }
                                        },0);
                                    })(this);
                                }
                            }
                        });
                    }
                    icon.tiClicked(function(c,num) {
                        if(c) {
                            show(num);
                        }
                    });
                    function show(num) {
                        $(".application-frame[data-OpenNumber='"+num+"']").toggle();
                        return;
                    }
                });
            });
            return {
                onload:function(callback,hide) {
                    $(".application-frame[data-OpenNumber='"+opnmbr+"']").find(".embed").load(function() {
                        if(hide) {
                            $(".application-frame[data-OpenNumber='"+opnmbr+"']").hide();
                        }
                        return callback(true,$(this)[0].contentWindow);
                    });
                },
                close:function() {
                    if(opnmbr != "none") {
                        $(".application-frame[data-OpenNumber='"+opnmbr+"']").remove();
                    }else {
                        $(".application-frame[data-OpenNumber='"+opnmbr+"']")
                        .animate({top:"100vh"},function() {
                            $(this).remove();
                        });
                    }
                },
                openNumber:function() {
                    return opnmbr;
                },
                title:function() {
                    return $(".application-frame[data-OpenNumber='"+opnmbr+"']").find(".title").text();
                }
            }
        }
    }
});
