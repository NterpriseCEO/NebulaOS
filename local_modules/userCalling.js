module.exports = function(client,io,fs) {
    var ss = require("socket.io-stream");
    /*ss(client).on("audio",function(stream,data) {
        console.log(stream)
        stream.pipe(fs.createWriteStream( Date.now() +'.txt'));
        stream.on("data",function(data2) {
            console.log(data2);
        });
    });*/
    client.on("audio",function(data) {
        console.log("test")
        console.log(data);
    });
}
