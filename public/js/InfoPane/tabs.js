define(function() {
    var tabsShown = false,
        started = false,
        selectedTab,clone,appSelected,openFolder;
    require(["Desktop/applications"],function(app) {
        $("#showApps").off("click").click(function() {
            $("#tabs").toggleClass("noColor");
            openFolder = $(".folder-view:visible");
            openFolder.toggle();
            //appSelected.show().addClass("positioned");
            $(".Applications").toggle().toggleClass("halfTabs");
            $(".tab").toggle();
            console.log("dude")
            if(parseInt($("#tabs").css("padding-left")) == $(window).width()/2) {
                $(".Applications").css("marginLeft","50vw");
            }else {
                $(".Applications").css("marginLeft",0);
            }
            /*if(parseInt($("#tabs").css("left")) == $(window).width()/2 && $(".Applications").hasClass("halfTabs")) {
                $(".Applications").css("marginLeft",$("#tabs").css("left"));
            }else{
                $(".Applications").css("marginLeft",0);
            }*/
        });
        $(document.body).off("keydown").on("keydown",function(e) {
            if(e.ctrlKey && e.altKey && $(".application-frame").length) {
                e.preventDefault();
                if(!started) {
                    tabsShown = true;
                    $("#tabs").addClass("tabsVisible").css({"left":0,"width":"100vw"});
                    $(".application-frame").addClass("tab");
                    $(".tab[data-order='1']").addClass("tabSelected");
                    started = true;
                }
                if(tabsShown) {
                    var tab;
                    if(e.keyCode == 84) {
                        tab = parseInt($(".tabSelected").attr("data-order")) > 1?
                            parseInt($(".tabSelected").attr("data-order"))-1:$(".tab").length;
                    }else {
                        tab = parseInt($(".tabSelected").attr("data-order")) < $(".tab").length?
                            parseInt($(".tabSelected").attr("data-order"))+1:1;
                    }
                    $(".tab").removeClass("tabSelected");
                    $(".tab[data-order='"+tab+"']").addClass("tabSelected");
                    selectedTab = $(".tabSelected").attr("data-openNumber");
                }
            }
        }).on("keyup",function(e) {
            if(!e.ctrlKey && tabsShown) {
                tabsShown = false;
                started = false;
                $(".tabSelected").attr("data-order",1).css("order",1);
                var plus = $(".tab:not(.tabSelected)").length > 2?2:1;
                for(var i = 0; i < $(".tab:not(.tabSelected)").length;i++) {
                    $(".tab:not(.tabSelected):eq("+i+")").attr("data-order",i+plus).css("order",i+plus);
                }
                $(".application-frame").removeClass("tab tabSelected");
                $("#tabs").removeClass("tabsVisible");
                $("#showApps").addClass("hide");
                console.log(selectedTab);
                app.show(selectedTab);
            }
        });
        $(document.body).on("click",".closeTab",function() {
            app.close($(this).parent().parent().attr("data-openNumber"));
            $(this).parent().parent().remove();
            var plus = $(".tab").length > 2?2:1;
            for(var i = 0; i < $(".tab").length;i++) {
                $(".tab").attr("data-order",i+plus).css("order",i+plus);
            }
        });
    });
    return {
        addTab:function(name,openNumber) {
            require(["InfoPane/iframe2image"],function() {
                $(".tab").removeClass("hidden");//tabSelected
                $("#tabs .row").append("<div class = 'tab tabSelected' data-openNumber = '"+openNumber+"'>\
                                       <div class = 'tabTitle'>"+name+"<i class = 'right closeTab material-icons'>close</i></div>\
                                       <div class = 'appView'></div>\
                                    </div>");
                $(".tabSelected .appView").css("backgroundImage",$(".icon[data-openNumber = '"+openNumber+"']").css("backgroundImage"))
            });
        },
        removeTab:function(openNumber) {
            $(".tab[data-openNumber='"+openNumber+"']").remove();
        },
        position:function(location,openNumber) {
            var moreThanOne = false;
            appSelected = $(".application-frame[data-OpenNumber='"+openNumber+"']");
            openFolder = $(".folder-view:visible");
            $(".application-frame[data-OpenNumber!='"+openNumber+"']").addClass("tab");
            if($(".tab").length == 0) {
                $("#showApps").addClass("hide");
                openFolder.hide();
                appSelected.show().addClass("positioned")
                $(".Applications").show().addClass("halfTabs");
                $("#tabs").addClass("noColor");
            }else {
                $(".tabSelected").removeClass("tabSelected");
                $("#showApps").removeClass("hide");
                $("#tabs").addClass("tabsVisible");
                moreThanOne = true;
            }
            if(location == "left") {
                if(!moreThanOne) {
                    $(".Applications").css("marginLeft",0);
                }else {
                    $("#tabs").css({"background":"linear-gradient(90deg, rgba(0,0,0,0.5) 50%, transparent  50%)"})
                }
            }else if(location == "right") {
                if(!moreThanOne) {
                    $(".Applications").css("marginLeft","50vw");
                }else {
                    $("#tabs").css({"background":"linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.5) 50%)","padding-left":"50vw"})
                }
            }
            $(".tab").addClass("smallTab");
            $(".tab").click(function() {
                $(".tab").off("click").removeClass("smallTab");
                $("#tabs").removeClass("tabsVisible").removeClass("noColor").css("left",0);
                $(".application-frame").removeClass("tab");
                var openNumber = $(this).attr("data-openNumber");
                var plus = $(".tab:not("+$(this)+")").length > 2?2:1;
                $(this).attr("data-order",1).css("order",1);
                for(var i = 0; i < $(".tab:not("+$(this)+")").length;i++) {
                    $(".tab:not("+$(this)+"):eq("+i+")").attr("data-order",i+plus).css("order",i+pllus);
                }
                require(["Desktop/applications"],function(app) {
                    app.position(openNumber,location);
                    $(".Applications").hide().removeClass("halfTabs")
                    .css("marginLeft",0);
                    openFolder.show();
                    $("#tabs").css({"background":"","padding-left":"0"});
                    $("#showApps").addClass("hide");
                });
            });
            /*$("body").on("click drag",function(e) {
                if(((e.target.id !== "tabs" && !$(e.target).parents('#tabs').length) &&
                   (e.target.class !== "Applications" && !$(e.target).parents('.Applications').length))) {
                    $(".tab").off("click").removeClass("smallTab");
                    $("#tabs").removeClass("tabsVisible").removeClass("noColor").css("left",0);
                    $(".Applications").hide().removeClass("halfTabs")
                    .css("marginLeft",0);
                    $(".application-frame").removeClass("tab");
                    if(openFolder != undefined) {
                        openFolder.show();
                    }
                }
            });*/
            return;
        },
        hide:function() {
            $("#tabs").removeClass("noColor tabsVisible").css("left",0);
            $(".application-frame").removeClass("tab");//tabSelected
            $(".Applications").removeClass("halfTabs").css("marginLeft",0);
        }
    }
});
