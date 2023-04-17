$(document).ready(function() {
    var rand = Math.floor(Math.random() * 12) + 1;
    $("#gkgmk").css("backgroundImage","url('images/bg_images/bg_image"+rand+".png')")
    $(document.body).on("click","#signUp",function() {
        createUsername();
    });
    $(document.body).on("click","#login",function() {
        if($("#username-type").val() != "" && $("#password-type").val() != "") {
            socket.emit("checkLogin",{username:$("#username-type").val(),
                                             password:$("#password-type").val()});
        }else {
            alert("Please enter username and password");
        }
        $("#gkgmk .lct").filter(function() {return $(this).val() == "";})
        .css("backgroundColor","orange");
        $("#gkgmk .lct").filter(function() {return $(this).val() != "";})
        .css("backgroundColor","white");
        socket.once("userExists",function(data) {
            loggedIn($("#username-type").val());
            $.getJSON("/public/userData/"+$("#usernameDisplay").text()+
                      "/data/userSettings.json",
            function(result) {
                if(result.avatar) {
                    $("#userIcon").css("backgroundImage",result.avatar);
                }
                if(result.language) {
                    lang = result.language;
                }
                console.log(lang);
                notifsDisabled = result.notificationsDisabled||false;
            });
            $.getJSON("/public/userData/"+
                      $("#usernameDisplay").text()+
                      "/data/appearanceSettings.json",
            function(result) {
                if(result.image[0].randomBG == false) {
                    $(".box1").css({backgroundImage:result.image[0].image,
                                    backgroundSize:result.image[0].bgSize,
                                    backgroundRepeat:result.image[0].bgRepeat});
                }else {
                    //$(".box1").css("backgroundImage","url('images/bg_images/bg_image"+rand+".png')");
                }
                $(".box1").css("backgroundColor",result.bgColor);
            });
        });
        socket.once("wrong",function(data) {
            alert(data.message);
        });
    });
    function loggedIn(display) {
        var a = new Audio(ngrok+"public/sounds/CompanyTone.m4a");
        a.play();
        $("#gkgmk").hide();
        $("#usernameDisplay").text(display);
        require(["InfoPane/messageCenter"]);
    }

    function createUsername() {
        if($("#username-type").val() != "" && $("#password-type").val() != "" && $("#signCode-type").val() != "") {
            socket.emit("cUsername",{username:$("#username-type").val(),password:$("#password-type").val(),accessCode:$("#signCode-type").val()});
            socket.once("allGo",function(data) {
                loggedIn(data.user);
                var userData = "userData"+"/"+$("#usernameDisplay").text()+"/",
                    folders = [".Desktop",".Document",".Images_Video",".Music"];
                for(var i = 0; i <3; i++) {
                    $(folders[i]).attr("data-Folder-URL",userData+$(folders[i]).attr("data-Folder-Name"));
                }
            });
            socket.once("userExists",function() {
                alert("User already exists");
            });
            socket.once("keyCodeError",function() {
                alert("Your KeyCode is wrong!")
            });
        }else {
            alert("Please enter a username, password and your keycode");
        }
        socket.once("wrong",function(data) {
            alert(data.message);
        });
    }
    $(document.body).on("click","#logOut",function() {
        socket.emit("saveOS",{user:$("#usernameDisplay").text(),contents:$("#data").html()});
        socket.once("OSSaved",function() {
            $("#gkgmk").show();
            location.reload(false);
        });
        timeOn = new Date().getTime();
        $("#tli").text("");
    });
});
