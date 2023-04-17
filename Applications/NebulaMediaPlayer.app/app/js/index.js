var mediaPlayer;
var video;
var playing;
var ngrok = window.location.protocol + "//" + window.location.host+"/public/"
$(document).ready(function() {
    $(".dropdown-trigger").dropdown();
    mediaPlayer = document.getElementById('media-video');
    video = document.getElementById('media-video-source');
    //mediaPlayer.controls = false;
    mediaPlayer.src = 'elf.mp4';
    function format(num) {
        return(("0" + num).slice(-2));
    }
    setInterval(function() {
        if(playing) {
            var duration = mediaPlayer.duration;
            var time = mediaPlayer.currentTime;
            var percentage = (time/mediaPlayer.duration)*100;
            var hours = Math.floor(time/3600);
            var minutes = Math.floor(time/60);
            time = time - hours * 3600;
            var seconds = time - minutes * 60;
            $("#progress-bar").val(percentage);
            $("#playedTime").html(format(hours)+":"+format(minutes)+":"+format(seconds.toFixed(0)));
            var hrsLeft = Math.floor(duration/3600)-(hours+1);
            if(hrsLeft == -1) {
                hrsLeft = 0;
            }
            var minsLeft = Math.floor(duration/60)-(minutes+1);
            var secsLeft = 60-seconds;
            if(minsLeft*60 == mediaPlayer.duration.toFixed(0)) {
                secsLeft = 0;
                minsLeft = minsLeft+1;
            }
            if(secsLeft.toFixed(0) == 60 && minsLeft ==-1) {
                secsLeft = 0;
                minsLeft = 0;
                stopPlayer();
            }
            $("#timeLeft").html(format(hrsLeft)+":"+format(minsLeft)+":"+format(secsLeft.toFixed(0)));
        }
    },1000);

    $("#play-pause-button").click(function() {
        if(mediaPlayer.src) {
            togglePlayPause();
        }
    });
    $("#stop-button").click(function() {
        stopPlayer();
        $("#playPane").hide();
    });

    function togglePlayPause() {
        playing = !playing;
        var btn = document.getElementById('play-pause-button');
        if(mediaPlayer.paused || mediaPlayer.ended) {
            changeButtonType(btn,"pause b");
            mediaPlayer.play();
            $("#playPane").hide();
        }else {
            changeButtonType(btn,"play b");
            mediaPlayer.pause();
            $("#playPane").show();
        }
    }

    function changeButtonType(btn,value) {
        btn.title = value;
        btn.className = value;
    }

    function stopPlayer() {
        mediaPlayer.pause();
        mediaPlayer.currentTime = 0;
        var btn = document.getElementById('play-pause-button');
        changeButtonType(btn,"play b")
        playing = false;
    }

    function changeVolume(direction) {
        if(direction === '+') mediaPlayer.volume += mediaPlayer.volume ==1 ? 0 : 0.1;

        else mediaPlayer.volume -=(mediaPlayer.volume == 0 ? 0 :0.1);
        mediaPlayer.volume = parseFloat(mediaPlayer.volume).toFixed(1);
    }

    $( "#slider" ).slider({
        orientation:"vertical",
        range:"min",
        min:0,
        max:100,
        value:40,
        slide: function(event, ui) {
            $("#value").html(ui.value+"%");
            mediaPlayer.volume = (ui.value/100);
            console.log(mediaPlayer.volume);
        }
    });
    $("#progress-bar").click(function(e) {
        var x = e.pageX - this.offsetLeft, // or e.offsetX (less support, though)
            y = e.pageY - this.offsetTop,  // or e.offsetY
            clickedValue = x * this.max / this.offsetWidth,
            isClicked = clickedValue >0;
        if (isClicked) {
            $("#progress-bar").val(clickedValue);
            mediaPlayer.currentTime = (mediaPlayer.duration/100)*clickedValue;
        }
    });

    $("#media-wrapper").hover(function() {
        $("#media-controls").animate({"bottom":0});
    },function() {
        setTimeout(function() {
            if(playing || mediaPlayer.paused) {
                $("#media-controls").animate({"bottom":"-14vh"});
            }
        },5000);
    });
    /*$("#topWrapper").hover(function() {
        $("#top").show();
    },function() {
        if(playing || $("#img").css("display") == "block") {
            setTimeout(function() {
                $("#top").hide();
            },5000);
        }
    });*/

    $("#media-video").click(function() {
        if(playing) {
            mediaPlayer.pause();
            $("#playPane").show();
        }
    });
    $("#mPlay").click(function() {
        $("#playPane").hide();
        togglePlayPause();
        mediaPlayer.play();
    });

    $("body").keyup(function(e) {
        if(e.keyCode == 32 && mediaPlayer.src) {
            togglePlayPause();
        }
    });
    $("body").click(function() {
        var elem = document.getElementById("media-video");
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    });
});
