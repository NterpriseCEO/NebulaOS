var loaded = false,
    nickname,
    areLoaded = false;
$(".mItem[data-page='settingsPane']").click(function() {
    if(!loaded) {
        post.post("getContents","StoreKey17",null,{path:"/data/userSettings.json"});
        post.once("contentsGotten","StoreKey17",function(data) {
            if(data.exists) {
                var d = JSON.parse(data.contents),
                avatar = d.avatar.replace('url("','')
                .replace('")','');
                $("#userIcon").attr("src",avatar);
                $("#nickname").val(d.nickname);
                nickname = d.nickname;
            }
        });
        loaded = true;
    }
});
$("#userIcon").click(function() {
    post.post("openFile","StoreKey18",null,{supExts:[".jpg",".png"]})
    post.once("fileOpened","StoreKey18",function(img) {
        $("#userIcon").attr("src",img.contents);
        post.post("saveUserSettings","StoreKey18",null,
        {avatar:'url("'+img.contents+'")',nickname:$("#nickname").val()});
    });
});
$("#changeNickname").click(function() {
    if($("#nickname").val() != nickname) {
        post.post("saveUserSettings","StoreKey18",null,
        {avatar:'url("'+$("#userIcon").attr("src")+'")',nickname:$("#nickname").val()});
        alert(C.nicknameChanged)
    }
});

$(".mItem[data-page='wishPane']").click(function() {
    post.post("getContents","StoreKey26",null,{path:"/data/NebulaStoreData/data.json"});
    post.once("contentsGotten","StoreKey26",function(data3) {
        if(data3.exists) {
            var d = JSON.parse(data3.contents);
            $(".wishItem").remove();
            for(var i = 0; i < d.length; i++) {
                $("#wishlistItems").append("<li class = 'collection-item wishItem' data-src = '"+d[i][3]+"' data-aLink='"+d[i][0]+"'><a href = '#!'>"+d[i][4]+"</a></li>");
            }
        }
    });
});
$(document.body).on("click",".wishItem",function() {
    $("#thumbs_up,#thumbs_down").addClass("grey-text").removeClass("blue-text");
    $("#wishlist").text("favorite_border");
    var _this = this;
    post.post("getContents","StoreKey27",null,
    {path:"/../../../Applications/NebulaStore.app/apps/"+$(_this).attr("data-aLink")+"/app.json"});
    post.once("contentsGotten","StoreKey27",function(data) {
        if(data.exists) {
            post.post("getContents","StoreKey28",null,{path:"../../../Applications/NebulaStore.app/apps/"+$(_this).attr("data-aLink")+"/likes.json"});
            post.once("contentsGotten","StoreKey28",function(data3) {
                if(data3.exists) {
                    var r = JSON.parse(data3.contents);
                    $(".thumbs_up").text(r.likes);
                    $(".thumbs_down").text(r.dislikes);
                }
                post.post("getContents","StoreKey29",null,{path:"/data/NebulaStoreData/data.json"});
                post.once("contentsGotten","StoreKey29",function(data5) {
                    var d = JSON.parse(data5.contents);
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
                });
                run(data);
            });
        }
    });
    function run(data) {
        var d2 = JSON.parse(data.contents)
        $("#appTtl").text(d2.appName);
        $("#apAppIcon").css("backgroundImage","url("+d2.icon+")");
        $("#description").html(d2.appDescription);
        $("#appPane").removeClass("hide").attr("data-src",$(_this).attr("data-src"));
        $("#apAppImages").children().remove();
        post.post("readDir","StoreKey14",null,{path:"/../../../Applications/NebulaStore.app/apps/"+$(_this).attr("data-aLink")+"/images/"});
        post.once("folderContents","StoreKey14",function(data) {
            for(var i = 0; i < data.files.length; i++) {
                $("#apAppImages").append("<img src = '../apps/"+$(_this).attr("data-aLink")+"/images/"+data.files[i]+"'>");
            }
        });
    }
});

$(".mItem[data-page='developersPane']").click(function() {
    if(!areLoaded) {
        areLoaded = true;
        post.post("getContents","StoreKey32",null,{path:"/data/NebulaStoreData/myApps.data"});
        post.once("contentsGotten","StoreKey32",function(data) {
            if(data.exists) {
                var d = JSON.parse(data.contents);
                for(var i = 0; i <d.length;i++) {
                    $("#myApps").append("<li class ='collection-item myApp' data-rand = '"+d[i][0]+"'data-src='"+d[i][1]+"'><a href = '#!'>"+d[i][2]+"</a></li>")
                }
            }
        });
    }
});
