let fs = require("fs-extra");

module.exports = function(client,io,dir) {
    var path = /*"C:/Users/intern/Desktop/alex/publicFull/"*/ "E:/publicFull";
    client.on("cUsername",function(data) {
        checkUserSync(data.username,data.password,true,data.accessCode);
    });
    client.on("checkLogin",function(data) {
        checkUserSync(data.username,data.password,false);
    });
    client.on("saveOS",function(data) {
        fs.writeFile(dir+"/public/userData/"+data.user+"/data/data",data.contents,function(error) {
            if(error) {
                console.log(error);
            }
            console.log("worked");
            io.to(client.id).emit("OSSaved");
        });
    });
    client.on("saveUserSettings",function(data) {
        var obj = {avatar:data.avatar,nickname:data.nickname};
        var save = JSON.stringify(obj,null,2);
        fs.truncate(dir+"/public/userData/"+data.user+"/data/userSettings.json", 0, function() {
            fs.writeFile(dir+"/public/userData/"+data.user+"/data/userSettings.json",save,"utf-8",function(error) {
                console.log("saved");
                if(error) {
                    console.log(error);
                }
            });
        });
    });
    function checkUserSync(user,password,c,keyCode) {
        var folders = ["","/Desktop","/Documents","/Images_Video","/Music","/data"];
        try {
            fs.statSync(dir+"/public/users/"+user);
            fs.readFile(dir+"/public/users/"+user,"utf8",function(error,data) {
                if(error) {
                    console.log(error);
                }
                if(data == password) {
                    io.to(client.id).emit("userExists");
                    console.log(user)
                    client.join(user);
                }else {
                    io.to(client.id).emit("wrong",{message:"Username or Password is Wrong"});
                }
            });
        } catch(e){
            if(c) {
                console.log(dir+"/keyCodes/"+keyCode)
                fs.stat(dir+"/keyCodes/"+keyCode,function(error) {
                    if(error) {
                        console.log(error);
                        io.to(client.id).emit("keyCodeError");
                    }else {
                        fs.unlink(dir+"/keyCodes/"+keyCode,function(error3) {
                            if(error3) {
                                console.log(error3)
                            }else {
                                for(var i = 0; i < folders.length;i++) {
                                    fs.mkdirSync(dir+"/public/userData/"+user+folders[i]);
                                }
                                var string = {"apps":[["../../../Applications/MarathonMessenger.app/","Marathon Messenger",true],["../../../Applications/Timer.app/","Timer",true]]};
                                fs.writeFile(dir+"/public/userData/"+user+"/data/appsThatNotify.json",JSON.stringify(string),"utf-8",function(error) {
                                    if(error) {
                                        console.log(error)
                                    }
                                    console.log("saved");
                                });
                                fs.writeFile(dir+"/public/users/"+user,password,"utf-8",function(error2) {
                                    console.log("saved");
                                    io.to(client.id).emit("allGo",{user:user});
                                    if(error2) {
                                        console.log(error2);
                                    }
                                    client.join(user);
                                });
                            }
                        });
                    }
                });
            }else {
                io.to(client.id).emit("wrong",{message:"User Does Not Exist"});
            }
        }
    }
}
