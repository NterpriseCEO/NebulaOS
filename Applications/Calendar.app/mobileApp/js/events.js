var days = ["Monday","Tuesday","Wednesday","Thrusday",
            "Friday","Saturday","Sunday"];
var selectedCol;
var dte = new Date();
var year = dte.getFullYear();
var month = dte.getMonth()+1;
var day = dte.getDate();
$(document.body).on("click",".calCol:not(.nil)",function() {
    $(".calCol.selected").removeClass("selected");
    $(this).addClass("selected")
    var y = $("#label").attr("year");
    var m = $("#label").attr("month");
    var d = $(this).text();
    $("#events .card").remove();
    if($(this).attr("data-hasEvent") == "true") {
        $("#newBttn").addClass("hide");
        $("#editBttn").removeClass("hide");
        $("#events .col").append("<div class = 'card'>\
                                      <div class = 'card-content'>\
                                          <span class = 'card-title'>"+events[y][m][d][2]+"</span>\
                                          <p>"+events[y][m][d][2]+"</p>\
                                      </div>\
                                      <div id = 'deleteEvent' class = 'card-action' data-text = 'deleteEvent'>\
                                          <a href = '#'>"+deleteEvent+"</a>\
                                      </div>\
                                  </div>");
    }else {
        $("#newBttn").removeClass("hide");
        $("#editBttn").addClass("hide");
    }
    selectedCol = this;
    var i = $($(this).parent()).find(".calCol").index(this)
    $("#date").text(days[i]+" "+suffix($(this).text())+" "+$("#label").text());
});
$(".xButton").click(function() {
    $(this).parent().parent().parent().parent().parent().parent().addClass("hide");
});
$("#newBttn").click(function() {
    $("#eventCreator").removeClass("hide");
});
$("#editBttn").click(function() {
    var y = $("#label").attr("year");
    var m = $("#label").attr("month");
    var d = $(selectedCol).text();
    $("select").val(events[y][m][d][0]);
    $("#eTT").val(events[y][m][d][1]);
    $("#eV").val(events[y][m][d][2]);
    $("#eventCreator").removeClass("hide");
});

$("#createEvent").click(function() {
    if($("#eV").val() != "" && $("#eTT").val() != "") {
        var y = $("#label").attr("year");
        var m = $("#label").attr("month");
        var d = $(selectedCol).text();
        if(events[y] == undefined) {
            events[y] = [];
        }
        if(events[y][m] == undefined) {
            events[y][m] = [];
        }
        events[y][m][d] = [];
        events[y][m][d][0] = $("select").val();
        events[y][m][d][1] = $("#eTT").val();
        events[y][m][d][2] = $("#eV").val();
        post.post("saveFile","CalendarKey2",null,{path:"/data/NebulaCalendarData/calendar.data",contents:JSON.stringify(events)});
        $(selectedCol).addClass($("select").val()).attr("data-hasEvent",true).removeClass("selected");
        $("#eventCreator").addClass("hide");
        $("#newBttn").addClass("hide");
        $("#editBttn").removeClass("hide");
        $("#events .col").children().remove();
        $("#events .col").append("<div class = 'card'>\
                                      <div class = 'card-content'>\
                                          <span class = 'card-title'>"+$("#eTT").val()+"</span>\
                                          <p>"+$("#eV").val()+"</p>\
                                      </div>\
                                      <div id = 'deleteEvent' class = 'card-action' data-text = 'deleteEvent'>\
                                          <a href = '#'>"+deleteEvent+"</a>\
                                      </div>\
                                  </div>");
        $("#eV").val("");
        $("#eTT").val("");
    }else {
        alert("Fill out necessary info");
    }
});

$(document.body).on("click","#deleteEvent",function() {
    var y = $("#label").attr("year");
    var m = $("#label").attr("month");
    var d = $(selectedCol).text();
    $(".card").remove();
    $(selectedCol).removeClass(events[y][m][d][0]);
    events[y][m][d] = null;
    post.post("saveFile","CalendarKey2",null,{path:"/data/NebulaCalendarData/calendar.data",contents:JSON.stringify(events)});
});

function suffix(num) {
    num = parseInt(num);
    var j = num%100,
        k = num%100;
    if(j == 1 && k != 11) {
        return num+"st";
    }
    if(j == 2 && k != 12) {
        return num+"nd";
    }
    if(j == 3 && k != 13) {
        return num+"rd"
    }
    return num+"th";
}
