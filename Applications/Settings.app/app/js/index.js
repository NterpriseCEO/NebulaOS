var post,
    ngrok = window.location.protocol + "//" + window.location.host+"/public/",
    C;
require([ngrok+"js/NebulaAPI.js",ngrok+"js/jquery.js",ngrok+"js/NebulaPM.js"],
function(api) {
    post = new SecurePost();
    $(document).ready(function() {
        require(["notifications"]);
        post.post("ready","SettingsKey0",null);
        post.once("appEvent","SettingsKey0",function(data1) {
            post.post("getContents","SettingsKey01",null,{path:"../../../Applications/Settings.app/app/langs/"+data1.lang+".json",isFolder:false});
            post.once("contentsGotten","SettingsKey01",function(data2) {
                if(data2.exists) {
                    C = JSON.parse(data2.contents);
                    for(var prop in C) {
                        if(C.hasOwnProperty(prop)) {
                            $("*[data-text='"+prop+"']").text(C[prop]);
                        }
                    }
                }
                post.post("getUsername","SettingsKey1",null);
                post.once("usernameGotten","SettingsKey1",function(data) {
                    user = data.username;
                });
                post.post("getContents","SettingsKey2",null,{path:"/data/appearanceSettings.json"});
                post.once("contentsGotten","SettingsKey2",function(data) {
                    if(data.exists) {
                        var result = JSON.parse(data.contents);
                        if(result.image[0].randomBG) {
                            $("#randBG").prop("checked",true);
                        }
                        post.post("getContents","SettingsKey18",null,{path:"/data/userSettings.json"});
                        post.once("contentsGotten","SettingsKey18",function(data2) {
                            if(data.exists) {
                                var result = JSON.parse(data2.contents);
                                if(result.avatar != undefined) {
                                    $("#avatarImg").css("backgroundImage",result.avatar);
                                }
                                if(result.nickname != undefined) {
                                    $("#nickname").val(result.nickname);
                                }
                                $("#disableNotifs").prop("checked",!result.notificationsDisabled)
                                post.post("getContents","SettingsKey21",null,{path:"/data/appsThatNotify.json"});
                                post.once("contentsGotten","SettingsKey21",function(data3) {
                                    if(data3.exists) {
                                        var d = JSON.parse(data3.contents);
                                        for(var i = 0; i < d.apps.length;i++) {
                                            $("#notifications")
                                            .append("<div class = 'switch'>\
                                                        <div class = 'col appName s9'>"+d.apps[i][1]+"</div>\
                                                        <div class = 'col s3'>\
                                                            <label>\
                                                                <input class = 'disableNotifs' type = 'checkbox'>\
                                                                <span class = 'lever'></span>\
                                                            </label>\
                                                        </div>\
                                                    </div>")
                                            $(".disableNotifs:eq("+i+")").prop("checked",d.apps[i][2])
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
                $(".card a").click(function() {
                    $("#mainPage").addClass("hide");
                    $(".page[data-link='"+$(this).attr("data-link")+"']").removeClass("hide");
                });
                $(".xButton").click(function() {
                    $(this).parent().parent().parent().parent().parent().addClass("hide");
                    $("#mainPage").removeClass("hide");
                });

                $("#colorChoice").on("input",function() {
                    var confCol = confirm(C.wishToChange);
                    if(confCol) {
                        if(!$('#keepBackground').is(":checked")) {
                            post.post("changeBG","SettingsKey3",null,{type:"Image",value:"none"});
                        }
                        post.post("changeBG","SettingsKey4",null,{type:"Color",value:$("#colorChoice").val()});
                        post.post("saveAppearance","SettingsKey5",null,{randomBG:false});
                    }
                });

                $("#imageChoice").click(function() {
                    post.post("openFile","SettingsKey6",null,{supExts:[".jpg",".png"]})
                    var canOpen = true;
                    post.once("canceled","SettingsKey6",function() {
                        canOpen = false;
                    });
                    post.once("fileOpened","SettingsKey6",function(img) {
                        if(canOpen) {
                            image = img.contents;
                            $("#imagePreview")
                            .css({backgroundImage:"url('"+image+"')",
                                  backgroundSize:$("#bgSize").val(),
                                  backgroundRepeat:$("#bgRepeat").val()}).show();
                            $("#changeImg").removeClass("hide");
                        }
                    });
                });

                $("#bgSize").change(function() {
                    $("#imagePreview").css("backgroundSize",$(this).val());
                });
                $("#bgRepeat").change(function() {
                    $("#imagePreview").css("backgroundRepeat",$(this).val());
                });

                $("#changeImg").click(function() {
                    $("#randBG").prop("checked",false);
                    post.post("changeBG","SettingsKey7",null,{type:"Image",value:"url("+image+")",
                    bgSize:$("#bgSize").val(),
                    bgRepeat:$("#bgRepeat").val()});
                    if(!$('#keepColor').is(":checked")) {
                        post.post("changeBG","SettingsKey8",null,{type:"Color",value:"white"});
                    }
                    post.post("saveAppearance","SettingsKey9",null,{randomBG:false});
                });
                var image;
                $("#imageChoice2").change(function() {
                    readURL(this,function(target) {
                        image = target;
                        $("#imagePreview").css({backgroundImage:"url('"+image+"')",
                              backgroundSize:$("#bgSize").val(),
                              backgroundRepeat:$("#bgRepeat").val()}).show();
                        $("#changeImg").removeClass("hide");
                    });
                });
                $("#randBG").change(function() {
                    if($("#randBG").is(":checked")) {
                        var rand = Math.floor(Math.random() * 12) + 1;
                        post.post("changeBG","SettingsKey12",null,{type:"Image",
                                                                   value:"url('images/bg_images/bg_image"+rand+".png')",
                                                                   bgRepeat:"no-repeat",
                                                                   bgSize:"cover"});
                    }
                    post.post("saveAppearance","SettingsKey13",null,{randomBG:$("#randBG").prop("checked")});
                });

                $("#avatarChoice").click(function() {
                    post.post("openFile","SettingsKey14",null,{supExts:[".jpg",".png"]})
                    var canOpen = true;
                    post.once("canceled","SettingsKey14",function() {
                        canOpen = false;
                    });
                    post.once("fileOpened","SettingsKey14",function(img) {
                        if(canOpen) {
                            $("#avatarImg").css("backgroundImage","url('"+img.contents+"')");
                            api.confirm({header:C.changeAvatar,displayText:C.confirmImage},function(clicked) {
                                if(clicked) {
                                    post.post("saveUserSettings","SettingsKey15",null,
                                    {avatar:'url("'+img.contents+'")',nickname:$("#nickname").val()});
                                }
                            });
                        }
                    });
                });
                $("#avatarChoice2").change(function() {
                    readURL(this,function(target) {
                        $("#avatarImg").css("backgroundImage","url('"+target+"')").show();
                        api.confirm({header:C.changeAvatar,displayText:C.confirmImage},function(clicked) {
                            if(clicked) {
                                post.post("saveUserSettings","SettingsKey16",null,
                                {avatar:'url("'+target+'")',nickname:$("#nickname").val()});
                            }
                        });
                    });
                });
                $("#change").click(function() {
                    if($("#nickname").val() != "") {
                        api.confirm({header:C.changeNickname,displayText:C.confirmNickname},function(clicked) {
                            if(clicked) {
                                post.post("saveUserSettings","SettingsKey17",null,
                                {avatar:$("#avatarImg").css("backgroundImage"),nickname:$("#nickname").val()});
                            }
                        });
                    }
                });

                function readURL(input,callback) {
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            return callback(e.target.result);
                        };
                        reader.readAsDataURL(input.files[0]);
                    }
                }

                post.post("getLanguage","SettingsKey24",null);
                post.once("languageGotten","SettingsKey24",function(data) {
                    $("#chooseLanguage").val(data.language)
                    console.log(data.language)
                });

                $("#chooseLanguage").change(function() {
                    var _this = this;
                    post.post("changeLanguage","SettingsKey25",null,$(this).val());
                    post.post("getContents","SettingsKey26",null,{path:"/data/userSettings.json"});
                    post.once("contentsGotten","SettingsKey26",function(data2) {
                        if(data2.exists) {
                            var result = JSON.parse(data2.contents);
                            result.language = $(_this).val();
                            post.post("saveFile","SettingsKey27",null,{path:"/data/userSettings.json",contents:JSON.stringify(result)});
                        }
                        post.post("getContents","SettingsKey01",null,{path:"../../../Applications/Settings.app/app/langs/"+$(_this).val()+".json",isFolder:false});
                        post.once("contentsGotten","SettingsKey01",function(data3) {
                            if(data3.exists) {
                                C = JSON.parse(data3.contents);
                                for(var prop in C) {
                                    if(C.hasOwnProperty(prop)) {
                                        $("*[data-text='"+prop+"']").text(C[prop]);
                                    }
                                }
                            }
                        });
                    });
                });
            });
        });
    });
});
