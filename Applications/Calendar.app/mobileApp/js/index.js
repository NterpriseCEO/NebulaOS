var events = [],
    post,
    ngrok = window.location.protocol + "//" + window.location.host+"/public/",
    deleteEvent = "Delete Event",
    lang = "NONE";
require([ngrok+"js/NebulaPM.js",ngrok+"js/jquery.js"],function() {
    require([ngrok+"js/materialize.min.js"],function() {
        post = new SecurePost();
        post.post("ready","CalendarKey0",null);
        post.once("appEvent","CalendarKey0",function(datay) {
            post.post("getContents","CalendarKey01",null,{path:"../../../Applications/Calendar.app/mobileApp/langs/"+datay.lang+".json",isFolder:false});
            post.once("contentsGotten","CalendarKey01",function(datax) {
                require(["events"]);
                deleteEvent = "Delete Event";
                if(datax.exists) {
                    var c = JSON.parse(datax.contents);
                    deleteEvent = c.deleteEvent;
                    for(var prop in c) {
                        if(c.hasOwnProperty(prop)) {
                            $("*[data-text='"+prop+"']").text(c[prop]);
                        }
                    }
                }
                post.post("getContents","CalendarKey1",null,{path:"/data/NebulaCalendarData/calendar.data",isFolder:false});
                post.once("contentsGotten","CalendarKey1",function(data) {
                    if(data.exists) {
                        events = JSON.parse(data.contents);
                        $("select").material_select();
                        for(var i = 0; i <5; i++) {
                            $(".curr").append("<div class = 'row calRow'></div>");
                            for(var o = 0; o < 7; o++) {
                                $(".calRow:eq("+i+")").append("<div class = 'col calCol lighten-3'>1</div>")
                            }
                        }
                    }
                    var Calendar  = function() {
                        var wrap, label,
                        months = ["Jan","Feb","March","Apr","May","June",
                        "July","Aug","Sept","Oct","Nov","Dec"];

                        function init(newWrap) {
                            $("#prev").click(function() {
                                switchMonth(false);
                            });
                            $("#next").click(function() {
                                switchMonth(true);
                            });
                            $("#label").click(function() {
                                switchMonth(null,new Date().getMonth(),new Date().getFullYear());
                            });
                            $("#label").click();
                        }
                        function switchMonth(next,month,year) {
                            var curr = $("#label").text().trim().split(" "),
                                calendar, tempYear = parseInt(curr[1],10);
                            if(month == 0) {
                                month = month;
                            }else {
                                month = (next ? ((curr[0] === "Dec") ?0:
                                months.indexOf(curr[0])+1):((curr[0] === "Jan")?11:months.indexOf(curr[0])-1));
                            }
                            year = year ||((next && month === 0) ? tempYear+1 : (!next && month === 11) ?tempYear-1: tempYear);
                            calendar = createCal(year,month);
                            $("#main").find(".curr").removeClass("curr")
                            .addClass("temp").end().append(calendar.calendar())
                            .find(".temp").remove();
                            $("#label").html(calendar.label).attr({"year":year,"month":month+1});
                            $("#dayPage").animate({marginTop:$("#main").height()+15,minHeight:$(window).height()-$("#main").height()-15});
                            $("td").each(function() {
                                if(events[year] != undefined || events[year] != null) {
                                    if(events[year][month+1] != undefined || events[year][month+1] != null) {
                                        if(events[year][month+1][parseInt($(this).text())] != undefined || events[year][month+1][parseInt($(this).text())] != null) {
                                            $(this).addClass(events[year][month+1][parseInt($(this).text())][0]).attr("data-hasEvent",true);
                                        }
                                    }
                                }
                            });
                        }
                        function createCal(year,month) {
                            createCal.cache = {};
                            var day = 1, i,j, haveDays = true
                            startDay = new Date(year,month,day).getDay(),
                            daysInMonths = [31,(((year%4==0)&&(year%100!=0))||(year%400==0))?29:28,31,30,31,30,31,31,30,31,30,31],
                            calendar = [];
                            if(createCal.cache[year]) {
                                if(createCal.cache[year][month]) {
                                    return createCal.cache[year][month];
                                }
                            }else {
                                createCal.cache[year] = {};
                            }
                            i = 0;
                            while(haveDays) {
                                calendar[i] = [];
                                for(j = 0; j<7; j++) {
                                    if(i === 0) {
                                        if(j === startDay) {
                                            calendar[i][j] = day++;
                                            startDay++;
                                        }
                                    }else if(day <= daysInMonths[month]) {
                                        calendar[i][j] = day++;
                                    }else {
                                        calendar[i][j] = "";
                                        haveDays = false;
                                    }
                                    if(day > daysInMonths[month]) {
                                        haveDays = false;
                                    }
                                }
                                i++;
                            }
                            if(calendar[5]) {
                                for(i = 0; i <calendar[5].length; i++) {
                                    if(calendar[5][i] !== "") {
                                        calendar[5][i] = "<span>"+calendar[5][i]+"</span>";
                                    }
                                }
                                calendar = calendar.slice(0,6);
                            }
                            for(i = 0; i < calendar.length; i++) {
                                calendar[i] = "<tr class = 'calRow'><td class = 'calCol'>" + calendar[i].join("</td><td class = 'calCol'>") + "</td></tr>";
                            }
                            calendar = $("<table>" + calendar.join("") + "</table>").addClass("curr");
                            $("td:empty", calendar).addClass("nil");
                            if(month === new Date().getMonth()) {
                                $('td', calendar).filter(function () { return $(this).text() === new Date().getDate().toString(); }).addClass("selected");
                            }
                            createCal.cache[year][month] = {
                                calendar:function(){
                                    return calendar.clone();
                                },
                                label:months[month]+" "+year
                            }
                            return createCal.cache[year][month];
                        }
                        return {
                            init:init,
                            switchMonth:switchMonth,
                            createCal:createCal
                        }
                    }
                    Calendar().init();
                    selectedCol = $(".calCol.selected");
                    var hasEvents = setInterval(function() {
                        if(events != undefined) {
                            console.log(events)
                            clearInterval(hasEvents);
                            if($(".calCol.selected").attr("data-hasEvent") == "true") {
                                var y = $("#label").attr("year");
                                var m = $("#label").attr("month");
                                var d = $(".calCol.selected").text();
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
                                $(".calCol.selected").removeClass("selected lighten-2");
                            }
                        }
                    },200);
                });
            });
        });
    });
});
