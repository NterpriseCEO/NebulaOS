$("#disableNotifs").change(function() {
    post.post("getContents","SettingsKey19",null,{path:"/data/userSettings.json"});
    post.once("contentsGotten","SettingsKey19",function(data) {
        if(data.exists) {
            var c = JSON.parse(data.contents);
            c.notificationsDisabled = !$("#disableNotifs").is(":checked");
            post.post("saveFile","SettingsKey20",null,{path:"/data/userSettings.json",contents:JSON.stringify(c)});
        }
    });
});
$(document.body).on("change",".disableNotifs",function() {
    post.post("getContents","SettingsKey22",null,{path:"/data/appsThatNotify.json"});
    post.once("contentsGotten","SettingsKey22",function(data) {
        if(data.exists) {
            var c = JSON.parse(data.contents);
            for(var i = 0; i <c.apps.length;i++) {
                c.apps[i][2] = $(".disableNotifs:eq("+i+")").is(":checked");
            }
            post.post("saveFile","SettingsKey23",null,{path:"/data/appsThatNotify.json",contents:JSON.stringify(c)});
        }
    });
    $(this).is(":checked")
});
