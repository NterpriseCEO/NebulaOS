var cmd,
    openApp = false,
    dir = "none",
    dirShow = "",
    ngrok = window.location.protocol + "//" + window.location.host+"/public/";
require([ngrok+"js/jquery.js",ngrok+"js/NebulaPM.js"],function() {
    var post = new SecurePost();
    $(document).ready(function() {
        $("#cmd").append("Commander started:"+new Date().toLocaleString("en-GB")+"<br>")
        $("#cmd").append("Type -help for list of commands<br>");
        $("#cmd").append("Directory: "+dir+"<br>");
        post.post("getUsername","TCommand2",null);
        post.once("usernameGotten","TCommand2",function(data) {
            var usr = data.username;
            dir = usr;
            $("input").keyup(function(e) {
                if(e.keyCode == 13) {
                    $("#run").click();
                }
            });
            $("#run").click(function() {
                openApp = false;
                var val = $("#type").val(),cmd;
                if(val != "") {
                    if(val.startsWith("app-open")) {
                        openApp = true;
                        var lio = val.substr(val.lastIndexOf("app-open")+9);
                        post.post("openApp","TCommand1",null,{name:lio});
                        post.once("openAppComplete","TCommand1",function(data) {
                            if(data.opened) {
                                cmd = "'"+lio+"' opened";
                            }else {
                                cmd = "'"+lio+"' isn't installed!"
                            }
                            $("#cmd").append(cmd+"<br>");
                        });
                    }else if(val.startsWith("cd")) {
                        var curDirShow = dirShow,
                            newPath,
                            sub = val.substr(val.lastIndexOf("cd")+3)
                        if(sub == "../" && dir != usr) {
                            newPath = dir.substring(dir.lastIndexOf("/")+1,dir.lastIndexOf("/"));
                            dirShow = newPath+"/>";
                        }else {
                            if(dir == usr) {
                                dir = "";
                            }
                            newPath = dir+"/"+sub;
                            dirShow = dir+"/"+sub+">";
                        }
                        openApp = true;
                        post.post("checkExistence","TCommand3",null,{path:newPath,isFolder:true});
                        post.once("existenceChecked","TCommand3",function(data2) {
                            if(data2.exists) {
                                dir = newPath;
                                dirShow = usr+"/"+dirShow;
                                $("#cmd").append(dirShow+" "+cmd+"<br>");
                            }else {
                                sub = newPath;
                                $("#cmd").append(curDirShow+"cd failed: "+usr+"/"+sub+" does not exist!<br>");
                            }
                        });
                        cmd = val;
                    }else if(val.startsWith("topdir")) {
                        openApp = true;
                        curDirShow = dirShow;
                        cmd = val;
                        post.post("checkExistence","TCommand3",null,{path:val.substr(val.lastIndexOf("cd")+8),isFolder:true});
                        post.once("existenceChecked","TCommand3",function(data2) {
                            if(data2.exists) {
                                dir = "/"+val.substr(val.lastIndexOf("cd")+8);
                                $("#cmd").append(usr+dir+"> "+cmd+"<br>");
                            }else {
                                sub = newPath;
                                $("#cmd").append(curDirShow+"cd failed: "+usr+"/"+sub+" does not exist!<br>");
                            }
                        });
                    }else if(val.endsWith("-n") && dir != usr) {
                        var file = val.substr(0,val.lastIndexOf("-n")-1)
                        post.post("saveFile","TCommand4",null,{path:dir+"/"+file});
                        post.once("fileSaved","TCommand4",function() {
                            $("#cmd").append("File created.<br>");
                        });
                        cmd = val;
                    }else if(val.endsWith("-r") && dir != usr) {
                        var file = val.substr(0,val.lastIndexOf("-r")-1)
                        post.post("getContents","TCommand5",null,{path:dir+"/"+file});
                        post.once("contentsGotten","TCommand5",function(data) {
                            $("#cmd").append("<pre>"+data.contents+"</pre><br>");
                        });
                        cmd = val;
                    }else if(val.endsWith("-del") && dir != usr) {
                        var file = val.substr(0,val.lastIndexOf("-del")-1)
                        post.post("deleteFile","TCommand6",null,{path:dir+"/"+file});
                        post.once("deleted","TCommand6",function() {
                            $("#cmd").append("File deleted.");
                        });
                        cmd = val;
                    }/*else if(val == "folder-contents") {
                        post.post("readDir","TCommand7",null,{path:dir+"/"});
                        post.once("folderContents","TCommand7",function(data) {
                            $("#cmd").append("Files:<br>");
                            for(var i = 0; i < data.files.length;i++) {
                                $("#cmd").append(data.files[i]+"<br>");
                            }
                            $("#cmd").append("Folders:<br>");
                            for(var o = 0; o <data.folders.length;i++) {
                                $("#cmd").append(data.folders[i]+"<br>");
                            }
                        });
                        cmd = val;
                    }*/else if(val == "-help") {
                        cmd = "type file name +<br> -n to create it<br> -r to read it<br>"
                        +"-del to delete it<br>Type cd + directory to open folder<br>"
                        +"type topdir to navigate the main folders<br> Type app-open App Name to open apps"
                    }else {
                        cmd = "Command '"+val+"' not found!";
                    }
                    if(!openApp) {
                        $("#cmd").append(dirShow+" "+cmd+"<br>");
                    }
                    $("#type").val("");
                    $("#type").focus();
                    var d = $('#cmd');
                    d.scrollTop(d.prop("scrollHeight"));
                }
            });
        });
    });
});
