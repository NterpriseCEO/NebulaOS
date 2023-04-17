require(["Desktop/menus","alert"],function(menu,alrt) {
    var copy;
    var toCut = false;
    $(document.body).on("mouseup",".td",function(e) {
        var _this = this;
        if(e.button == 2 && $(_this).parent().attr("class") != "table5 folderTable") {
            if($(_this).children().length == 0) {
                menu.menu(e,[
                    ["New File",function() {
                        alrt.type({header:"New File",displayText:"Choose A File Name"},function(name,clicked) {
                            if(clicked) {
                                if(!/[^a-zA-Z0-9\.\-\_]/.test(name)) {
                                    saveFile(_this,name,false)
                                }else {
                                    alrt.notification("Error","Alphanumeric and dots only please");
                                }
                            }
                        });
                    }],
                    ["New Folder",function() {
                        alrt.type({header:"New Folder",displayText:"Choose Folder Name"},function(name,clicked) {
                            if(clicked) {
                                if(!/[^a-zA-Z0-9\.\-\_]/.test(name)) {
                                    saveFile(_this,name,true)
                                }else {
                                    alrt.notification("Error","Alphanumeric and dots only please");
                                }
                            }
                        });
                    }],
                    ["Paste",function() {
                        if(copy != undefined) {
                            if(typeof copy == "object" && copy.length != undefined) {
                                for(var i = 0; i < copy.length;i++) {
                                    copyFile(copy[i],_this,true);
                                }
                            }else {
                                copyFile(copy,_this);
                            }
                        }
                    }]
                ]);
            }else {
                menu.menu(e,[
                    ["Open",function() {
                        if($(_this).children().attr("class") == "folder") {
                            require(["Desktop/applications"],function(app) {
                                var APP = app.app({src:ngrok+"Applications/Columbus.app/"});
                                post.once("ready","all",function(data,key,sender) {
                                    post.post("appEvent",key,sender,{path:$(_this).parent().parent().attr("data-Folder-Name"),title:$(_this).children().attr("title"),type:"dialogueShowFolder"});
                                });
                            });
                        }else {
                            open(_this,$(_this).parent().parent().attr("data-Folder-Name"),"");
                        }
                    }],
                    ["Open With",function() {
                        $("#openWithModal").modal().modal("open");
                        openWith(_this,$(_this).parent().parent().attr("data-Folder-Name"));
                    }],
                    ["Copy",function() {
                        if($(_this).hasClass("selected")) {
                            copy = [];
                            $(".folderTable:visible .selected").children().each(function(i) {
                                copy[i] = $(this).parent();
                            });
                        }else {
                            copy = _this;
                        }
                        toCut = false;
                    }],
                    ["Cut",function() {
                        if($(_this).hasClass("selected")) {
                            copy = [];
                            $(".folderTable:visible .selected").children().each(function(i) {
                                copy[i] = $(this).parent();
                            });
                        }else {
                            copy = _this;
                        }
                        toCut = true;
                    }],
                    ["Rename",function() {
                        rename(_this);
                    }],
                    ["Delete",function() {
                        var type = $(_this).children()
                        .hasClass("folder")?"folder":"file";
                        if($(_this).hasClass("selected")) {
                            var l = $(".folderTable:visible .selected").children().length;
                            alrt.confirm({header:"Confirm",displayText:"Do you want to delete the "+l+" items?"},function(clicked) {
                                if(clicked) {
                                    $(".folderTable:visible .selected").children().each(function(i) {
                                        deleteItem($(this).parent());
                                        $(this).parent().removeClass("selected")
                                    });
                                }
                            });
                        }else {
                            alrt.confirm({header:"Confirm",displayText:"Do you want to delete this "+type+"?"},function(clicked) {
                                if(clicked) {
                                    deleteItem(_this);
                                }
                            });
                        }
                    }]
                ]);
            }
        }
    });
    $(document.body).on("dblclick",".folder",function() {
        var _this = this;
        require(["Desktop/applications"],function(app) {
            app.app({src:ngrok+"Applications/Columbus.app/"});
            post.once("ready","all",function(data,key,sender) {
                post.post("appEvent",key,sender,{path:$(_this).parent().parent().parent().attr("data-Folder-Name"),title:$(_this).parent().children().attr("title"),type:"dialogueShowFolder"});
            });
        });
    });
    $(document.body).on("dblclick",".file",function(e) {
        open($(this).parent(),$(this).parent().parent().parent().attr("data-Folder-Name"));
    });

    function open(td,parentFolder) {
        var title = $(td).children().attr("title");
        $.getJSON(ngrok+"public/js/defaults.json",function(result) {
            var array = $.map(result,function(value) {
                return [value];
            });
            for(var i = 0; i < array.length;i++) {
                if(title.endsWith(array[i][0])) {
                    var path = parentFolder+"/"+title;
                    require(["Desktop/applications"],function(app) {
                        app.app({src:array[i][1]});
                        post.once("ready","all",function(data,key,sender) {
                            post.post("openFile",key,sender,{path:path});
                        });
                    });
                    break;
                }
            }
        });
    }
    function openWith(td,parentFolder) {
        var title = $(td).children().attr("title");
        var location = parentFolder+"/"+title;
        $.getJSON(ngrok+"public/js/defaults.json",function(result) {
            var array = $.map(result,function(value) {
                return [value];
            });
            $("#modalCollection").html("");
            for(var i = 0; i < array.length;i++) {
                if(title.endsWith(array[i][0])) {
                    for(var o = 0; o <array[i].length-1;o++) {
                        console.log(o)
                        var icon = $(".icon[data-src='"+array[i][o+1]+"']");
                        var c = $('<div>').append(icon.clone()).html();
                        $("#modalCollection").append("<li class = 'collection-item'>"+c+icon.attr("title")+"</li>")
                    }
                    break;
                }
            }
            $("#modalCollection .collection-item").click(function() {
                var _this = this;
                require(["Desktop/applications"],function(app) {
                    $(".modal").modal("close");
                    app.app({src:$(_this).find(".icon").attr("data-src")});
                    post.once("ready","all",function(data,key,sender) {
                        post.post("openFile",key,sender,{path:location});
                    });
                });
            });
        });
    }
    function saveFile(td,name,isFolder) {
        var folderName = parent.$("#usernameDisplay").text()+
        "/"+$(td).parent().parent().attr("data-Folder-Name")+
        "/"+name;
        socket.emit("checkExistence",{path:folderName,isFolder});
        socket.once("existenceChecked",function(data) {
            if(!data.exists) {
                socket.emit("saveFile",{path:folderName,isFolder:isFolder});
                socket.once("fileSaved",function() {
                    if(!isFolder) {
                        $(td).append("<div class = 'file'><div class = 'fType'><div class='attl' title='"+name+"'>"+name+"</div></div></div>");
                        var ext = name.substr(name.lastIndexOf("."));
                        ext = ext.substr(1);
                        $(td).attr("title",name).find(".fType")
                        .css("backgroundImage","url('"+window.location.protocol + "//" + window.location.host+"/public/images/"+ext+".png')");
                    }else {
                        $(td).append("<div class = 'folder' title='"+name+"'><div class='attl' title='"+name+"'>"+name+"</div></div>");
                        if(name.endsWith(".app")) {
                            $(td).find(".folder").addClass("appFolder");
                        }
                    }
                    $(td).children().attr("title",name);
                });
            }
        });
    }
    function rename(td) {
        var isFolder = $(td).children().attr("class") ==
        "folder"?"folder":"file";
        alrt.type({header:"Rename",displayText:"Choose a new name for this "+isFolder},function(name,clicked) {
            if(clicked) {
                if(!/[^a-zA-Z0-9\.\-\_]/.test(name)) {
                    var path = $("#usernameDisplay").text()+"/"
                    +$(td).parent().parent().attr("data-Folder-Name")+"/";
                    var nme = $(td).children().attr("title");
                    var ext = nme.substr(nme.lastIndexOf("."));
                    var title = $(td).children().attr("class") ==
                    "folder"? name:name+ext;
                    var newPath = path+title;
                    socket.emit("renameFileFolder",{oldPath:path+nme,newPath:newPath});
                    socket.once("renamed",function() {
                        $(td).children().attr("title",title);
                        $(td).find(".attl").text(title).attr("title",title);
                    });
                }else {
                    alrt.notification("Error","Alphanumeric and dots only please");
                }
            }
        });
    }
    function deleteItem(td) {
        var done = false;
        var isFolder = $(td).children().hasClass("folder")?true:false;
        socket.emit("deleteFile",{path:$("#usernameDisplay").text()+
                  "/"+$(td).parent().parent().attr("data-Folder-Name")+
                  "/"+$(td).children().attr("title"),isFolder:isFolder});
        socket.once("deleted",function() {
            if(!done) {
                $(td).children().remove();
            }
        });
        socket.once("cannotDelete",function() {
            alrt.notification("Error","Cannot Delete Folder.");
            done = true;
            return;
        });
    }
    function copyFile(_this,_that,multiple) {
        if($(_that).parent() != $(_this).parent()) {
            var dir = $("#usernameDisplay").text()+
                      "/"+$(_this).parent().parent().attr("data-Folder-Name")+
                      "/"+$(_this).children().attr("title");
            var newPath = $("#usernameDisplay").text()+
                      "/"+$(_that).parent().parent().attr("data-Folder-Name")+
                      "/"+$(_this).children().attr("title");
            socket.emit("copyFile",{path:dir,newPath:newPath,cut:toCut});
            socket.once("pasted",function() {
                if(multiple) {
                    $(".folderTable:visible .td:empty:first").append($(_this).children().clone());
                }else {
                    $(_that).append($(_this).children().clone());
                }
                if(toCut) {
                    $(_this).remove();
                }
            });
        }
    }
});
