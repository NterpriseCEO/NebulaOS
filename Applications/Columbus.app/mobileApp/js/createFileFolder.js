define(function() {
    function loadImg(src,what) {
        $(what).css("backgroundImage","url('"+src+"')");
    }
    return {
        goUp:function() {
            if($(".fold:visible").attr("data-Parent") != "true") {
                var name = $(".fold:visible").attr("data-FolderName");
                name = name.substring(0,name.lastIndexOf("/"));
                $(".current .currnetName").text(name);
                $(".current span[data-text='current']").text(C.current)
                $(".fold").hide();
                $(".fold[data-FolderName='"+name+"']").show();
            }
        },
        createFileFolder:function(name,isFolder,post) {
            var folder = $(".fold:visible").attr("data-FolderName");
            var location = "/"+folder+"/"+name;
            var type = "file";
            if(isFolder) {
                type = "folderIcon icon";
                if(name.endsWith(".app")) {
                    type = "folderIcon icon appIcon";
                }
            }else {
                type = "icon";
            }
            post.post("saveFile","ColumbusKey3",null,{path:location,
            contents:"",isFolder:isFolder});
            post.once("fileSaved","ColumbusKey3",function() {
                var nme = name.substr(name.lastIndexOf("."));
                nme = nme.substr(1);
                var src = "../../../public/images/"+nme+".png";
                $(".fold:visible").prepend("<li class = 'fileFolder collection-item' title = '"+name+"'>\
                                              <div class ='"+type+"'>\
                                              </div>\
                                              <div class ='ffName'>"+name+"</div>\
                                              <a class = 'fMenu modal-trigger black-text' href ='#bottomMenu'><i class = 'material-icons'>more_vert</i></a>\
                                              <div class = 'deleteFF' data-text = 'delete'>"+C.delete+"</div>\
                                          </li>");
                if(!isFolder) {
                    loadImg(src,".fileFolder[title='"+name+"']:first .icon");
                }
            });
        },
        renameFileFolder:function(_this,post,api,callback) {
            api.type({displayText:C.chooseNewName,ok:C.rename},function(name,clicked) {
                if(clicked && !/[^a-zA-Z0-9\.\-\_]/.test(name)) {
                    var path = $(_this).parent().attr("data-FolderName")+"/";
                    var nme = $(_this).find(".ffName").text();
                    var ext = nme.substr(nme.lastIndexOf("."));
                    var title = $(_this).find(".icon").hasClass("folderIcon")?name:name+ext;
                    if($(_this).find(".ffName").text().endsWith(".app")) {
                        title = name+ext;
                    }
                    var newPath = path+title;
                    post.post("renameFileFolder","ColumbusKey4",null,
                    {oldPath:path+nme,newPath:newPath});
                    post.once("renamed","ColumbusKey4",function() {
                        $(_this).find(".ffName").text(title);
                        return callback(true);
                    });
                }else {
                    alert(C.alphanumeric);
                }
            });
        },
        deleteFileFolder:function(_this,post) {
            var folder = $(_this).parent().attr("data-FolderName");
            var location = "/"+folder+"/"+$(_this).attr("title");
            var isFolder = false;
            if($(_this).find(".icon").hasClass("folderIcon")) {
                isFolder = true;
            }
            post.post("deleteFile","ColumbusKey2",null,{path:location,isFolder:isFolder});
            post.once("deleted","ColumbusKey2",function() {
                $(_this).remove();
            });
        },
        loadFolder:function(fold,post,_this,callback) {
            link++;
            var folder;
            var name;
            if($(fold).length == 0) {
                name = $(_this).parent().attr("data-FolderName")+"/"+$(_this).attr("title");
                $("body").append("<ul class = 'fold collection hide' data-FolderName='"+name+"'>\
                                  </ul>");
                folder = ".fold[data-FolderName='"+name+"']";
                $(".current .currnetName").text(name);
                $(".current span[data-text='current']").text(C.current);
            }else {
                folder = fold;
            }
            $(".fold").addClass("hide");
            historyNum++;
            hstry.length = historyNum;
            hstry[historyNum] = $(folder).attr("data-FolderName");
            $("body").scrollTop(0);
            $("#headerFolder, #headerTitle").css("opacity",1);
            $("#navbar").removeClass("border");
            name = $(folder).attr("data-FolderName") || name;
            $("#headerTitle").text(name);
            if($(folder).attr("data-loaded") == undefined) {
                post.post("readDir","ColumbusKey1",null,{path:name});
                post.once("folderContents","ColumbusKey1",function(data) {
                    var next = 0;
                    if(data.files != undefined && data.folders != undefined) {
                        $(".emptyFolder").addClass("hide");
                        for(var i = 0; i < data.files.length; i++) {
                            $(folder).append("<li class = 'fileFolder collection-item' title = '"+data.files[i]+"'>\
                                                <div class ='file icon'>\
                                                    <div class = 'lIcon'>\
                                                    </div>\
                                                </div>\
                                                <div class ='ffName'>"+data.files[i]+"</div>\
                                                <a class = 'fMenu modal-trigger black-text' href ='#bottomMenu'><i class = 'material-icons'>more_vert</i></a>\
                                                <div class = 'deleteFF' data-text='delete'>"+C.delete+"</div>\
                                              </li>");
                            var nme = data.files[i].substr(data.files[i].lastIndexOf("."));
                            nme = nme.substr(1);
                            var src = "../../../../public/images/"+nme+".png";
                            loadImg(src,".fileFolder[title='"+data.files[i]+"'] .lIcon");
                        }
                        for(var i = 0; i <data.folders.length; i++) {
                            $(folder).append("<div class = 'fileFolder collection-item' title = '"+data.folders[i]+"'>\
                                                  <div class ='folderIcon icon'>\
                                                  </div>\
                                                  <div class ='ffName'>"+data.folders[i]+"</div>\
                                                  <a class = 'fMenu modal-trigger black-text' href ='#bottomMenu'><i class = 'material-icons'>more_vert</i></a>\
                                                  <div class = 'deleteFF' data-text = 'delete'>"+C.delete+"</div>\
                                              </div>");
                            if(data.folders[i].endsWith(".app")) {
                                $(".fileFolder[title='"+data.folders[i]+"']")
                                .find(".icon").addClass("appIcon");
                            }
                        }
                        return callback();
                    }else {
                        $(".emptyFolder").removeClass("hide");
                        return callback();
                    }
                });
                $(folder).attr("data-loaded",true).removeClass("hide").attr("data-Link-P",link);
                if($(folder).attr("class") != "fold parent") {
                    $(folder).attr("data-Link-C",$(_this).parent().attr("data-Link-P"));
                }
            }else {
                $(folder).removeClass("hide")
                if($(folder).children().length != 0) {
                    $(".emptyFolder").addClass("hide");
                    return callback();
                }
            }
        },
        copyFile:function(_this,toCut,post) {
            var isFolder = false;
            if($(".fold:visible").attr("data-FolderName") != $(_this).parent().attr("data-FolderName")) {
                if($(_this).find(".folderIcon").length != -1) {
                    isFolder = true;
                }
                post.post("copyFile","ColumbusKey10",null,{path:"/"+$(_this).parent().attr("data-FolderName")+
                                     "/"+$(_this).find(".ffName").text(),
                                     newPath:"/"+$(".fold:visible").attr("data-FolderName")
                                     +"/"+$(_this).find(".ffName").text(),cut:toCut,isFolder:isFolder});
                post.once("pasted","ColumbusKey10",function() {
                    $(".fold:visible").append($(_this).clone());
                    if(toCut) {
                        $(_this).remove();
                    }
                });
            }
        }
    }
});
