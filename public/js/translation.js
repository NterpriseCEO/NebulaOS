function translate(app,fileName,filename) {
    if(lang != undefined) {
        $.getJSON(window.location.protocol + "//" + window.location.host+"/public/Applications/"+app+"/"+fileName+"_"+lang,function(result) {
        });
    }
}
