var canvas = new Background();
var sprite = new ColouredSprite(220,370,"rect");
var sprite2 = new ColouredSprite(100,120,"textured");
var doXM = true;
var doXP = true;
//var character = new TexturedSprite(35.5,45.5);
//var character2 = new TexturedSprite(35.5,45.5);
$(document).ready(function(e) {
    canvas.canvasToUse("gameFrame");
    canvas.size("100vw","100vh");
    canvas.colour("#FF8000");
    canvas.resizeToFrame(true); 
    sprite.spriteData("sprite","100vw","100vh",1,"rgba(256,256,256,0.0)");
    sprite.position(1,10);
    sprite.render();
    
    sprite2.spriteData("sprite2","100vw","100vh",2);
    sprite2.position(250,0);
    sprite2.texture("dude.png");
    sprite2.render();
    
    window.addEventListener("keydown", sprite2.keysPressed, false);
    window.addEventListener("keyup", sprite2.keysReleased, false);
    //window.addEventListener("keydown", keyboard, false);
    //window.addEventListener("keyup", sprite.keysReleased, false);
    var objs = [];
    objs.push(sprite);
    objs.push(sprite2);
    setInterval(
                function(){ 
                    if(objs[1].posX() < objs[0].posX() + objs[0].width() ) {
                        console.log("Collided");
                        doXM = false;
                    }
                    /*&& 
                       objs[1].posX() + objs[1].width() > objs[0].posX() && 
                       objs[1].posY() < objs[0].posY() + objs[0].height() && 
                       objs[1].height() + objs[1].posY() > objs[0].posY()*/
                },1000);
    //setInterval(function(){ alert(objs[1].posX()); },10000);
    
});