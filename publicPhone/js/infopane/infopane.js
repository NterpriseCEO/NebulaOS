var d = [C.sun,C.mon,C.tues,C.wed,C.thurs,C.fri,C.sat];
var m = [C.jan,C.feb,C.mar,C.apr,C.may,C.june,
        C.july,C.aug,C.sept,C.oct,C.nov,C.dec];
var dte = new Date();
setInterval(function(){
    var date = new Date();
    var ds = date.toLocaleTimeString();
    var d2 = ds.substr(0,5);
    $(".time").text(d2);
    $("#date").text(d[date.getDay()]+" "+date.getDate()+" "+m[date.getMonth()]+" "+date.getFullYear());
},1000);
$("#date").text(dte[dte.getDay()]+" "+dte.getDate()+" "+dte.getFullYear());
$("#notificationsBtn").click(function() {
    swiper.slideTo(0);
});
$("#volumeBtn").click(function() {
    $("#volumeBtn span").toggleClass("vHide");
});
