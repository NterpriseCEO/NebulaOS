var path = window.location.protocol + "//" + window.location.host+"/public/";
require([path+"j/NebulaPM.js",path+"js/jquery.js"],function() {
    var post = new SecurePost();
    post.post("pageLoaded","AcceleronKey2");
    post.once("renderPage","AcceleronKey3",function(data) {
        $("body").html(data);
    });
});
