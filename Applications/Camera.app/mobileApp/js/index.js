var ngrok = window.location.protocol + "//" + window.location.host+"/public/";
require([ngrok+"js/jquery.js",ngrok+"js/NebulaPM.js"],function() {
    require([ngrok+"../publicPhone/js/jquery.mobile.js","https://cdn.WebRTC-Experiment.com/RecordRTC.js"],function() {
        var post = new SecurePost(),
            video = document.getElementById("camera"),
            canvas = document.getElementById("snapshot"),
            ctx = canvas.getContext("2d"),
            ready = false,
            recording = false,
            width,
            height,
            audioSelect = document.getElementById("audioSource"),
            videoSelect = document.getElementById('videoSource'),
            recordRTC;
        video.muted = true;
        navigator.mediaDevices.enumerateDevices()
        .then(gotDevices).then(getStream).catch(handleError);

        audioSelect.onchange = getStream;
        videoSelect.onchange = getStream;

        function gotDevices(deviceInfos) {
            for (let i = 0; i !== deviceInfos.length; ++i) {
                var deviceInfo = deviceInfos[i],
                    option = document.createElement('option');
                    option.value = deviceInfo.deviceId;
                if (deviceInfo.kind === 'audioinput') {
                    option.text = deviceInfo.label ||
                    'microphone ' + (audioSelect.length + 1);
                    audioSelect.appendChild(option);
                } else if (deviceInfo.kind === 'videoinput') {
                    option.text = deviceInfo.label || 'camera ' +
                    (videoSelect.length + 1);
                    videoSelect.appendChild(option);
                } else {
                    console.log('Found another kind of device: ', deviceInfo);
                }
            }
        }

        function getStream() {
            if (window.stream) {
                window.stream.getTracks().forEach(function(track) {
                    track.stop();
                });
            }

            var constraints = {
                audio: {
                    deviceId: {exact:audioSelect.value}
                },
                video: {
                    deviceId: {exact: videoSelect.value}
                }
            };

            navigator.mediaDevices.getUserMedia(constraints).
            then(gotStream).catch(handleError);
        }

        function gotStream(stream) {
            window.stream = stream; // make stream available to console
            video.srcObject = stream;
            var interval  = setInterval(function() {
                if(video.readyState == 4) {
                    clearInterval(interval);
                    ready = true;
                    width = canvas.width = $(window).width();
                    height = canvas.height = video.videoHeight;
                }
            },50);
        }

        function handleError(error) {
            console.error('Error: ', error);
        }
        var scaled = false,
            canScale = true;
        $("#snap").click(function() {
            if(ready) {
                if(!scaled && canScale) {
                    scaled = true;
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                }
                $(".flash").addClass("pulse");
                var time = new Date().getTime();
                video.pause();
                ctx.drawImage(video,0,0,video.videoWidth,video.videoHeight);
                var image = canvas.toDataURL("image/png")

                post.post("saveFile","CameraCode1",null,{path:"/Images_Video/Camera/"+time+".png",contents:image});
                setTimeout(function() {
                    $(".flash").removeClass("pulse");
                },500);
                setTimeout(function() {
                    video.play();
                },3000);
            }
        });
        $("body").on("swipeleft",function() {
            $('option:selected').prop("selected",false);
            $('#videoSource option:eq(1)').prop("selected",true).change();
            $("#camera").addClass("reverse");
            ctx.translate(canvas.width, 0);
            ctx.scale(1, 1);
            canScale = false;
        });
        $("body").on("swiperight",function() {
            $('option:selected').prop("selected",false);
            $('#videoSource option:eq(0)').prop("selected",true).change();
            $("#camera").removeClass("reverse");
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            canScale = true;
        });
        $("#record").click(function() {
            recording = !recording;
            $("#record i").text() == "stop"?
            $("#record i").text("fiber_manual_record"):$("#record i").text("stop");
            if(recording) {
                if(ready) {
                    var options = {
                        mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
                        audioBitsPerSecond: 128000,
                        videoBitsPerSecond: 8000000000,
                        bitsPerSecond: 128000 // if this line is provided, skip above two
                    };
                    recordRTC = RecordRTC(stream,options);
                    recordRTC.startRecording();
                }
            }else {
                recordRTC.stopRecording(function (audioVideoWebMURL) {
                    video.src = audioVideoWebMURL;
                    var recordedBlob = recordRTC.getBlob(),
                        time = new Date().getTime();
                    recordRTC.getDataURL(function(dataURL) {
                        post.post("saveFile","CameraCode2",null,{path:"/Images_Video/Videos/"+time+".webm",contents:dataURL});
                    });
                });
            }
        });
        $("#images").click(function() {
            post.post("openApp","CameraCode3",null,{title:"Photos",inApp:true});
        });
    });
});
