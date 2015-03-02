(function(){
	var text = document.getElementById("text"),
		info = document.getElementById("info"),
		albumPic = document.getElementById("albumPic"),
		time = document.getElementById("time"),
		fraction = document.getElementById("fraction"),
		audio = document.getElementById("audio"),
		control = document.getElementById("control"),
		changeStatus = document.getElementById("changeStatus"),
		canvas = document.getElementById("canvas"),
		style = document.createElement("style"),
		head = document.getElementsByTagName("head")[0],
		artist = document.createElement("label"),
		title = document.createElement("label"),
		color = document.getElementById("color"),
		list = document.getElementById("list"),
		about = document.getElementById("about"),
		dragging = false,
		pressProgress = false,
		playing = 0,
		STATES = {
			NEXT:"NEXT",
			PREV:"PREV"
		},
		isload = false,
		bg = null,
		progressbar = new Progressbar("#progress"),
		audioContext = null,
		sourceNode = null,
		analyser = null;

	var loadMusic = function(){
		if(isload)
			return;
		audioContext = new AudioContext();
		sourceNode = audioContext.createMediaElementSource(audio);
		analyser = audioContext.createAnalyser();//创建分析器
		sourceNode.connect(analyser);
		analyser.connect(audioContext.destination);
		isload = true;
		play();
		progressbar.unlock();
		artist.className = "artist";
		title.className = "title";
		text.appendChild(title);
		text.appendChild(document.createElement("br"));
		text.appendChild(artist);
	};
	var dropFiles = null;
	var ctrl = load(function(){
		console.log("load",ctrl);
		if(ctrl.music.getLength() > 0)
		{
			loadMusic();
		}
		else
			document.querySelectorAll(".popBox")[0].open();
		dropFiles = function (event){
			var files = null,
				i = 0,
				len = 0;
			event.preventDefault();
			if(event.type == "drop" && event.dataTransfer.files.length)
			{

				files = event.dataTransfer.files;
				len = files.length;
				var items = [];
				while( len > i )
				{
					if( files[i].type == "audio/mp3" )
					{
						items.push(files[i]);
					}
					i++;
				}
				ctrl.music.addAll(items, function(){
					if( items.length && items.length == ctrl.music.getLength() )
						loadMusic();
					console.log(ctrl.music.getLength());
				});
			}
		};
		document.body.addEventListener("dragenter",dropFiles);
		document.body.addEventListener("dragover",dropFiles);
		document.body.addEventListener("drop",dropFiles);
	});

	progressbar.lock();
	style.type = "text/css";
	head.appendChild(style);
	function choise(state)
	{
		console.log(ctrl);
		var setting = ctrl.setting;
		var music = ctrl.music;
		var file = null;
		var index = setting.getPlaying();
		var playing = setting.getPlaying();
		var length = music.getLength();
		if( state!==STATES.NEXT && state!==STATES.PREV && typeof state == "string")
		{
			var temp = music.getByName(state);
			file = temp.value;
			setting.setPlaying(temp.index);
			return file;
		}
		switch(state)
		{
			case STATES.NEXT : playing = (playing+1) % length;
				break;
			case STATES.PREV : playing = !playing ? length-1 : (playing-1) % length;
				break;
		}
		setting.setPlaying(playing);
		switch(setting.getMode())
		{
			case "random" : 
				var temp = music.getByRandom();
				file = temp.value;
				setting.setPlaying(temp.index);
				break;
			case "repeat" : 
				setting.setPlaying(index);
				file = music.getByIndex(index);
				break;
			case "repeatAll" : 
				file = music.getByIndex(playing);
				break;
		}
		return file;
	}
	var start = Date.now();
	function play(state)
	{
		var file = choise(state);
		playingItemInList();
		console.log(file);
		reader = new FileReader();
		reader.readAsDataURL(file);
		start = Date.now();
		info.innerText = "载入中...";
		title.innerText = "";
		artist.innerText = "";
		reader.onerror = function(){
			console.log("error");
			var index = ctrl.setting.getPlaying();
			ctrl.music.removeByIndex(index, function(){
				isload = true;
				play(STATES.NEXT);
			});
		};
		reader.onload = function(){
			audio.src = reader.result;
		};
		ID3.loadTags(file.name, function(){//读取ID3信息
			var tags = ID3.getAllTags(file.name),
			image = tags.picture,
			base64String = "";
			if(image && image.data)
			{
				for (var i = 0; i < image.data.length; i++)
		        {
		            base64String += String.fromCharCode(image.data[i]);
		        }
			    albumPic.src = "data:" + image.format + ";base64," + window.btoa(base64String);
			}
			else
			{
				image = document.createElement("canvas");
				image.width = 512;
				image.height = 512;
				print(image,10,512);
				albumPic.src = image.toDataURL();
			}
		    albumPic.parentElement.style.display = "initial";
		    stackBlurImage("albumPic", "canvas", 180, false );
		    if(bg)
		    	style.removeChild(bg);
		    bg = document.createTextNode('.bg{background-image:url("'+canvas.toDataURL()+'")}');
		    style.appendChild(bg);
		    info.innerText = "";
		    title.innerText = tags.title;
		    artist.innerText = tags.artist;
		}, 
		{
			tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"],
		    dataReader: FileAPIReader(file)
		});
		isload = false;
	}
	document.body.addEventListener("mousewheel",function(event){
		contextmenuList(null,true);
		menu.style.visibility = "hidden";
		if(event.clientX <= 360 || (event.target.localName == "ul" || event.target.localName == "li"))
			return;
		if(event.wheelDelta > 0)
			audio.volume = audio.volume+0.1 > 1 ? 1 : audio.volume+0.1;
		else
			audio.volume = audio.volume-0.1 < 0 ? 0 : audio.volume-0.1;
	});
	color.addEventListener("change",function(){
		var setting = ctrl.setting;
		var music = ctrl.music;
		setting.setThemeColor(this.value);
	});
	control.addEventListener("click",function(event){//控制按钮
		var e = event.target;
		var localName = e.localName;
		if(localName == "span" && isload)
		{
			switch(e.className)
			{
				case "glyphicon glyphicon-play" : audio.play();e.className = "glyphicon glyphicon-pause";albumPic.classList.remove("paused");albumPic.classList.add("running");
					break;
				case "glyphicon glyphicon-pause" : audio.pause();e.className = "glyphicon glyphicon-play";albumPic.classList.remove("running");albumPic.classList.add("paused");
					break;
				case "glyphicon glyphicon-backward" : play(STATES.PREV);
					break;
				case "glyphicon glyphicon-forward" : play(STATES.NEXT);
					break;
			}
		}
	});
	list.addEventListener("click",function(event){
		var e = event.target;
		var localName = e.localName;
		if(localName == "li" && isload)
		{
			console.log(localName,e.innerText);
			play(e.innerText);
		}
	});
	var songName = "";
	var contextmenuList = function(selected,clean){
		list = document.getElementById("list").childNodes;
		for(var i = 0; i < list.length; i++)
			list[i].classList.remove("contextmenu");
		if(!clean)
			selected.classList.add("contextmenu");
	};
	list.addEventListener("contextmenu", function(event)
	{
		event.preventDefault();
		if(event.target.localName == "li")
		{
			var menu = document.getElementById("menu");
			menu.style.left = event.clientX + "px";			
			if( document.body.offsetHeight - event.clientY > 86)
				menu.style.top = event.clientY + "px";
			else
				menu.style.top = event.clientY - 86 + "px";
			menu.style.visibility = "visible";
			contextmenuList(null,true);
			songName = event.target.innerText;
			contextmenuList(event.target,false);
		}
		
	});
	var menu = document.getElementById("menu");
	menu.firstElementChild.addEventListener("click", function(event)
	{
		console.log(songName,"播放");
		play(songName);
		contextmenuList(null,true);
	});
	menu.firstElementChild.nextElementSibling.addEventListener("click", function(event)
	{
		console.log(songName,"删除");
		ctrl.music.removeByName(songName,function(index, name){
			console.log(index, name, "remove success");
			contextmenuList(null,true);
		});
	});
	document.body.addEventListener("click", function(event)
	{
		var menu = document.getElementById("menu");
		menu.style.visibility = "hidden";
		contextmenuList(null,true);
	});
	audio.addEventListener('play', function(){
		initSpectrum(analyser, ctrl);
        startSpectrum();
    });
    audio.addEventListener('pause', function(){
        stopSpectrum();
    });
    audio.addEventListener('loadedmetadata', function(){
    	stopSpectrum();
    });
	audio.addEventListener("canplay",function(event){//载入完成修改状态
	    isload = true;
	    if( control.children[1].className == "glyphicon glyphicon-play" )
	    {
	    	control.children[1].className = "glyphicon glyphicon-pause";
	    	albumPic.classList.remove("paused");
	    	albumPic.classList.add("running");
	    }
	    console.log(Date.now() - start);
	});
	audio.addEventListener("ended",function(event){//结束后播放下一曲
		play(STATES.NEXT);
	});
	changeMode.addEventListener("click",function(event){//改变播放模式，列表循环、随机播放、单曲循环
			var index = {
				"列表循环" : "repeatAll",
				"随机播放" : "random",
				"单曲循环" : "repeat"
			}
			setMode(index[this.title]);
	});
	about.addEventListener("click",function(event){
		document.querySelectorAll(".popBox")[0].open();
	});
	progressbar.on("pressBar",function(event){//监听进度条的pressProgress事件，单击进度条后更改播放位置
		console.log("pressBar");
		audio.currentTime = progressbar.getPosition() * audio.duration;
		
	});
	progressbar.on("startDraggingFlag",function(event){//监听进度条的startDragging事件，拖动开始，更改拖动状态
		console.log("startDraggingFlag");
		pressProgress = true;
		dragging = true;
	});
	
	progressbar.on("stopDraggingFlag",function(event){//监听进度条的stopDragging事件，拖动结束，更改拖动状态
		console.log("stopDraggingFlag");
		if(pressProgress && audio.currentTime != 0)
		{
			audio.currentTime = progressbar.getPosition() * audio.duration;
			dragging = false;
			pressProgress = false;
		}
	});
	var printSearchBox = new PrintSearchBox();
	printSearchBox.on("mousedown",function(event){
		console.log(event.message.innerText);
		var fileName = event.message.innerText;
		play(fileName);
	});
	printSearchBox.on("pressEnter",function(event){
		console.log(event.message.innerText);
		var fileName = event.message.innerText;
		play(fileName);
	});
	audio.addEventListener("timeupdate",function(e){
		var setting = ctrl.setting;
		var music = ctrl.music;
		var duration = audio.duration;
		var currentTime = audio.currentTime;
		if(!dragging)
			progressbar.setPosition( currentTime/duration );
		duration = parseInt(duration/60) + ":" + parseInt(duration%60);
		currentTime = parseInt(currentTime/60) + ":" + parseInt(currentTime%60);
		time.innerText = currentTime + " / " + duration;
		fraction.innerText = setting.getPlaying()+1 + " / " + music.getLength();
	});
}())