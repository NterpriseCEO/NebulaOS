module.exports = function(client,io) {
    var request = require("request"),
        cheerio = require("cheerio");
    client.on("loadWebpage",function(data) {
        request(data.url,function(error,resp,html) {
            if(!error) {
                var $ = cheerio.load(html);
                io.to(client.id).emit("pageContents",{html:html});
            }else {
                console.log(error);
            }
        });
    });
}
