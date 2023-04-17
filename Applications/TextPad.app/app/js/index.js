var ngrok = "http://localhost:8080/public/";
require([ngrok+"js/NebulaAPI.js",ngrok+"js/alert.js",ngrok+"js/NebulaPM.js"],function(api,alrt) {
    require([ngrok+"uiElementDefaults/ui.js"]);

    document.addEventListener("keydown", function(e) {
        if (e.key === 's' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
        }
    }, false);

    $(".dropdown-trigger").dropdown();
    var post = new SecurePost(),
        dir,
        contents;
    require([ngrok+"js/allowTabChar.js"],function() {
        $("#edit").allowTabChar();
    });
    post.post("ready","TextPadKey0",null);
    post.once("openFile","TextPadKey0",function(data) {
        post.post("getContents","TextPadKey1",null,{path:data.path});
        post.once("contentsGotten","TextPadKey1",function(data2) {
            $("#edit").val(data2.contents);
            dir = data2.path;
            contents = data2.contents;
        });
    });
    $("#newButton").click(function() {
        if($("#edit").val().trim().length && contents != $("#edit").val()) {
            if(dir != undefined) {
                api.notification("Save file before continuing");
            }else {
                $("#edit").val("");
            }
        }
    });
    $("#saveButton").click(function() {
        if($("#edit").val().trim().length) {
            if(contents != undefined) {
                post.post("saveFile","TextPadKey2",null,{path:"/../"+dir,contents:$("#edit").val()});
            }else {
                save(function(){});
            }
        }else {
            api.notification("There's no text to save!");
        }
    });
    $("#loadButton").click(function() {
        if($("#edit").val().trim().length && contents != $("#edit").val()) {
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
        }else if($("#edit").val() == "" || $("#edit").val() == contents) {
            if(dir != undefined) {
                var pth = dir.substring(dir.indexOf("/"));
                post.post("checkExistence","TextPadKey3",null,{path:pth});
                post.once("existenceChecked","TextPadKey3",function(data) {
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
        });
    }
});
