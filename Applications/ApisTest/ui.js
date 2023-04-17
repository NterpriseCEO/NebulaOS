$(document).ready(function() {
    //var appLayer = new Layer("appLayer","#",0,"body")
    var menuPane = new Layer("menuPane","#",1,"body");
    
    var menu = new BoxedFrame("menu","#");
    
    menu.addTo(menuPane.this());
    menu.boxes(1,2)
});