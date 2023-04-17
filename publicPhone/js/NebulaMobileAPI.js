define(function() {
    function saveFile(input,name,_this,supExts,path,socket,callback,doc) {
        require([path+"alert"],function(alrt) {
            var ext;
            var folderName = parent.$(_this,doc).attr("data-FolderName");
            var dir = prarent.$("#usernameDisplay").text()+"/"+folderName+"/"+name;
            var canComplete = true;
            for(var i = 0; i<supExts.length; i++) {
                if(supExts[i] == ".png" || supExts[i] == ".jpg") {
                    if(name.endsWith(supExts[i])) {
                        socket.emit("checkExistence",{path:dir});
                        socket.once("existenceChecked",function(data) {
                            if(!data.exists) {
                                socket.emit("saveImageFile",{path:dir,
                                contents:input});
                                ext = supExts[i];
                                canComplete = true;
                            }else {
                                alrt.confirm({displayText:"This file already exists. Do you wish to override it?"},function(replace) {
                                    if(replace) {
                                        socket.emit("saveImageFile",{path:dir,
                                        contents:input});
                                        canComplete = false;
                                        ext = supExts[i];
                                    }else {
                                        return callback(false);
                                    }
                                });
                            }
                        });
                        break;
                    }else {
                        canComplete = false;
                        alrt.notification("This file extension is unsupported.")
                        break;
                    }
                }else if(supExts[i] == ".docx") {
                    socket.emit("checkExistence",{path:dir});
                    socket.once("existenceChecked",function(data) {
                        /*var converted;
                        if(input != "") {
                            converted = htmlDocx.asBlob(input);
                        }else {
                            converted = input;
                        }*/
                        if(!data.exists) {
                            socket.emit("saveFile",{path:dir,
                            contents:input});
                            ext = supExts[i];
                            canComplete = true;
                        }else {
                            alrt.confirm({displayText:"This file already exists. Do you wish to override it?"},function(replace) {
                                if(replace) {
                                    socket.emit("saveFile",{path:dir,
                                    contents:input});
                                    canComplete = false;
                                    ext = supExts[i];
                                }else {
                                    return callback(false);
                                }
                            });
                        }
                    });
                    break;
                }else if(supExts == "all"){
                    socket.emit("checkExistence",{path:dir});
                    socket.once("existenceChecked",function(data) {
                        if(!data.exists) {
                            socket.emit("saveFile",{path:dir,
                            contents:input});
                            ext = name.substr(name.indexOf('.'));
                            canComplete = true;
                        }else {
                            alrt.confirm({displayText:"This file already exists. Do you wish to override it?"},function(replace) {
                                if(replace) {
                                    socket.emit("saveFile",{path:dir,
                                    contents:input});
                                    canComplete = false;
                                }else {
                                    return callback(false);
                                }
                            });
                        }
                    });
                    break;
                }
            }
            socket.once("fileSaved",function() {
                if(canComplete) {1
                    return callback(true,parent.$("#usernameDisplay").text()+"/"+folderName+"/"+name,name);
                }
            });
            socket.once("fileExists",function() {
                return callback(false);
            });
        });
    }
    return {
        saveFile:function(options,callback) {
            require(["../../../../publicPhone/js/desktop/applications",options.path+"alert"],function(app,alrt) {
                var APP = app.app({src:"/publicPhone/mobileApps/Columbus.app/",path:"../../../",addon:["addon=save"]});
                APP.onload(function(load,doc) {
                    if(load) {
                        $("#do",doc.document).click(function() {
                            saveFile(options.input,$("#addon input",doc.document).val(),
                            $(".folder:visible",doc.document),options.supExts,
                            options.path,options.socket,function(saved,dir,name) {
                                APP.close();
                                return callback(saved,dir,name);
                            },doc.document);
                        });
                    }
                });
            });
        },
        autoSaveFile:function(input,td,name,supExts,path,socket,callback) {
            require([path+"alert"],function(alrt) {
                saveFile(input,name,td,supExts,path,socket,function(done) {
                    if(!done) {
                    }
                    return callback(true);
                });
            });
        },
        createFolder:function(name,td,socket,path,callback) {
            require([path+"alert"],function(app,alrt,icon) {
                var clss = "."+parent.$(td).attr("class").split(" ").pop();
                var folderName = parent.$(clss).parent().parent().attr("data-Folder-Name")+
                "/"+name;
                socket.emit("checkExistence",{path:parent.$("#usernameDisplay").text()+"/"+folderName});
                socket.once("existenceChecked",function(data) {
                    if(!data.exists) {
                        socket.emit("saveFile",{path:parent.$("#usernameDisplay").text()+
                                    "/"+folderName,isFolder:true});
                        socket.once("fileSaved",function() {
                            parent.$(clss).append("<div class = 'folder'></div>");
                            parent.$(clss).children().attr({"title":name,"data-C":parent.$(clss).parent().parent().attr("data-P")});
                            return callback(true);
                        });
                    }else {
                        alrt.notification("This Folder already exists. Did nothing!");
                        return callback(false);
                    }
                });
            });
        },
        delete:function(td,path,callback) {
            require([path+"alert"],function(alrt) {
                var isFolder = $(td).children().attr("class") ==
                "folder"?true:false;
                socket.emit("deleteFile",{path:$("#usernameDisplay").text()+
                          "/"+$(td).parent().parent().attr("data-Folder-Name")+
                          "/"+$(td).children().attr("title"),isFolder:isFolder});
                socket.once("deleted",function() {
                    $(td).children().remove();
                    return callback(true);
                });
                socket.once("cannotDelete",function() {
                    alrt.notification("Cannot Delete Folder: Folder isn't empty.");
                    return callback(false);
                });
            });
        },
        openFolder:function(td,path,callback) {
            require([path+"Desktop/applications",path+"alert"],function(app,alrt) {
                app.app({src:"Applications/Columbus.app/",path:"../../../",addon:["addon=showFolder","folderRoot="+$(td).parent().parent().attr("data-Folder-Name"),"folderName="+$(td).children().attr("title")]});
            });
        },
        openFile:function(path,supExts,socket,callback) {
            require([path+"/Desktop/applications",path+"alert"],function(app,alrt) {
                var APP = app.app({src:"Applications/Columbus.app/",path:"../../../",addon:["addon=open"]});
                APP.onload(function(load,doc) {
                    if(load) {
                        $(doc.document.body).on("dblclick",".file",function() {
                            var name = $(this,doc.document).attr("title");
                            var toGet = parent.$("#usernameDisplay").text()+"/"+
                            $(this,doc.document).parent().parent().attr("data-Folder-Name")+"/"+
                            name;
                            for(var i = 0; i < supExts.length;i++) {
                                if(name.endsWith(supExts[i]) || supExts[i] == "all") {
                                    if(name.endsWith(".png") || name.endsWith(".jpg")) {
                                        socket.emit("getImageFile",{path:toGet});
                                    }else if(name.endsWith(".docx")) {
                                        socket.emit("getDocxFile",{path:toGet});
                                    }else if(name.endsWith(".mp4")) {
                                        APP.close();
                                        return callback(true,window.location.protocol + "//" + window.location.host+"/userData/"+toGet,toGet,name);
                                    }else {
                                        socket.emit("getContents",{path:toGet});
                                    }
                                    socket.once("contentsGotten",function(data) {
                                        APP.close();
                                        return callback(true,data.contents,toGet,name);
                                    });
                                    break;
                                }else if(i == supExts.length && !name.endsWith(supExts[i])){
                                    alrt.notification("Wrong file type dumbass");
                                    break;
                                }
                            }
                        });
                    }
                });
            });
        },
        openInApp:function(td,parentFolder,path) {
            var title = parent.$(td).children().attr("title");
            parent.$.getJSON(window.location.protocol + "//" + window.location.host+"/js/defaults.json",function(result) {
                var array = $.map(result,function(value) {
                    return [value];
                });
                for(var i = 0; i < array.length;i++) {
                    if(title.endsWith(array[i][0])) {
                        var location = parent.$("#usernameDisplay").text()+"/"+parentFolder+"/"+title;
                        require([path+"Desktop/applications"],function(app) {
                            app.app({src:array[i][1],path:"../../../",addon:["addon=loadFile","location="+location]});
                        });
                        break;
                    }
                }
            });
        },
        getFile:function(location,socket,callback) {
            if(location.endsWith(".png") || location.endsWith(".jpg")) {
                socket.emit("getImageFile",{path:location});
            }else if(location.endsWith(".mp4")) {
                return callback(window.location.protocol + "//" + window.location.host+"/userData/"+location);
            }else {
                socket.emit("getContents",{path:location});
            }
            socket.once("contentsGotten",function(data) {
                return callback(data.contents,location);
            });
        },
        copyFile:function(_this,_that,socket) {
            socket.emit("copyFile",{path:parent.$("#usernameDisplay").text()+"/"+$(_this).parent().parent().attr("data-Folder-Name")+
                        "/"+$(_this).children().attr("title"),
                        newPath:parent.$("#usernameDisplay").text()+
                        "/"+$(_that).parent().parent().attr("data-Folder-Name")+"/"+$(_this).children().attr("title")});
            socket.once("pasted",function() {
                if($(_that).parent().parent() != $(_this).parent().parent()) {
                    var title = $(_this).children().attr("title");
                    var find =$(_that).parent().find("div[title='"+title+"']");
                    if(find.length == 0) {
                        require(["../../../js/alert"],function(alrt) {
                            alrt.notification(title+" was pasted");
                        });
                        $(_that).append($(_this).children().clone());
                    }
                }
            });
        },
        uploadFolder:function(path,socket,callback) {
            require([path+"/Desktop/applications",path+"alert"],function(app,alrt) {
                var APP = app.app({src:"Applications/Columbus.app/",path:"../../../",addon:["addon=upload"]});
                APP.onload(function(load,doc) {
                    if(load) {
                        $(doc.document).on("dblclick",".folder",function() {
                            var folder = parent.$("#usernameDisplay").text()+"/"+$(this).parent().parent().attr("data-Folder-Name")+"/"+$(this).attr("title");
                            var newFolder = "../Applications/NebulaStore.app/apps/"+$(this).attr("title");
                            socket.emit("copyFile",{path:folder,newPath:newFolder});
                            socket.once("pasted",function() {
                                APP.close();
                                return callback(true,newFolder);
                            });
                        });
                    }
                });
            });
        }
    }
});
