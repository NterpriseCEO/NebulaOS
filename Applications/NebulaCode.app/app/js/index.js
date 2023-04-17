var post,dir,selected,contents,copy,toCut,openFolder,renderTree,
    saving = false,
    tabs = 1,
    tabSet = [],
    recents = [],
    ngrok = window.location.protocol + "//" + window.location.host+"/public/";
require([ngrok+"js/NebulaPM.js",ngrok+"js/jquery.js"],function() {
    require([ngrok+"js/Desktop/menus.js",ngrok+"js/NebulaAPI.js",ngrok+"js/materialize.min.js",ngrok+"js/jquery-ui.js"],function(menu,api) {
        post = new SecurePost();
        $("#fileTabs").sortable({containment:"parent"});
        function textNode(selector,setNode,value) {
            if(!setNode) {
                return $(selector).contents().filter(function() {
                    return this.nodeType == 3
                })[0].nodeValue.trimLeft();
            }else {
                return $(selector).contents().filter(function() {
                    return this.nodeType == 3
                })[0].nodeValue = value;
            }
        }
        function contains(selector,text) {
            var hasText = false;
            var isFolder = false;
            var _this;
            $(selector).filter(function() {
                if(textNode(this) == text) {
                    hasText = true;
                    _this = this;
                }
                if(textNode(this) == text && $(this).is(".folder")) {
                    isFolder = true;
                }
            });
            return [hasText,isFolder,_this];
        }
        $(document).ready(function() {
            openFolder = function(callback) {
                post.post("openFolderDialogue","NebulaCode1",null);
                post.once("folderSelected","NebulaCode1",function(data) {
                    renderTree(data);
                    var length = recents.length < 5?recents.length:5;
                    for(var i = 0; i < length;i++) {
                        if(recents[i] == data.path) {
                            break;
                        }
                        if(i == length-1 && length != 5) {
                            recents[i+1] = data.path;
                        }else if(i == length-1 && length == 5) {
                            recents.shift();
                            recents[4] = data.path;
                        }
                    }
                    if(length === 0) {
                        recents[0] = data.path;
                    }
                    post.post("saveFile","NebulaCode13",null,{path:"/data/NebulaCodeData/recents.data",contents:JSON.stringify(recents)});
                    if(callback) {
                        return callback();
                    }
                });
            }
            renderTree = function(data) {
                $("#projectTitle").text(data.path)
                dir = data.path;
                $("#files").children().remove();
                for(var i = 0; i < data.files.length;i++) {
                    $("#files").append("<div class = 'file col s12 white-text'>"+
                                            data.files[i]+
                                       "</div>");
                    $(".file:eq("+i+")").attr("data-path",data.path+"/"+data.files[i]);
                }
                for(var i = 0; i < data.folders.length;i++) {
                    $("#files").append("<div class = 'folder col s12 white-text' data-path = '"+data.path+"/"+data.folders[i]+"'><span>></span> "+data.folders[i]+"</div>");
                }
            }
            require(["startup"],function(){});
            $('.dropdown-trigger').dropdown();
            function append(append,text) {
                $(".editor:last").length?
                $(".editor:last").after(append):$("#editor").append(append);
            }

            $("#newFile").click(function() {
                newTab();
            });
            $("#saveFile").click(function() {
                saveFile();
            });
            $("#openNebulaSrc").click(function() {
                post.post("readDir","NebulaCode12",null,{path:"../../../../NebulaFull/"});
                post.once("folderContents","NebulaCode12",function(data) {
                    renderTree(data);
                });
            });

            $("#newTab").click(function() {
                newTab();
            });

            $(document.body).on("click",".aTab",function() {
                $(".file[data-tab='"+$(".selected").attr("data-tab")+"']")
                .removeClass("blue-text").addClass("white-text");
                $(".file[data-tab='"+$(this).attr("data-tab")+"']")
                .removeClass("white-text").addClass("blue-text")
                $(".aTab").removeClass("darken-4").addClass("darken-3")
                .removeClass("selected").addClass("grey-text");
                $(this).addClass("selected").removeClass("grey-text");
                $(".selected").removeClass("darken-3")
                .addClass("darken-4");
                $(".editor").addClass("hide");
                $("#"+$(this).attr("data-tab")).removeClass("hide")
                var num = $(this).attr("data-tab").match(/\d+$/);
                tabSet[num].focus();
            });

            $(document.body).on("keydown",".editor",function(e) {
                var num = $(this).attr("id").match(/\d+$/);
                setTimeout(function() {
                    contents = tabSet[num].session.getValue();
                },200)
            }).on("keyup",".editor",function() {
                var num = $(this).attr("id").match(/\d+$/);
                if(contents != tabSet[num].session.getValue()) {
                    $(this).attr("data-saved",false)
                }
            });

            $(document).on("keydown",function(e) {
                if(e.ctrlKey && e.which == 83) {
                    saveFile();
                    e.preventDefault();
                }else if(e.ctrlKey && e.which == 82) {
                    if($("#projectTitle").text() !== "") {
                        post.post("openApp","NebulaCode4",null,{path:$("#projectTitle").text(),basic:true});
                    }
                    e.preventDefault();
                }
            });
            $("#newProject").click(function() {
                post.post("openApp","NebulaCode7",null,{path:"Applications/NebulaCode.app/",basic:true});
            });
            $("#openProject").click(function() {
                openFolder();
            });

            $(document.body).on("mousedown",".file,.folder,#projectTitle",function(e) {
                e.stopPropagation();
                e.preventDefault();
                if(e.button == 0) {
                    $(".file,.folder").removeClass("blue-text").addClass("white-text");
                    $(this).addClass("blue-text").removeClass("white-text");
                    if(!$(this).is(".folder") && !$(this).is("#projectTitle")) {
                        open(this);
                    }else {
                        if($(this).children("span").text() == ">") {
                            $(this).children("span").html("&#8690;");
                        }else {
                            $(this).children("span").html(">")
                        }
                        if(!$(this).is("#projectTitle")) {
                            $(this).find(".file,.folder").toggle();
                            if($(this).find(".file,.folder").length == 0) {
                                var t = $(this).text();
                                t = t.substring(2,t.length)
                                var _this = this,
                                    DIR = $(this).parent().attr("data-path")||$("#projectTitle").text(),
                                    path = DIR+"/"+t;
                                post.post("readDir","NebulaCode5",null,{path:path});
                                post.once("folderContents","NebulaCode5",function(data) {
                                    if(data.files != undefined) {
                                        for(var i = 0; i < data.files.length;i++) {
                                            $(_this).append("<div class = 'file col s12 white-text' data-path = '"+path+"/"+data.files[i]+"'>"+
                                            data.files[i]+
                                            "</div>");
                                        }
                                    }
                                    if(data.folders != undefined) {
                                        for(var i = 0; i < data.folders.length;i++) {
                                            $(_this).append("<div class = 'folder col s12 white-text' data-path = '"+path+"/"+data.folders[i]+"'><span>></span> "+data.folders[i]+"</div>");
                                        }
                                    }
                                });
                            }
                        }
                    }
                }else if(e.button == 2) {
                    var _this = this,
                    useDir = $(_this).parent().is(".folder")?$(_this).parent().attr("data-path"):dir;
                    menu.menu(e,[
                        ["Open",function() {
                            if(!$(_this).is(".folder") && !$(_this).is("#projectTitle")) {
                                open(_this);
                            }
                        }],
                        ["New File",function() {
                            if($(_this).is(".folder") || $(_this).is("#projectTitle")) {
                                api.type({header:"New File",displayText:"Choose a name for this file."},function(name,clicked) {
                                    if(clicked) {
                                        if(($(_this).is(".folder") && contains($(_this).children(".file"),name))[0] ||
                                           ($(_this).is("#projectTitle") && contains($("#files").children(".file"),name))[0]) {
                                            alert("File Already Exists!");
                                        }else {
                                            var useDir = $(_this).is(".folder")?$(_this).attr("data-path"):$("#projectTitle").text();
                                            post.post("saveFile","NebulaCode10",null,{path:useDir+"/"+name});
                                            post.once("fileSaved","NebulaCode10",function() {
                                                var toAppend = "<div class = 'file col s12 white-text' data-path = '"+useDir+"/"+name+"'>"+name+"</div>",
                                                    parent = $(_this).is(".folder")?$(_this):$("#files"),
                                                    lastFile = parent.find(".file:last"),
                                                    lastFolder = parent.find(".folder:last");
                                                if(lastFile.length) {
                                                    lastFile.after(toAppend);
                                                    open(parent.find(".file:last"),true);
                                                }else if(lastFolder.length) {
                                                    lastFolder.before(toAppend);
                                                    open(parent.find(".file:last"),true);
                                                }else {
                                                    parent.append(toAppend);
                                                    open(parent.find(".file:last"),true);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }],
                        ["New Folder",function() {
                            if($(_this).is(".folder") || $(_this).is("#projectTitle")) {
                                api.type({header:"New Folder",displayText:"Choose a name for this folder."},function(name,clicked) {
                                    if(clicked) {
                                        if(($(_this).is(".folder") && contains($(_this).children(".folder"),name)[0]) ||
                                           ($(_this).is("#projectTitle") && contains($("#files").children(".folder"),name)[0])) {
                                            alert("Folder Already Exists!");
                                        }else {
                                            var useDir = $(_this).is(".folder")?$(_this).attr("data-path"):$("#projectTitle").text();
                                            post.post("saveFile","NebulaCode11",null,{path:useDir+"/"+name,isFolder:true});
                                            post.once("fileSaved","NebulaCode11",function() {
                                                var toAppend = "<div class = 'folder col s12 white-text' data-path = '"+useDir+"/"+name+"'><span>></span> "+name+"</div>",
                                                    parent = $(_this).is(".folder")?$(_this):$("#files"),
                                                    lastFile = parent.find(".file:last"),
                                                    lastFolder = parent.find(".folder:last");
                                                if(lastFile.length) {
                                                    lastFile.after(toAppend);
                                                }else if(lastFolder.length) {
                                                    lastFolder.before(toAppend);
                                                }else {
                                                    parent.append(toAppend);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }],
                        ["Rename",function() {
                            if(!$(_this).is("#projectTitle")) {
                                api.type({header:"Rename",displayText:"Choose a new name for this file."},function(name,clicked) {
                                    if(clicked) {
                                        if(($(_this).is(".file") && contains($(_this).parent().children(".file"),name)[0]) ||
                                           ($(_this).is(".folder") && contains($(_this).parent().children(".folder"),name)[0])) {
                                               alert("Cannot Rename. This Already Exists!");
                                        }else {
                                            var path = useDir+"/"+name,
                                            oldPath = useDir+"/"+textNode(_this);
                                            post.post("renameFileFolder","NebulaCode8",null,
                                            {oldPath:oldPath,newPath:path,isFolder:$(_this).is(".folder")});
                                            post.once("renamed","NebulaCode8",function(data) {
                                                if(!data.failed) {
                                                    if($(".aTab[data-tab='"+$(_this).attr("data-tab")+"']").length) {
                                                        textNode(".aTab[data-tab='"+$(_this).attr("data-tab")+"']",true,name);
                                                        $(".aTab[data-tab='"+$(_this).attr("data-tab")+"']").attr("data-path",path);
                                                        $("#"+$(_this).attr("data-tab")).attr("data-name",name);
                                                    }
                                                    textNode(_this,true," "+name);
                                                    $(_this).attr("data-path",path);
                                                    if($(_this).is(".folder")) {
                                                        $(_this).children(".folder").attr("data-path",path);
                                                        $(_this).find(".file,.folder").each(function() {
                                                            var tab = $(this).attr("data-tab");
                                                            var name = path+"/"+textNode(this);
                                                            $("#"+tab).attr("data-dir",name.substr(0,name.lastIndexOf("/")));
                                                            $(this).attr("data-path",name);
                                                            $(".aTab[data-tab='"+tab+"']")
                                                            .attr({"data-dir":name.substr(0,name.lastIndexOf("/")),"data-path":name});
                                                        });
                                                    }
                                                }else {
                                                    alert("Cannot Rename!");
                                                }
                                            });
                                        }
                                    }
                                });
                            }else {
                                alert("Cannot Rename");
                            }
                        }],
                        ["Delete",function() {
                            if(!$(_this).is("#projectTitle")) {
                                api.confirm({header:"Confirm",displayText:"Do you whish to delete this?"},function(clicked) {
                                    if(clicked) {
                                        var title = textNode(_this),
                                            toDelete = useDir+"/"+title.trimLeft();
                                        post.post("deleteFile","NebulaCode8",null,{path:"/"+toDelete,isFolder:$(_this).is(".folder"),
                                        clss:useDir,title:title,deleteRecursive:true});
                                        post.once("deleted","NebulaCode8",function() {
                                            if($(_this).is(".folder")) {
                                                var tab = $(".aTab[data-dir='"+$(_this).attr("data-path")+"']").attr("data-tab"),
                                                    index = $(".aTab[data-dir='"+$(_this).attr("data-path")+"']").index()-1,
                                                    path = $(_this).attr("data-path"),
                                                    textarea = $(".editor[data-dir='"+path+"']");
                                                $(".aTab[data-dir='"+textarea.attr("data-dir")+"']").remove();
                                                textarea.each(function() {
                                                    var index2 = $(this).index()-1;
                                                    $(".editor:eq("+index2+")").removeClass("hide");
                                                    $(".aTab:eq("+index2+")").removeClass("grey-text").addClass("selected darken-4 white-text");
                                                    $(".editor:eq("+index2+")").removeClass("hide");
                                                    $(this).remove();
                                                });
                                            }else {
                                                var tab = $(".aTab[data-path='"+$(_this).attr("data-path")+"']").attr("data-tab"),
                                                    index = $(".aTab[data-path='"+$(_this).attr("data-path")+"']").index()-1,
                                                    path = $(_this).attr("data-path"),
                                                    textarea = $(".editor[data-path='"+path+"']");
                                                $(".aTab[data-path='"+path+"']").remove();
                                                $("#"+tab).remove();
                                                $(".aTab:eq("+index+")").removeClass("grey-text").addClass("selected darken-4 white-text");
                                                $(".editor:eq("+index+")").removeClass("hide");
                                            }
                                            $(_this).remove();
                                        });
                                    }
                                });
                            }else {
                                alert("Cannot Delete");
                            }
                        }],
                        ["Copy",function() {
                            if(!$(_this).is("#projectTitle")) {
                                copy = _this;
                                toCut = false;
                            }
                        }],
                        ["Cut",function() {
                            copy = _this;
                            toCut = true;
                        }],
                        ["Paste",function(){
                            if(copy != undefined) {
                                if(($(_this).is(".folder") && copy != _this && $(copy).parent().attr("data-path") != $(_this).attr("data-path")) ||
                                   ($(_this).is("#projectTitle") && !$(copy).parent().is("#files"))) {
                                    checkForCopies(copy,_this,function(cut) {
                                        if(cut) {
                                            toCut = false;
                                            copy = undefined;
                                        }
                                    });
                                }
                            }
                        }]
                    ]);
                }
            });

            function checkForCopies(copy,_this,callback) {
                var sel = $(_this).is(".folder")?[$(_this),$(_this).attr("data-path")]:[$("#files"),$("#projectTitle").text()],
                    hasCopy = $(copy).is(".folder")?contains(sel[0].children(".folder"),textNode(copy)):contains(sel[0].children(".file"),textNode(copy)),
                    node = textNode(copy),
                    tNode = sel[1]+"/"+node,
                    fileName,
                    newFile = "";
                if(hasCopy[2] && !sel[0].is(".file")) {
                    for(var i = 0; i < sel[0].children(".file,.folder").length;i++) {
                        if($(copy).is(".file")) {
                            fileName = node.substr(0,node.lastIndexOf("."))+i+
                            node.substr(node.lastIndexOf("."),node.length);
                            console.log(fileName)
                            if(contains(sel[0].children(".file"),fileName)[0]) {
                                fileName = node.substr(0,node.lastIndexOf("."))+(i+1)+
                                node.substr(node.lastIndexOf("."),node.length);
                                newFile = fileName;
                            }
                        }else {
                            fileName = node+i;
                            if(contains(sel[0].children(".folder"),fileName)[0]) {
                                fileName = node+(i+1);
                                newFile = fileName;
                            }
                        }
                    }
                }else if(!hasCopy[2] && !sel[0].is(".file")){
                    newFile = node;
                }
                var file = $(copy).is(".folder")?newFile||node+0:newFile||node.substr(0,node.lastIndexOf("."))+0+
                node.substr(node.lastIndexOf("."),node.length),
                    newDir = sel[1]+"/"+file;
                post.post("copyFile","NebulaCode9",null,{path:$(copy).attr("data-path"),
                newPath:newDir+"/",cut:toCut,isFolder:$(copy).is(".folder")});
                post.once("pasted","NebulaCode9",function() {
                    sel[0].children(".file:last").after($(copy).clone());
                    var topName = newDir.substr(newDir.lastIndexOf("/")+1,newDir.length);
                    if(!$(copy).is(".folder")) {
                        sel[0].find(".file:last").attr("data-path",newDir);
                        textNode(sel[0].children(".file:last"),true,topName)
                    }else {
                        textNode(sel[0].children(".folder:first"),true," "+topName);
                        sel[0].children(".folder:first").attr("data-path",newDir);
                        sel[0].children(".folder:first").find(".file,.folder").each(function() {
                            var tab = $(this).attr("data-tab"),
                                newD = $(this).parent().attr("data-path")||newDir,
                                name = newD+"/"+textNode(this);
                            $("#"+tab).attr("data-dir",name.substr(0,name.lastIndexOf("/")));
                            $(this).attr("data-path",name);
                            $(".aTab[data-tab='"+tab+"']")
                            .attr({"data-dir":name.substr(0,name.lastIndexOf("/")),"data-path":name});
                        });
                    }
                    if(toCut) {
                        $(copy).remove();
                    }
                    return callback(toCut);
                });
            }

            function newTab() {
                tabs++;
                $(".file[data-tab='"+$(".selected").attr("data-tab")+"']")
                .removeClass("blue-text").addClass("white-text")
                $(".selected").removeClass("darken-4").addClass("darken-3");
                $(".aTab").removeClass("selected").addClass("grey-text");
                $("#fileTabs").append("<div class='aTab blue-grey darken-4 selected' data-tab = 'tab"+tabs+"'>Untitled<i class = 'material-icons closeTab'>close</i></div>");
                $(".editor").addClass("hide");
                append("<div id = 'tab"+tabs+"' class = 'editor' data-exists = 'false' data-saved='false'></div>");
                if($(".aTab").length > 3) {
                    $(".aTab").css("width","calc(100% / "+$(".aTab").length+")");
                }
                $("#fileTabs").scrollLeft($("#fileTabs")[0].scrollWidth);
                tabSet[tabs] = ace.edit("tab"+tabs);
                tabSet[tabs].setTheme("ace/theme/chaos");
                tabSet[tabs].session.setMode("ace/mode/txt");
                tabSet[tabs].focus();
            }

            function saveFile() {
                var t = $(".editor:visible"),
                    num = t.attr("id").match(/\d+$/);
                if(t.attr("data-saved") == "false") {
                    if(t.attr("data-exists") == "false" && !saving) {
                        saving = true;
                        post.post("saveFileDialogue","NebulaCode6",null,tabSet[num].session.getValue());
                        post.on("fileSaved","NebulaCode6",function(data) {
                            var dir = data.path;
                            dir = dir.substring(0,dir.lastIndexOf("/")+1);
                            $(".selected").text(data.name);
                            t.attr({"data-dir":dir,
                                    "data-name":data.name,
                                    "data-exists":"true",
                                    "data-saved":"true"
                                });
                            saving = false;
                        });
                    }else {
                        t.attr("data-saved",true)
                        alert(tabSet[num].session.getValue())
                        post.post("saveFile","NebulaCode3",null,{path:t.attr("data-dir")+"/"+t.attr("data-name"),contents:tabSet[num].session.getValue()});
                    }
                }
            }

            function open(_this,empty) {
                if($(".aTab[data-tab='"+$(_this).attr("data-tab")+"']").length == 0) {
                    tabs++;
                    $(_this).attr("data-tab","tab"+tabs);
                    $(".selected").removeClass("darken-4").addClass("darken-3");
                    $(".aTab").removeClass("selected").addClass("grey-text");
                    $("#fileTabs").append("<div class = 'aTab blue-grey darken-4 selected' data-tab = 'tab"+tabs+"'>"+$(_this).text()+"<i class = 'material-icons closeTab'>close</i></div>");
                    $(".editor").addClass("hide");
                    var name = textNode(_this),
                        useDir = $(_this).parent().is(".folder")?$(_this).parent().attr("data-path"):dir;
                    append("<div id = 'tab"+tabs+"' class = 'editor' data-exists = 'true' data-saved='true' data-dir = '"+useDir+"' data-name = '"+name+"'></div>",$(_this).text());
                    if($(".aTab").length > 3) {
                        $(".aTab").css("width","calc(100% / "+$(".aTab").length+")");
                    }
                    $("#fileTabs").scrollLeft($("#fileTabs")[0].scrollWidth);
                    $(".aTab:last")
                    .attr({"data-path":$(_this).attr("data-path"),"data-dir":useDir});
                    selected = "tab"+tabs;
                    tabSet[tabs] = ace.edit($(".editor:last").attr("id")),
                        modelist = ace.require("ace/ext/modelist"),
                        mode = modelist.getModeForPath(textNode(".aTab:last")).mode;
                    tabSet[tabs].session.setMode(mode);
                    tabSet[tabs].setTheme("ace/theme/chaos");
                    tabSet[tabs].focus();
                    if(empty == undefined) {
                        post.post("getContents","NebulaCode2",null,{path:useDir+"/"+$(_this).text()});
                        post.once("contentsGotten","NebulaCode2",function(data) {
                            if(!data.exists) {
                                alert("Error: File does not exist!");
                            }else {
                                tabSet[tabs].session.setValue(data.contents);
                            }
                        });
                    }
                }else {
                    var tab = $(_this).attr("data-tab"),
                        num = tab.match(/\d+$/);
                    if(!$(".aTab[data-tab='"+tab+"']").hasClass("selected")) {
                        $(".selected").removeClass("darken-4").addClass("darken-3");
                        $(".aTab").removeClass("selected").addClass("grey-text");
                        $(".aTab[data-tab='"+tab+"']").removeClass("darken-3").addClass("darken-4 selected");
                        $(".editor").addClass("hide");
                        $("#"+tab).removeClass("hide");
                    }
                    tabSet[num].focus();
                }
            }

            $(document.body).on("click",".closeTab",function(e) {
                var id = $(this).parent().attr("data-tab");
                var index = $(this).parent().is(".aTab:first")?$(this).parent().index()+1:$(this).parent().index()-1;
                if($(this).parent().is($(".aTab:last"))) {
                    if($(".aTab").length > 3) {
                        $(".aTab").css("width","calc(100% / "+$(".aTab").length+")");
                    }else {
                        $(".aTab").css("width","30%");
                    }
                }
                if($("#"+id).is(".editor:visible")) {
                    $(".file")
                    .removeClass("blue-text").addClass("white-text");
                    $(".file[data-tab='"+$(".aTab:eq("+index+")").attr("data-tab")+"']")
                    .removeClass("white-text").addClass("blue-text");
                    $(".aTab:eq("+index+")").addClass("selected")
                    .removeClass("grey-text");
                    $(".selected").removeClass("darken-3")
                    .addClass("darken-4");
                    $(".editor:eq("+index+")").removeClass("hide");
                }
                $("#"+id).remove();
                $(this).parent().remove();
                e.stopPropagation();
            });
            $("#openAsApp").click(function() {
                var isNebula = $("#projectTitle").text() == "../../../../NebulaFull/"?[ngrok+"/public",true]:[$("#projectTitle").text(),false];
                post.post("openApp","NebulaCode4",null,{path:isNebula[0],basic:true,isNebula:isNebula[1]})
            });
        });
    });
});
