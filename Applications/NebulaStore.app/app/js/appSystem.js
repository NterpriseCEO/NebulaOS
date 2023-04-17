post.post("getContents","StoreKey8",null,{path:"/../../../Applications/NebulaStore.app/data/appData.json"});
post.once("contentsGotten","StoreKey8",function(data) {
    console.log(data)
    var d = JSON.parse(data.contents)
    for(var i = 0; i < d.apps.length; i++) {
        $("#whatsHotPane .row").append("<div class = 'col s2'><div class = 'appWTitle'><div class = 'appIconSml appIcon' data-aLink = '"+d.apps[i][0]+"'></div>"+d.apps[i][1]+"</div></div>");
        $(".appIconSml.appIcon[data-aLink='"+d.apps[i][0]+"']")
        .css("backgroundImage","url('../data/icons/"+d.apps[i][0]+".png')").attr("data-src",d.apps[i][2]);
    }
});
$(".mItem").click(function() {
    $("#"+$(this).attr("data-link")).show();
    if("#"+$(this).attr("data-page") == "#whatsHotPane") {
        $("#hotApps .row").children().remove();
        post.post("getContents","StoreKey9",null,{path:"/../../../Applications/NebulaStore.app/data/appData.json"});
        post.once("contentsGotten","StoreKey9",function(data) {
            var d = JSON.parse(data.contents)
            $("#whatsHotPane .row .col").remove();
            for(var i = 0; i < d.apps.length; i++) {
                $("#whatsHotPane .row").append("<div class = 'col s2'><div class = 'appWTitle'><div class = 'appIconSml appIcon' data-aLink = '"+d.apps[i][0]+"'></div>"+d.apps[i][1]+"</div></div>");
                $(".appIconSml.appIcon[data-aLink='"+d.apps[i][0]+"']")
                .css("backgroundImage","url('../data/icons/"+d.apps[i][0]+".png')").attr("data-src",d.apps[i][2]);
            }
        });
    }
});
$(document.body).on("click",".appIconSml.appIcon",function() {
    $("#thumbs_up,#thumbs_down").addClass("grey-text").removeClass("blue-text");
    $("#wishlist").text("favorite_border");
    var _this = this;
    post.post("getContents","StoreKey10",null,
    {path:"/../../../Applications/NebulaStore.app/apps/"+$(_this).attr("data-aLink")+"/app.json"});
    post.once("contentsGotten","StoreKey10",function(data) {
        post.post("getContents","StoreKey16",null,{path:"../../../Applications/NebulaStore.app/apps/"+$(_this).attr("data-aLink")+"/likes.json"});
        post.once("contentsGotten","StoreKey16",function(data2) {
            if(data2.exists) {
                var r = JSON.parse(data2.contents);
                $(".thumbs_up").text(r.likes);
                $(".thumbs_down").text(r.dislikes);
                userLikes();
            }else {
                userLikes();
            }
            run(data);
        });
    });
    function userLikes() {
        post.post("getContents","StoreKey21",null,{path:"/data/NebulaStoreData/data.json"});
        post.once("contentsGotten","StoreKey21",function(data4) {
            if(data4.exists) {
                var d = JSON.parse(data4.contents);
                for(var i = 0; i < d.length; i++) {
                    if(d[i][0] == $(_this).attr("data-aLink")) {
                        if(d[i][1]) {
                            $("#thumbs_up").addClass("blue-text").removeClass("grey-text");
                        }else if(d[i][1] != null) {
                            $("#thumbs_down").addClass("blue-text").removeClass("grey-text");
                        }
                        if(d[i][2]) {
                            $("#wishlist").text("favorite");
                            $("#wishlist").attr("title",C.removeFromWishlist);
                        }
                        break;
                    }
                }
            }
        });
    }
    function run(data) {
        var d2 = JSON.parse(data.contents)
        $("#appTtl").text(d2.appName);
        $("#apAppIcon").css("backgroundImage","url("+d2.icon+")");
        console.log(d2)
        $("#description").html(d2.appDescription);
        $("#appPane").removeClass("hide").attr("data-src",$(_this).attr("data-src"));
        $("#apAppImages").children().remove();
        $("#apAppImages").addClass("hide");
        $(".card-title:contains('Images')").addClass("hide");
        post.post("readDir","StoreKey14",null,{path:"/../../../Applications/NebulaStore.app/apps/"+$(_this).attr("data-aLink")+"/images/"});
        post.once("folderContents","StoreKey14",function(data) {
            for(var i = 0; i < data.files.length; i++) {
                $(".card-title:contains('Images')").removeClass("hide");
                $("#apAppImages").removeClass("hide").append("<img src = '../apps/"+$(_this).attr("data-aLink")+"/images/"+data.files[i]+"'>");
            }
        });
    }
});
$("#closeAppPane").click(function() {
    $("#appPane").addClass("hide");
});
$("#thumbs_up,#thumbs_down").click(function() {
    var num1 = parseInt($(".thumbs_up").text()),
        num2 = parseInt($(".thumbs_down").text())
        _this = this;
    if($(this).is($("#thumbs_up"))) {
        if($("#thumbs_up").hasClass("blue-text")) {
            $(this).toggleClass("blue-text").addClass("grey-text")
            num1--;
            $(".thumbs_up").text(num1);
        }else {
            if($("#thumbs_down").hasClass("blue-text")) {
                num2--;
                $(".thumbs_down").text(num2);
                $("#thumbs_down").toggleClass("blue-text").toggleClass("grey-text");
            }
            num1++;
            $(this).toggleClass("blue-text").toggleClass("grey-text");
            $(".thumbs_up").text(num1);
        }
    }else {
        if($("#thumbs_down").hasClass("blue-text")) {
            $(this).toggleClass("blue-text").addClass("grey-text");
            num2--;
            $(".thumbs_down").text(num2);
        }else {
            if($("#thumbs_up").hasClass("blue-text")) {
                num1--;
                $(".thumbs_up").text(num1);
                $("#thumbs_up").toggleClass("blue-text").toggleClass("grey-text");
            }
            num2++;
            $(this).toggleClass("blue-text").toggleClass("grey-text");
            $(".thumbs_down").text(num2);
        }
    }
    var rating = {likes:num1,dislikes:num2};
    var src = $("#appPane").attr("data-src");
    src = "../"+src.substr(0,src.lastIndexOf("/")+1)+"likes.json";
    var wishlist = $("#wishlist").text() == "favorite";
    post.post("saveFile","StoreKey15",null,{path:src,contents:JSON.stringify(rating)});
    post.post("getContents","StoreKey19",null,{path:"/data/NebulaStoreData/data.json"});
    post.once("contentsGotten","StoreKey19",function(data) {
        var likedApps = [];
        var liked = $(_this).is($("#thumbs_up"));
        if($("#thumbs_up,#thumbs_down").filter(".grey-text").length == 2) {
            liked = null;
        }
        src = $("#appPane").attr("data-src")
        if(data.exists) {
            var d = JSON.parse(data.contents);
            for(var i = 0; i < d.length; i++) {
                if(d[i][0] == $(".appIcon[data-src='"+src+"']").attr("data-aLink")) {
                    d[i][1] = liked;
                    d[i][2] = wishlist;
                    d[i][3] = src;
                    d[i][4] = $("#appTtl").text();
                    break;
                }else {
                    d[d.length-1] = [$(".appIcon[data-src='"+src+"']").attr("data-aLink"),liked,wishlist,src,$("#appTtl").text()];
                    break;
                }
            }
            likedApps = d;
            post.post("saveFile","StoreKey20",null,{path:"/data/NebulaStoreData/data.json",contents:JSON.stringify(likedApps)});
        }else {
            likedApps[0] = [$(".appIcon[data-src='"+src+"']").attr("data-aLink"),liked,wishlist,src,$("#appTtl").text()];
            post.post("saveFile","StoreKey24",null,{path:"/data/NebulaStoreData/data.json",contents:JSON.stringify(likedApps)});
        }
    });
});
$("#wishlist").click(function() {
    if($(this).text() == "favorite_border") {
        $(this).text("favorite");
        $("#wishlist").attr("title",C.removeFromWishlist);
    }else {
        $(this).text("favorite_border");
        $("#wishlist").attr("title",C.addToWishlist);
    }
    var _this = this;
    post.post("getContents","StoreKey22",null,{path:"/data/NebulaStoreData/data.json"});
    post.once("contentsGotten","StoreKey22",function(data) {
        var wishlist = $(_this).text() == "favorite";
        src = $("#appPane").attr("data-src");
        var wishes = [];
        var liked = $("#thumbs_up").hasClass("blue-text");
        if($("#thumbs_up,#thumbs_down").filter(".grey-text").length == 2) {
            liked = null;
        }
        if(data.exists) {
            var d = JSON.parse(data.contents);
            for(var i = 0; i < d.length; i++) {
                if(d[i][0] == $(".appIcon[data-src='"+src+"']").attr("data-aLink")) {
                    d[i][2] = wishlist;
                    d[i][3] = src;
                    d[i][4] = $("#appTtl").text();
                    break;
                }else {
                    d[d.length] = [$(".appIcon[data-src='"+src+"']").attr("data-aLink"),liked,wishlist,src,$("#appTtl").text()];
                }
            }
            wishes = d;
            post.post("saveFile","StoreKey20",null,{path:"/data/NebulaStoreData/data.json",contents:JSON.stringify(wishes)});
        }else {
            wishes[0] = [$(".appIcon[data-src='"+src+"']").attr("data-aLink"),liked,wishlist,src,$("#appTtl").text()];
            post.post("saveFile","StoreKey25",null,{path:"/data/NebulaStoreData/data.json",contents:JSON.stringify(wishes)});
        }
    });
});
$("#download").click(function() {
    var dName = $("#appPane").attr("data-src");
    dName = dName.slice(4);
    post.post("addApp","StoreKey12",null,
    {title:$("#appTtl").text(),path:dName})
});

function throttle(f, delay){
    var timer = null;
    return function(){
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = window.setTimeout(function(){
            f.apply(context, args);
        },
        delay || 500);
    };
}

$("#search").keyup(throttle(function(e) {
    if($("#search").val()) {
        $(".page:visible .appWTitle").filter(function() {
            return $(this).text().toLowerCase().lastIndexOf($("#search").val().toLowerCase()) == -1;
        }).parent().addClass("hide");
    }else {
        $(".page:visible .col").removeClass("hide");
    }
},100));
