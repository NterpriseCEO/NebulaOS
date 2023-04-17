$(document).ready(function() {
    var post = new SecurePost(),
        dir,
        contents,
        C;
    post.post("ready","TextPadKey0",null);
    post.once("appEvent","TextPadKey0",function(data) {
        post.post("getContents","TextPadKey01",null,{path:"../../../Applications/TextPad.app/mobileApp/langs/"+data.lang+".json",isFolder:false});
        post.once("contentsGotten","TextPadKey01",function(data2) {
            if(data2.exists) {
                C = JSON.parse(data2.contents);
                for(var prop in C) {
                    if(C.hasOwnProperty(prop)) {
                        $("*[data-text='"+prop+"']").text(C[prop]);
                    }
                }
            }
        });
    });
    $(".button-collapse").sideNav();
    /*if(getUrlVars()["addon"] == "loadFile") {
        post.post("getContents","TextPadKey1",null,{path:getUrlVars()["location"]});
        post.once("contentsGotten","TextPadKey1",function(data) {
            $("#edit").val(data.contents);
            M.textareaAutoResize($("#edit"));
            dir = data.path;
            contents = data.contents;
        });
    }*/
    $(document.body).on("click",".mItem",function() {
        $(".button-collapse").sideNav("hide");
    });
    $("#save").click(function() {
        if($("#edit").val().trim().length) {
            if(contents != undefined) {
                post.post("saveFile","TextPadKey2",null,{path:"/../"+dir,contents:$("#edit").val()});
            }else {
                save(function(){});
            }
        }else {
            alert("No text to save!");
        }
    });
    $("#open").click(function() {
        if($("#edit").val().trim().length && contents != $("#edit").val()) {
            if(dir != undefined) {
                var cnfrm = confirm(C.wishToSave);
                if(cnfrm) {
                    post.post("saveFile","TextPadKey2",null,{path:"/../"+dir,contents:$("#edit").val()});
                    load();
                }else {
                    load();
                }
            }else {
                var cnfrm = confirm(C.wishToSave);
                if(cnfrm) {
                    save(function() {
                        load();
                    });
                }else {
                    load();
                }
            }
        }else if($("#edit").val() == "" || $("#edit").val() == contents) {
            if(dir != undefined) {
                var pth = dir.substring(dir.indexOf("/"));
                post.post("checkExistence","TextPadKey3",null,{path:pth});
                post.once("existenceChecked","TextPadKey3",function(data) {
                    if(!data.exists) {
                        var cnfrm = confirm(C.wishToSave);
                        if(cnfrm) {
                            save(function() {
                                load();
                            });
                        }else {
                            load();
                        }
                    }else {
                        load();
                    }
                });
            }else {
                load();
            }
        }
    });
    function save(callback) {
        post.post("saveFileDialogue","TextPadKey4",null,$("#edit").val());
        post.once("fileSaved","TextPadKey4",function(data) {
            console.log(data)
            dir = data.path;
            contents = $("#edit").val();
            return callback();
        });
    }
    function load() {
        post.post("openFile","TextPadKey5",null,{supExts:["all"]});
        post.once("fileOpened","TextPadKey5",function(data) {
            dir = data.path;
            contents = data.contents;
            $("#edit").val(contents);
            M.textareaAutoResize("#edit");
        });
    }
});
