var ngrok = window.location.protocol + "//" + window.location.host+"/public/";
require([ngrok+"js/NebulaPM.js",ngrok+"js/jquery.js"],function() {
    require([ngrok+"js/materialize.min.js"],function() {
        var post = new SecurePost(),
            name,
            user,
            canvas,
            ctx,
            image,
            C;
        post.post("ready","PhotosKey0",null);
        post.once("appEvent","PhotosKey0",function(data) {
            console.log(data)
            if(data != undefined) {
                if(data.inApp) {
                    $("#close").removeClass("hide");
                }
                post.post("getContents","PhotosKey01",null,{path:"../../../Applications/Photos.app/app/langs/"+data.lang+".json",isFolder:false});
                post.once("contentsGotten","PhotosKey01",function(data3) {
                    if(data3.exists) {
                        C = JSON.parse(data3.contents);
                        for (var prop in C) {
                            if(C.hasOwnProperty(prop)) {
                                $("*[data-text='"+prop+"']").text(C[prop]);
                            }
                        }
                    }
                });
            }
        });

        $('ul.tabs').tabs();
        $(".navbar-fixed,nav").height($(".navbar-wrapper").height());
        $("#bottomMenu").modal({
            complete:function() {
                $("#bottomMenu").removeClass("upScreen");
                $("#name").text(name);
                $("#name").attr("contenteditable","false");
                $("#name").addClass("truncate");
                $("#bMRename i").text("edit");
            }
        });

        var swiper = new Swiper('#imageSwiper', {
            // Optional parameters
            direction:'horizontal',
            centeredSlides: true,
            pagination: {
                el: '.swiper-pagination',
            },
            touchMoveStopPropagation:true,
            noSwipingClass:"icon",
            noSwiping:true,
            observer:true,
            observeParents:true
        });
        var videoSwiper = new Swiper('#videoSwiper', {
            // Optional parameters
            direction:'horizontal',
            pagination: {
                el: '.swiper-pagination',
            },
            touchMoveStopPropagation:true,
            noSwipingClass:"icon",
            noSwiping:true,
            observer:true,
            observeParents:true
        });

        post.post("getUsername","PhotosKey1",null);
        post.once("usernameGotten","PhotosKey1",function(data) {
            user = data.username;
            post.post("readDir","PhotosKey2",null,{path:"/Images_Video/Camera"});
            var path = ngrok+"/public/userData/"+data.username+"/Images_video/Camera/";
            post.once("folderContents","PhotosKey2",function(data2) {
                var d = data2.files,
                    y = -1,
                    y2 = -1;
                if(data2.files != undefined) {
                    contents(d,0);
                }
                function contents(d,i) {
                    if(d[i].endsWith(".png") || d[i].endsWith(".jpg")) {
                        post.post("getContents","PhotosKey6",null,{path:"/Images_Video/Camera/"+d[i]});
                        post.once("contentsGotten","PhotosKey6",function(data) {
                            if(i % 4 == 0) {
                                $("#images").append("<div class = 'row'></div>");
                                y++;
                            }
                            $("#images .row:eq("+y+")").append("<div class = 'col s6'><img class = 'responsive-img z-depth-1' src = '"+data.contents+"' data-src = '"+(path+d[i])+"'></div>");
                            swiper.appendSlide([
                                "<div class = 'swiper-slide'><div class = 'helper'></div><img src = '"+data.contents+"' data-src = '"+(path+d[i])+"'></div></div>"
                            ]);
                            if(i < d.length-1) {
                                contents(d,i+1);
                            }
                        });
                    }
                }
                post.post("readDir","PhotosKey2",null,{path:"/Images_Video/Videos"});
                var path2 = window.location.protocol + "//" + window.location.host+"/public/userData/"+data.username+"/Images_video/Videos/";
                post.once("folderContents","PhotosKey2",function(data3) {
                    var d3 = data3.files;
                    if(data3.files != undefined) {
                        for(var i = 0; i <d3.length; i++) {
                            if(d3[i].endsWith(".webm") || d3[i].endsWith(".mp4")) {
                                if(i % 4 == 0) {
                                    $("#videos").append("<div class = 'row'></div>");
                                    y2++;
                                }
                                $("#videos .row:eq("+y2+")").append("<div class = 'col s6'><video class = 'responsive-video z-depth-1' src = '"+(path2+d3[i])+"'></video>");
                                videoSwiper.appendSlide([
                                    "<div class = 'swiper-slide'><div class = 'helper'></div><video controls class = 'responsive-video'></video></div>"
                                ]);
                                $("#videosPane .swiper-slide:last video").attr("src",path2+d3[i]);
                            }
                        }
                    }
                });
            });
        });
        $(document.body).on("click","#images img",function() {
            var pos = $("#images img").index(this);
            swiper.slideTo(pos);
            $("#imagesPane").removeClass("hide");
            $("body").addClass("noScroll");
        });
        $(document.body).on("click","#videos video",function() {
            var pos = $("#videos video").index(this);
            videoSwiper.slideTo(pos);
            $("#videosPane").removeClass("hide");
            $("body").addClass("noScroll");
        });
        var canScroll = true;

        $(".modal-trigger").click(function() {
            var index = $("#videosPane").hasClass("hide")?swiper.activeIndex:videoSwiper.activeIndex,
                type = $("#videosPane").hasClass("hide")?"img":"video"
                name = $(this).parent().parent().find(type+":eq("+index+")").attr("data-src");
            name = name.substr(name.lastIndexOf("/")+1,name.length);
            $(".modal h4").text(name);
        });

        $(".back").click(function() {
            $("#imagesPane,#videosPane").addClass("hide");
            $('video').each(function() {
                $(this).get(0).currentTime = 0;
                $(this).get(0).pause()
            });
            $("body").removeClass("noScroll");
        });

        $("#bMRename").click(function() {
            $("#bottomMenu").toggleClass("upScreen");
            var section = $("#videosPane").hasClass("hide")?["#images img","Camera/","#imagesPane img","#imagesPane"]:["#videos video","Videos/","#videosPane video","#videosPane"],
                pos = $("#videosPane").hasClass("hide")?swiper.activeIndex:videoSwiper.activeIndex,
                truth = $('#name').attr('contenteditable') == "true";
            if(!truth) {
                name = $("#name").text();
                $("#bMRename i").text("save");
                $("#name").text(name.substr(name,name.lastIndexOf(".")));
                cEnd(document.getElementById('name'));
                setTimeout(function() {
                    $("#name").focus();
                }, 0);
            }else {
                $("#bMRename i").text("edit");
                if($("#name").text() != name.substr(name,name.lastIndexOf(".")) &&
                   $("#name").text() != "") {
                    var newName = $("#name").text()+name.substr(name.lastIndexOf("."),name.length),
                        path = $("#videosPane").hasClass("hide")?"Camera/":"Videos/";
                    post.post("renameFileFolder","PhotosKey3",null,{oldPath:"Images_Video/"+path+name,
                    newPath:"Images_Video/"+path+newName});
                    post.once("renamed","PhotosKey3",function() {
                        $(section[0]+":eq("+pos+"),"+section[2]+":eq("+pos+")").attr("data-src",window.location.protocol + "//" + window.location.host+"/public/userData/"+user+"/Images_Video/"+section[1]+newName);
                        $("#name").text(newName);
                    });
                    name = newName;
                }else {
                    $("#name").text(name);
                }
                $("#name").focusout();
            }
            $('#name').attr('contenteditable',!truth);
            $('#name').toggleClass('truncate');
        });

        $("#bMDelete").click(function() {
            post.post("confirmAlert","PhotosKey4",null,{displayText:C.wantToDelete});
            post.once("confirmDone","PhotosKey4",function(confirmed) {
                if(confirmed) {
                    var section = $("#videosPane").hasClass("hide")?["#images img","#imagesPane img","#imagesPane","Camera/"]:["#videos video","#videosPane video","#videosPane","Videos/"],
                        pos = $("#videosPane").hasClass("hide")?swiper.activeIndex:videoSwiper.activeIndex,
                        filePath = "/Images_Video/"+section[3]+$("#name").text();
                    if($(section[1]+":eq("+pos+")").is($("#imagesPane img"))) {
                        $(section[0]+":eq("+pos+"),"+section[1]+":eq("+pos+")").parent().remove();
                    }else {
                        $(section[0]+":eq("+pos+"),"+section[1]+":eq("+pos+")").remove();
                    }

                    post.post("deleteFile","PhotosKey5",null,{path:filePath});
                    $("#bottomMenu").modal("close");
                }
            });
        });

        $("#bMEdit").click(function() {
            loadImage($(".swiper-slide-active img"));
            $("canvas,#cancel,#save").removeClass("hide");
            $("#bottomMenu").modal("close");
            $("#imagesPane .paneHeader").removeClass("white z-depth-1");
            $("#imagesPane .modal-trigger, .back").addClass("hide");
            $("#filters").removeClass("hide");
        });
        $("#cancel,#save").click(function() {
            $("canvas,#cancel,#save").addClass("hide");
            $("#bottomMenu").modal("open");
            $("#imagesPane .paneHeader").addClass("white z-depth-1");
            $("#imagesPane .modal-trigger, .back").removeClass("hide");
            $("#filters").addClass("hide");
            if($(this).is("#save")) {
                var imageData = canvas.toDataURL();
                var name = image.attr("data-src");
                name = name.substr(name.lastIndexOf("/"),name.length);
                image.attr("src",imageData);
                post.post("saveFile","PhotosKey7",null,{path:"/Images_Video/Camera/"+name,contents:imageData,
                                                        isFolder:false});
                post.once("fileSaved","PhotosKey7",function() {
                    $("#images img[data-src='"+image.attr("data-src")+"']").attr("src",imageData);
                });
            }
        });

        $(".filter").click(function() {
            ctx.filter = "none";
            ctx.filter = $(this).attr("data-value")+"(100)";
            ctx.drawImage(image[0],0,0,image.width(),image.height());
        });

        function loadImage(img) {
            image = img;
            canvas = document.getElementsByTagName("canvas")[0];
            canvas.width = img.width();
            canvas.height = img.height();
            ctx = canvas.getContext("2d");
            ctx.drawImage(img[0],0,0,img.width(),img.height());
            $("#canvas").css("top",($("#imagesPane").height()-canvas.height)/2);
        }

        function cEnd(div) {
            // Modern browsers
            var str = div.innerHTML;
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(div.childNodes[0],str.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        $(".swiper-container").click(function() {
            $(this).parent().find(".paneHeader").fadeToggle();
        });
    });
});
