var ngrok = window.location.protocol + "//" + window.location.host+"/public/"
require([ngrok+"js/NebulaAPI.js",ngrok+"js/jquery.js",
ngrok+"js/NebulaPM.js"],function(api) {
    require(["https://cdn.jsdelivr.net/npm/bootstrap@3.3.5/dist/js/bootstrap.min.js"],function() {
        require(["https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.9/summernote.js"],function() {
            var post = new SecurePost(),
                contents,dir;
            var file = function(context) {
                var ui = $.summernote.ui;
                var button = ui.buttonGroup([
                    ui.button({
                        contents: "File <span class='caret'></span>",
                        tooltip: "File",
                        data: {
                            toggle: "dropdown"
                        }
                    }),
                    ui.dropdown({
                        items:[
                            "New","Open","Save"
                        ],
                        callback: function (dropdown) {
                            dropdown.find("li a").on("click",function() {
                                var val = $("#summernote").summernote("code");
                                switch ($(this).html()) {
                                    case "New":
                                        if(val.trim().length && contents != val) {
                                            if(dir != undefined) {
                                                api.notification("Save file before continuing");
                                            }else {
                                                $("#summernote").summernote("code","");
                                            }
                                        }
                                        break;
                                    case "Open":
                                        if(val.trim().length && contents != val && val != "<p><br></p>") {
                                            if(dir != undefined) {
                                                api.confirm({header:"Confirm",displayText:"Do you wish to save this file first?"},
                                                function(ok) {
                                                    if(ok) {
                                                        post.post("saveFile","TextPadKey2",null,{path:"/../"+dir,contents:$("#edit").val()});
                                                    }
                                                });
                                            }else {
                                                api.confirm({header:"Confirm",displayText:"Do you wish to save this file first?"},
                                                function(ok) {
                                                    if(ok) {
                                                        save(function() {
                                                        });
                                                    }
                                                });
                                            }
                                        }else if(val == "" || val == "<p><br></p>" || val == contents) {
                                            if(dir != undefined) {
                                                var pth = dir.substring(dir.indexOf("/"));
                                                post.post("checkExistence","NebEdit3",null,{path:pth});
                                                post.once("existenceChecked","NebEdit3",function(data) {
                                                    if(!data.exists) {
                                                        api.confirm({header:"Confirm",displayText:"Do you wish to save this file first?"},
                                                        function(ok) {
                                                            if(ok) {
                                                                save(function() {
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                        load();
                                        break;
                                    case "Save":
                                        if(val.trim().length && val != "<p><br></p>") {
                                            if(contents != undefined) {
                                                post.post("saveFile","NebEdit4",null,{path:"/../"+dir,contents:val});
                                            }else {
                                                save(function(){});
                                            }
                                        }else {
                                            api.notification("There's no text to save!");
                                        }
                                        break;
                                }
                            });
                        }
                    })
                ]);
                return button.render();
            }
            $("#summernote").summernote({
                focus:true,
                toolbar:[
                    ["file",["file"]],
                    ["misc",["undo","redo"]],
                    ["style", ["bold", "italic", "underline", "clear"]],
                    ["fontsize", ["fontsize","fontname"]],
                    ["height", ["height"]],
                    ["color", ["color"]],
                    ["font", ["strikethrough", "superscript", "subscript"]],
                    ["para", ["ul", "ol", "paragraph","style"]],
                    ["insert",["picture","link","video","table","hr"]],
                    ["help",["help"]]
                ],
                buttons:{
                    file:file
                },
                placeholder:"Text here",
                callbacks: {
                    onInit: function(e) {
                        $("#summernote").summernote("fullscreen.toggle");
                    }
                }
            });
            function save(callback) {
                post.post("saveFileDialogue","NebEdit2",null,$("#summernote").summernote("code"));
                post.once("fileSaved","NebEdit2",function(data) {
                    dir = data.path;
                    contents = $("#summernote").summernote("code");
                    return callback();
                });
            }
            function load() {
                post.post("openFile","NebEdit1",null,{supExts:[".dHtml"]});
                post.once("fileOpened","NebEdit1",function(data) {
                    dir = data.path;
                    contents = data.contents;
                    $("#summernote").summernote("code",contents)
                });
            }
        });
    });
});
