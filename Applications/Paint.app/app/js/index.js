var lc = LC.init(
    document.getElementsByClassName('my-drawing')[0],
    {imageURLPrefix: 'images/'}
);
var ngrok = window.location.protocol + "//" + window.location.host+"/public/";
require([ngrok+"js/NebulaAPI.js",ngrok+"js/NebulaPM.js"],
function(api) {
    var post = new SecurePost(),
        dir,
        img,
        IMG = new Image();
    post.post("ready","PaintKey0",null);
    post.once("openFile","PaintKey0",function(data) {
        post.post("getContents","PaintKey1",null,{path:data.path});
        post.once("contentsGotten","PaintKey1",function(image) {
            dir = data.path;
            img = image.contents;
            IMG.src = img;
            lc.saveShape(LC.createShape("Image",{x:0, y:0, image:IMG}));
        });
    });
    function load() {
        post.post("openFile","PaintKey2",null,{supExts:[".png",".jpg"]});
        post.once("fileOpened","PaintKey2",function(data) {
            dir = data.dir;
            img = data.contents;
            IMG.src = img;
            lc.clear();
            lc.saveShape(LC.createShape("Image",{x:0, y:0, image:IMG}));
        });
    }
    $(".dropdown-trigger").dropdown();
    $("#saveButton").click(function() {
        if(lc.getImage() != undefined) {
            if(img != undefined) {
                post.post("saveFile","PaintKey3",null,{path:dir,contents:lc.getImage().toDataURL()});
                img = lc.getImage().toDataURL();
                IMG.src = img;
            }else {
                save(function(){});
            }
        }
    });
    $("#loadButton").click(function() {
        if(lc.getImage() != null && img != lc.getImage().toDataURL()) {
            if(dir != undefined) {
                api.confirm({header:"Confirm",displayText:"Do you wish to save this file first?"},
                function(ok) {
                    if(ok) {
                        post.post("saveFile","PaintKey4",null,{path:dir,contents:lc.getImage().toDataURL()});
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
        }else if(lc.getImage() == undefined ||
                 lc.getImage() == img) {
            if(dir != undefined) {
                post.post("checkExistence","PaintKey5",null,{path:dir});
                post.once("existenceChecked","PaintKey5",function(data) {
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
    $("#newButton").click(function() {
        if(lc.getImage() != null) {
            if(img == lc.getImage().toDataURL()) {
                dir = undefined;
            }else {
                if(dir != undefined) {
                    post.post("checkExistence","PaintKey6",null,{path:dir});
                    post.post("existenceChecked","PaintKey6",function(data) {
                        if(!data.exists) {
                            api.confirm({header:"Confirm",displayText:"Do you wish to save this file first?"},
                            function(ok) {
                                if(ok) {
                                    save(function() {
                                    });
                                }
                            });
                        }else {
                            post.post("saveFile","PaintKey7",null,{path:dir,contents:lc.getImage().toDataURL()});
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
            }
        }
        lc.clear();
    });
    function save(callback) {
        post.post("saveFileDialogue","PaintKey8",null,lc.getImage().toDataURL());
        post.once("fileSaved","PaintKey8",function(data) {
            dir = data.path;
            img = lc.getImage().toDataURL();
            IMG.src = img;
            return callback();
        });
    }
});
