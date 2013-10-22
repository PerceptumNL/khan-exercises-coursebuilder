/*

	Khan Exercises for WordPress

	Copyright (C) 2012 Pavel Simakov (pavel@vokamis.com)
	https://github.com/psimakov/khan-exercises-wordpress

*/

function ity_load_globals(id, name){
    if(document.getElementById){
		// show frame
		var frm = document.getElementById(id);
        if (window[name + '_data']) {
		    frm.contentWindow.userExerciseData = window[name + '_data'];
        }
		frm.contentWindow.Badges = window['Badges'];
    }
}

function ity_ef_resize_height(id){
    if(document.getElementById){
		// show frame
		var frm = document.getElementById(id);
		frm.style.display = 'block';
		var h = 0;

		// hide progress		
		var progress = document.getElementById(id + '-loading');
		progress.style.display = 'none';

		// this is a very fragile spot; may need to research old browsers a bit better;
		// tested ok with Chrome 22.0.1229.94, Firefox 16.0.1, and IE 9.0.8112.16421
		if(frm.contentDocument) {
			h = frm.contentDocument.documentElement.scrollHeight;
		} else  {
			h = frm.contentWindow.document.documentElement.scrollHeight;
		}
		
		if (!frm.ityMinHeight || (h > frm.ityMinHeight)){
			frm.height = "" + h + "px";
			frm.ityMinHeight = h;
		}

		// hook Khan framework to listen to further resize events
		if (frm.contentWindow.Khan){
			frm.contentWindow.Khan.onItyEfResize = function () {
				ity_ef_resize_height(id);
			}
		}
	}
}

(function() {

	// sanitize CSS style and other restricted alphanumeric input
	function sanitize(text){
		var out = "";
		var len = text.length;
		for (i = 0; i < len; i++) {
			var c = text.charAt(i);
			if ('a' <= c && c <= 'z' ||
				'A' <= c && c <= 'Z' ||
				'0' <= c && c <= '9' ||
				':' == c || ';' == c ||
				'-' == c || '#' == c ||
				'{' == c || '}' == c ||
				' ' == c || '.' == c ||
				'_' == c
				){
				out = out + c;
			} else {
				out = out + "*";
			}
		}
		return out;
	}

	// figure out base URL by looking at the last DOM node that embedded this script
	var scripts = document.getElementsByTagName('script');
	var parts = scripts[scripts.length - 1].src.split('?');
	var path = parts[0];	// resource
	var base = path.split('/').slice(0, -1).join('/');		// remove last filename part of path

	// embed frame uid
	if (typeof(window['ity_ef_uid']) == "undefined"){
		window['ity_ef_uid'] = 0;
	} else { 
		ity_ef_uid = parseInt(ity_ef_uid) + 1;
	}

	// get exercise id (protocol:name)
	var id = "static:adding decimals";
	if (typeof(window['ity_ef_id']) != "undefined"){
		id = encodeURIComponent(ity_ef_id);		// use one defined by a variable
		window['ity_ef_id'] = undefined;
	} else {
		if (parts.length == 2){
			id = encodeURIComponent(parts[1]);	// use one passed in a query string
		}
	}

	// get custom style
        var style = "width: 100%; min-height: 500px; overflow: hidden; border: none; display: none;";
	if (typeof(window['ity_ef_style']) != "undefined"){
		style = style + sanitize(ity_ef_style);
	 	window['ity_ef_style'] = undefined;
	}

    var name = parts[1].replace("static:", "");
    var longestStreak = "";
    var currentStreak = "";
    console.log("NAME: " + name);
    if (window[name + '_data']) {
        console.log("Loading Data");
        var userExercise = window[name + '_data'];
        longestStreak = '&longestStreak=' + userExercise['longest_streak'];
        currentStreak = '&currentStreak=' + userExercise['streak'];
    }

	// origin
	var origin = encodeURIComponent(window.location.href);

	// prepare iframe html
	var uid = "ity-ef-exercise-" + ity_ef_uid;
	var src = base + "/khan-exercises/indirect/?" + "ity_ef_site=raw" + "&ity_ef_slug=" + id + "&ity_ef_origin=" + origin + currentStreak + longestStreak;
	var body =
		"<a name='" + uid + "-ancor'></a>" + 
		"<div id='" + uid + "-loading'><img src='" + base + "/khan-exercises/css/images/throbber.gif' /></div>" +
		"<iframe src='" + src + "' style='" + style + "' frameborder='0' scrolling='no' id='" + uid + "' onLoad='ity_ef_resize_height(\"" + uid + "\");ity_load_globals(\"" + uid + "\",\"" + name + "\")'></iframe>";

	// render it out
	document.write(body);

})();
