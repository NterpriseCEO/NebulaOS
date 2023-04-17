require(["alert"],function(alrt) {
    setInterval(function(){
        var date = new Date();
        $("#time").text(date.toLocaleTimeString());
    },1000);
    $(".fsbv").click(function() {
        $(".fsbh").toggle();
        $("#others").toggle();
    });
    $(".fsbh").click(function() {
        $(".fsbv").text($(this).text());
        $(".fsbh").toggle();
        $("#others").toggle();
        $(".folder-view").hide();
        var num = $(this).attr("data-folderNum");
        $(".table"+num).parent().show();
        if($(".table"+num).attr("data-loaded") == undefined && num != 5) {
            socket.emit("readDir",{path:parent.$("#usernameDisplay").text()+"/"+$(".table"+num).parent().attr("data-Folder-Name")});
            socket.once("folderContents",function(data) {
                var next = 0;
                for(var i = 0; i < data.files.length; i++) {
                    var name = data.files[i].substr(data.files[i].lastIndexOf("."));
                    $(".table"+num+" .td:eq("+i+")").append("<div class = 'file'><div class = 'fType'><div class='attl' title='"+data.files[i]+"'>"+data.files[i]+"</div></div></div>");
                    name = name.substr(1);
                    $(".table"+num+" .td:eq("+i+")").children().attr("title",data.files[i])
                    .find(".fType").css("backgroundImage","url('"+window.location.protocol + "//" + window.location.host+"/public/images/"+name+".png')");
                    next++;
                }
                for(var i = 0; i <data.folders.length; i++) {
                    var o = next+i;
                    $(".table"+num+" .td:eq("+o+")").html("<div class = 'folder' title='"+data.folders[i]+"'><div class='attl' title='"+data.folders[i]+"'>"+data.folders[i]+"</div></div>");
                    if(data.folders[i].endsWith(".app")) {
                        $(".table"+num+" .td:eq("+o+")").find(".folder").addClass("appFolder");
                    }
                }
                $(".table"+num).attr("data-loaded",true);
            });
        }
    });

    navigator.getBattery().then(function(battery) {
        function updateAllBatteryInfo(){
            updateChargeInfo();
            updateLevelInfo();
            updateChargingInfo();
            updateDischargingInfo();
        }
        var batteryLevel = battery.level * 100;
        $("#battery").width(batteryLevel+"%");
        $("#bName").attr("title",batteryLevel+"%").text(batteryLevel+"%");
        battery.addEventListener('chargingchange', function(){
            updateChargeInfo();
        });
        function updateChargeInfo(){
            if($("#gkgmk").css("display") != "block") {
                if(battery.charging) {
                    alrt.notification("Charging","Charger Plugged In");
                }else {
                    alrt.notification("Caution","Charger Unplugged");
                }
            }
        }
        battery.addEventListener('levelchange', function(){
            updateLevelInfo();
        });
        function updateLevelInfo(){
            var batteryLevel = battery.level * 100;
            $("#battery").css("width",batteryLevel+"%")
            $("#bName").attr("title",batteryLevel+"%").text(batteryLevel+"%");
        }

        battery.addEventListener('chargingtimechange', function(){
            updateChargingInfo();
        });

        battery.addEventListener('dischargingtimechange', function(){
            updateDischargingInfo();
        });
        function updateDischargingInfo(){
            var minutes = Math.floor(battery.dischargingTime / 60);
        }
    });
    $("#search").click(function() {
        $("#searchBar").toggle();
    });
    require(["infoPane/searchBar","infoPane/tabs"],function(){});
});
