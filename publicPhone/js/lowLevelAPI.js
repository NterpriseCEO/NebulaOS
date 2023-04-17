require(["../../public/js/NebulaPM"],function() {
    post = new SecurePost();
    post.on("getUsername","all",function(data,key,sender) {
        post.post("usernameGotten",key,sender,{username:$("#usernameDisplay").text()});
    });

    post.on("changeLanguage","all",function(data) {
        lang = data;
        $.getJSON("langs/"+lang+".json",function(result2) {
            C = result2;
            for(var prop in C) {
                if(C.hasOwnProperty(prop)) {
                    $("*[data-text='"+prop+"']").text(C[prop]);
                }
            }
            d = [C.sun,C.mon,C.tues,C.wed,C.thurs,C.fri,C.sat];
            m = [C.jan,C.feb,C.mar,C.apr,C.may,C.june,
                C.july,C.aug,C.sept,C.oct,C.nov,C.dec];
        });
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
    post.on("getContents","all",function(data,key,sender) {
        var location = $("#usernameDisplay").text()+"/"+data.path;
        if(location.endsWith(".png") || location.endsWith(".jpg")) {
            socket.emit("getImageFile",{path:location});
        }else if(location.endsWith(".mp4")) {
            post.post("contentsGotten",key,sender,window.location.protocol + "//" + window.location.host+"/public/userData/"+location);
        }else {
            socket.emit("getContents",{path:location});
        }
        socket.once("contentsGotten",function(data2) {
            var exists = (data2.error == null || data2.error.code != "ENOENT");
            post.post("contentsGotten",key,sender,{contents:data2.contents,path:location,exists:exists});
        });
    });
    post.on("changeBG","all",function(data) {
        var val = data.value;
        if(val.endsWith(".png')")) {
            val = val.substr(0,5) +"../public/"+val.substr(5);
        }
        var type = "background"+data.type;
        $("#osWrap").css(type,val);
        $("#osWrap").css("backgroundSize",data.bgSize)
        $("#osWrap").css("backgroundRepeat",data.bgRepeat);
    });
    post.on("saveAppearance","all",function(data) {
        socket.emit("saveAppearance",{user:$("#usernameDisplay").text(),
                                      image:$("#osWrap").css("backgroundImage"),
                                      bgSize:$("#osWrap").css("backgroundSize"),
                                      bgRepeat:$("#osWrap").css("backgroundRepeat"),
                                      bgColor:$("#osWrap").css("backgroundColor"),
                                      randomBG:data.randomBG});
    });
    post.on("saveUserSettings","all",function(data) {
        socket.emit("saveUserSettings",{avatar:data.avatar,
                                        nickname:data.nickname,
                                        user:$("#usernameDisplay").text()});
    });
    post.on("addApp","all",function(data) {
        require(["desktop/icons","../../public/js/alert"],function(icon,alrt) {
            if($(".Applications").find(".icon[title='"+data.title+"']").length == 0) {
                icon.addApp(data.path,data.title,false);
                alrt.notification(C.complete,'"'+data.title+C.installed);
            }
        });
    });
    post.on("confirmAlert","all",function(data,key,sender) {
        require(["../../public/js/alert"],function(alrt) {
            alrt.confirm({displayText:data.displayText,cancel:data.cancel,ok:data.ok},function(clicked) {
                if(clicked) {
                    post.post("confirmDone",key,sender,true);
                }else {
                    post.post("confirmDone",key,sender,false);
                }
            });
        });
    });
    post.on("typeAlert","all",function(data,key,sender) {
        require(["../../public/js/alert"],function(alrt) {
            alrt.type({displayText:data.displayText,cancel:data.cancel,ok:data.ok},function(input,clicked) {
                if(clicked) {
                    post.post("typedDone",key,sender,{input:input,clicked:true});
                }else {
                    post.post("typedDone",key,sender,{clicked:false});
                }
            });
        });
    });
    post.on("readDir","all",function(data,key,sender) {
        socket.emit("readDir",{path:$("#usernameDisplay").text()+"/"+data.path});
        socket.once("folderContents",function(data2) {
            post.post("folderContents",key,sender,{files:data2.files,folders:data2.folders,empty:data.empty});
        });
    });
    post.on("saveFile","all",function(data,key,sender) {
        socket.emit("saveFile",{path:"/"+$("#usernameDisplay").text()+data.path,contents:data.contents,isFolder:data.isFolder});
        socket.once("fileSaved",function() {
            post.post("fileSaved",key,sender)
        });
    });
    post.on("deleteFile","all",function(data,key,sender) {
        require(["../../public/js/alert"],function(alrt) {
            socket.emit("deleteFile",{path:"/"+$("#usernameDisplay").text()+data.path,isFolder:data.isFolder,
            deleteRecursive:data.deleteRecursive});
            socket.once("deleted",function(data2) {
                post.post("deleted",key,sender);
            });
            socket.once("cannotDelete",function() {
                alrt.notification(C.error,C.columbusSailed);
            });
        });
    });
    post.on("uploadFolder","all",function(data,key,sender) {
        require(["Desktop/applications"],function(app) {
            var APP = app.app({src:"../Applications/Columbus.app/",inApp:true});
            post.once("ready","all",function(data,key2,sender2) {
                post.post("appEvent",key2,sender2,{type:"dialogueUploadFile"});
            });
            post.once("fileChosen","all",function(data2,key2,sender2) {
                var newFolder = data.path+data2.name;
                socket.emit("copyFile",{path:$("#usernameDisplay").text()+"/"+data2.path,newPath:newFolder});
                socket.once("pasted",function() {
                    APP.close();
                    post.post("uploaded",key,sender,{path:newFolder});
                });
            });
            post.once("canceled","all",function() {
                APP.close();
                post.post("canceled",key,sender);
            });
        });
    });
    post.on("openFile","all",function(data,key,sender) {
        require(["Desktop/applications"],function(app) {
            var APP = app.app({src:"../Applications/Columbus.app/",inApp:true});
            post.once("ready","all",function(data,key2,sender2) {
                post.post("appEvent",key2,sender2,{type:"dialogueOpenFile"});
            });
            post.once("canceled","all",function() {
                APP.close();
                post.post("canceled",key,sender);
            });
            post.once("fileChosen","all",function(data2) {
                var path = $("#usernameDisplay").text()+"/"+data2.path;
                var supExts = data.supExts;
                for(var i = 0; i < supExts.length;i++) {
                    if(path.endsWith(supExts[i]) || supExts[i] == "all") {
                        if(path.endsWith(".png") || path.endsWith(".jpg")) {
                            socket.emit("getImageFile",{path:path});
                        }else if(path.endsWith(".docx")) {
                            socket.emit("getDocxFile",{path:path});
                        }else if(path.endsWith(".mp4")) {
                            APP.close();
                            post.post("fileOpened",key,sender,window.location.protocol + "//" + window.location.host+"/public/userData/"+path);
                        }else if(supExts == "all"){
                            socket.emit("getContents",{path:path});
                        }
                        socket.once("contentsGotten",function(data3) {
                            APP.close();
                            post.post("fileOpened",key,sender,{contents:data3.contents,path:path});
                        });
                        break;
                    }else if(i == supExts.length && !path.endsWith(supExts[i])){
                        alrt.notification(C.error,c.wrongFileType);
                        break;
                    }
                }
            });
        });
    });
    post.on("saveFileDialogue","all",function(data,key,sender) {
        require(["desktop/applications"],function(app) {
            var APP = app.app({src:"../Applications/Columbus.app/",inApp:true});
            post.once("ready","all",function(data,key2,sender2) {
                post.post("appEvent",key2,sender2,{type:"dialogueSaveFile"});
            });
            post.once("canceled","all",function() {
                APP.close();
            });
            post.on("fileNameChosen","all",function(data2) {
                socket.emit("checkExistence",{path:$("#usernameDisplay").text()+"/"+data2.path});
                socket.once("existenceChecked",function(data3) {
                    if(!data3.exists) {
                        saveFile(data2);
                    }else {
                        require(["alert"],function(alrt) {
                            alrt.confirm({displayText:C.fileExists},function(clicked) {
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
                    post.post("fileSaved",key,sender,{path:data2.path,name:data2.name});
                }
            });
        });
    });

    post.on("renameFileFolder","all",function(data,key,sender) {
        var root = $("#usernameDisplay").text()+"/";
        socket.emit("renameFileFolder",{oldPath:root+data.oldPath,newPath:root+data.newPath});
        socket.once("renamed",function() {
            post.post("renamed",key,sender);
        });
    });
    post.on("copyFile","all",function(data,key,sender) {
        socket.emit("copyFile",{path:$("#usernameDisplay").text()+"/"+data.path,
                                newPath:$("#usernameDisplay").text()+"/"+data.newPath,cut:data.cut});
        socket.once("pasted",function() {
            post.post("pasted",key,sender);
        });
    });

    post.on("createRoom","all",function(data,key,sender) {
        socket.emit("createRoom",{room:data.room,name:data.user});
    });
    post.on("sendMessage","all",function(data,key,sender) {
        socket.emit("sendMessage",{user:$("#usernameDisplay").text(),receiver:data.receiver,message:data.message});
    });
    post.on("checkForMessages","all",function(data,key,sender) {
        socket.on("message",function(data2) {
            post.post("message","all",sender,{user:data2.user,message:data2.message});
        });
    });
    post.on("openApp","all",function(data,key,sender) {
        $(".attl").each(function() {
            if($(this).text().indexOf(data.title) > -1) {
                var _this = this;
                require(["desktop/applications"],function(app) {
                    app.app({src:$(_this).parent().attr("data-src"),inApp:data.inApp});
                    post.once("ready","all",function(data2,key2,sender2) {
                        post.post("appEvent",key2,sender2,{inApp:data.inApp});
                    });
                });
            }
        });
    });
});
