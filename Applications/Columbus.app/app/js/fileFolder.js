define([ngrok+"js/NebulaAPI.js"],function(api) {
    return {
        loadFolder:function(folder,post,extra,name) {
            function loadImg(i,src) {
                $(folder+" .td:eq("+i+")").find(".fType").css("backgroundImage","url('"+src+"')");
            }
            var dir;
            if(extra != undefined) {
                dir = extra;
            }else {
                dir = folder.substr(1);
            }
            post.post("readDir","ColumbusKey5",null,{path:dir});
            post.once("folderContents","ColumbusKey5",function(data) {
                if(!data.empty) {
                    var next = 0;
                    for(var i = 0; i < data.files.length; i++) {
                        $(folder+" .td:eq("+i+")")
                        .html("<div class = 'file'><div class = 'fType'></div><div class='attl' title='"+data.files[i]+"'>"+data.files[i]+"</div></div>");
                        $(folder+" .td:eq("+i+")").children().attr("title",data.files[i]);
                        var name = data.files[i].substr(data.files[i].lastIndexOf("."));
                        name = name.substr(1);
                        var src = "../../../../public/images/"+name+".png";
                        loadImg(i,src,name);
                        next++;
                    }
                    for(var i = 0; i <data.folders.length; i++) {
                        var o = next+i;
                        $(folder+" .td:eq("+o+")")
                        .html("<div class = 'folder' title='"+data.folders[i]+"' data-P='"+dir+"'><div class='attl'title='"+data.folders[i]+"'>"+data.folders[i]+"</div></div>");
                        if(data.folders[i].endsWith(".app")) {
                            $(folder+" .td:eq("+o+")").find(".folder").addClass("appFolder");
                        }
                    }
                }
            });
        },
        addFile:function(td,name,post) {
            var dir = "/"+$(td).parent().attr("data-Folder-Name")+"/"+name;
            post.post("checkExistence","ColumbusKey6",null,
            {path:dir,folderName:$(td).parent().attr("data-Folder-Name")});
            post.once("existenceChecked","ColumbusKey6",function(data) {
                if(!data.exists) {
                    post.post("saveFile","ColumbusKey7",null,{path:dir,name:name,contents:"",
                                                              folderName:$(td).parent().attr("data-Folder-Name"),
                                                              isFolder:false});
                    post.once("fileSaved","ColumbusKey7",function() {
                        var nme = name;
                        $(td).append("<div class = 'file'><div class = 'fType'></div><div class='attl' title='"+name+"'>"+name+"</div></div>");
                        name = name.substr(name.lastIndexOf("."));
                        name = name.substr(1);
                        $(td).children().attr("title",nme).find(".fType")
                        .css("backgroundImage","url('"+ngrok+"/images/"+name+".png')");
                    });
                }else {
                    api.confirm({header:"Warning!",displayText:"This file already exists. Do you wish to override it?"},function(replace) {
                        if(replace) {
                            post.post("saveFile",{path:dir,
                            contents:" ",isFolder:false});
                        }
                    });
                }
            });
        },
        addFolder:function(td,post,name) {
            require([ngrok+"js/Desktop/icons"],function(icon) {
                var folder = "/"+$(td).parent().attr("data-Folder-Name")+"/"+name;
                post.post("checkExistence","ColumbusKey8",null,{path:folder,isFolder:true});
                post.once("existenceChecked","ColumbusKey8",function(data) {
                    if(!data.exists) {
                        post.post("saveFile","ColumbusKey9",null,{path:folder,folderName:$(td).parent().attr("data-Folder-Name"),name:name,isFolder:true});
                        post.once("fileSaved","ColumbusKey9",function() {
                            link++;
                            $("#middle").append("<div class = 'fold' data-Folder-Name='"+folder+"' title = '"+name+"'></div>");
                            icon.addTable(".fold[data-Folder-Name='"+folder+"']",link);
                            $(td).html("<div class = 'folder' title='"+name+"'><div class='attl'title='"+name+"'>"+name+"</div></div>");
                            if(name.endsWith(".app")) {
                                $(td).find(".folder").addClass("appFolder");
                            }
                        });
                    }else {
                        api.notification("This Folder already exists. Did nothing!")
                    }
                });
            });
        },
        deleteFileFolder:function(td,post,multiple  ) {
            var toDelete = $(td).parent().attr("data-Folder-Name")+
            "/"+$(td).children().attr("title");
            var isFolder = $(td).children().hasClass("folder")?[true,"folder"]:[false,"file"];
            var clss = $(td).parent().attr("data-Folder-Name");
            if(multiple) {
                post.post("deleteFile","ColumbusKey11",null,{path:"/"+toDelete,isFolder:isFolder[0],clss:clss,title:$(td).children().attr("title")});
            }else {
                api.confirm({header:"Confirm?",displayText:"Do you want to delete this "+isFolder[1]+"?"},function(clicked) {
                    if(clicked) {
                        post.post("deleteFile","ColumbusKey11",null,{path:"/"+toDelete,isFolder:isFolder[0],clss:clss,title:$(td).children().attr("title")});
                    }
                });
            }
            post.once("deleted","ColumbusKey11",function() {
                if(isFolder[0]) {
                    $(".fold[data-Folder-Name='"+toDelete+"']").remove();
                }
                $(td).children().remove();
            });
        },
        renameFileFolder:function(td,post) {
            var isFolder = $(td).children().attr("class") ==
            "folder"?"folder":"file";
            api.type({header:"Rename",displayText:"Choose a new name for this "+isFolder+"."},function(name,clicked) {
                if(clicked) {
                    if(!/[^a-zA-Z0-9\.\-\_]/.test(name)) {
                        var path = $(td).parent().attr("data-Folder-Name")+"/";
                        var nme = $(td).children().attr("title");
                        var ext = nme.substr(nme.lastIndexOf("."));
                        var title = $(td).children().attr("class") ==
                        "folder"? name:name+ext;
                        var newPath = path+title;
                        post.post("renameFileFolder","ColumbusKey15",null,
                        {oldPath:path+nme,newPath:newPath});
                        post.once("renamed","ColumbusKey15",function() {
                            $(td).children().attr("title",title);
                            $(td).find(".attl").text(title).attr("title",title);
                        });
                    }else {
                        api.notification("Alphanumeric and dots only please");
                    }
                }
            });
        },
        traverseFolder:function() {
            var dir = $(".fold:visible").attr("data-Folder-Name");
            dir = dir.substr(0, dir.lastIndexOf("/"));
            if($(".fold[data-Folder-name='"+dir+"']").length != 0) {
                $(".fold").hide();
                $(".fold[data-Folder-Name='"+dir+"']").show();
                $("#pageSearchBar").val(dir+"/");
                index--;
            }
        },
        copyFile:function(_this,_that,toCut,post,multiple) {
            var isFolder = false;
            if($(_that).parent().attr("data-folder-name") != $(_this).parent().attr("data-folder-name")) {
                if($(_this).find(".folder").length) {
                    isFolder = true;
                }
                post.post("copyFile","ColumbusKey10",null,{path:"/"+$(_this).parent().attr("data-Folder-Name")+
                                     "/"+$(_this).children().attr("title"),
                                     newPath:"/"+$(_that).parent().attr("data-Folder-Name")
                                     +"/"+$(_this).children().attr("title"),cut:toCut,isFolder:isFolder});
                post.once("pasted","ColumbusKey10",function() {
                    if(multiple) {
                        $(".fold:visible .td:empty:first").append($(_this).children().clone());
                    }else {
                        $(_that).append($(_this).children().clone());
                    }
                    if(toCut) {
                        $(_this).children().remove();
                    }
                });
            }
        }
    }
});
