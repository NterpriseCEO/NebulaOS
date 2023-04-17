var socket,
    notifsDisabled = false,
    post,
    lang = "EN",
    ngrok = window.location.protocol + "//" + window.location.host+"/",
    C;
window.openNumber = -1;
require.config({
    urlArgs: "v=1.0000000000001",
    paths: {
        socketio: "/socket.io/socket.io"
    },
    waitSeconds:0
});
require(["jquery","jquery.mobile"],function() {
    require(["socket.io"],function(io) {
        socket = io(ngrok);
        //socket = io("https://d3f325f0.ngrok.io");
        require(["login"],function() {
            $("#gkgmk input:eq(0)").val("alex");
            $("#gkgmk input:eq(1)").val("nuzum");
        });
    });
});
