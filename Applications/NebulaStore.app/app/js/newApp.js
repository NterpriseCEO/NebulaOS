var startSrc = $("#uAppIcon").attr("src"),
    rand,
    appLocation,
    canDelete = false,
    appExists = false,
    toRemove = [],
    noImages = true;
$("#cancelApp").click(function() {
    if($("#newAppPane input,textarea").val() != "" || rand != undefined) {
        var confirm  = window.confirm(C.willDeleteApp);
        if(confirm) {
            $("#newAppPane").addClass("hide");
            $("#devMain").removeClass("hide");
            $("#newAppPane input,textarea").val("");
            post.post("deleteFile","StoreKey6",null,{path:"/../../../Applications/NebulaStore.app/apps/"+rand+"/",
            isFolder:true,deleteRecursive:true});
        }
    }else {
        $("#newAppPane").addClass("hide");
        $("#devMain").removeClass("hide");
    }
})
$(document.body).on("click","#createAppPane,.myApp",function() {
    toRemove = [];
    $("#devMain").addClass("hide");
    $("#newAppPane").removeClass("hide");
    $("#submitApp").text(C.submit).attr("data-text",C["submit"]);
    if($(this).is($(".myApp"))) {
        $("#submitApp").text(C.update).attr("data-text",C["update"]);
        post.post("getContents","StoreKey33",null,{path:"/../../../Applications/NebulaStore.app/apps/"+$(this).data("rand")+"/app.json"});
        post.once("contentsGotten","StoreKey33",function(data) {
            var appData = JSON.parse(data.contents);
            $("#appName").val(appData.appName);
            $("#category").val(appData.category);
            $("#uAppIcon").attr("src",appData.icon);
            $("#appDescription").val(appData.appDescription);
            appLocation = appData.appSrc;
            rand = appData.appLocation;
            appExists = true;
            var path = "/../../../Applications/NebulaStore.app/apps/"+rand+"/images/";
            $("#addedImages img").remove();
            post.post("readDir","StoreKey34",null,{path:path});
            post.once("folderContents","StoreKey34",function(data) {
                if(data.files.length) {
                    getImage(0,data.files.length-1);
                    noImages = false;
                }
            });
            function getImage(i,length) {
                if(i <= length) {
                    post.post("getContents","StoreKey35_"+i,null,{path:path+i+".png"});
                    post.once("contentsGotten","StoreKey35_"+i,function(data) {
                        $("#addedImages").append("<img src = '"+data.contents+"' class = 'addedImage'></img>");
                        getImage(i+1,length);
                    });
                }
            }
        });
    }
});
$(document.body).on("mousedown","#addedImages img",function(e) {
    if(e.button == 2) {
        toRemove[toRemove.length] = $(this).index();
        $(this).hide();
    }
});
$("#upload").click(function() {
    if(!appExists) {
        rand = Math.floor((Math.random()*1000000000)+1);
        post.post("checkExistence","StoreKey1",null,{path:"/../../../Applications/NebulaStore.app/apps/"+rand,isFolder:true});
        post.once("existenceChecked","StoreKey1",function(data) {
            if(!data.exists) {
                post.post("saveFile","StoreKey5",null,{path:"/../../../Applications/NebulaStore.app/apps/"+rand,isFolder:true});
                post.post("uploadFolder","StoreKey2",null,{path:"/../../Applications/NebulaStore.app/apps/"+rand+"/"});
                var uploaded = true;
                post.once("canceled","StoreKey2",function() {
                    uploaded = false;
                    post.post("deleteFile","StoreKey5",null,{path:"/../../../Applications/NebulaStore.app/apps/"+rand,isFolder:true});
                });
                post.once("uploaded","StoreKey2",function(data2) {
                    if(uploaded) {
                        appLocation = data2.path;
                        canDelete = true;
                    }
                });
            }
        });
    }else {
        post.post("uploadFolder","StoreKey2",null,{path:"/../../../Applications/NebulaStore.app/apps/"+rand+"/"});
        var uploaded = true;
        post.once("canceled","StoreKey2",function() {
            uploaded = false;
        });
        post.once("uploaded","StoreKey2",function(data2) {
            if(uploaded) {
                appLocation = data2.path;
                canDelete = true;
            }
        });
    }
});
$("#uAppIcon").click(function() {
    post.post("openFile","StoreKey3",null,{supExts:[".jpg",".png"]})
    post.once("fileOpened","StoreKey3",function(data) {
        $("#uAppIcon").attr("src",data.contents);
    });
});
$("#addImage").click(function() {
    post.post("openFile","StoreKey13",null,{supExts:[".jpg",".png"]});
    var canLoad = true;
    post.once("canceled","StoreKey13",function() {
        canLoad = false;
    });
    post.once("fileOpened","StoreKey13",function(data) {
        if(canLoad) {
            $("#addedImages").prepend("<img src = '"+data.contents+"' class = 'addedImage'></img>");
        }
    });
});

