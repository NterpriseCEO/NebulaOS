//../../../public/js/materialize.min.js
var ngrok = window.location.protocol + "//" + window.location.host+"/public/";
require(["jquery",ngrok+"js/NebulaPM.js"],function() {
    require([ngrok+"js/materialize.min.js","circle-progress.min"],function() {
        var audio = new Audio("../sounds/timer2.m4a"),
            post = new SecurePost(),
            timer,
            paused = false,
            running = false,
            type = 1,
            current = 1,
            timerVal = "00:00:00:00",
            C;
        post.post("ready","TimerKey0",null);
        post.once("appEvent","TimerKey0",function(data1) {
            post.post("getContents","TimerKey01",null,{path:"../../../Applications/Timer.app/mobileApp/langs/"+data1.lang+".json",isFolder:false});
            post.once("contentsGotten","TimerKey01",function(data2) {
                if(data2.exists) {
                    C = JSON.parse(data2.contents);
                    for(var prop in C) {
                        if(C.hasOwnProperty(prop)) {
                            $("*[data-text='"+prop+"']").text(C[prop]);
                        }
                    }
                    $(".timer,.countdown").text(timerVal);
                    var stopwatch = $("#stopwatch").circleProgress({
                        animation:false,
                        value:0,
                        size:1000,
                        fill:{
                            color:["#455a64"]
                        }
                    });
                    var countdown = $("#timer").circleProgress({
                        animation:false,
                        value:0,
                        size:1000,
                        fill:{
                            color:["#455a64"]
                        }
                    }).on('circle-animation-progress', function(event, progressValue, stepValue) {
                        $(this).find('.value').text(stepValue.toFixed(2));
                    });

                    $(".carousel").carousel({
                        fullWidth:true,
                        indicators:true,
                        onCycleTo:function(data) {
                            $("#start").text(C.start);
                            running = false;
                            paused = false;
                            stopwatch.circleProgress({value:0});
                            countdown.circleProgress({value:0});
                            clearInterval(timer);
                            $(".timer,.countdown").text("00:00:00:00");
                            type = $(data).index();
                            console.log(type)
                            if(type == 3) {
                                $("#start,#reset").addClass("hide");
                                $("#set").removeClass("hide");
                            }else {
                                $("#start,#reset").removeClass("hide");
                                $("#set").addClass("hide");
                            }
                        }
                    });

                    $(document.body).on("touchstart","#timer canvas, .value",function() {
                        $("#setTimer").modal("open");
                    });
                    $(document.body).on("click touchstart","#set",function() {
                        $("#setTimer").modal("open");
                    });

                    $("#setTimer").modal();

                    $("#start").on("click touchstart",function() {
                        audio.currentTime = 0;
                        audio.pause();
                        if(!running) {
                            $("#start").text(C.stop).attr("data-text",C.stop);
                            running = true;
                            if(type != current) {
                                stopwatch.circleProgress({value:0});
                                countdown.circleProgress({value:0});
                                clearInterval(timer);
                            }
                            if(!paused) {
                                if(type == 1) {
                                    startTimer();
                                }else if(type == 2) {
                                    startCountdown();
                                }
                                current = type;
                            }
                            paused = false;
                        }else {
                            running = false;
                            paused = true;
                            $("#start").text(C.start).attr("data-text",C.start);
                        }
                    });

                    $("#reset").on("click touchstart",function() {
                        clearInterval(timer);
                        paused = false;
                        running = false;
                        if(type == 1) {
                            stopwatch.circleProgress({value:0});
                            $(".timer").text("00:00:00:00");
                        }else {
                            countdown.circleProgress({value:0});
                            $(".countdown").text(timerVal);
                        }
                        $("#start").text(C.start).attr("data-text",C.start);
                        audio.currentTime = 0;
                        audio.pause();
                    });

                    var reg = /[0-9,:-]/;
                    $("#timerVal").on("keyup",function() {
                        if((this.value.length == 2 || this.value.length == 5) && reg.test(this.value)) {
                            this.value = this.value+":";
                        }
                        if(this.value.length > 8) {
                            this.value = this.value.substr(0,8);
                        }
                    });
                    $("#confirm").click(function() {
                        if(reg.test($("#timerVal").val())) {
                            if(type == 3) {
                                $(".alarm").text($("#timerVal").val());
                                startAlarm($("#timerVal").val());
                            }else {
                                timerVal = $("#timerVal").val()+":00";
                                $(".countdown").text(timerVal);
                            }
                        }
                    });
                    $(".modal-close").click(function() {
                        $("#timerVal").val("");
                    });

                    function startTimer() {
                        stopwatch.circleProgress({value:0});
                        var centi = 0,
                            sec = 0,
                            setVal = 0,
                            result;
                        timer = setInterval(function() {
                            if(!paused) {
                                centi++;
                                if(setVal == 59) {
                                    setVal = 0;
                                }
                                if(centi == 100) {
                                    centi = 0;
                                    sec++;
                                    setVal++;
                                    if(sec % 60 === 0) {
                                        stopwatch.circleProgress("value",0);
                                    }else {
                                        stopwatch.circleProgress("value",(1/60)*sec);
                                    }
                                    result = new Date(sec*1000).toISOString().substr(11,8);
                                }
                                $(".timer").text((result||"00:00:00")+":"+centi);
                            }
                        },10);
                    }
                    function startCountdown() {
                        countdown.circleProgress({value:0});
                        var centi = 0,
                            time = $(".countdown").text(),
                            a = time.split(":"),
                            sec = (+a[0])*60*60+(+a[1])*60+(+a[2]),
                            result,
                            setVal = (+a[2])+1;
                            sec = parseInt(sec)
                        timer = setInterval(function() {
                            if(!paused) {
                                console.log(setVal)
                                if(centi == 0) {
                                    centi = 100;
                                    sec--;
                                    setVal--;
                                    result = new Date(sec*1000).toISOString().substr(11,8);
                                    if(setVal % 60 === 0) {
                                        countdown.circleProgress("value",0);
                                    }else {
                                        countdown.circleProgress("value",(1/60)*setVal);
                                    }
                                }
                                if(setVal == 0) {
                                    setVal = 59;
                                }
                                centi--;
                                $(".countdown").text((result||"00:00:00")+":"+centi);
                                if(sec == 0){
                                    running = false;
                                    $("#start").text(C.start).attr("data-text",C.start);
                                    post.post("timerDone","TimerKey",null);
                                    $(".countdown").text(timerVal);
                                    audio.play()
                                    clearInterval(timer);
                                }
                            }
                        },10);
                    }
                    function startAlarm(time,pause) {
                        var hours = time.substr(0,2);
                        var mins = time.substr(3,2);
                        var d = new Date();
                        var nPause;
                        setTimeout(function() {
                            /*if(d.getHours() >= hours) {
                                if(d.getMinutes() > mins) {
                                    nPause = 60000;
                                }else {
                                    nPause = 1000;
                                }
                            }*/
                            if(d.getHours() == hours && d.getMinutes() == mins) {
                                post.post("alarmDone","TimerKey2",null);
                                startAlarm(time,1000);
                            }else {
                                startAlarm(time,1000);
                            }
                        },1000)
                    }
                    audio.addEventListener("ended",function() {
                        this.currentTime = 0;
                        this.play();
                    });
                }
            });
        });
    });
});
