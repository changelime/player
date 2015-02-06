(function(){
	var music = [],
		text = document.getElementById("text"),
		info = document.getElementById("info"),
		albumPic = document.getElementById("albumPic"),
		time = document.getElementById("time"),
		fraction = document.getElementById("fraction"),
		bar = document.getElementById("bar"),
		control = document.getElementById("control"),
		changeStatus = document.getElementById("changeStatus"),
		canvas = document.getElementById("canvas"),
		style = document.createElement("style"),
		head = document.getElementsByTagName("head")[0],
		artist = document.createElement("label"),
		title = document.createElement("label"),
		dragging = false,
		pressProgress = false,
		playing = 0,
		STATES = {
			NEXT:"NEXT",
			PREV:"PREV"
		},
		mode = {
			random : false,
			repeat : false,
			repeatAll : true,
		},
		isload = false,
		bg = null,
		target = new Progressbar("#progress"),
		dropFiles = function (event)
		{
			var files = null,
				i = 0,
				len = 0;

			event.preventDefault();
			if(event.type == "drop" && event.dataTransfer.files.length)
			{

				files = event.dataTransfer.files;
				len = files.length;
				while( len > i )
				{
					if( files[i].type == "audio/mp3" )
						music.push(files[i]);
					i++;
				}
				if (music.length)
				{
					isload = true;
					play();
					document.body.removeEventListener("dragenter",dropFiles,false);
					document.body.removeEventListener("dragover",dropFiles,false);
					document.body.removeEventListener("drop",dropFiles,false);
					dropFiles = null;
					target.canDrag();
					artist.className = "artist";
					title.className = "title";
					text.appendChild(title);
					text.appendChild(document.createElement("br"));
					text.appendChild(artist);
				}
			}
		};
	style.type = "text/css";
	head.appendChild(style);
	function choise(state)
	{
		var file = null;
		var index = playing;
		switch(state)
		{
			case STATES.NEXT : playing = (playing+1) % music.length;
				break;
			case STATES.PREV : playing = !playing ? music.length-1 : (playing-1) % music.length;
				break;
		}
		if(mode.random)
		{
			var pickOne = music.pickOne();//随机选取数组中的一个元素
			file = pickOne.value;
			playing = pickOne.index;
		}
		else if(mode.repeat)
		{
			playing = index;
			file = music[playing];
		}
		else if(mode.repeatAll)
		{
			file = music[playing];
		}
		return file;
	}
	function play(state)
	{
		var file = choise(state);
		reader = new FileReader();
		reader.readAsDataURL(file);
		info.innerText = "载入中...";
		title.innerText = "";
		artist.innerText = "";

		reader.onerror = function(){
			console.log("error");
		};
		reader.onload = function(){
			bar.src = reader.result;
		};
		ID3.loadTags(file.name, function() {//读取ID3信息
			var tags = ID3.getAllTags(file.name),
			image = tags.picture,
			base64String = "";
			for (var i = 0; i < image.data.length; i++)
	        {
	            base64String += String.fromCharCode(image.data[i]);
	        }
		    albumPic.src = "data:" + image.format + ";base64," + window.btoa(base64String);
		    albumPic.parentElement.style.display = "initial";
		    stackBlurImage("albumPic", "canvas", 180, false );
		    if(bg)
		    	style.removeChild(bg);
		    bg = document.createTextNode('.bg{background-image:url("'+canvas.toDataURL()+'")}');
		    style.appendChild(bg);
		    info.innerText = "";
		    title.innerText = tags.title;
		    artist.innerText = tags.artist;
		    fraction.innerText = (playing+1) + " / " + music.length;
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
	control.addEventListener("click",function(event){//控制按钮
		var e = event.target;
		var localName = e.localName;
		if(localName == "span" && isload)
		{
			switch(e.className)
			{
				case "glyphicon glyphicon-play" : bar.play();e.className = "glyphicon glyphicon-pause";albumPic.classList.remove("paused");albumPic.classList.add("running");
					break;
				case "glyphicon glyphicon-pause" : bar.pause();e.className = "glyphicon glyphicon-play";albumPic.classList.remove("running");albumPic.classList.add("paused");
					break;
				case "glyphicon glyphicon-backward" : play(STATES.PREV);
					break;
				case "glyphicon glyphicon-forward" : play(STATES.NEXT);
					break;
			}
		}
		
	});
	bar.addEventListener("canplay",function(event){//载入完成修改状态
	    isload = true;
	});
	bar.addEventListener("ended",function(event){//结束后播放下一曲
		play(STATES.NEXT);
	});
	changeMode.addEventListener("click",function(event){//改变播放模式，列表循环、随机播放、单曲循环
			if(mode.repeatAll)
			{
				mode.repeatAll = false;
				mode.random = true;
				mode.repeat = false;
				changeMode.title = "随机播放";
				changeMode.className = "glyphicon glyphicon-random";
			}
			else if(mode.random)
			{
				mode.repeatAll = false;
				mode.random = false;
				mode.repeat = true;
				changeMode.title = "单曲循环";
				changeMode.className = "glyphicon glyphicon-record";
			}
			else if(mode.repeat)
			{
				mode.repeatAll = true;
				mode.random = false;
				mode.repeat = false;
				changeMode.title = "列表循环";
				changeMode.className = "glyphicon glyphicon-retweet";
			}
	});
	target.on("pressProgress",function(event){//监听进度条的pressProgress事件，单击进度条后更改播放位置
		console.log("pressProgress");
		bar.currentTime = target.getPastTime();
		
	});
	/*target.on("draggingFlag",function(event){
		console.log("draggingFlag");
	});*/
	target.on("startDragging",function(event){//监听进度条的startDragging事件，拖动开始，更改拖动状态
		console.log("startDragging");
		pressProgress = true;
		dragging = true;
	});
	
	target.on("stopDragging",function(event){//监听进度条的stopDragging事件，拖动结束，更改拖动状态
		console.log("stopDragging");
		if(pressProgress && bar.currentTime != 0)
		{
			bar.currentTime = target.getPastTime();
			dragging = false;
			pressProgress = false;
		}
	});
	function setProgress()//循环获取播放时间并设置进度条位置
	{
		var whole = parseInt(bar.duration);
		whole = isNaN(whole) ? 0 : whole;
		var now = parseInt(bar.currentTime);
		if(!dragging)
			target.fire({time:whole, pastTime:now});
		whole = parseInt(whole/60) + ":" + parseInt(whole%60);
		now = parseInt(now/60) + ":" + parseInt(now%60);
		time.innerText = now + " / " + whole;
		setTimeout(arguments.callee,500);
	}
	setProgress();
}())