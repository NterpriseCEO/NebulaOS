var link = 0,
    selectedFile,
    copied,
    toCut = false,
    hstry = [],
    historyNum = 0,
    ngrok = window.location.protocol + "//" + window.location.host+"/public/",
    C;
require(["js/createFileFolder",ngrok+"js/NebulaAPI.js",ngrok+"js/jquery.js"],function(file,api){
    require([ngrok+"js/materialize.min.js"],function() {
        var post = new SecurePost(),
            theType;
        post.post("ready","ColumbusKey0",null);

        $(".dropdown-trigger").dropdown();
        $(".button-collapse").sideNav();
        $("#bottomMenu").modal();

        post.once("appEvent","ColumbusKey0",function(data) {
            post.post("getContents","ColumbusKey01",null,{path:"../../../Applications/Columbus.app/mobileApp/langs/"+data.lang+".json",isFolder:false});
            post.once("contentsGotten","ColumbusKey01",function(datax) {
                if(datax.exists) {
                    C = JSON.parse(datax.contents);
                    for (var prop in C) {
                        if(C.hasOwnProperty(prop)) {
                            $("*[data-text='"+prop+"']").text(C[prop]);
                        }
                    }
                    if(data != undefined) {
                        if(data.type == "dialogueSaveFile") {
                            $("#addon").show();
                            $("#fileName").show();
                            $("#ok").text(C.save).attr("data-text","save");
                        }else if(data.type == "dialogueUploadFile" || data.type == "dialogueOpenFile") {
                            theType = data.type;
                            $("#addon").show();
                            //$(".fold").addClass("withAddon");
                            $(document.body).on("click",".fileFolder",function() {
                                $(".fileFolder").removeClass("selectedFile");
                                $(this).addClass("selectedFile");
                                $("#ok").removeClass("disabled");
                            });
                        }
                        file.loadFolder(".fold[data-FolderName='Desktop']",post,null,function() {
                            if(theType != undefined) {
                                $(".fold[data-FolderName='Desktop']").height($(".fold[data-FolderName='Desktop']").height()+$("#addon").height());
                            }
                        });
                    }else {
                        file.loadFolder(".fold[data-FolderName='Desktop']",post,null,function(){});
                    }
                }
            });
            var opacity;
            $("body").on("touchmove",function() {
                opacity = $(this).scrollTop() / ($(document).height() - $(window).height());
                $("#headerFolder, #headerTitle").css("opacity",1-opacity);
                var pos = $(this).scrollTop() >= ($(window).height()/2)-200;
                $("#navbar").toggleClass("border",pos);
            });

            $("#search").click(function() {
                $("body").stop().animate({scrollTop:($(window).height()/2)-($("#navbar").height()*3)},500,function() {
                    $("#navbar").addClass("border");
                    $("#navbar").children().addClass("hide");
                    $("#searchBox, #cancelSearch").removeClass("hide");
                    $("#searchBox").focus();
                    $("body").height($("body").height());
                });
            });

            $("#cancelSearch").click(function() {
                $("#navbar").children().removeClass("hide");
                $("#searchBox, #cancelSearch").addClass("hide");
                $("#searchBox").val("").change();
                $("body").css("height","auto");
            });

            $("#fileName").on("keyup",function() {
                $("#ok").toggleClass("disabled",$(this).val() == "");
            });
            $("#ok").click(function() {
                if(!$(this).hasClass("disabled")) {
                    if(theType == "dialogueOpenFile") {
                        var path = $(".fold:visible").attr("data-FolderName")+
                        "/"+$(".selectedFile").find(".ffName").text();
                        post.post("fileChosen","all",null,{path:path})
                    }else if(theType == "dialogueUploadFile" && $(".selectedFile").find(".fileFolder").length == 1) {
                        var path = $(".fold:visible").attr("data-FolderName")+
                        "/"+$(".selectedFile").find(".ffName").text();
                        post.post("fileChosen","all",null,{path:path})
                    }else {
                        if($("#fileName").val() != "") {
                            var path = $(".fold:visible").attr("data-FolderName")+"/"+$("#fileName").val();
                            post.post("fileNameChosen","ColumbusKey4",null,{folderName:$(".fold:visible").attr("data-FolderName"),
                                                                            path:path,
                                                                            name:$("#fileName").val()});
                        }
                    }
                }
            });

            $("#cancel").click(function() {
                post.post("canceled","all",null);
            });
            $(".current, .mItem").click(function() {
                $(".button-collapse").sideNav("hide");
            });

            $("#goUp").click(function() {
                file.goUp();
            });

            $(".mItem").click(function() {
                var t = $(this).find("a").clone().children().remove().end().text();
                $(".current .currnetName").text(t);
                $(".current span[data-text='current']").text(C.current);
                $(".fold").addClass("hide");
                $(".fold[data-FolderName='"+t+"']").removeClass("hide");
                $("body").scrollTop(0);
                $("#headerFolder, #headerTitle").css("opacity",1);
                $("#navbar").removeClass("border");
                $("#headerTitle").text(t);
                if($(".fold[data-FolderName='"+t+"']").children().length == 0) {
                    file.loadFolder(".fold[data-FolderName='"+t+"']",post,null,function() {
                        if(theType != undefined) {
                            $(".fold[data-FolderName='"+t+"']").height($(".fold[data-FolderName='"+t+"']").height()+$("#addon").height());
                        }
                    });
                }else {
                    if($(".fold[data-FolderName='"+t+"']").children().length != 0) {
                        $(".emptyFolder").addClass("hide");
                    }
                }
            });

            var longpress = false;
            $(".newFile, .newFolder").click(function() {
                var isFolder = $(this).text() == C.newFolder?true:false,
                type = $(this).text() == C.newFolder?C.folder:C.file;

                api.type({displayText:type},function(name,clicked) {
                    if(clicked) {
                        if(!/[^a-zA-Z0-9\.\-\_]/.test(name)) {
                            file.createFileFolder(name,isFolder,post);
                        }else {
                            alert(C.alphanumeric);
                        }
                    }
                });
            });
            var timer;
            $(document.body).on("swipeleft","div[data-role='page']",function() {
                if(hstry[historyNum+1] != undefined) {
                    $(".fold:visible").addClass("hide");
                    $(".fold[data-FolderName='"+hstry[historyNum+1]+"']").removeClass("hide");
                    historyNum++;
                }
            });
            $(document.body).on("swiperight","div[data-role='page']",function() {
                if(hstry[historyNum-1] != undefined) {
                    $(".fold:visible").addClass("hide");
                    $(".fold[data-FolderName='"+hstry[historyNum-1]+"']").removeClass("hide");
                    historyNum--;
                }
            });
            $("#searchBox").on("change textInput input",function() {
                var _this = $(this).val();
                $(".fold:visible .ffName").each(function() {
                    var title = $(this).text();
                    if(title.indexOf(_this) == -1) {
                        $(this).parent().addClass("hide");
                    }else {
                        $(this).parent().removeClass("hide");
                    }
                });
                $("body").height($("body").height());
            });
            $(document.body).on("click",".fileFolder",function() {
                if($(this).find(".folderIcon").length > 0) {
                    if(theType != "dialogueUploadFile") {
                        var fold = ".folder[data-FolderName='"+$(this).parent().attr("data-FolderName")+"/"+$(this).attr("title")+"']";
                        file.loadFolder(fold,post,this,function() {
                            if(theType != undefined) {
                                $(fold).height($(fold).height()+$("#addon").height());
                            }
                        });
                    }else {
                        var name = $(this).attr("title");
                        post.post("fileChosen","ColumbusKey5",null,{name:name,path:$(this).parent().attr("data-FolderName")+"/"+name})
                    }
                }else {
                }
            });
            $(document.body).on("click",".fMenu",function(e) {
                $("#fileMenu").show();
                $("#generalMenu").hide();
                $("#bottomMenu").find("h4").text($(this).parent().find(".ffName").text())
                selectedFile = $(this).parent();
                e.stopPropagation();
            });

            $("#bMRename").click(function() {
                file.renameFileFolder(selectedFile,post,api,function(renamed) {
                });
            });
            $("#bMDelete").click(function() {
                api.confirm({displayText:C.wishToDelete,ok:C.delete},function(clicked) {
                    if(clicked) {
                        $("#bottomMenu").modal("close");
                        file.deleteFileFolder(selectedFile,post);
                    }
                });
            });
            $("#bMCopy").click(function() {
                copied = selectedFile;
                toCut = false;
                $("#bottomMenu").modal("close");
            });
            $("#bMCut").click(function() {
                copied = selectedFile;
                toCut = true;
                $("#bottomMenu").modal("close");
            });
            $(".paste").click(function() {
                if(copied != undefined) {
                    file.copyFile(copied,toCut,post);
                }
            });
        });
    });
});
