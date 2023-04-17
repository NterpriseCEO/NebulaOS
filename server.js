var express = require("express"),
    https = require("https"),
    fs = require("fs-extra"),
    app = express();
app.use(express.static(__dirname));
app.get("/",function(req,res) {
    // console.log(res);
});
/*var sslOptions = {
    key: fs.readFileSync('cert/key.pem'),
    cert: fs.readFileSync('cert/cert.pem'),
    passphrase:"nebulaos"
};
var server = https.createServer(sslOptions,app);
*/
var server = require('http').createServer(app);

server.listen(8081);

global.io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"]
    }
  }),
    login = require("./local_modules/login.js"),
    saveFiles = require("./local_modules/fileFolderSave.js"),
    loadPage = require("./local_modules/loadWebpage.js"),
    calls = require("./local_modules/userCalling.js");

global.io.on("connection",function(client) {
    console.log("Client connected...");
    console.log(__dirname)
    login(client,global.io,__dirname);
    saveFiles(client,global.io,__dirname);
    loadPage(client,global.io);
    calls(client,global.io);
    var room;
    client.on("createRoom",function(data) {
        console.log("Connected to: "+data.room);
    	room = data.room;
    });
    client.on("sendMessage",function(data2) {
        client.join(data2.receiver);
        client.broadcast.to(room).emit("message",{message:data2.message,user:data2.user});
        client.broadcast.to(data2.receiver).emit("message",{message:data2.message,user:data2.user});
        console.log("Sending to: "+data2.receiver);
    });
});
//All lines in project 15/05/2021 - 14761
