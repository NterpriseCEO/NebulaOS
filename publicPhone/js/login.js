$(document).ready(function() {
    var rand = Math.floor(Math.random() * 12) + 1;
    $("#gkgmk").css("backgroundImage","url('../public/images/bg_images/bg_image"+rand+".png')")
    $(document.body).on("click","#dfgs",function() {
        createUsername();
    });
    function setup() {
        require(["infopane/infopane","taskbar/taskbar",
        "desktop/desktop","lowLevelAPI"],function(){});
    }
    $(document.body).on("click","#skglsdkgjls",function() {
        if($("#username-type").val() != "" && $("#password-type").val() != "") {
            socket.emit("checkLogin",{username:$("#username-type").val(),
                                      password:$("#password-type").val()});
        }else {
            alert("Please Enter Username and Password");
        }
        socket.once("userExists",function(data) {
            $("#usernameDisplay").text($("#username-type").val());
            require(["InfoPane/messages"]);
            $.getJSON("../public/userData/"+
                             $("#usernameDisplay").text()+
                             "/data/appearanceSettings.json",
            function(result) {
                if(result.image[0].randomBG) {
                    $("#osWrap").css("backgroundImage","url('../public/images/bg_images/bg_image"+rand+".png')");
                }else {
                    $("#osWrap").css({backgroundImage:result.image[0].image,
                                    backgroundSize:result.image[0].bgSize,
                                    backgroundRepeat:result.image[0].bgRepeat});
                }
                $("#osWrap").css("backgroundColor",result.bgColor);
            });
            $.getJSON("../public/userData/"+
                             $("#usernameDisplay").text()+
                             "/data/userSettings.json",
            function(result) {
                $("#userIcon").css("backgroundImage",result.avatar)
                notifsDisabled = result.notificationsDisabled||false;
                if(result.language) {
                    lang = result.language;
                }
                $.getJSON("langs/"+lang+".json",function(result2) {
                    C = result2;
                    for(var prop in C) {
                        if(C.hasOwnProperty(prop)) {
                            $("*[data-text='"+prop+"']").text(C[prop]);
                        }
                    }
                    setup();
                });
                $("#gkgmk").hide();
            });
        });
        socket.once("wrong",function(data) {
            alert(data.message);
        });
    });

    function createUsername() {
        if($("#username-type").val() != "" && $("#password-type").val() != "" && !/\s/.test($("#username-type").val()) && !/\s/.test($("#password-type").val())) {
            socket.emit("cUsername",{username:$("#username-type").val(),password:$("#password-type").val()});
            socket.once("allGo",function(data) {
                $("#gkgmk").hide();
                $("#usernameDisplay").text(data.user);
                setup();
            });
            socket.once("userExists",function() {
                alert("User already exists!");
            });
        }else {
            if(/\s/.test($("#username-type").val()) || /\s/.test($("#password-type").val())) {
                alert("Must contain no spaces")
            }else {
                alert("Please Enter a Username and Password");
            }
        }
    }
    $(document.body).on("click","#logOut",function() {
        window.location.reload();
    });
});
