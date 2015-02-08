(function(){
	var music = [],
		text = document.getElementById("text"),
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
		progressbar = new Progressbar("#progress"),
		audioContext = null,
		sourceNode = null,
		analyser = null,
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
					audioContext = new AudioContext();
					sourceNode = audioContext.createMediaElementSource(audio);
					analyser = audioContext.createAnalyser();//创建分析器
					sourceNode.connect(analyser);
					analyser.connect(audioContext.destination);
					isload = true;
					play();
					document.body.removeEventListener("dragenter",dropFiles,false);
					document.body.removeEventListener("dragover",dropFiles,false);
					document.body.removeEventListener("drop",dropFiles,false);
					dropFiles = null;
					progressbar.unlock();
					artist.className = "artist";
					title.className = "title";
					text.appendChild(title);
					text.appendChild(document.createElement("br"));
					text.appendChild(artist);
				}
			}
		};
	var spectrum = document.getElementById('spectrum');
    var cwidth = spectrum.offsetWidth;
    var cheight = spectrum.offsetHeight - 2;
    var meterWidth = 5; //频谱条宽度
    var gap = 2; //频谱条间距
    var capHeight = 2;
    var capStyle = "#56FFF6";
    var meterNum = cwidth/(meterWidth + gap); //频谱条数量
    var capYPositionArray = []; //将上一画面各帽头的位置保存到这个数组
    var ctx = spectrum.getContext('2d');
    var id = 0;
	var fillStyle = "#41A868"
	var drawMeter = function() {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var step = Math.round(array.length / (meterNum+(meterNum/6))); //计算采样步长
        ctx.clearRect(0, 0, cwidth, cheight);
        for (var i = 0; i < meterNum; i++) {
            var value = array[i * step]; //获取当前能量值
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value); //初始化保存帽头位置的数组，将第一个画面的数据压入其中
            };
            ctx.fillStyle = capStyle;
            //开始绘制帽头
            if (value < capYPositionArray[i]) { //如果当前值小于之前值
                ctx.fillRect(i * (meterWidth + gap), cheight - (--capYPositionArray[i]), meterWidth, capHeight); //则使用前一次保存的值来绘制帽头
            } else {
                ctx.fillRect(i * (meterWidth + gap), cheight - value, meterWidth, capHeight); //否则使用当前值直接绘制
                capYPositionArray[i] = value;
            };
            //开始绘制频谱条
            ctx.fillStyle = fillStyle;
            ctx.fillRect(i * (meterWidth + gap), cheight - value + capHeight, meterWidth, cheight);
        }
        id = requestAnimationFrame(drawMeter);
        console.log(id);
    };
    var resize = function(){
    	var width = document.createAttribute("width");
		width.value = document.body.offsetWidth + "px";

		spectrum.attributes.setNamedItem(width);
    	cwidth = spectrum.offsetWidth;
    	meterNum = cwidth/(meterWidth + gap);
    	console.log(spectrum.width,document.body.offsetWidth);
    };
    resize();
	progressbar.lock();
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
			audio.src = reader.result;
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
	window.addEventListener("resize",resize);
	document.body.addEventListener("dragenter",dropFiles);
	document.body.addEventListener("dragover",dropFiles);
	document.body.addEventListener("drop",dropFiles);
	document.body.addEventListener("mousewheel",function(event){
		if(event.wheelDelta > 0)
			audio.volume = audio.volume+0.1 > 1 ? 1 : audio.volume+0.1;
		else
			audio.volume = audio.volume-0.1 < 0 ? 0 : audio.volume-0.1;
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
	audio.addEventListener('play', function(){
        id = requestAnimationFrame(drawMeter);
    });
    audio.addEventListener('pause', function(){
        cancelAnimationFrame(id);
    });
    audio.addEventListener('loadedmetadata', function(){
    	cancelAnimationFrame(id);
    });
	audio.addEventListener("canplay",function(event){//载入完成修改状态
	    isload = true;
	});
	audio.addEventListener("ended",function(event){//结束后播放下一曲
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
	progressbar.on("pressBar",function(event){//监听进度条的pressProgress事件，单击进度条后更改播放位置
		console.log("pressBar");
		audio.currentTime = progressbar.getPosition() * audio.duration;
		
	});
	/*progressbar.on("draggingFlag",function(event){
		console.log("draggingFlag");
	});*/
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
	audio.addEventListener("timeupdate",function(e){
		var duration = audio.duration;
		var currentTime = audio.currentTime;
		if(!dragging)
			progressbar.setPosition( currentTime/duration );
		duration = parseInt(duration/60) + ":" + parseInt(duration%60);
		currentTime = parseInt(currentTime/60) + ":" + parseInt(currentTime%60);
		time.innerText = currentTime + " / " + duration;
	});
}())