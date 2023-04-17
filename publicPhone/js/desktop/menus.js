define(function() {
    return {
        menu:function() {
            $(".menu").remove();
            $("body").append("<div class = 'menu blur'>\
                              </div>");
            $(document).mousedown(function(e) {
                if(!$(".menu").is(e.target) && $(".menu").has(e.target).length == 0) {
                    $(".menu").remove();
                }
            });
            return {
                file_interact:function(clicked) {
                    $(".menu").append("<div class = 'mr deleteItem flatBB'>Delete</div>\
                                       <div class = 'mr openFile flatBB'>Open</div>\
                                       <div class = 'mr moveFile flatBB'>Copy</div>\
                                       <div class = 'mr viewItemDetails flatBB'>Details</div>");
                    if($(".menu").children().length >4) {
                        $(".menu").css("height","90vh");
                    }
                    return {
                        deleteFFClicked:function(callback) {
                            $(".deleteItem").click(function() {
                                $(".menu").remove();
                                return callback(true);
                            });
                        },openClicked:function(callback) {
                            $(".openFile").click(function() {
                                $(".menu").remove();
                                return callback(true);
                            });
                        },moveFFClicked:function(callback) {
                            $(".moveFile").click(function() {
                                $(".menu").remove();
                                return callback(true);
                            });
                        },
                        getInfoClicked:function(callback) {
                            $(".viewItemDetails").click(function() {
                                $(".menu").remove();
                                return callback(true);
                            });
                        }
                    }
                }/*,
                app_interact:function() {
                    $(".menu").append("<div class = 'mr openApp flatBB'>Open App</div>\
                                       <div class = 'mr pinApp flatBB'>Pin App To Taskbar</div>\
                                       <div class = 'mr removeApp flatBB'>Uninstall App</div>");
                    if(event.clientY > $(window).height()-100) {
                        $(".menu").css("top",(event.clientY+5)-$(".menu").height());
                    }else {
                        $(".menu").css("top",event.clientY+5);
                    }
                    return {
                        openApp:function(callback) {
                            $(".openApp").click(function() {
                                return callback(true);
                            });
                        },
                        pinApp:function(callback) {
                            $(".pinApp").click(function() {
                                return callback(true);
                            });
                        },
                        removeApp:function(callback) {
                            $(".removeApp").click(function() {
                                return callback(true);
                            });
                        }
                    }
                },
                taskbar:function(pinned) {
                    var text = ["Pin App","Close App"];
                    if(pinned == "true") {
                        text = ["Unpin App","Open App"];
                    }
                    $(".menu").append("<div class = 'mr pupApp flatBB'>"+text[0]+"</div>\
                                       <div class = 'mr ocApp flatBB'>"+text[1]+"</div>");
                    $(".menu").css("top",(event.clientY+5)-$(".menu").height());
                    return {
                        pupApp:function(callback) {
                            $(".pupApp").click(function() {
                                if(pinned == undefined) {
                                    return callback(true,false);
                                }else {
                                    return callback(true,true);
                                }
                            });
                        },
                        ocApp:function(callback) {
                            $(".ocApp").click(function() {
                                if($(this).text() == "Close App") {
                                    return callback(true,true);
                                }else {
                                    return callback(true,false);
                                }
                            });
                        }
                    }
                }*/
            }
        }
    }
})
