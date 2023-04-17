define(function() {
    var getMaxZ = function(selector){
        return Math.max.apply(null, $(selector).map(function(){
            var z;
            return isNaN(z = parseInt($(this).css("z-index"), 10)) ? 0 : z;
        }));
    };
    $(document.body).on("click",".tabX",function(e) {
        e.stopPropagation();
        $(".application-frame[data-OpenNumber='"+$(this).parent().attr("data-openNumber")+"']").remove()
        if($(this).parent().parent().children().length == 1) {
            var p = $(this).parent().parent().parent();
            $(this).parent().parent().remove();
            p.parent().removeClass("open");
            p.removeAttr("data-OpenNumber")
            if(p.attr("data-pinned") == "false" || p.attr("data-pinned") == undefined) {
                p.remove();
            }
        }else {
            $(this).parent().remove();
        }
    });
    return {
        addTable:function(parent,i,doc) {
            for(var r = 0;r<10;r++) {
                for(var x = 0;x<10;x++) {
                    $(parent,doc).append("<div class = 'td td-"+i+"-"+r+"-"+x+"'></div>");
                }
            }
        },
        addApp:function(src,title,preinstalled) {
            var icon = src+"/images/icon.png";
            $(".table5").append("<div class = 'icon'\
                                                  data-src='"+src+"'\
                                                  title='"+title+"'>\
                                                  <div class='attl' title='"+title+"'>"+title+"</div>\
                                                  </div>");
            $(".icon[data-src='"+src+"']").css("backgroundImage","url('"+icon+"')")
            .attr("data-Preinstalled",preinstalled);
            if(!preinstalled) {
                var iconArray = [];
                $(".icon[data-Preinstalled='false']").each(function(i) {
                    iconArray[i] = $(this)[0].outerHTML;
                });
                var object = {"downloadedApps":iconArray};
                parent.socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/downloadedApps.data",
                                        contents:JSON.stringify(object)});
            }
        },
        clicked:function(callback) {
            $(document.body).on("dblclick",".folderTable .icon",function() {
                return callback(true,$(this).attr("data-src"),this);
            });
        },
        rightClicked:function(callback) {
            $(document.body).on("mousedown",".icon",function(e) {
                if(e.button == 2 && $(this).parent().hasClass("folderTable")) {
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
        addTaskbarIcon:function(options) {
            if($(".ti[title='"+options.title+"']").length > 0) {
                if($(".ti[title='"+options.title+"'] .appTabs").length == 0) {
                    $(".ti[title='"+options.title+"']").attr("data-OpenNumber",options.openNumber)
                    $(".ti[title='"+options.title+"']").parent().addClass("open");
                    $(".ti[title='"+options.title+"']").append("<div class = 'appTabs blur'></div>")
                }
                $(".ti[title='"+options.title+"'] .appTabs").append("<div data-openNumber='"+options.openNumber+"'>"+options.title+"</div>")
                var index = $(".ti[title='"+options.title+"'] .appTabs div:last");
                index.html(options.title+" #"+(index.index()+1)+"<div class = 'tabX'>X</div>");
            }else {
                for(var x = 0; x < $("#taskbarItems").children().length;x++) {
                    if($(".t-td"+x).children().length == 0) {
                        if($(".t-td"+x+" .icon[data-src='"+options.src+"']").length == 0) {
                            $(".t-td"+x).html("<div class = 'ti icon' title='"+options.title+"'><div class = 'appTabs blur'><div data-openNumber='"+options.openNumber+"'></div></div></div>");
                            $(".t-td"+x+" .icon").css("backgroundImage","url("+options.src+"/images/icon.png)")
                            .attr("data-OpenNumber",options.openNumber);
                            $(".t-td"+x).addClass("open");
                            if(options.pin) {
                                $(".t-td"+x+" .icon").attr({"data-pinned":options.pin,"data-src":options.src});
                            }else {
                                $(".t-td"+x+" .icon").attr("data-src",options.src);
                            }
                        }else {
                            $(".icon[data-src='"+options.src+"'] .appTabs").html("<div data-openNumber='"+options.openNumber+"'></div>");
                        }
                        var index = $(".icon[data-src='"+options.src+"'] .appTabs div:last");
                        index.html(options.title+" #"+(index.index()+1)+"<div class = 'tabX'>X</div>");
                        break;
                    }else {
                        if($(".t-td"+x+" .icon[data-src='"+options.src+"']").length) {
                            $(".t-td"+x).addClass("open");
                            $(".t-td"+x+" .icon[data-src='"+options.src+"']").append("<div class = 'appTabs blur'><div data-openNumber='"+options.openNumber+"'></div></div>")
                            var index = $(".icon[data-src='"+options.src+"'] .appTabs div:last");
                            index.html(options.title+" #"+(index.index()+1)+"<div class = 'tabX'>X</div>");
                            $(".t-td"+x+" .icon").attr({"data-OpenNumber":options.openNumber});
                            break;
                        }
                    }
                }
            }
            $(document.body).on("mousedown",".appTabs div",function(e) {
                e.stopPropagation();
            });
            $(document.body).on("click",".appTabs div",function(e) {
                e.stopPropagation();
                var appFrame = $(".application-frame[data-OpenNumber='"+$(this).attr("data-openNumber")+"']");
                appFrame.show();
                appFrame.css("zIndex",getMaxZ($(".application-frame"))+1);
            });
        },
        addTaskbarTab:function(options) {
        },
        removeTaskbarIcon:function(options) {
            $(".t-td .icon[data-OpenNumber='"+options.openNumber+"']").parent().removeClass("open");
            var div = $(".t-td .icon[title='"+options.title+"'] .appTabs div");
            if(options.removeAll) {
                div.each(function() {
                    $(".application-frame[data-openNumber='"+$(this).attr("data-OpenNumber")+"']").remove();
                });
                div.parent().remove();
            }
            if(div.parent().parent().find(".appTabs > div").length == 1 || options.removeAll || div.length == 0) {
                div.parent().remove();
                if(options.openNumber && ($(".t-td .icon[data-OpenNumber='"+options.openNumber+"']").attr("data-pinned") == undefined || $(".t-td .icon[data-OpenNumber='"+options.openNumber+"']").attr("data-pinned") == "false")) {
                    $(".t-td .icon[data-OpenNumber='"+options.openNumber+"']").remove();
                }else if(options.title && $(".t-td .icon[title='"+options.title+"']").attr("data-OpenNumber") == undefined) {
                    $(".t-td .icon[title='"+options.title+"']").remove();
                }else if($(".t-td .icon[title='"+options.title+"']").attr("data-OpenNumber") != undefined && ($(".t-td .icon[data-OpenNumber='"+options.openNumber+"']").attr("data-pinned") == undefined || $(".t-td .icon[data-OpenNumber='"+options.openNumber+"']").attr("data-pinned") == "false")) {
                    $(".t-td .icon[title='"+options.title+"']").attr("data-pinned","false").removeAttr("data-OpenNumber");
                }
                $(".t-td .icon[data-OpenNumber='"+options.openNumber+"']").removeAttr("data-openNumber");
            }else {
                div.remove();
            }
            return;
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
