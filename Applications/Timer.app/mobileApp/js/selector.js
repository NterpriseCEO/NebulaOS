define(function() {
    function round(num,to) {
        return Math.round(num/to)*to;
    }
    return {
        init:function(_this) {
            $(_this).addClass("hide topFloat");
            $(_this).append("<div class = 'selection'><input type='number' max='23'></div><span>:</span><div class = 'selection'><input type='number' max='59'></div><span>:</span><div class = 'selection'><input type='number' max='59'></div><span class = 'confirm'><i class = 'material-icons'>check</i></span>")
            /*for(var hour = 0; hour < 24;hour++) {
                $(_this).find(".selection:eq(0)").append("<div class = 'num'>"+('0' + hour).slice(-2)+"</div>");
            }
            for(var mins = 0; mins < 60;mins++) {
                $(_this).find(".selection:eq(1)").append("<div class = 'num'>"+('0' + mins).slice(-2)+"</div>");
            }
            for(var sec = 0; sec < 60;sec++) {
                $(_this).find(".selection:eq(2)").append("<div class = 'num'>"+('0' + sec).slice(-2)+"</div>");
            }*/
        },
        select:function(_this) {
            $(_this).removeClass("hide");
        }
    }
});
