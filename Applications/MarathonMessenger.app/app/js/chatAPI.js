define(function() {
    //["../../../publicPhone/mobileApps/Timer.app/","Timer",true]
    var textsAmount,
        otherUserAvatar;
    function userSettings(post,callback) {
        post.post("getContents","key9",null,{path:"/data/userSettings.json"});
        post.once("contentsGotten","key9",function(data2,key) {
            if(data2.exists) {
                var result = JSON.parse(data2.contents);
                if(result.avatar != undefined) {
                    userAvatar = result.avatar;
                }
            }
            return callback(true);
        });
    }
    function otherUser(chatsList,i,post) {
        var index = chatsList[i][0].lastIndexOf("_");
        var USER = chatsList[i][0].substr(index+1);
        if(user == USER) {
            USER = chatsList[i][0].substring(0,index);
        }
        otherUserAvatar = undefined;
        post.post("getContents","key12",null,{path:"/../"+USER+"/data/userSettings.json"});
        post.once("contentsGotten","key12",function(data2,key) {
            if(data2.exists) {
                try {
                    var result = JSON.parse(data2.contents);
                    if(result.avatar != undefined) {
                        otherUserAvatar = result.avatar;
                    }
                }catch(e) {
                    console.error(e);
                }
            }
            var src = otherUserAvatar || "../../../public/images/userIcon.png";
            var theChat = $("<a class = 'chat' data-chat = "+chatsList[i][0]+" href = '#!'><div class = 'name'></div><span class = 'cName'>"+chatsList[i][1]+"</span><span class ='new badge hide'></span><span class = 'badge'><i class = 'material-icons'>close</i></span></a>");
            $("#noChats").before(theChat);
            $("#noChats").addClass("hide");
            $(theChat).find(".name").css("backgroundImage",src);
            otherUserAvatar = undefined;
            post.post("createRoom","all",null,{room:chatsList[i][0],name:user});
            console.log(i,chatsList[i])
            if(chatsList[i+1] != undefined) {
                otherUser(chatsList,i+1,post);
            }
        });
    }

    function getTexts(tchat,post,icon) {
        if($("#mssgGroup").attr("data-Chat") != tchat) {
            $("#messages .text").remove();
            var username = tchat.split("_")[1] != user ? tchat.split("_")[1]:tchat.split("_")[0];
            $("#gIUser").text(C.chattingWith+username);
            post.post("createRoom","all",null,{room:tchat,name:user});
            $("#mssgGroup").attr("data-Chat",tchat);
            $("#messages .texts").remove();

            post.post("getContents","key6",null,{path:"/data/MarathonMessengerData/"+tchat+".data",isFolder:false});
            post.once("contentsGotten","key6",function(data) {
                if(data.exists) {
                    var texts = JSON.parse(data.contents);
                    otherUserAvatar = undefined;
                    if(icon != undefined) {
                        otherUserAvatar = icon;
                    }else {
                        post.post("getContents","key12",null,{path:"/../"+username+"/data/userSettings.json"});
                        post.once("contentsGotten","key12",function(data2,key) {
                            if(data2.exists) {
                                try {
                                    var result = JSON.parse(data2.contents);
                                    if(result.avatar != undefined) {
                                        otherUserAvatar = result.avatar;
                                    }
                                }catch(e) {
                                    console.error(e);
                                }
                            }
                        });
                    }
                }
                var checkIcon = setInterval(function() {
                    if(otherUserAvatar != undefined) {
                        clearInterval(checkIcon);
                        if(texts != undefined) {
                            openChatData = texts;
                            textsAmount = texts.length;
                            if(texts.length > 20) {
                                $("#loadMore").removeClass("hide");
                            }
                            textsAmount = (textsAmount >= 21)? textsAmount-20:0;
                            for(var i = textsAmount; i < texts.length; i++) {
                                if(texts[i][0] == user) {
                                    $("#messages").append("<div class = 'text'>\
                                                               <div class = 'name' title='"+user+"' style='background-image:"+userAvatar+"'>\
                                                                   <i class = 'material-icons medium circle grey-text red hide'>close</i>\
                                                               </div>\
                                                               <div class = 'left cntnt'>"+texts[i][1]+"</div>\
                                                           </div>");
                                }else {
                                    $("#messages").append("<div class = 'text fltrt'>\
                                                               <div class = 'name fltrt' title='"+texts[i][0]+"' style='background-image:"+otherUserAvatar+"'>\
                                                                   <i class = 'material-icons medium circle grey-text red hide'>close</i>\
                                                               </div>\
                                                               <div class = 'right cntnt'>"+texts[i][1]+"</div>\
                                                           </div>");
                                }
                                if($(".text:last .sentImgs").children().length !=0) {
                                    $(".text:last .cntnt").append("<br class = 'br'><a class ='viewImages btn blue modal-trigger' href = '#imagesModal'>"+C.viewImages+"</a>")
                                }
                                $("#messages").scrollTop($("#messages")[0].scrollHeight);
                            }
                        }
                        $("#mssgGroup").addClass("animMGroup");
                    }
                },100);
            });
            openChat = tchat;
        }else {
            $("#mssgGroup").hasClass("animMGroup",$("#mssgGroup").addClass("animMGroup"));
        }
    }

    return {
        init:function(post,user,callback) {
            post.post("checkForMessages");
            post.on("message","all",function(data) {
                if($("#gIUser").text().endsWith(data.user)) {
                    $("#messages").append("<div class = 'text fltrt'>\
                                              <div class = 'name fltrt' title='"+data.user+"' style='background-image:"+otherUserAvatar+"'>\
                                             </div>\
                                              <div class = 'right cntnt'>"+data.message+"</div>\
                                           </div>");
                    $("#messages").scrollTop($("#messages")[0].scrollHeight);
                    messages = [];
                }else {
                    if($(".chat:contains('"+data.user+"')").length) {
                        $(".chat:contains('"+data.user+"')").find(".badge").removeClass("hide");
                    }else {
                        var chat = data.user+"_"+user;
                        $("#noChats").before("<a class = 'chat' data-chat = "+chat+" href = '#!'><span class = 'cName'>"+data.user+"</span><span class ='new badge'></span><span class = 'badge'><i class = 'material-icons'>close</i></span></a>");
                    }
                    $("#noChats").addClass("hide");
                }
                new Audio("sounds/received.mp3").play();
                if($(".text:last .sentImgs").children().length !=0) {
                    $(".text:last .cntnt").append("<br class = 'br'><a class ='viewImages btn blue modal-trigger' href = '#imagesModal'>"+C.viewImages+"</a>")
                }
            });
            post.post("ready","MarathonKey0",null);
            post.on("appEvent","MarathonKey0",function(data) {
                if(data != undefined) {
                    post.post("getContents","MarathonKey01",null,{path:"../../../Applications/MarathonMessenger.app/app/langs/"+data.lang+".json",isFolder:false});
                    post.once("contentsGotten","MarathonKey01",function(datax) {
                        if(datax.exists) {
                            C = JSON.parse(datax.contents);
                            for(var prop in C) {
                                if(C.hasOwnProperty(prop)) {
                                    $("*[data-text='"+prop+"']").text(C[prop]);
                                }
                            }
                        }
                        if(data.chat != undefined) {
                            var tchat = data.chat;
                            var usrNme = tchat.split("_")[1] != user ? tchat.split("_")[1]:tchat.split("_")[0];
                            userSettings(post,function() {
                                post.post("getContents","key7",null,{path:"/data/MarathonMessengerData/"+tchat+".data",isFolder:false});
                                post.once("contentsGotten","key7",function(data) {
                                    if(data.exists) {
                                        getTexts(tchat,post);
                                        openChat = tchat;
                                        $(".side-nav").addClass("toHide");
                                        $("#mssgGroup").addClass("animMGroup");
                                    }
                                });
                            });
                        }
                        post.post("getContents","key1",null,{path:"/data/MarathonMessengerData/chats.data",isFolder:false});
                        post.once("contentsGotten","key1",function(data2) {
                            if(data2.exists) {
                                var chatsList = JSON.parse(data2.contents);
                                if(chatsList.length == 0) {
                                    $("#noChats").removeClass("hide");
                                }
                                otherUser(chatsList,0,post)
                            }else {
                                $("#noChats").removeClass("hide");
                            }
                            return callback();
                        });
                        userSettings(post,function(){});
                    });
                }
            });
        },
        createChat:function(USER,post,api) {
            $(".selected").removeClass("selected");
            post.post("checkExistence","key4",null,{path:"/../"+USER,isFolder:true});
            post.once("existenceChecked","key4",function(data) {
                if(data.exists) {
                    var chatName = user+"_"+USER,
                        chatName2 = USER+"_"+user;
                    if($(".chat[data-chat='"+chatName+"']").length == 0 || $(".chat[data-chat='"+chatName2+"']").length == 0) {
                        $(".side-nav").addClass("toHide");
                        $("#mssgGroup").addClass("animMGroup").attr("data-chat",chatName);
                        $("#gIUser").text(C.chattingWith+USER);
                        $("#noChats").addClass("hide");
                        var chatsContent;
                        post.post("getContents","key5_1",null,{path:"/../"+USER+"/data/MarathonMessengerData/chats.data",isFolder:false});
                        post.once("contentsGotten","key5_1",function(data2,key) {
                            if(data2.exists) {
                                var contents = Array.from(JSON.parse(data2.contents));
                                for(var i = 0; i < contents.length; i++) {
                                    if(contents[i][0] == chatName) {
                                        break;
                                    }
                                    if(i == contents.length-1) {
                                        contents[contents.length] = [chatName,user];
                                    }
                                }
                                if(contents.length == 0) {
                                    contents[contents.length] = [chatName,user];
                                }
                                chatsContent = contents;
                            }else {
                                chatsContent = [[chatName,user]];
                            }
                            post.post("createRoom","all",null,{room:chatName,name:user});
                            getUserAvatar(function() {
                                $("#noChats").before("<a class = 'chat selected' data-chat = "+chatName+" href = '#!'><div class = 'name'></div><span class = 'cName'>"+USER+"</span><span class ='new badge hide'></span><span class = 'badge'><i class = 'material-icons'>close</i></span></a>");
                                $(".chat:last .name").css("backgroundImage",otherUserAvatar);
                                var chats = [];
                                $(".chat").each(function(i) {
                                    chats[i] = [];
                                    chats[i][0] = $(this).attr("data-chat");
                                    chats[i][1] = $(this).find(".cName").text();
                                });
                                post.post("saveFile","all",null,{path:"/data/MarathonMessengerData/chats.data",contents:JSON.stringify(chats)});
                            });
                            post.post("saveFile","key5_3",null,{path:"/../"+USER+"/data/MarathonMessengerData/chats.data",
                            contents:JSON.stringify(chatsContent),isFolder:false});
                            function getUserAvatar(callback) {
                                post.post("getContents","key10",null,{path:"/../"+USER+"/data/userSettings.json"});
                                post.once("contentsGotten","key10",function(data4) {
                                    if(data4.exists) {
                                        var result = JSON.parse(data4.contents);
                                        if(result.avatar != undefined) {
                                            otherUserAvatar = result.avatar;
                                        }
                                    }
                                    return callback();
                                });
                            }
                            chatsContent[chatsContent.length-1][1] = USER;
                        });
                        chats = [];
                        openChat = chatName;
                    }else {
                        api.notification(C.chatExists);
                    }
                }else {
                    api.notification(C.userNonExistent);
                }
            });
        },
        deleteChat:function(_this,api,post) {
            api.confirm({header:C.confirm,displayText:C.wishToDelete},function(clicked) {
                if(clicked) {
                    if($("#mssgGroup").attr("data-chat") == $(_this).parent().parent().attr("data-chat")) {
                        $("#mssgGroup").removeClass("animMGroup");
                        $("#messages .text").remove();
                        $("#gIUser").text("");
                        $("#mssgGroup").attr("data-chat","");
                    }
                    var chat = $(_this).parent().parent().attr("data-chat");
                    $(_this).parent().parent().remove();
                    if($(".chat").length == 0) {
                        $("#noChats").removeClass("hide");
                    }
                    var chats = [];
                    $(".chat").each(function(i) {
                        chats[i] = [];
                        chats[i][0] = $(this).attr("data-chat");
                        chats[i][1] = $(this).find(".cName").text();
                    });
                    post.post("deleteFile","all",null,{path:"/data/MarathonMessengerData/"+chat+".data"});
                    post.post("saveFile","all",null,{path:"/data/MarathonMessengerData/chats.data",contents:JSON.stringify(chats)});
                }
            });
        },
        getTexts:function(tchat,post,icon) {
            getTexts(tchat,post,icon);
        },
        sendMessage:function(post,receiver) {
            if($(".emojionearea-editor").text() != "" || $("#imgsToSnd .img").length != 0) {
                $("div.imgX").remove();
                $("#messages").append("<div class = 'text'>\
                                            <div class = 'name' title='"+user+"' style='background-image:"+userAvatar+"'>\
                                                <i class = 'material-icons medium circle grey-text red hide'>close</i>\
                                            </div>\
                                            <div class = 'left cntnt'>"
                                                +$(".emojionearea-editor").html()+
                                                "<div class = 'sentImgs'>"
                                                    +$("#imgsToSnd").html()+
                                                "</div>\
                                            </div>\
                                       </div>");
                post.post("sendMessage","all",null,{message:$(".text:last .cntnt").html(),receiver:receiver});
                $("#messages").scrollTop($("#messages")[0].scrollHeight);
                new Audio("sounds/send.mp3").play();
                var messages = [];
                $(".text").each(function(i) {
                    $(this).find(".br,.viewImages").remove();
                    var name = $(this).find(".name").attr("title");
                    messages[i] = [];
                    messages[i][0] = name.replace(/:/g,'');
                    messages[i][1] = $(this).find(".cntnt").html();
                });
                var chat = $("#mssgGroup").attr("data-chat");
                var usrNme = chat.split("_")[1] != user ? chat.split("_")[1]:chat.split("_")[0];
                post.post("saveFile","all",null,{path:"/data/MarathonMessengerData/"+chat+".data",contents:JSON.stringify(messages)});

                var lt = $(".text:last");
                post.post("getContents","key13",null,{path:"/../"+usrNme+"/data/MarathonMessengerData/"+chat+".data"});
                post.once("contentsGotten","key13",function(data) {
                    if(data.exists) {
                        var t = JSON.parse(data.contents);
                        t[t.length] = [lt.find(".name").attr("title"),lt.find(".cntnt").html()];
                    }else {
                        var t = [];
                        t[0] = [lt.find(".name").attr("title"),lt.find(".cntnt").html()];
                    }
                    post.post("saveFile","all",null,{path:"/../"+usrNme+"/data/MarathonMessengerData/"+chat+".data",contents:JSON.stringify(t)});
                    post.post("getContents","key14",null,{path:"/../"+usrNme+"/data/MarathonMessengerData/chats.data",isFolder:false});
                    post.once("contentsGotten","key14",function(data3) {
                        var c = [];
                        if(data3.exists) {
                            c = JSON.parse(data3.contents);
                            if(c.length != 0) {
                                for(var i = 0; i < c.length;i++) {
                                    if(c[i][0] == chat) {
                                        break;
                                    }
                                    if(i == c.length-1) {
                                        c[c.length-1][0] = chat;
                                        c[c.length-1][1] = user;
                                    }
                                }
                            }else {
                                c[c.length] = [chat,user];
                            }
                        }else {
                            c[0] = [chat,user];
                        }
                        post.post("saveFile","all",null,{path:"/../"+usrNme+"/data/MarathonMessengerData/chats.data",contents:JSON.stringify(c)});
                    });
                    if($(".text:last .sentImgs").children().length !=0) {
                        $(".text:last .cntnt").append("<br class = 'br'><a class ='viewImages btn blue modal-trigger' href = '#imagesModal'>"+C.viewImages+"</a>")
                    }
                });
                messages = [];
                $(".emojionearea-editor").text("");
                $("#message").val("")
                $("#imgsToSnd").html("").hide();
                $("#messages").removeClass("smaller")
            }
        },
        loadMoreTexts:function() {
            var amount = (textsAmount >= 20)? textsAmount-20:0;
            if(amount == 0) {
                $("#loadMore").addClass("hide");
            }
            for(var i = textsAmount-1; i > amount-1; i--) {
                if(openChatData[i][0] == user) {
                    $("#loadMore").after("<div class = 'text new'>\
                                              <div class = 'name' title='"+user+"' style='background-image:"+userAvatar+"'>\
                                                  <i class = 'material-icons medium circle grey-text red hide'>close</i>\
                                              </div>\
                                              <div class = 'left cntnt'>"+openChatData[i][1]+"</div>\
                                          </div>");
                }else {
                    $("#loadMore").after("<div class = 'text fltrt new'>\
                                              <div class = 'name fltrt' title='"+openChatData[i][0]+"' style='background-image:"+otherUserAvatar+"'>\
                                                  <i class = 'material-icons medium circle grey-text red hide'>close</i>\
                                              </div>\
                                              <div class = 'right cntnt'>"+openChatData[i][1]+"</div>\
                                          </div>");
                }
                if($(".new:first .sentImgs").children().length !=0) {
                    var br = ($(".new:first .cntnt").text() != "")? "":"<br class = 'br'>";
                    $(".new:first .cntnt").append(br+"<a class ='viewImages btn blue modal-trigger' href = '#imagesModal'>"+C.viewImages+"</a>")
                }
            }
            $(".text").removeClass("new")
            textsAmount -= 20
        },
        deleteMessage:function(_this,post,api) {
            api.confirm({header:C.confirm,displayText:C.wishToDeleteText},function(clicked) {
                if(clicked) {
                    $(_this).parent().parent().remove();
                    var messages = [];
                    $(".text").each(function(i) {
                        $(this).find(".br,.viewImages").remove();
                        var name = $(this).find(".name").attr("title");
                        messages[i] = [];
                        messages[i][0] = name.replace(/:/g,'');
                        messages[i][1] = $(this).find(".cntnt").html();
                    });
                    post.post("saveFile","all",null,{path:"/data/MarathonMessengerData/"+$("#mssgGroup").attr("data-chat")+".data",contents:JSON.stringify(messages)});
                }else {
                    $(_this).removeClass("clicked");
                }
            });
        },
        loadImages:function(post) {
            var canLoad = true;
            post.post("openFile","key8",null,{supExts:[".png",".jpg",".gif"]});
            post.once("canceled","key8",function() {
                canLoad = false;
            });
            post.once("fileOpened","key8",function(data) {
                if(canLoad) {
                    $("#messages").addClass("smaller");
                    $("#mssgSender").css("height","50vh");
                    $("#imgsToSnd").show().append("<div class = 'img'><i class = 'imgX material-icons medium'>close</i></div>");
                    $("#imgsToSnd .img:last")
                    .css("backgroundImage","url('"+data.contents+"')");
                }
            });
        },
        getImages:function(_this) {
            var c = $(_this).parent().find(".sentImgs").html();
            $(".modal-content .img").remove();
            $(".modal-content").append(c)
            $(".modal-content i").remove();
            $("#imagesModal").scrollTop(0);
        }
    }
});
