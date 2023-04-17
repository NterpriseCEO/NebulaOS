let fs = require("fs-extra");
module.exports = function(client,io,dir){
    var mkpath = require("./mkpath.js"),
        rmdir = require("./rmdir.js"),
        path = require("path");
    client.on("saveFile",function(data) {
        checkFileFolder(data.path,data.isFolder,data.contents);
    });
    client.on("getImageFile",function(data) {
        console.log(data.path)
        var bitmap = fs.readFileSync(dir+"/public/userData/"+data.path);
        io.to(client.id).emit("contentsGotten",{contents:"data:image/png;base64,"+new Buffer(bitmap).toString("base64"),rand:data.rand});
    });
    client.on("getDocxFile",function(data) {
        var mammoth = require("mammoth");
        mammoth.convertToHtml({path:dir+"/public/userData/"+data.path}).then(function(result) {
            console.log(result)
            io.to(client.id).emit("contentsGotten",{contents:result.value});
        }).done();
    });
    client.on("saveImageFile",function(data) {
        fs.truncate(dir+"/public/userData/"+data.path, 0, function() {
            fs.writeFile(dir+"/public/userData/"+data.path, imageBuffer, function(error) {
                if(error) {
                    console.log(error);
                }
                io.to(client.id).emit("fileSaved");
            });
        });
    });
    client.on("checkExistence",function(data) {
        console.log(dir+"/public/userData/"+data.path+"  ya bois")
        if(!fs.existsSync(dir+"/public/userData/"+data.path)) {
            io.to(client.id).emit("existenceChecked",{exists:false});
            io.to(client.id).emit("contentsGotten",{noContents:true,exists:false});
        }else {
            io.to(client.id).emit("existenceChecked",{exists:true});
            if(!data.isFolder) {
                fs.readFile(dir+"/public/userData/"+data.path,{encoding:"utf-8"},function(error,data2) {
                    if(error) {
                        console.log(error);
                    }
                    console.log(data2.indexOf("t"));
                    io.to(client.id).emit("contentsGotten",{contents:data2,exists:true});
                });
            }
        }
    });
    client.on("deleteFile",function(data) {
        console.log("data");
        deleteFile_Folder(data.path,data.isFolder,data.deleteRecursive);
    });
    client.on("getContents",function(data) {
        fs.readFile(dir+"/public/userData/"+data.path,"utf8",function(error,data2) {
            if(error) {
                console.log(error);
            }
            io.to(client.id).emit("contentsGotten",{contents:data2,error:error,rand:data.rand});
        });
    });
    client.on("copyFile",function(data) {
        if(data.cut) {
            fs.move(dir+"/public/userData/"+data.path,dir+"/public/userData/"+data.newPath,function(error) {
                if(error) {
                    console.log(error);
                }
                console.log("done");
                io.to(client.id).emit("pasted");
            });
        }else {
            fs.copy(dir+"/public/userData/"+data.path,dir+"/public/userData/"+data.newPath,function(error) {
                if(error) {
                    console.log(error);
                }
                console.log("done");
                io.to(client.id).emit("pasted");
            });
        }
    });

    client.on("renameFileFolder",function(data) {
        console.log(dir+"/public/userData/"+data.oldPath);
        fs.rename(dir+"/public/userData/"+data.oldPath,dir+"/public/userData/"+data.newPath,function(error) {
            console.log("test")
            if(error) {
                console.log(error);
            }
            io.to(client.id).emit("renamed")
        });
    });

    client.on("saveAppearance",function(data) {
        var obj = {image:[{image:data.image,bgRepeat:data.bgRepeat,bgSize:data.bgSize,randomBG:data.randomBG}],bgColor:data.bgColor};
        var save = JSON.stringify(obj,null,2);
        fs.truncate(dir+"/public/userData/"+data.user+"/data/appearanceSettings.json", 0, function() {
            fs.writeFile(dir+"/public/userData/"+data.user+"/data/appearanceSettings.json",save,"utf-8",function(error) {
                console.log("saved");
                if(error) {
                    console.log(error);
                }
            });
        });
    });

    client.on("readDir",function(data) {
        console.log(dir+"/public/userData/"+data.path);
        var fls = [], folders = [];
        var f = 0, fldr = 0, num = 0;
        fs.readdir(dir+"/public/userData/"+data.path,function(error,files) {
            try {
                if(error) {
                    console.log(error)
                    io.to(client.id).emit("folderContents",{empty:true});
                }
                if(files.length == 0) {
                    io.to(client.id).emit("folderContents",{empty:true});
                }
                files.forEach(function(file,index) {
                    fs.lstat(dir+"/public/userData/"+data.path+"/"+file,
                    function(error,stats) {
                        num++
                        if(!error && stats.isDirectory()) {
                            folders[fldr++] = file;
                        }else {
                            fls[f++] = file;
                        }
                        if(num == files.length) {
                            io.to(client.id).emit("folderContents",{files:fls,folders:folders});
                        }
                    });
                });
            }catch(e) {
                console.log(e);
            }
        });
    });
    client.on("readAllDirs",function(data) {
        console.log(data.path)
        fls = [];
        walk(dir+"/public/userData/"+data.path,function(error, files) {
            for(let i = 0; i < files.length; i++) {
                files[i] = files[i].substring((dir+"\\public\\userData\\"+data.path).length, files[i].length);
            }
            files = files.filter(function(file) {
                return file !== ""
            });
            console.log(files[0]);
            io.to(client.id).emit("allDirsRead",{files:files});
        });
    });
    // var walk = function(dir, callback) {
    //     var results = [],
    //         pos = dir.split("/");
    //
    //     fs.readdir(dir, function(err, list) {
    //         if (err) {
    //             return callback(err);
    //         }
    //         var pending = list.length;
    //         if (!pending) {
    //             return callback(null, results);
    //         }
    //         list.forEach(function(file,i) {
    //             file = pos[4] != "data"?dir+"/"+file:dir+"/"+file[i+1];
    //             fs.stat(file,function(err, stat) {
    //                 if (stat && stat.isDirectory()) {
    //                     console.log(file)
    //                     walk(file, function(err, res) {
    //                         results = results.concat(res);
    //                         if (!--pending) {
    //                             callback(null, results);
    //                         }
    //                     });
    //                 }else {
    //                     results.push(file);
    //                     if (!--pending) {
    //                         callback(null, results);
    //                     }
    //                 }
    //             });
    //         });
    //     });
    // };
        var path = require('path');
        var walk = function(dir, done) {
            var results = [];
            fs.readdir(dir, function(err, list) {
                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, results);
                list.forEach(function(file) {
                    file = path.resolve(dir, file);
                    fs.stat(file, function(err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function(err, res) {
                            results = results.concat(res);
                            if (!--pending) done(null, results);
                            });
                        } else {
                            results.push(file);
                            if (!--pending) done(null, results);
                        }
                    });
                });
            });
        };

    function checkFileFolder(file,isFolder,content) {
        if(isFolder) {
            fs.mkdir(dir+"/public/userData/"+file,function(error) {
                if(error) {
                    io.to(client.id).emit("fileExists");
                    console.log(error)
                }
                console.log("done");
                io.to(client.id).emit("fileSaved");
            });
        }else {
            var saveData;
            fs.stat(dir+"/public/userData/"+file,function(error) {
                var DIR = file.substr(0, file.lastIndexOf("/"));
                if(error || content != undefined) {
                    mkpath(dir+"/public/userData/"+DIR,function(error) {
                        if(error) {
                            console.log(error);
                        }
                        if(file.endsWith(".png") || file.endsWith(".webm")) {
                            console.log(file)
                            saveData = image(content);
                        }else {
                            saveData = content;
                        }
                        fs.truncate(dir+"/public/userData/"+file, 0, function() {
                            fs.writeFile(dir+"/public/userData/"+file,saveData,"utf-8",function(error) {
                                io.to(client.id).emit("fileSaved");
                                if(error) {
                                    console.log(error);
                                }
                            });
                        });
                    });
                }else {
                    io.to(client.id).emit("fileExists");
                }
            });
        }
    }
    function image(data) {
        function decodeBase64Image(dataString) {
            var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
            if(matches.length !== 3) {
                return new Error('Invalid input string');
            }
            response.type = matches[1];
            response.data = new Buffer(matches[2], 'base64');

            return response;
        }
        var imageBuffer;
        if(data != "") {
            imageBuffer = decodeBase64Image(data);
            imageBuffer = imageBuffer.data;
        }else {
            imageBuffer = " ";
        }
        return imageBuffer;
    }
    function deleteFile_Folder(DIR,isFolder,canRM) {
        if(isFolder) {
            console.log(dir+"/public/userData/"+DIR);
            console.log("!!");
            console.log(canRM+" "+isFolder)
            if(canRM && isFolder) {
                rmdir(dir+"/public/userData/"+DIR,function() {
                    io.to(client.id).emit("deleted",{folder:isFolder});
                });
            }else {
                fs.rmdir(dir+"/public/userData/"+DIR,function(error) {
                    if(error) {
                        console.log(error);
                        io.to(client.id).emit("cannotDelete");
                    }else {
                        console.log("ddd")
                        io.to(client.id).emit("deleted",{folder:isFolder});
                    }
                });
            }
        }else {
            fs.unlink(dir+"/public/userData/"+DIR,function(error) {
                if(error) {
                    console.log(error);
                }
                io.to(client.id).emit("deleted",{folder:isFolder});
                return;
            });
        }
    }
}
