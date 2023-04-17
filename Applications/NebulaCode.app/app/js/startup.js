post.post("getContents","NebulaCode14",null,{path:"/data/NebulaCodeData/recents.data"});
post.once("contentsGotten","NebulaCode14",function(data) {
    if(data.exists) {
        var c = JSON.parse(data.contents);
        if(c.length) {
            $(".collection").removeClass("hide");
            $("#noRecents").remove();
        }
        for(var i = 0; i < c.length;i++) {
            recents[i] = c[i];
            $(".collection").append("<li class = 'collection-item'>"+c[i]+"</li>");
        }
    }
});
$("ul.tabs").tabs();
$(document.body).on("click",".tab",function() {
    var id = $(this).find("a").attr("href");
    id = id.substring(1,id.length);
});
$(document.body).on("click",".collection-item",function() {
    post.post("readDir","NebulaCode12",null,{path:$(this).text()});
    post.once("folderContents","NebulaCode12",function(data) {
        renderTree(data);
        $("#startUp").addClass("Hide");
        init();
    }); 
});

$("#new").click(function() {
    $("#startUp").addClass("Hide");
    $("#tab1").focus();
    init();
});
$("#open").click(function() {
    openFolder(function() {
        $("#startUp").addClass("Hide");
        init();
    });
});
function init() {
    tabSet[tabs] = ace.edit("tab1");
    tabSet[tabs].setTheme("ace/theme/chaos");
    tabSet[tabs].session.setMode("ace/mode/php");
    tabSet[tabs].focus();
}