$("#submitApp").click(function() {
    if($("#appName").val() == "" ||
       $("#appDescription").val() == "" || $("#uAppIcon").attr("src") == startSrc
        || appLocation == undefined) {
        alert(C.fillOutFields);
    }else {
        var appName = $("#appName").val();
        var saveObj = {
            "appName":appName,
            "category":$("#category").val(),
            "icon":$("#uAppIcon").attr("src"),
            "appDescription":$("#appDescription").val(),
            "appLocation":rand,
            "appSrc":appLocation
        }
        if($(".addedImage").length) {
            function remove(i,length) {
                if(i <= length-1) {
                    post.post("deleteFile","StoreKey36_"+i,null,{path:"/../../../Applications/NebulaStore.app/apps/"+rand+"/images/"+toRemove[i]+".png"});
                    post.once("deleted","StoreKey36_"+i,function() {
                        remove(i+1,length);
                    });
                }else {
                    add();
                }
            }
            if(toRemove.length) {
                remove(0,toRemove.length);
            }else {
                add();
            }
            function add() {
                for(var i = 0; i < $(".addedImage:visible").length; i++) {
                    post.post("saveFile","StoreKey23",null,{path:"/../../../Applications/NebulaStore.app/apps/"+rand+"/images/"+i+".png",
                    contents:$(".addedImage:eq("+i+")").attr("src")});
                }
                if(toRemove.length && !noImages && $(".addedImage:visible").length) {
                    var l = $(".addedImage").length;
                    for(var i = l; i <=+ l+toRemove.length;i++) {
                        post.post("deleteFile","StoreKey36_"+i,null,{path:"/../../../Applications/NebulaStore.app/apps/"+rand+"/images/"+i+".png"});
                    }
                }
            }
        }
        post.post("saveFile","StoreKey4",null,{path:"/../../../Applications/NebulaStore.app/apps/"+rand+"/app.json",
                                       contents:JSON.stringify(saveObj)});
        var img = $("#uAppIcon").attr("src");
        img = img.replace(/^url\(["']?/,"").replace(/["']?/,"");
        post.post("saveFile","StoreKey11",null,{path:"/../../../Applications/NebulaStore.app/data/icons/"+rand+".png",
                                                contents:img});
        if(!appExists) {
            post.post("getContents","StoreKey6",null,{path:"/../../../Applications/NebulaStore.app/data/appData.json"});
            post.once("contentsGotten","StoreKey6",function(data) {
                if(data.exists) {
                    var result = JSON.parse(data.contents);
                    result.apps[result.apps.length] = [rand,appName,appLocation];
                    post.post("saveFile","StoreKey7",null,{path:"/../../../Applications/NebulaStore.app/data/appData.json",
                                                   contents:JSON.stringify(result)});
                }else {
                    post.post("saveFile","StoreKey7",null,{path:"/../../../Applications/NebulaStore.app/data/appData.json",
                                                    contents:JSON.stringify({apps:[[rand,appName,appLocation]]})});
                }
                post.post("getContents","StoreKey30",null,{path:"/data/NebulaStoreData/myApps.data"});
                post.once("contentsGotten","StoreKey30",function(data2) {
                    var myApps = [];
                    if(data2.exists) {
                        var d = JSON.parse(data2.contents);
                        d[d.length] = [rand,appLocation,appName];
                        myApps = d;
                    }else {
                        myApps[0] = [rand,appLocation,appName]
                    }
                    $("#myApps").append("<li class ='collection-item myApp' data-rand = '"+rand+"' data-src='"+appLocation+"'><a href = '#!'>"+appName+"</a></li>")
                    post.post("saveFile","StoreKey31",null,{path:"data/NebulaStoreData/myApps.data",contents:JSON.stringify(myApps)});
                });
            });
        }
        $("#newAppPane input, textarea").val("");
        $("#newAppPane").addClass("hide");
        $("#devMain").removeClass("hide");
        canDelete = false;
        $("#uIcon").attr("src",startSrc);
    }
});
