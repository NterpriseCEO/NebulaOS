define(function() {
    var menuLoaded = false;
    return {
        menu:function(event,menuData) {
            $(document.body).on("click",".mr",function() {
                $(".mnu").remove();
            });
            $(".mnu").remove();
            menuLoaded = false;
            $("body").append("<div class = 'mnu blur'>\
                              </div>");
            $(".mnu").css("left",event.clientX+5).hover(function() {
            },function() {
                $(".mnu").remove();
                return;
            });

            for(var i = 0; i < menuData.length;i++) {
                var forModal = (menuData[i][0].indexOf("<a") != -1)?
                " data-target='modal'  class = 'mr modal-trigger ":" class = 'mr ";
                $(".mnu").append("<div id = 'mb"+i+"' "+forModal+"flatBB'>"+menuData[i][0]+"</div>");
                click("mb"+i,i);
            }
            function click(clicker,i) {
                $("#"+clicker).click(function() {
                    return menuData[i][1](true);
                });
            }
            if(event.clientY+$(".mnu").height() > $(window).height()-100) {
                $(".mnu").css("top",(event.clientY+5)-$(".mnu").height());
            }else {
                $(".mnu").css("top",event.clientY+5);
            }
        }
    }
});
