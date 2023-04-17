define([window.location.protocol + "//" + window.location.host+"/public/js/materialize.min.js"],function() {
    return {
        notification:function(header,displayTxt,title) {
            var header = title||"";
            if($("#modal").length) {
                $("#modal").modal("close").remove();
            }
            if(!$(".alert")[0]) {
                $("body").append("<div id='modal' class='modal'>\
                                      <div class='modal-content'>\
                                          <h4>"+header+"</h4>\
                                              <p>"+displayTxt+"</p>\
                                          </div>\
                                          <div class='modal-footer'>\
                                              <a href='#!' class='ok modal-close blue-text btn-flat'>close</a>\
                                          </div>\
                                  </div>");
                $("#modal").modal().modal("open");
                $(".ok").click(function() {
                    $("#modal").modal("close").remove();
                    $("#disableBox").hide();
                });
            }
        },
        type:function(options,callback) {
            var header = options.header||"";
            if($("#modal").length) {
                $("#modal").modal("close").remove();
            }
            if(!$(".alrt")[0]) {
                $("body").append("<div id='modal' class='modal'>\
                                      <div class='modal-content'>\
                                          <h4>"+header+"</h4>\
                                              <p>"+options.displayText+"</p>\
                                              <input type = 'text' id = 'value' spellcheck='false'>\
                                          </div>\
                                          <div class='modal-footer'>\
                                              <a href='#!' class='ok modal-close blue-text btn-flat'>ok</a>\
                                              <a href='#!' class='cancel modal-close red-text btn-flat'>cancel</a>\
                                          </div>\
                                  </div>");
                $("#modal").modal().modal("open");
                $("#value").focus();
                $(".ok").click(function() {
                    var _this = this;
                    if($("#value").val().length >0) {
                        var val = $("#value").val();
                        $("#modal").modal("close").remove();
                        return callback(val,true);
                    }
                });
                $(".cancel").click(function() {
                    $("#modal").modal("close").remove()
                    return callback(false);
                });
                if(options.cancel != undefined) {
                    $(".cancel").text(options.cancel);
                }
                if(options.ok != undefined) {
                    $(".ok").text(options.ok);
                }
            }
        },
        confirm:function(options,callback) {
            var header = options.header||"";
            if($("#modal").length) {
                $("#modal").modal("close").remove();
            }
            if(!$(".alrt")[0]) {
                $("body").append("<div id='modal' class='modal'>\
                                      <div class='modal-content'>\
                                          <h4>"+header+"</h4>\
                                              <p>"+options.displayText+"</p>\
                                          </div>\
                                          <div class='modal-footer'>\
                                              <a href='#!' class='ok modal-close blue-text btn-flat'>ok</a>\
                                              <a href='#!' class='cancel modal-close red-text btn-flat'>cancel</a>\
                                          </div>\
                                  </div>");
                $("#modal").modal().modal("open");
                if(options.cancel != undefined) {
                    $(".cancel").text(options.cancel);
                }
                if(options.ok != undefined) {
                    $(".ok").text(options.ok);
                }
                $(".ok").click(function() {
                    $("#modal").modal("close").remove();
                    return callback(true);
                });
                $(".cancel").click(function() {
                    $("#modal").modal("close").remove();
                    return callback(false);
                });
            }
        }
    }
});
