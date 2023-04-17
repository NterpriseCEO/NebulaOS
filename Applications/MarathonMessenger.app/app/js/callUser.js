var ngrok = window.location.protocol + "//" + window.location.host+"/";

require([ngrok+"publicPhone/js/socket.io.js",ngrok+"node_modules/socket.io-stream/socket.io-stream.js"],function(io,ss) {
    var socket = io();
    $("#callUser").click(function() {
        var user = $("#gIUser").text().split(": ")[1];
        $("#callPane h1").text(user);
        $("#callPane").removeClass("hide");
        call();
    });
    function call() {
        navigator.getUserMedia = ( navigator.getUserMedia ||
                                navigator.webkitGetUserMedia ||
                                navigator.mozGetUserMedia ||
                                navigator.msGetUserMedia);
        var STREAM = ss.createStream();
        //ss(socket).emit("audio",STREAM,{user:user});
        // set up basic variables for app

        var stop = document.querySelector('.stop');
        var soundClips = document.querySelector('.sound-clips');
        var canvas = document.getElementsByTagName('canvas')[0];

        // visualiser setup - create web audio api context and canvas

        var audioCtx = new (window.AudioContext || webkitAudioContext)();
        var canvasCtx = canvas.getContext("2d");
        var audio = document.getElementsByTagName("audio")[0];
        //main block for doing the audio recording

        if (navigator.getUserMedia) {
            console.log('getUserMedia supported.');
            navigator.getUserMedia({audio: true},function(stream) {
                var mediaRecorder = new MediaRecorder(stream);
                audio.srcObject = stream;
                visualize(stream);
                console.log(stream);
                //ss.createBlobReadStream(stream.getAudioTracks()).pipe(STREAM);

                mediaRecorder.ondataavailable = function(e) {
                    console.log("data available");

                    var audioURL = window.URL.createObjectURL(e.data);
                    socket.emit("audio",audioURL);
                    audio.src = audioURL;
                }
                setInterval(function() {
                    mediaRecorder.requestData();
                },1000);
            },
            function(err) {
                console.log('The following gUM error occured: ' + err);
            });
        } else {
            console.log('getUserMedia not supported on your browser!');
        }

        function visualize(stream) {
            var source = audioCtx.createMediaStreamSource(stream);

            var analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            var bufferLength = analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);

            source.connect(analyser);
            //analyser.connect(audioCtx.destination);

            WIDTH = canvas.width
            HEIGHT = canvas.height;

            draw()

            function draw() {
                requestAnimationFrame(draw);

                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = 'rgb(200, 200, 200)';
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

                canvasCtx.beginPath();

                var sliceWidth = WIDTH * 1.0 / bufferLength;
                var x = 0;


                for(var i = 0; i < bufferLength; i++) {

                    var v = dataArray[i] / 128.0;
                    var y = v * HEIGHT/2;

                    if(i === 0) {
                        canvasCtx.moveTo(x, y);
                    }else {
                        canvasCtx.lineTo(x, y);

                    }
                    x += sliceWidth;
                }

                canvasCtx.lineTo(canvas.width, canvas.height/2);
                canvasCtx.stroke();
            }
        }
    }
});
