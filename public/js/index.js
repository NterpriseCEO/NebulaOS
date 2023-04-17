var socket,
    notifsDisabled = false,
    timeOn = new Date().getTime(),
    lang = "EN",
    post,
    forceQuit,
    ngrok = window.location.protocol + "//" + window.location.host+"/";
require.config({
    urlArgs: "v=1.0000000000001",
    paths: {
        socketio: "/socket.io/socket.io"
    }
});
window.openNumber = -1;
require(["jquery"],function() {
    require(["socket.io","jquery-ui","Desktop/desk","OpenCloseDeleteSaves","Taskbar/Task",
    "InfoPane/InfoPane","lowLevelAPI","materialize.min"],function(io) {
        socket = io(window.location.protocol + "//" + window.location.host);
        //socket = io(host);
        $("#gkgmk input:eq(0)").val("alex");
        $("#gkgmk input:eq(1)").val("nuzum");
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            alert("While Internet Explorer Eats a D*ck, why not download Chrome or Firefox?");
        }


        $(document).on("keydown",function(e) {
            if(e.ctrlKey && (e.keyCode == 81)) {
                require(["Desktop/applications"],function(app) {
                    if($("#gkgmk:visible").length === 0) {
                        app.app({src:"../Applications/ForceQuit.app"});
                    }
                });
            }else if(e.ctrlKey && (e.keyCode == 83)) {
                //ctrl+s
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 70)) {
                //ctrl+f
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 71)) {
                //ctrl+g
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 72)) {
                //ctrl+h
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 74)) {
                //ctrl+j
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 79)) {
                //ctrl+o
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 80)) {
                //ctrl+p
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 82)) {
                //ctrl+r
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 85)) {
                //ctrl+u
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 87)) {
                //ctrl+w
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 107)) {
                //ctrl+plus
                e.preventDefault();
            }else if(e.ctrlKey && (e.keyCode == 109)) {
                //ctrl+minus
                e.preventDefault();
            }
        });
        $("input").on("keydown",function(e) {
            if(e.keyCode == 27) {
                //space
                e.preventDefault();
            }
        });
    });
});
