var animating = false,
    swiper,
    x;
require(["desktop/icons","../../public/js/alert","jquery.longpress"],function(icon,alrt) {
    //App Store = Continuum
    swiper = new Swiper('.swiper-container', {
        // Optional parameters
        direction: 'horizontal',
        pagination: {
            el: '.swiper-pagination',
        },
        touchMoveStopPropagation:true,
        noSwipingClass:"icon",
        noSwiping:true,
        initialSlide:1
    });

    //icon.addTable(".swiper-wrapper");
    icon.addApp("../Applications/NebulaStore.app/","Nebula Store",true,null,swiper);
    icon.addApp("../Applications/Settings.app/","Settings",true,null,swiper);
    icon.addApp("../Applications/MarathonMessenger.app/","Marathon Messenger",true,null,swiper);
    icon.addApp("../Applications/Camera.app/","Camera",true,null,swiper);
    icon.addApp("../Applications/Photos.app/","Photos",true,null,swiper);
    icon.addApp("../Applications/NebulaBrowser.app/","Acellron",true,null,swiper);
    icon.addApp("../Applications/Columbus.app/", "Columbus",true,null,swiper);
    icon.addApp("../Applications/NebulaCalculator.app/","Calculator",true,null,swiper);
    icon.addApp("../Applications/Calendar.app/","Calendar",true,null,swiper);
    icon.addApp("../Applications/Timer.app/","Timer",true,null,swiper);
    icon.addApp("../Applications/TextPad.app/","TextPad",true,null,swiper);


    /*icon.addApp("../public/Applications/TextPad.app/","TextPad",true);
    icon.addApp("../public/Applications/NebulaBrowser.app/","Acellron",true);
    icon.addApp("mobileApps/Columbus.app/", "Columbus",true);
    icon.addApp("../public/Applications/NebulaCalculator.app/","Calculator",true);
    icon.addApp("../public/Applications/MarathonMessenger.app/","Marathon Messenger",true);
    icon.addApp("mobileApps/Timer.app/","Timer",true);
    icon.addApp("mobileApps/Calendar.app/","Calendar",true);*/

    var interval = setInterval(function () {
        if($("#usernameDisplay").text() != "") {
            clearInterval(interval);
            $.getJSON("../../public/userData/"+$("#usernameDisplay").text()+"/data/downloadedApps.data",function(result) {
                for(var i = 0;i < result.downloadedApps.length;i++) {
                    $("body").append(result.downloadedApps[i]);
                    var last = $("body .icon:last"),
                        src = $(last).attr("data-src"),
                        title = $(last).attr("title");
                    $(last).remove();
                    icon.addApp(src,title,false,true);
                }
            });
            $.getJSON("../../public/userData/"+$("#usernameDisplay").text()+"/data/mobilePinnedIcons.data",function(result) {
                for(var i = 0;i < result.pinnedIcons.length;i++) {
                    $("#taskbarItems").append(result.pinnedIcons[i])
                    require(["jquery-ui.min"],function() {
                        require(["touchPunch"],function() {
                            $("#taskbarItems .icon").longpress(function() {
                                $(".icon").addClass("jiggle");
                                $(".icon[data-preinstalled='false'] .aX").show();
                                $(".appPane,#taskbarItems").sortable({disabled:false});
                                setTimeout(function() {
                                    $(".icon").removeClass("jiggle")
                                    $(".aX").hide();
                                },5000);
                            });
                            if($("#appsTable .icon[data-src='"+$("#taskbarItems .icon:last").attr("data-src")+"']").length > 0) {
                                $("#appsTable .icon[data-src='"+$("#taskbarItems .icon:last").attr("data-src")+"']").remove();
                            }
                        });
                    });
                }
            });
        }
    },100);
    icon.clicked(function(clicked,src,_this) {
        if(clicked) {
            if($(".application-frame[data-OpenNumber='"+icon.get(_this,"data-OpenNumber")+"']").length == 0) {
                require(["desktop/applications"],function(app) {
                    var APP = app.app({src:src,title:icon.get(_this,"title")});

                    post.once("ready","all",function(data,key2,sender2) {
                        //if(src.includes("Settings")) {
                            post.post("appEvent",key2,sender2,{lang:lang});
                        //}
                    });
                });
            }else {
                $(".application-frame[data-OpenNumber='"+icon.get(_this,"data-OpenNumber")+"']").show();
            }
        }
    });
    $("#desktopBox").mousemove(function(e) {
        var _this = this;
        x = e.pageX;
    });

    $(document.body).on("click",".aX",function(e) {
        var p = $(this).parent();
        e.stopPropagation();
        alrt.confirm({displayText:C.wishToUninstall+p.find(".attl").text()+"'?"},function(clicked) {
            if(clicked) {
                var iconArray = [];
                $(".icon[data-Preinstalled='false']").each(function(i) {
                    if(!p.is(this)) {
                        iconArray.push($('<div>').append($(this).clone()).html());
                    }
                });
                var object = {"downloadedApps":iconArray};
                socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/downloadedApps.data",
                                        contents:JSON.stringify(object)});
                p.remove();
            }
        });
    });
});
