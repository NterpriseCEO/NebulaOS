define(function() {
    var swipeInterval;
    function addTable(parent,swiper,doc) {
        if(parent != "apps") {
            $(parent,doc).append("<div class = 'swiper-slide'></div>")
        }else {
            swiper.appendSlide([
                "<div class='swiper-slide'><div class = 'appPane'></div></div>"
            ]);
        }
        require(["jquery-ui.min"],function() {
            require(["touchPunch"],function() {
                $(".appPane").sortable({
                    connectWith:".appPane,#taskbarItems",
                    cursorAt:{left:10,top:10},
                    disabled:true,
                    opacity:0.5,
                    appendTo:"body",
                    containment:document.body,
                    helper:"clone",
                    start:function(e) {
                        var time = 1000;
                        swipeInterval = setInterval(function() {
                            time = 3000;
                            console.log(x,30)
                            if(x >= $(window).width()-10) {
                                swiper.slideNext();
                            }else if(x <= 50 && swiper.activeIndex != 1) {
                                console.log(time)
                                swiper.slidePrev();
                            }else {
                                time = 1000;
                            }
                        },time);
                    },
                    stop:function() {
                        clearInterval(swipeInterval)
                    },
                    receive:function(e,ui) {
                        var can = true;
                        if($(this).attr("id") == "homepage") {
                            if($(this).children().length > 4) {
                                can = false;
                            }
                        }else {
                            if($(this).children().length > 16) {
                                can = false;
                            }
                        }
                        if(can) {
                            if($(ui.sender).attr("id") == "taskbarItems") {
                                $("#taskbarItems .icon[data-preinstalled='false'] .aX").hide();
                                var iconArray = [];
                                $("#taskbarItems .icon").each(function(i) {
                                    $(this).removeClass("jiggle");
                                    iconArray[i] = $(this)[0].outerHTML;
                                    $(this).addClass("jiggle");
                                });
                                var object = {"pinnedIcons":iconArray};
                                socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/mobilePinnedIcons.data",
                                                      content:JSON.stringify(object)});
                                $("#taskbarItems .icon[data-preinstalled='false'] .aX").show();
                            }
                        }else {
                            $(ui.sender).sortable("cancel");
                        }
                    }
                });
            });
        });
    }
    return {
        addTable:function(parent,i,doc) {
            addTable(parent,i,doc);
        },
        addApp:function(src,title,preinstalled,fromDownloads,swiper) {
            var i = -1;
            function addApp(i) {
                var icon = src+"/images/icon.png";
                $(".appPane:eq("+i+")").append("<div class = 'icon'\
                                                      data-src='"+src+"'\
                                                      title='"+title+"'>\
                                                      <div class='attl'>"+title+"</div>\
                                                      </div>");
                $(".icon[data-src='"+src+"']").css("backgroundImage","url('"+icon+"')")
                .attr("data-Preinstalled",preinstalled).longpress(function() {
                    $(".icon").addClass("jiggle");
                    $(".icon[data-preinstalled='false'] .aX").show();
                    $(".appPane,#taskbarItems").sortable({disabled:false});
                    setTimeout(function() {
                        $(".icon").removeClass("jiggle");
                        $(".aX").hide();
                    },5000);
                });
            }
            function skip() {
                i++;
                if(!$(".appPane:eq("+i+")").is($("#action-center"))) {
                    if($(".appPane:eq("+i+")").children().length < 8 && $(".appPane:eq("+i+")").attr("id") == "homepage") {
                        addApp(i);
                    }else if($(".appPane:eq("+i+")").children().length < 16 && $(".appPane:eq("+i+")").attr("id") != "homepage") {
                        addApp(i);
                    }else {
                        if($(".appPane:eq("+(i+1)+")").length == 0) {
                            addTable("apps",swiper);
                        }
                        skip();
                    }
                }
            }
            skip();
            if(!preinstalled) {
                var iconArray = [];
                $(".icon[data-Preinstalled='false']").each(function(i) {
                    iconArray.push($('<div>').append($(this).clone()).html());
                });
                var object = {"downloadedApps":iconArray};
                if(!fromDownloads) {
                    socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/downloadedApps.data",
                                            contents:JSON.stringify(object)});
                }
                $(".icon[data-src='"+src+"']").css("backgroundImage","url('"+src+"/images/icon.png')");
                $(".icon[data-src='"+src+"']").append("<div class = 'aX'>X</div>")
                $(".icon[data-src='"+src+"']").attr("data-src",""+src);
            }
        },
        clicked:function(callback) {
            var canClick = true;
            $(document.body).on("click",".icon",function() {
                if(canClick) {
                    canClick = false;
                    setTimeout(function() {
                        canClick = true;
                    },200);
                    return callback(true,$(this).attr("data-src"),this);
                }
            });
        },
        rightClicked:function(callback) {
            $(document.body).on("mousedown",".icon",function(e) {
                if(e.button == 2) {
                    return callback(true,e,this,$(this).attr("data-src"),$(this).attr("title"));
                }
            });
        },
        tiRightClicked:function(callback) {
            $(document.body).on("mousedown",".t-td .icon",function(e) {
                if(e.button == 2) {
                    return callback(true,e,this);
                }
            });
        },
        tiDblClicked:function(callback) {
            $(document.body).on("dblclick",".t-td .icon",function() {
                if($(this).attr("data-pinned") == "true" && $(this).attr("data-OpenNumber") == undefined) {
                    return callback(true,$(this).attr("data-src"),this);
                }
            });
        },
        tiClicked:function(callback) {
            $(document.body).off("click",".t-td .icon");
            $(document.body).on("click",".t-td .icon",function() {
                if($(this).attr("pinned") != "true") {
                    return callback(true,$(this).attr("data-OpenNumber"));
                }
            });
        },
        set:function(_this,variable,val) {
            $(_this).attr(variable,val);
        },
        unset:function(_this,variable) {
            $(_this).removeAttr(variable);
        },
        get:function(_this,variable) {
            return $(_this).attr(variable);
        }
    }
});
