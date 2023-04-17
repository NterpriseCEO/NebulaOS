$(document).ready(function() {
    var errorPane = new BoxedFrame("errorPane","#");
    errorPane.addTo("body");
    errorPane.boxes(1,2);
    errorPane.setColor(1,1,"orange");
    errorPane.setColor(2,2,"darkOrange");
    errorPane.style("position","relative");
    errorPane.style("float","right");
    errorPane.style("left","-25vw");
    errorPane.style("top","10vh");
    var error = new Label("error","#")
    error.addTo(errorPane.atIndex(1,1));
    error.dimensions(10,12,30,10);
    error.setColor("rgba(0,0,0,0)");
    new Text("Connection Refused!","error");
});