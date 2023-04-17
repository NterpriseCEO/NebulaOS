require(["NebulaPM"],function() {
    post = new SecurePost();
    post.on("ready","ForceCode0",function(data,key,sender) {
        forceQuit = sender;
    });
    post.on("getUsername","all",function(data,key,sender) {
        post.post("usernameGotten",key,sender,{username:$("#usernameDisplay").text()});
    });
    post.on("changeLanguage","all",function(data) {
        lang = data;
        /*$.getJSON("langs/"+lang+".json",function(result2) {
            C = result2;
            for(var prop in C) {
                if(C.hasOwnProperty(prop)) {
                    $("*[data-text='"+prop+"']").text(C[prop]);
                }
            }
            d = [C.sun,C.mon,C.tues,C.wed,C.thurs,C.fri,C.sat];
            m = [C.jan,C.feb,C.mar,C.apr,C.may,C.june,
                C.july,C.aug,C.sept,C.oct,C.nov,C.dec];
        });*/
    });
    post.on("getLanguage","all",function(data,key,sender) {
        post.post("languageGotten",key,sender,{language:lang});
    });
    post.on("checkExistence","all",function(data,key,sender) {
        socket.emit("checkExistence",{path:$("#usernameDisplay").text()+"/"+data.path,isFolder:data.isFolder});
        socket.once("existenceChecked",function(data2) {
            post.post("existenceChecked",key,sender,{exists:data2.exists});
        });
        socket.once("contentsGotten",function(data2) {
            post.post("contentsGotten",key,sender,data2.contents);
        });
    });
    post.on("saveFile","all",function(data,key,sender) {
        socket.emit("saveFile",{path:"/"+$("#usernameDisplay").text()+"/"+data.path,contents:data.contents,isFolder:data.isFolder});
        if($(".folder-view[data-Folder-Name='"+data.folderName+"']").is(":visible")) {
            var td = $(".folder-view[data-Folder-Name='"+data.folderName+"']").find(".td:empty:first");
            if(data.isFolder) {
                $(td).append("<div class = 'folder'></div><div class='attl' title='"+data.name+"'>"+data.name+"</div>");
                $(td).children().attr("title",data.name);
                if(data.name.endsWith(".app")) {
                    $(td).find(".folder").addClass("appFolder");
                }
            }else {
                var name = data.name.substr(data.name.lastIndexOf("."));
                name = name.substr(1);
                $(td).append("<div class = 'file'><div class = 'fType'></div><div class='attl' title='"+data.name+"'>"+data.name+"</div></div>");
                $(td).children().attr("title",data.name)
                .css("backgroundImage","url('"+window.location.protocol + "//" + window.location.host+"/public/images/"+name+".png')");
            }
        }
        socket.once("fileSaved",function() {
            post.post("fileSaved",key,sender)
        });
    });
    post.on("readDir","all",function(data,key,sender) {
        socket.emit("readDir",{path:$("#usernameDisplay").text()+"/"+data.path});
        socket.once("folderContents",function(data2) {
            post.post("folderContents",key,sender,{files:data2.files,folders:data2.folders,empty:data.empty,path:data.path});
        });
    });
    post.on("getContents","all",function(data,key,sender) {
        var rand = Math.floor(Math.random() * 10000000000);
        var location = $("#usernameDisplay").text()+"/"+data.path;
        if(location.endsWith(".png") || location.endsWith(".jpg")) {
            socket.emit("getImageFile",{path:location,rand:rand});
        }else if(location.endsWith(".mp4")) {
            post.post("contentsGotten",key,sender,ngrok+"public/userData/"+location);
        }else {
            socket.emit("getContents",{path:location,rand:rand});
        }
        var check = socket.on("contentsGotten",function(data2) {
            socket.off({id:check});
            if(data2.rand == rand) {
                //var exists = (data2.error === undefined || (data.error != null?data2.error.code != "ENOENT":true));
                var exists;
                if(data2.error != null) {
                    console.log(data2.error.code)
                    exists = data2.error.code == "ENOENT"?false:false;
                }else if(data2.error === null) {
                    exists = true;
                }

                post.post("contentsGotten",key,sender,{contents:data2.contents,path:location,exists:exists});
            }
        });
    });
    post.on("copyFile","all",function(data,key,sender) {
        console.log(data.path)
        socket.emit("copyFile",{path:$("#usernameDisplay").text()+"/"+data.path,
                                newPath:$("#usernameDisplay").text()+"/"+data.newPath,cut:data.cut,isFolder:data.isFolder});
        socket.once("pasted",function() {
            var dir = data.newPath;
            if((dir.match(/\//g) || []).length == 2) {
                var folder = dir.substr(0,dir.lastIndexOf("/")).substr(1);
                var name = dir.substring(dir.lastIndexOf("/")+1);
                var td = $("."+folder).find(".td:empty:first");
                if($("."+folder).children().attr("data-loaded") == "true") {
                    if(!data.isFolder) {
                        var ext = dir.substr(dir.lastIndexOf("."));
                        ext = ext.substr(1);
                        $(td).append("<div class = 'file'><div class = 'fType'></div><div class='attl' title='"+name+"'>"+name+"</div></div>");
                        $(td).children().attr("title",name).find(".fType")
                        .css("backgroundImage","url('"+window.location.protocol + "//" + window.location.host+"/public/images/"+ext+".png')");
                    }else {
                        $(td).append("<div class = 'folder' title='"+name+"'></div><div class='attl' title='"+name+"'>"+name+"</div>");
                    }
                }
                if(data.cut) {
                    var oldDir = data.path;
                    var oldFolder = oldDir.substr(0,oldDir.lastIndexOf("/")).substr(1);
                    var td2 = $("."+oldFolder).find("div[title='"+name+"']").parent();
                    $(td2).children().remove();
                }
            }
            post.post("pasted",key,sender);
        });
    });
    post.on("deleteFile","all",function(data,key,sender) {
        require(["alert"],function(alrt) {
            socket.emit("deleteFile",{path:$("#usernameDisplay").text()+data.path+"/",isFolder:data.isFolder,
            deleteRecursive:data.deleteRecursive});
            socket.once("deleted",function(data2) {
                $(".folder-view[data-Folder-Name='"+data.clss+"']").find("div[title='"+data.title+"']").remove();
                post.post("deleted",key,sender);
            });
            socket.once("cannotDelete",function() {
                alrt.notification("Error","Columbus sailed the ocean blue,\
                and he <i><u>STILL</u></i> can't delete this folder");
            });
        });
    });
    post.on("renameFileFolder","all",function(data,key,sender) {
        var root = $("#usernameDisplay").text()+"/";
        socket.emit("renameFileFolder",{oldPath:root+data.oldPath,newPath:root+data.newPath});
        socket.once("renamed",function() {
            post.post("renamed",key,sender,{failed:data.failed});
        });
    });
    post.on("sendMessage","all",function(data,key,sender) {
        socket.emit("sendMessage",{user:$("#usernameDisplay").text(),message:data.message,receiver:data.receiver});
    });
    post.on("checkForMessages","all",function(data,key,sender) {
        socket.on("message",function(data2) {
            post.post("message","all",sender,{user:data2.user,message:data2.message});
        });
    });
    post.on("createRoom","all",function(data,key,sender) {
        socket.emit("createRoom",{room:data.room,name:data.user});
    });
    post.on("uploadFolder","all",function(data,key,sender) {
        require(["Desktop/applications"],function(app) {
            var APP = app.app({src:"../Applications/Columbus.app/",inApp:true});
            post.once("ready","all",function(data,key2,sender2) {
                post.post("appEvent",key2,sender2,{type:"dialogueUploadFile"});
            });
            var canSend = true;
            APP.onClose(function() {
                canSend = false;
                post.post("canceled",key,sender);
            });
            post.once("fileChosen","all",function(data2,key2,sender2) {
                if(canSend) {
                    var newFolder = data.path+data2.name;
                    socket.emit("copyFile",{path:data2.path,newPath:newFolder});
                    socket.once("pasted",function() {
                        APP.close();
                        post.post("uploaded",key,sender,{path:newFolder});
                    });
                }
            });
        });
    });
    post.on("openFile","all",function(data,key,sender) {
        var canSend = true;
        require(["Desktop/applications"],function(app) {
            var APP = app.app({src:"../Applications/Columbus.app/",inApp:true});
            APP.onClose(function() {
                canSend = false;
                post.post("canceled",key,sender);
            });
            post.once("ready","all",function(data,key2,sender2) {
                post.post("appEvent",key2,sender2,{type:"dialogueOpenFile"});
            });
            post.once("fileChosen","all",function(data2) {
                if(canSend) {
                    var path = data2.path;
                    var supExts = data.supExts;
                    for(var i = 0; i < supExts.length;i++) {
                        if(path.endsWith(supExts[i]) || supExts[i] == "all") {
                            if(path.endsWith(".png") || path.endsWith(".jpg")) {
                                socket.emit("getImageFile",{path:path});
                            }else if(path.endsWith(".docx")) {
                                socket.emit("getDocxFile",{path:path});
                            }else if(path.endsWith(".mp4") || path.endsWith(".webm")) {
                                APP.close();
                                post.post("fileOpened",key,sender,ngrok+"public/userData/"+path);
                            }else if(supExts == "all"){
                                socket.emit("getContents",{path:path});
                            }else {
                                socket.emit("getContents",{path:path});
                            }
                            socket.once("contentsGotten",function(data3) {
                                APP.close();
                                post.post("fileOpened",key,sender,{contents:data3.contents,path:path});
                            });
                            break;
                        }else if(i == supExts.length && !path.endsWith(supExts[i])){
                            alrt.notification("Error","Wrong file type!");
                            break;
                        }
                    }
                }
            });
        });
    });
    post.on("saveFileDialogue","all",function(data,key,sender) {
        require(["Desktop/applications"],function(app) {
            var APP = app.app({src:"../Applications/Columbus.app/",inApp:true});
            post.once("ready","all",function(data,key2,sender2) {
                post.post("appEvent",key2,sender2,{type:"dialogueSaveFile"});
            });
            post.on("fileNameChosen","all",function(data2) {
                socket.emit("checkExistence",{path:$("#usernameDisplay").text()+"/"+data2.path});
                socket.once("existenceChecked",function(data3) {
                    if(!data3.exists) {
                        saveFile(data2);
                    }else {
                        require(["alert"],function(alrt) {
                            alrt.confirm({header:"Confirm",displayText:"File exists, do you wish to override it?"},function(clicked) {
                                if(clicked) {
                                    saveFile(data2);
                                }
                            });
                        });
                    }
                });
                function saveFile(data2) {
                    socket.emit("saveFile",{path:$("#usernameDisplay").text()+"/"+data2.path,contents:data});
                    APP.close();
                    if($(".folder-view[data-Folder-Name='"+data2.folderName+"']").is(":visible")) {
                        var td = $(".folder-view[data-Folder-Name='"+data2.folderName+"']").find(".td:empty:first");
                        var name = data2.name.substr(data2.name.lastIndexOf("."));
                        name = name.substr(1);
                        $(td).append("<div class = 'file'><div class = 'fType'></div></div>");
                        $(td).children().attr("title",data2.name)
                        .css("backgroundImage","url('"+window.location.protocol + "//" + window.location.host+"/public/images/"+name+".png')");
                    }
                    post.post("fileSaved",key,sender,{path:data2.path,name:data2.name});
                }
            });
        });
    });
    post.on("openFolderDialogue","all",function(data,key,sender) {
        require(["Desktop/applications"],function(app) {
            var APP = app.app({src:"../Applications/Columbus.app/",inApp:true});
            post.once("ready","all",function(data,key2,sender2) {
                post.post("appEvent",key2,sender2,{type:"dialogueOpenFolderContents"});
            });
            post.once("folderSelected","all",function(data2) {
                socket.emit("readDir",{path:$("#usernameDisplay").text()+"/"+data2.path});
                socket.once("folderContents",function(data3) {
                    APP.close();
                    post.post("folderSelected",key,sender,{files:data3.files,folders:data3.folders,path:data2.path,empty:data3.empty});
                });
            });
        });
    });
    post.on("typeAlert","all",function(text,key,sender) {
        require(["alert"],function(alrt) {
            alrt.type(text,function(input,clicked) {
                if(clicked) {
                    post.post("typedDone",key,sender,{input:input,clicked:clicked});
                }
            });
        });
    });
    post.on("notificationAlert","all",function(text) {
        require(["alert"],function(alrt) {
            alrt.notification("",text);
        });
    });
    post.on("confirmAlert","all",function(data,key,sender) {
        require(["alert"],function(alrt) {
            alrt.confirm({header:data.header,displayText:data.displayText},function(clicked) {
                if(clicked) {
                    post.post("confirmDone",key,sender,true);
                }else {
                    post.post("confirmDone",key,sender,false);
                }
            });
        });
    });
    post.on("changeBG","all",function(data) {
        var type = "background"+data.type;
        $(".box1").css(type,data.value);
        $(".box1").css("backgroundSize",data.bgSize)
        $(".box1").css("backgroundRepeat",data.bgRepeat);
    });
    post.on("saveAppearance","all",function(data) {
        socket.emit("saveAppearance",{user:$("#usernameDisplay").text(),
                                      image:$(".box1").css("backgroundImage"),
                                      bgSize:$(".box1").css("backgroundSize"),
                                      bgRepeat:$(".box1").css("backgroundRepeat"),
                                      bgColor:$(".box1").css("backgroundColor"),
                                      randomBG:data.randomBG});
    });
    post.on("saveUserSettings","all",function(data) {
        socket.emit("saveUserSettings",{avatar:data.avatar,
                                        nickname:data.nickname,
                                        user:$("#usernameDisplay").text()});
    });
    post.on("addApp","all",function(data) {
        require(["Desktop/icons","alert"],function(icon,alrt) {
            if($(".Applications").find(".icon[title='"+data.title+"']").length == 0) {
                icon.addApp(data.path,data.title,false);
                alrt.notification("Commplete!",'"'+data.title+'" was installed!');
            }
        });
    });
    post.on("openInApp","all",function(data) {
        $.getJSON(ngrok+"public/js/defaults.json",function(result) {
            var array = $.map(result,function(value) {
                return [value];
            });
            for(var i = 0; i < array.length;i++) {
                if(data.title.endsWith(array[i][0])) {
                    var path = data.parentFolder+"/"+data.title;
                    var evnt = data.event || "openFile";
                    var actn = data.action || {path:path};
                    require(["Desktop/applications"],function(app) {
                        app.app({src:array[i][1],path:"../../../"});
                        post.once("ready","all",function(data,key,sender) {
                            post.post(evnt,key,sender,actn);
                        });
                    });
                    break;
                }
            }
        });
    });

    post.on("openApp","all",function(data,key,sender) {
        if(data.path != undefined) {
            open(data.path,data.basic,data.event,data.action,data.isNebula);
        }else {
            var opened = false;
            $(".icon").each(function(i) {
                var _this = this;
                if($(this).attr("title") == data.name) {
                    opened = true;
                    require(["Desktop/applications"],function(app) {
                        app.app({src:$(_this).attr("data-src")});
                        post.post("openAppComplete",key,sender,{opened:true});
                    });
                    return;
                }else if(i+1 == $(".icon").length && !opened) {
                    post.post("openAppComplete",key,sender,{opened:false});
                }
            });
        }
        function open(path,basic,event,action,isNebula) {
            if(!basic) {
                path = "userData/"+$("#usernameDisplay").text()+"/"+path;
                $.getJSON(ngrok+"public/js/defaults.json",function(result) {
                    var array = $.map(result,function(value) {
                        return [value];
                    });
                    for(var i = 0; i < array.length;i++) {
                        if(path.endsWith(array[i][0])) {
                            var evnt = event || "openFile";
                            var actn = action || {path:path};
                            require(["Desktop/applications"],function(app) {
                                app.app({src:array[i][1]});
                                post.once("ready","all",function(data,key,sender) {
                                    post.post(evnt,key,sender,actn);
                                });
                            });
                            break;
                        }
                    }
                });
            }else {
                require(["Desktop/applications"],function(app) {
                    if(!isNebula) {
                        path = path.startsWith("../Applications")?path:"userData/"+$("#usernameDisplay").text()+"/"+path;
                    }
                    app.app({src:path});
                    post.once("ready","all",function(data,key,sender) {
                        post.post(event,key,sender,action);
                        post.post("appEvent",key,sender,{lang:lang});
                    });
                });
            }
        }
    });
    post.on("getOpenWithData","all",function(data,key,sender) {
        $.getJSON(ngrok+"public/js/defaults.json",function(result) {
            var array = $.map(result,function(value) {
                return [value];
            });
            $("#modalCollection").html("");
            for(var i = 0; i < array.length;i++) {
                if(data.title.endsWith(array[i][0])) {
                    for(var o = 0; o <array[i].length-1;o++) {
                        var icon = $(".icon[data-src='"+array[i][o+1]+"']");
                        var c = $('<div>').append(icon.clone()).html();
                        $("#modalCollection").append("<li class = 'collection-item'>"+c+icon.attr("title")+"</li>")
                    }
                    var str = $("#modalCollection").html();
                    post.post("appDataGotten",key,sender,{contents:str});
                    break;
                }
            }
        });
    });
    post.on("getOpenAppsData","all",function(data,key,sender) {
        var apps = [];
        for(var i = 0; i < $(".application-frame").length;i++) {
            apps[i] = [$(".application-frame:eq("+i+")").attr("data-OpenNumber"),$(".application-frame:eq("+i+") .title").text(), $(".application-frame:eq("+i+") iframe").attr("src")];
        }
        console.log(apps);
        post.post("appDataGotten",key,sender,{apps:apps});
    });
    post.on("closeApp","all",function(data) {
        require(["Desktop/applications"],function(app) {
            app.close(data.openNumber);
        });
    });
    post.on("loadWebpage","all",function(data,key,sender) {
        socket.emit("loadWebpage",{url:data.url});
        socket.once("pageContents",function(data2) {
            post.post("pageContents",key,sender,{html:data2.html})
        });
    });
});
