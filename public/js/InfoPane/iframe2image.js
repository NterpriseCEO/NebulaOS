/*! iframe2image - v0.2.1 - 2017-06-14
* https://github.com/twolfson/iframe2image
* Copyright (c) 2017 Todd Wolfson; Licensed MIT */
(function(e){function t(e,t){function s(){var e=n.contentWindow.document.body,r=getComputedStyle(n),i=parseInt(r.height,"10"),s=parseInt(r.width,"10");domvas.toImage(e,function(e){t(null,e)},s,i)}var n=e.iframe||e;if(!n.contentWindow)throw new Error("Unable to access iframe contents. Please verify it's hosted on the same domain");var r=n.contentWindow.document;if(r&&r.readyState==="complete")s();else{function i(e){n.removeEventListener("load",i),s()}n.addEventListener("load",i)}}e.iframe2image=t})(typeof exports=="object"&&exports||this);
