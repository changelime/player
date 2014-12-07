(function(){
	var music = [];
	var info = document.getElementById("info");
	var main = document.getElementById("main");
	var albumPic = document.getElementById("albumPic");
	var time = document.getElementById("time");
	var progress = document.getElementById("progress");
	var bar = document.getElementById("bar");
	var control = document.getElementById("control");
	var canvas = document.getElementById("canvas");
	var style = document.createElement("style");
	var head = document.getElementsByTagName("head")[0];
	style.type = "text/css";
	head.appendChild(style);
	var progressStop = false;
	var pressProgress = false;
	var playing = 0;
	var STATES = {NEXT:"NEXT",PREV:"PREV"};
	var isload = false;
	var bg = null;
	var resize = function(){
		albumPic.style.top = (document.body.offsetHeight/2)-256+"px";
		albumPic.style.left = (document.body.offsetWidth/2)-256+"px";
	};
	document.body.onresize = resize;
	var dropFiles = function (event)
	{
		var files = null,
			i = 0,
			len = 0;

		event.preventDefault();
		if(event.type == "drop")
		{
			files = event.dataTransfer.files;
			len = files.length;
			while(len > i)
			{
				music.push(files[i]);
				i++;
			}
			isload = true;
			play();
			document.body.removeEventListener("dragenter",dropFiles,false);
			document.body.removeEventListener("dragover",dropFiles,false);
			document.body.removeEventListener("drop",dropFiles,false);
			dropFiles = null;
		}
	}
	function play(state)
	{
		if(!isload)
			return;
		if(state === STATES.NEXT)
			playing = (playing+1) % music.length;
		else
			playing = (playing-1 == -1) ? music.length-1 : playing = (playing-1) % music.length;
		var file = music[playing];
		var reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onerror = function(){
			console.log("error");
		};
		reader.onload = function(){
			bar.src = reader.result;
		};
		ID3.loadTags(file.name, function() {
		    var tags = ID3.getAllTags(file.name);
		    var image = tags.picture;
	        var base64String = "";
	        for (var i = 0; i < image.data.length; i++)
	        {
	            base64String += String.fromCharCode(image.data[i]);
	        }
		    albumPic.src = "data:" + image.format + ";base64," + window.btoa(base64String);
		    albumPic.style.display = "initial";
		    resize();
		    stackBlurImage("albumPic", "canvas", 180, false );
		    if(bg)
		    	style.removeChild(bg);
		    bg = document.createTextNode('.bg{background-image:url("'+canvas.toDataURL()+'")}');
		    style.appendChild(bg);

		    //document.body.style.backgroundImage = 'url("' + canvas.toDataURL() + '")';
		    info.innerText = tags.title + " —— " + tags.artist;
		}, 
		{
			tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"],
		    dataReader: FileAPIReader(file)
		});
		isload = false;
	}
	document.body.addEventListener("dragenter",dropFiles);
	document.body.addEventListener("dragover",dropFiles);
	document.body.addEventListener("drop",dropFiles);
	document.body.addEventListener("mousewheel",function(event){
		if(event.wheelDelta > 0)
			bar.volume = bar.volume+0.1 > 1 ? 1 : bar.volume+0.1;
		else
			bar.volume = bar.volume-0.1 < 0 ? 0 : bar.volume-0.1;
	});
	control.addEventListener("click",function(event){
		var e = event.target;
		var localName = e.localName;
		if(localName == "span")
		{
			switch(e.className)
			{
				case "glyphicon glyphicon-play" : bar.play();e.className = "glyphicon glyphicon-pause";
					break;
				case "glyphicon glyphicon-pause" : bar.pause();e.className = "glyphicon glyphicon-play";
					break;
				case "glyphicon glyphicon-backward" : play(STATES.PREV);
					break;
				case "glyphicon glyphicon-forward" : play(STATES.NEXT);
					break;
			}
		}
		
	});
	bar.addEventListener("canplay",function(event){
		var now = bar.currentTime;
		$("#progress").slider({
	      orientation: "horizontal",
	      range: "min",
	      max: parseInt(bar.duration),
	      value: now
	    });
	    isload = true;
	});
	bar.addEventListener("ended",function(event){
			play(STATES.NEXT);
	});
	document.body.addEventListener("mouseup",function(event){
		if(pressProgress && bar.currentTime != 0)
		{
			bar.currentTime = $( "#progress" ).slider("value");
			progressStop = false;
			pressProgress = false;
		}
	});
	progress.addEventListener("mousedown",function(event){
		pressProgress = true;
		progressStop = true;
	});
	function setProgress()
	{
		var whole = parseInt(bar.duration);
		whole = isNaN(whole) ? 0 : whole;
		var now = parseInt(bar.currentTime);
		if(!progressStop)
			$("#progress").slider( "value", now);
		whole = parseInt(whole/60) + ":" + parseInt(whole%60);
		now = parseInt(now/60) + ":" + parseInt(now%60);
		time.innerText = now + " / " + whole;
		setTimeout(arguments.callee,500);
	}
	$("#progress").slider();
	setProgress();
}())