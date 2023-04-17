require(["Desktop/icons","alert","jquery.select.min"],function(icon,alrt) {
    for(var i = 1; i <5;i++) {
        icon.addTable(".table"+i,i);
        $(".folderTable:eq("+(i-1)+")").nuSelectable({
            items:".td",
            selectionClass: 'selection-box',
            selectedClass: 'selected',
            autoRefresh: true,
            onSelect:function(){
                $(".folderTable:hidden .td").removeClass("selected");
                $(".td:empty").removeClass("selected")
            },
            onUnSelect:function(){},
            onClear:function(){}
        });
    }

    icon.addApp("../Applications/NebulaStore.app/","Continuum",true);
    icon.addApp("../Applications/MarathonMessenger.app/","Marathon Messenger",true);
    icon.addApp("../Applications/Settings.app/", "Settings",true);
    icon.addApp("../Applications/ForceQuit.app/", "Force Quit",true);
    icon.addApp("../Applications/NebulaCalculator.app/", "Calculator",true);
    icon.addApp("../Applications/NebulaMediaPlayer.app/", "Media Player",true);
    icon.addApp("../Applications/NebulaEditor.app/", "Nebula Editor",true);
    icon.addApp("../Applications/TextPad.app/", "TextPad",true);
    icon.addApp("../Applications/NebulaBrowser.app/", "Acceleron",true);
    icon.addApp("../Applications/Columbus.app/", "Columbus",true);
    icon.addApp("../Applications/TheCommander.app/", "The Commander",true);
    icon.addApp("../Applications/Paint.app/", "Leonardo",true);
    icon.addApp("../Applications/NebulaCode.app/", "Nebula Code",true);
    var interval = setInterval(function () {
        if($("#usernameDisplay").text() != "") {
            clearInterval(interval);
            $.getJSON("/public/userData/"+$("#usernameDisplay").text()+"/data/downloadedApps.data",function(result) {
                for(var i = 0;i < result.downloadedApps.length;i++) {
                    $(".table5").append(result.downloadedApps[i]);
                }
            });
        }
    },100);

    icon.clicked(function(clicked,src,_this) {
        if(clicked) {
            require(["Desktop/applications","InfoPane/tabs"],function(app,tabs) {
                var side = $(".Applications").width() ==
                $(window).width()/2?"right":"left";
                var canPosition = parseInt($(".Applications").css("marginLeft"))
                    == $(window).width()/2?side:"",
                    isPositioned = (canPosition == "left"||canPosition=="right");
                console.log(src);
                var APP = app.app({src:src,isPositioned:isPositioned});
                post.once("ready","all",function(data,key2,sender2) {
                    post.post("appEvent",key2,sender2,{lang:lang});
                });
                app.position(APP.openNumber(),canPosition);
                tabs.hide();
                /*if($(".ti[title='"+icon.get(_this,"title")+"']").length >0) {
                    icon.set($(".ti[title='"+icon.get(_this,"title")+"']"),"data-OpenNumber",APP.openNumber());
                    $(".ti[title='"+icon.get(_this,"title")+"']").append("<div class = 'appTabs blur'><div data-openNumber='"+APP.openNumber()+"'></div></div>")
                    var index = $(".icon[data-OpenNumber='"+APP.openNumber()+"'] .appTabs div:last");
                    index.html(icon.get(_this,"title")+" #"+(index.index()+1)+"<div class = 'tabX'>X</div>");
                }*/
            });
        }
    });
    icon.rightClicked(function(clicked,e,_this,src,title) {
        if(clicked) {
            require(["Desktop/menus"],function(menu) {
                menu.menu(e,[
                    ["Open App",function() {
                        require(["Desktop/applications"],function(app) {
                            app.app({src:src});
                            post.once("ready","all",function(data,key2,sender2) {
                                post.post("appEvent",key2,sender2,{lang:lang});
                            });
                        });
                    }],
                    ["Pin App To Taskbar",function() {
                        icon.addTaskbarIcon({src:src,title:title,pin:true});
                        alrt.notification("","App Pinned");
                        var iconArray = [];
                        $(".icon[data-pinned='true']").each(function(i) {
                            iconArray[i] = $("<div>").append($(this).removeAttr("data-OpenNumber").clone()).html();
                        });
                        var object = {"pinnedIcons":iconArray};
                        socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/pinnedIcons.data",
                                                contents:JSON.stringify(object)});
                    }],
                    ["Uninstall App",function() {
                        if(icon.get(_this,"data-Preinstalled") == "false") {
                            alrt.confirm({header:"Uninstall App",displayText:"Do you wish to uninstall this app?"},function(clicked) {
                                if(clicked) {
                                    $(_this).remove();
                                    var iconArray = [];
                                    $(".icon[data-Preinstalled='false']").each(function(i) {
                                        iconArray[i] = $(this).parent().html();
                                    });
                                    var object = {"downloadedApps":iconArray};
                                    parent.socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/data/downloadedApps.data",
                                    contents:JSON.stringify(object)});
                                }
                            });
                        }else {
                            alrt.notification("Warning","This app cannot be uninstalled!");
                        }
                    }]
                ]);
            });
        }
    });
    icon.tiDblClicked(function(dblcliked,src,_this) {
        if(dblcliked) {
            require(["Desktop/applications"],function(app) {
                var APP = app.app({src:src,pinned:true,icon:_this});
                post.once("ready","all",function(data,key2,sender2) {
                    post.post("appEvent",key2,sender2,{lang:lang});
                });
                icon.set(_this,"data-OpenNumber",APP.openNumber());
                $(_this).parent().addClass("open");
                $(_this).append("<div class = 'appTabs blur'><div data-openNumber='"+APP.openNumber()+"'></div></div>")
                var index = $(".icon[data-OpenNumber='"+APP.openNumber()+"'] .appTabs div:last");
                index.html(icon.get(_this,"title")+" #"+(index.index()+1)+"<div class = 'tabX'>X</div>");
            });
        }
    });
});
require(["Desktop/createFileFolder"],function(){});
