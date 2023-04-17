(function() {
    for(var i = 0; i < 14;i++) {
        $("#taskbarItems").append('<div class =" t-td t-td'+i+'"></div>');
    }
    var interval = setInterval(function () {
        if($("#usernameDisplay").text() != "") {
            clearInterval(interval);
            $.getJSON("/public/userData/"+$("#usernameDisplay").text()+"/data/pinnedIcons.data",function(result) {
                for(var i = 0;i < result.pinnedIcons.length;i++) {
                    $("#taskbarItems .t-td"+i).append(result.pinnedIcons[i]);
                }
            });
        }
    },100);
})();
require(["Desktop/icons","Desktop/menus","alert","Desktop/applications"],function(icons,menu,alrt,app) {
    icons.tiRightClicked(function(clicked,e,_this) {
        if(clicked) {
            var pinned = icons.get(_this,"data-pinned");
            var pinUnpin = (pinned)?"Unpin":"Pin";
            var open =
            ($(".application-frame[data-OpenNumber='"+icons.get(_this,"data-OpenNumber")+"']").length !=0)
            ?["Close App",true]:["Open App",false];
            menu.menu(e,[
                [pinUnpin,function() {
                    if(!pinned) {
                        icons.set(_this,"data-pinned",true);
                        alrt.notification("Complete","App Pinned");
                        var iconArray = [];
                        $(".icon[data-pinned='true']").each(function(i) {
                            var div = $("<div>").append($(this).clone().removeAttr("data-OpenNumber").empty()).html();
                            iconArray[i] = div;
                        });
                        var object = {"pinnedIcons":iconArray};
                        socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/pinnedIcons.data",
                                                contents:JSON.stringify(object)});
                    }else {
                        icons.removeTaskbarIcon({title:icons.get(_this,"title"),openNumber:icons.get(_this,"data-OpenNumber")});
                        alrt.notification("Complete","App Unpinned");
                        var iconArray = [];
                        $(".icon[data-pinned='true']").each(function(i) {
                            iconArray[i] = $("<div>").append($(this).clone().removeAttr("data-OpenNumber").empty()).html();
                        });
                        var object = {"pinnedIcons":iconArray};
                        socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/pinnedIcons.data",
                                                contents:JSON.stringify(object)});
                    }
                }],
                [open[0],function() {
                    if(open[1]) {
                        $(".application-frame[data-OpenNumber='"+icons.get(_this,"data-OpenNumber")+"']").remove();
                        $(_this).parent().removeClass("open");
                        icons.removeTaskbarIcon({title:icons.get(_this,"title"),openNumber:icons.get(_this,"data-OpenNumber"),removeAll:true});
                    }else {
                        var APP = app.app({src:$(_this).attr("data-src"),icon:_this});
                        $(_this).parent().addClass("open");
                        icons.set(_this,"data-OpenNumber",APP.openNumber());
                    }
                }]
            ])
        }
    });
});
