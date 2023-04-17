var post,
    ngrok = window.location.protocol + "//" + window.location.host+"/public/",
    src = window.location.href,
    C;

require([ngrok+"js/NebulaPM.js"],function() {
    post = new SecurePost();
    post.post("ready","StoreKey0",null);
    post.once("appEvent","StoreKey0",function(data) {
        console.log(data);
        post.post("getContents","StoreKey01",null,{path:"../../../Applications/NebulaStore.app/app/langs/"+data.lang+".json",isFolder:false});
        post.once("contentsGotten","StoreKey01",function(datax) {
            if(datax.exists) {
                C = JSON.parse(datax.contents);
                for (var prop in C) {
                    if(C.hasOwnProperty(prop)) {
                        $("*[data-text='"+prop+"']").text(C[prop]);
                    }
                }
            }
            $("#menuBtn").sideNav();
            $(document).mousedown(function(e) {
                if(!$("#appPane").is(e.target) && $("#appPane").has(e.target).length == 0 && !$("#appPane").hasClass("hide")) {
                    $("#appPane").addClass("hide");
                }
            });
            post.init(function() {
                require(["account","appSystem","newApp"],function() {
                    $(".mItem").click(function() {
                        $("#menuBtn").sideNav("hide");
                        $(".container").addClass("hide");
                        $("#"+$(this).data("page")).removeClass("hide");
                        $("#title").text($("#"+$(this).data("page")).data("title"))
                        $("#search").toggle($("#whatsHotPane").is(":visible"));
                    });
                });
                /*$(".back[id='aPBack']").click(function() {
                    $(this).parent().parent().fadeOut();
                });*/
            });
        });
    });
});
