$(".dropdownMenuBtn").click(function(e) {
    $(this).find(".dropdownMenu").toggle();
});
$(document).mousedown(function(e) {
    if(!$(".dropdownMenu").is(e.target)
        && $(".dropdownMenu").has(e.target).length == 0) {
        $(".dropdownMenu").hide();
    }
});
