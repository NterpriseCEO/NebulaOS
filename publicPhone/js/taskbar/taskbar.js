var tap1;
var tapped = false;
require(["jquery-ui.min"],function() {
    require(["touchPunch"],function() {
        $("#taskbarItems").sortable({
            connectWith:".appPane",
            appendTo:document.body,
            helper:"clone",
            containment:"window",
            cursorAt:{left:10,top:10},
            disabled:true,
            opacity:0.5,
            receive:function(e,ui) {
                if($(this).children().length > 4) {
                    $(ui.sender).sortable("cancel");
                }
                $("#taskbarItems .icon[data-preinstalled='false'] .aX").hide();
                var iconArray = [];
                $("#taskbarItems .icon").each(function(i) {
                    $(this).removeClass("jiggle");
                    iconArray[i] = $(this)[0].outerHTML;
                    $(this).addClass("jiggle");
                });
                var object = {"pinnedIcons":iconArray};
                socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/mobilePinnedIcons.data",
                                      contents:JSON.stringify(object)});
                $("#taskbarItems .icon[data-preinstalled='false'] .aX").show();
            }
        });
    });
});
var fadeApp = false;
var app;
$("#swipeUp").click(function() {
    $(".icon").removeClass("jiggle");
    $(".appPane,#taskbarItems").sortable({disabled:true});
    $(".icon[data-preinstalled='false'] .aX").hide();
    $("#openAppsPane").fadeOut();
    $(".application-frame[data-inApp='true']").remove();
    var d = Date.now();
    if(swiper.activeIndex == 0) {
        swiper.slideTo(1);
    }
    if(tapped && d-tap1 <=300) {
        if(!$("#openAppsPane").is(":visible")) {
            $("#openAppsPane").fadeIn();
        }
        tapped = false;
    }else {
        tapped = true;
        tap1 = Date.now();
    }
    setTimeout(function() {
        if(tapped && !$("#openAppsPane").is(":visible")) {
            if($(".application-frame:visible").length) {
                $(".application-frame:visible").fadeOut();
            }
            if($(".application-frame:visible").length == 0) {
                swiper.slideTo(1);
            }
        }
    },301);
}).on("swiperight",function() {
    //$("#infoPane,#desktopBox,#taskbar").fadeOut("fast");
    if(swiper.activeIndex != 0 && !$("#openAppsPane").is(":visible")) {
        if($(".application-frame:visible").length) {
            fadeApp = true;
            app = $(".application-frame:visible");
            $(".application-frame:visible").fadeOut();
        }
        swiper.slideTo(0)
    }
}).on("swipeleft",function() {
    if(swiper.activeIndex == 0) {
        if(fadeApp) {
            fadeApp = false;
            app.fadeIn();
        }
        swiper.slideTo(1);
        $("#infoPane,#desktopBox,#taskbar").fadeIn("fast");
    }
});
$(document.body).on("click",".openApp",function() {
    $(".application-frame[data-OpenNumber='"+$(this).attr("data-OpenNumber")+"']").show();
    $(this).parent().parent().fadeOut();
}).on("swipeleft",function() {
    console.log("hello")
    $("#appsList").scrollLeft($("#appsList").scrollLeft()+$("body").width());
}).on("swiperight",function() {

});

var el = $("#mssngsHdr").offset().top;

$("#actionCenter").scroll(function() {
    $("#mssngsHdr").toggleClass("sticky",$("#actionCenter").scrollTop() > el)
});
