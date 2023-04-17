require(["Desktop/applications"],function(app) {
    $("#search").click(function() {
        $("#searchBar,#loadFiles").show();
        $("#searchWrap").fadeIn("slow").animate({width:"60%",height:"7.5vh",left:"20%",top:"5vh"},
        500,function() {
            $("#searchBox").focus();
        });
        setTimeout(function() {
            $("#disableBox").fadeIn();//.addClass("dBlur");
        },400)
        $(".desktop-box,.iPane").fadeOut("fast");
    });
    $("#searchBox").keypress(function() {
        $("#searchResults").slideDown();
        $("#searchBar,#searchBox").css({borderBottomLeftRadius:0,borderBottomRightRadius:0});
    });
    $("#searchBox").keyup(function() {
        if($("#searchBox").val().length == 0) {
            $("#searchResults").slideUp(400,function() {
                $("#searchBar,#searchBox").css("borderRadius","0.7vw");
                $("#infoSide").empty();
            });
        }else {
            $("#results .sR,#fileResults .sR").remove();
            console.log($("#usernameDisplay").text());
            socket.emit("readAllDirs",{path:$("#usernameDisplay").text()});
            socket.once("allDirsRead",function(data) {
                $("#fileResults .sR").remove();
                for(var i = 0; i < data.files.length; i++) {
                    var file = data.files[i];
                    file = file.substr(file.lastIndexOf("\\")+1,file.length);
                    console.log(file);
                    if(file.indexOf($("#searchBox").val()) > -1) {
                        $("#fileResults").append("<div class = 'sR fSR' data-file-src = '"+data.files[i]+"'>"+file+"</div>");
                    }
                    if(i == data.files.length-1 && $("#fileResults .sR").length == 0){
                        $("#fileResults").append("<div class = 'sR'>No File matches</div>");
                    }
                }
            });
            $(".table5 .icon").each(function() {
                var title = $(this).attr("title");
                var val = $("#searchBox").val();
                if(title.toUpperCase().indexOf(val.toUpperCase()) > -1) {
                    var icon = $(this).attr("data-src")+"/images/icon.png";
                    $("#results").append("<div class = 'sR' data-src='"+$(this).attr("data-src")+"'>"+title+"<div class = 'icon'></div></div>");
                    $(".sR .icon:last").css("backgroundImage","url('"+icon+"')");
                }
            });
        }
    });
    $(document.body).on("dblclick",".sR",function() {
        if(!$(this).hasClass("fSR")) {
            var src = $(this).attr("data-src");
            app.app({src:src});
        }else {
            loadFile($(this).data("file-src"));
        }
        hideBox();
    });
    $(document.body).on("click",".sR",function() {
        if(!$(this).hasClass("fSR")) {
            var icon = $(this).attr("data-src")+"/images/icon.png";
            $("#infoSide").html("<div class = 'icon'></div>"+$(this).text()+"<a id = 'open' class = 'btn blue' data-src='"+$(this).attr("data-src")+"'>Open App</a>");
            $("#infoSide .icon").css("backgroundImage","url('"+icon+"')");
        }else {
            $("#infoSide").html($(this).text()+"<a id = 'open' class = 'btn blue' data-file-src='"+$(this).data("file-src")+"'>Open File</a>");
        }
    });
    $(document.body).on("click","#open",function() {
        if($(this).data("file-src") == undefined) {
            var src = $(this).attr("data-src");
            app.app({src:src});
        }else {
            loadFile($(this).data("file-src"));
        }
        hideBox();
    });
    String.prototype.nthIndexOf = function(s, n) {
        var i = -1;
        while(n-- > 0 && -1 != (i = this.indexOf(s, i+1)));
        return i;
    }
    function loadFile(path) {
        $.getJSON(ngrok+"public/js/defaults.json",function(result) {
            var array = $.map(result,function(value) {
                return [value];
            });
            for(var i = 0; i < array.length;i++) {
                if(path.endsWith(array[i][0])) {
                    path = path.substring(path.nthIndexOf("/",4));
                    require(["Desktop/applications"],function(app) {
                        app.app({src:array[i][1],path:"../../../"});
                        post.once("ready","all",function(data,key,sender) {
                            post.post("openFile",key,sender,{path:path});
                        });
                    });
                    break;
                }
            }
        });
    }

    $("#disableBox").click(function(e) {
        if($("#searchWrap").css("display") == "block") {
            hideBox();
        }
    });
    function hideBox() {
        $("#searchWrap").animate({width:0,height:0,left:"50vw",top:"8.75vh"},500,function() {
            $(this).hide();
        })
        $("#disableBox").fadeOut("slow");//.removeClass("dBlur");
        $(".desktop-box,.iPane").fadeIn("fast");
        $("#searchBox").val("");
        $("#results,#infoSide").empty();
        $("#searchResults").slideUp(400,function() {
            $("#searchBar,#searchBox").css("borderRadius","0.7vw");
        });
    }
    $(document).keyup(function(e) {
        if(e.keyCode == 27) { // escape key maps to keycode `27`
            if($("#searchWrap").css("display") == "block") {
                hideBox();
            }
        }
    });
});
