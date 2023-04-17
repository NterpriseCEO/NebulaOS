var loaded = false,
    canSave = false,
    link = 5,
    hstry = [],
    index = 0,
    user,
    ngrok = window.location.protocol + "//" + window.location.host+"/public/";

require([ngrok+"js/Desktop/menus.js","fileFolder",ngrok+"js/NebulaAPI.js",
ngrok+"js/NebulaPM.js",ngrok+"js/jquery.js"],function(menu,folder,api) {
    require([ngrok+"js/alert.js",ngrok+"js/Desktop/icons.js",ngrok+"js/materialize.min.js",ngrok+"js/jquery.select.min.js"],function(alrt,icon) {
        $(".modal").modal();
        var SV = $("#pageSearchBar").val(),
            copy,
            toCut = false,
            addon,
            selectedFile,
            post = new SecurePost();
        post.init(function() {
            post.post("ready","ColumbusKey0",null);
            post.post("getUsername","ColumbusKey1",null);
            post.once("usernameGotten","ColumbusKey1",function(data) {
                user = data.username;
            });
            index++;
            hstry[index] = "Desktop";
            post.once("appEvent","ColumbusKey0",function(data) {
                let keys = Object.keys(data),
                    key = keys[0];
                if(data != undefined && (keys.length !== 1 || key !== "lang")) {
                    if(data.type == "dialogueOpenFile") {
                        addon = "open";
                        icon.addTable(".folder1",1);
                        folder.loadFolder(".Desktop",post);
                        $("#addon").show();
                        $("#doButton").text("Open");
                    }else if(data.type == "dialogueSaveFile") {
                        addon = "save";
                        icon.addTable(".folder1",1);
                        folder.loadFolder(".Desktop",post);
                        $("#addon").show();
                    }else if(data.type == "dialogueShowFolder") {
                        var location = data.path+(data.title!=undefined?"/"+data.title:"");
                        $("#middle").append("<div class = 'fold' data-opened = 'opened' data-Folder-Name='"+location+"' title = '"+data.title+"'></div>");
                        $(".fold:eq(0)").hide();
                        $("#pageSearchBar").val(location);
                        $(".fold[data-Folder-Name='"+location+"']").show();
                        icon.addTable(".fold[data-Folder-Name='"+location+"']",link);
                        folder.loadFolder(".fold[data-Folder-Name='"+location+"']",post,location);
                        $(".fold[data-Folder-Name='"+location+"']").nuSelectable({
                            items:".td",
                            selectionClass: 'selection-box',
                            selectedClass: 'selected',
                            autoRefresh: true,
                            onSelect:function(){
                                $(".fold:hidden .td").removeClass("selected");
                                $(".td:empty").removeClass("selected")
                            },
                            onUnSelect:function(){},
                            onClear:function(){}
                        });
                    }else if(data.type == "dialogueUploadFile") {
                        addon = "upload";
                        icon.addTable(".folder1",1);
                        folder.loadFolder(".Desktop",post);
                        $("#addon").show();
                        $("#doButton").text("Upload");
                    }else if(data.type == "dialogueOpenFolderContents") {
                        openFolder = true;
                        addon = "openFolder";
                        $("#addon").show();
                        $("#doButton").text("Open");
                        icon.addTable(".folder1",1);
                        folder.loadFolder(".Desktop",post);
                    }
                }else {
                    icon.addTable(".folder1",1);
                    folder.loadFolder(".Desktop",post);
                    $(".fold[data-Folder-Name='Desktop']").nuSelectable({
                        items:".td",
                        selectionClass: 'selection-box',
                        selectedClass: 'selected',
                        autoRefresh: true,
                        onSelect:function(){
                            $(".fold:hidden .td").removeClass("selected");
                            $(".td:empty").removeClass("selected")
                        },
                        onUnSelect:function(){},
                        onClear:function(){}
                    });
                }
            });
            //app-open Columbus
            $(document.body).on("click","#favFoldersTitle",function() {
                $(".favFoldButton").toggleClass("hide");
            });
            var has = false;
            $(".favFoldButton").hover(function() {
                if(!$(this).hasClass("blue")) {
                    $(this).addClass("blue");
                    has = true;
                }else {
                    has = false;
                }
            },function() {
                if(has && !$(this).hasClass("selected")) {
                    $(this).removeClass("blue")
                }
            });
            $(".favFoldButton").mousedown(function(e) {
                var _this = this;
                if(e.button == 2) {
                    menu.menu(e,[
                        ["Open In new Window",
                        function() {
                            post.post("openApp","ColumbusKey17",null,{path:"../Applications/Columbus.app/",event:"dialogueShowFolder",action:{path:$(_this).attr("id")},basic:true});
                        }]
                    ]);
                }
            });
            $(document.body).on("click",".favFoldButton",function() {
                $(".favFoldButton").removeClass("blue selected");
                $(this).addClass("blue selected");
                if($(".fold[data-Folder-Name='"+$(this).attr("id")+"']").children().length == 0) {
                    icon.addTable(".folder"+$(this).attr("data-num"),$(this).attr("data-num"));
                    $(".fold:eq("+($(this).attr("data-num")-1)+")").nuSelectable({
                        items:".td",
                        selectionClass: 'selection-box',
                        selectedClass: 'selected',
                        autoRefresh: true,
                        onSelect:function(){
                            $(".fold:hidden .td").removeClass("selected");
                            $(".td:empty").removeClass("selected")
                        },
                        onUnSelect:function(){},
                        onClear:function(){}
                    });
                    folder.loadFolder("."+$(this).attr("id"),post);
                }
                if($(".fold[data-Folder-Name='"+$(this).attr("id")+"']").css("display") != "block") {
                    index++
                    hstry[index] = $(this).attr("id");
                    hstry.length = index+1;
                    $(".fold").hide();
                    $(".fold[data-Folder-Name='"+$(this).attr("id")+"']").show();
                    $("#pageSearchBar").val($(this).attr("id")+"/");
                }
            });
            $(document.body).on("mouseup",".td",function(e) {
                var _this = this;
                if(e.button == 2) {
                    if($(_this).children().length == 0) {
                        menu.menu(e,[
                            ["New File",function() {
                                api.type({header:"New File",displayText:"Choose  file name."},function(name,clicked) {
                                    if(clicked) {
                                        if(!/[^a-zA-Z0-9\.\-\_]/.test(name)) {
                                            folder.addFile(_this,name,post);
                                        }else {
                                            api.notification("Alphanumeric and dots only please");
                                        }
                                    }
                                });
                            }],
                            ["New Folder",function() {
                                api.type({header:"New Folder",displayText:"Choose a folder name."},function(name,clicked) {
                                    if(clicked) {
                                        if(!/[^a-zA-Z0-9\.\-\_]/.test(name)) {
                                            folder.addFolder(_this,post,name);
                                        }else {
                                            api.notification("Alphanumeric and dots only please");
                                        }
                                    }
                                });
                            }],
                            ["Paste",function() {
                                if(copy != undefined) {
                                    if(copy.isArray) {
                                        for(var i = 0; i < copy.length;i++) {
                                            folder.copyFile(copy[i],_this,toCut,post,true);
                                        }
                                    }else {
                                        folder.copyFile(copy,_this,toCut,post);
                                    }
                                }
                            }]
                        ]);
                    }else {
                        menu.menu(e,[
                            ["Open",function() {
                                var title = $(_this).children().attr("title");
                                var dir = $(_this).parent().attr("data-Folder-Name")+"/"+title;
                                if(addon == "openFolder") {
                                    selectedFile = _this
                                    post.post("folderSelected",null,"ColumbusKey16",{path:dir})
                                }else {
                                    if($(_this).children().attr("class") == "folder") {
                                        loadFolder($(_this).children(),post);
                                    }else {
                                        post.post("openInApp","ColumbusKey12",null,{title:title,parentFolder:$(_this).parent().attr("data-Folder-Name")});
                                    }
                                }
                            }],
                            ["<a class = 'modal-trigger' data-target='modal'>Open With</a>",function() {
                                var location = $(_this).parent().attr("data-Folder-Name")+"/"+$(_this).children().attr("title");
                                post.post("getOpenWithData","ColumbusKey18",null,{title:$(_this).children().attr("title")});
                                post.once("appDataGotten","ColumbusKey18",function(data) {
                                    $("#modalCollection").html(data.contents);
                                    $(".icon").each(function() {
                                        var bg = $(this).css('background-image');
                                        bg = bg.replace('url(','').replace(')','').replace(/\"/gi, "");
                                        bg = bg.substr(bg.indexOf(".app")+4,bg.length)
                                        console.log(bg);
                                        $(this).css("backgroundImage","url(../../../../"+bg+")")
                                    });
                                    $("#modalCollection .collection-item").click(function() {
                                        var _this = this;
                                        post.post("openApp","ColumbusKey19",null,{path:$(this).find(".icon").attr("data-src"),basic:true,event:"openFile",action:{path:location}});
                                        $(".modal").modal("close");
                                    });
                                });
                            }],
                            ["Copy",function() {
                                if($(_this).hasClass("selected")) {
                                    copy = [];
                                    $(".fold:visible .selected").children().each(function(i) {
                                        copy[i] = $(this).parent();
                                    });
                                    copy.isArray = true;
                                }else {
                                    copy = _this;
                                    copy.isArray = false;
                                }
                                toCut = false;
                            }],
                            ["Cut",function() {
                                if($(_this).hasClass("selected")) {
                                    copy = [];
                                    $(".fold:visible .selected").children().each(function(i) {
                                        copy[i] = $(this).parent();
                                    });
                                }else {
                                    copy = _this;
                                }
                                toCut = true;
                            }],
                            ["Rename",function() {
                                folder.renameFileFolder(_this,post);
                            }],
                            ["Delete",function() {
                                if($(_this).hasClass("selected")) {
                                    var l = $(".fold:visible .selected").children().length;
                                    api.confirm({header:"Confirm",displayText:"Do you want to delete the "+l+" items?"},function(clicked) {
                                        if(clicked) {
                                            $(".fold:visible .selected").children().each(function(i) {
                                                folder.deleteFileFolder($(this).parent(),post,true);
                                                $(this).parent().removeClass("selected")
                                            });
                                        }
                                    });
                                }else {
                                    folder.deleteFileFolder(_this,post);
                                }
                            }]
                        ]);
                     }
                }
            });

            $(document.body).on("dblclick",".folder",function() {
                loadFolder(this);
            })
            $(document.body).on("click",".folder",function() {
                if(addon == "openFolder" || addon == "upload") {
                    $("#addon input").val($(this).attr("title"));
                    selectedFile = this;
                }
            });;
            $(document.body).on("dblclick",".file",function() {
                if(addon == "open") {
                    var folder = user+"/"+$(this).parent().parent().attr("data-Folder-Name")+"/"+$(this).attr("title");
                    post.post("fileChosen","ColumbusKey3",null,{path:folder});
                }else {
                    post.post("openInApp","ColumbusKey14",null,{title:$(this).attr("title"),parentFolder:$(this).parent().parent().attr("data-Folder-Name")});
                }
            }).on("click",".file",function() {
                if(addon == "open") {
                    $("#addon input").val($(this).find(".attl").text())
                    selectedFile = this;
                }
            });

            $("#doButton").click(function() {
                if(addon == "save") {
                    var path = $(".fold:visible").attr("data-Folder-Name")+"/"+$("#addon input").val();
                    post.post("fileNameChosen","ColumbusKey4",null,{folderName:$(".fold:visible").attr("data-Folder-Name"),
                                                                    path:path,
                                                                    name:$("#addon input").val()});
                }else if(addon == "open") {
                    var folder = user+"/"+$(selectedFile).parent().parent().attr("data-Folder-Name")+"/"+$(selectedFile).attr("title");
                    post.post("fileChosen","ColumbusKey3",null,{path:folder});
                }else if(addon == "openFolder") {
                    var title = $(selectedFile).children().attr("title");
                    var dir = $(selectedFile).parent().parent().attr("data-Folder-Name")+"/"+title;
                    post.post("folderSelected",null,"ColumbusKey16",{path:dir})
                }else if(addon == "upload") {
                    var folder = user+"/"+$(selectedFile).parent().parent().attr("data-Folder-Name")+"/"+$(selectedFile).attr("title");
                    post.post("fileChosen","ColumbusKey",null,{path:folder,name:$(selectedFile).attr("title")});
                }
            });

            $("#upDir").click(function() {
                folder.traverseFolder();
            });

            $("#pageSearchBar").focus(function() {
                $("#goBttn").show();
            });
            $("#goBttn").click(function() {
                $("#goBttn").hide();
                var sv = $("#pageSearchBar").val();
                //sv = sv.replace("/","")
                var can = true;
                if($("#pageSearchBar").val() != SV || $("#pageSearchBar").val() != SV+"/") {
                    if($(".fold[data-Folder-Name='"+sv+"']").length
                       != 0) {
                        $(".fold").hide();
                        $(".fold[data-Folder-Name='"+sv+"']").show();
                        if($(".fold[data-Folder-Name='"+sv+"']").children().length
                           == 0) {
                               link++;
                               icon.addTable(".fold[data-Folder-Name='"+sv+"']",link);
                               folder.loadFolder(".fold[data-Folder-Name='"+sv+"']",post,sv);
                        }
                        can = true;
                    }else {
                        link++;
                        post.post("checkExistence","ColumbusKey13",null,{path:sv,isFolder:true});
                        post.once("existenceChecked","ColumbusKey13",function(data) {
                            if(data.exists) {
                                $(".fold").hide();
                                $("#middle").append("<div class = 'fold' data-Folder-Name='"+sv+"' title = '"+sv+"'></div>");
                                $(".fold[data-Folder-Name='"+sv+"']").show();
                                icon.addTable(".fold[data-Folder-Name='"+sv+"']",link);
                                folder.loadFolder(".fold[data-Folder-Name='"+sv+"']",post,sv);
                                can = true;
                            }else {
                                api.notification("'"+sv+"/' doesn't exist");
                                $("#pageSearchBar").val(SV);
                                can = false;
                            }
                        });
                    }
                    if(can) {
                        $("#pageSearchBar").val(sv+"/");
                        SV = sv;
                    }
                    index++;
                    hstry[index] = sv;
                    hstry.length = index+1;
                    $(".favFoldButton").removeClass("blue");
                    $("#"+sv).addClass("blue");
                }
            });
            $("#goUp").click(function() {
                if(index != 1) {
                    index--;
                    $(".fold").hide();
                    $(".fold[data-folder-Name='"+hstry[index]+"']").show();
                    $("#pageSearchBar").val(hstry[index]+"/");
                    if($("#"+hstry[index]).length != 0) {
                        $(".favFoldButton").removeClass("blue");
                        $("#"+hstry[index]).addClass("blue");
                    }
                }
            });
            $("#goDown").click(function() {
                if(index != hstry.length-1) {
                    index++;
                    $(".fold").hide();
                    $(".fold[data-folder-Name='"+hstry[index]+"']").show();
                    $("#pageSearchBar").val(hstry[index]+"/");
                    if($("#"+hstry[index]).length != 0) {
                        $(".favFoldButton").removeClass("blue");
                        $("#"+hstry[index]).addClass("blue");
                    }
                }
            });

            $("#srchBttns").click(function() {
                if($(this).hasClass("cncleSrch")) {
                    $(".fold:visible").find(".td").show();
                    $("#srchBttn").removeClass("cncleSrch");
                    $("#search").val("");
                }
                var text = $("#search").val();
                var amnt = 0;
                var _this = this;
                if(text != "" && !$(this).hasClass("cncleSrch")) {
                    $(_this).addClass("cncleSrch");
                    $(".fold:visible").find(".td").each(function(){
                        var ttl = $(this).children().attr("title");
                        if(ttl.toUpperCase().indexOf(text.toUpperCase()) == -1){
                            $(this).hide();
                            amnt++;
                        }
                        if(amnt == $(".fold:visible").find(".file,.folder").length) {
                            $(".td").show();
                            $(_this).removeClass("cncleSrch");
                        }
                    });
                }
            });
            $("#search").on("input",function() {
                $("#srchBttn").removeClass("cncleSrch");
                if($("#search").val() == "") {
                    $(".fold:visible").find(".file,.folder").parent().show();
                }else {
                    $(".file,.folder").parent().show();
                    var list = $(".file,.folder").filter(function() {
                        return $(this).text().indexOf($("#search").val()) ==-1;
                    });
                    console.log(list)
                    if(list.length != $(".file,.folder").length) {
                        list.parent().hide();
                    }else {
                        $(".file,.folder").parent().hide();
                        api.notification("No file could be found containing this text!")
                    }
                }
            });

            function loadFolder(_this) {
                var fldr = $(_this).parent().parent().attr("data-Folder-Name")+"/"
                +$(_this).attr("title");
                if($(".fold[data-Folder-Name='"+fldr+"']").length == 0) {
                    $("#middle").append("<div class = 'fold' data-Folder-Name='"+fldr+"' title = '"+$(_this).attr("title")+"'></div>");
                    icon.addTable(".fold[data-Folder-Name='"+fldr+"']",link);
                    folder.loadFolder(".fold[data-Folder-Name='"+fldr+"']",post,fldr);
                    $(".fold[data-Folder-Name='"+fldr+"']").nuSelectable({
                        items:".td",
                        selectionClass: 'selection-box',
                        selectedClass: 'selected',
                        autoRefresh: true,
                        onSelect:function(){
                            $(".fold:hidden .td").removeClass("selected");
                            $(".td:empty").removeClass("selected")
                        },
                        onUnSelect:function(){},
                        onClear:function(){}
                    });
                }
                $(".fold").hide();
                $(".fold[data-Folder-Name='"+fldr+"']").show();
                $("#pageSearchBar").val(fldr+"/");
                index++;
                hstry[index] = fldr;
                hstry.length = index+1;
            }
        });
    });
});
