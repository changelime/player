(function(){
	var printThemeColor = function(setting){
		var inside = document.getElementsByClassName("inside")[0];
		var flag = document.getElementsByClassName("flag")[0];
		var left = document.getElementById("left");
		var color = document.getElementById("color");
		inside.style.backgroundColor = setting.themeColor;
		flag.style.backgroundColor = setting.themeColor;
		left.style.backgroundColor = setting.themeColor;
		color.value = setting.themeColor;
	};
	var getPlaying = null;
	var playingItemInList = function(){
		list = document.getElementById("list").childNodes;
		for(var i = 0; i < list.length; i++)
			list[i].className = "";
		console.log(getPlaying());
		list[getPlaying()].className = "playing";
	};
	var printList = function(list){
		listDom = document.getElementById("list");
		listDom.innerHTML = "";
		for(var i = 0; i<list.length; i++)
		{
			var li = document.createElement("li");
			li.innerText = list[i].name;
			listDom.appendChild(li);
		}
		playingItemInList();
	};
	var addListeners = function(elements, callback){
		for(var i = 0; i<elements.length; i++)
		{
			elements[i].addEventListener("click",callback);
		}
	};
	var saveMode = null;
	var setMode = function(mode,load){
		var changeMode = document.getElementById("changeMode");
		if(load)
		{
			switch( mode )
			{
				case "repeatAll" : 
					changeMode.title = "列表循环";
					changeMode.className = "glyphicon glyphicon-retweet";
					break;
				case "random" : 
					changeMode.title = "随机播放";
					changeMode.className = "glyphicon glyphicon-random";
					break;
				case "repeat" : 
					changeMode.title = "单曲循环";
					changeMode.className = "glyphicon glyphicon-record";
					break;
			}
			return;
		}
		switch( mode )
		{
			case "repeatAll" : 
				saveMode("random");
				changeMode.title = "随机播放";
				changeMode.className = "glyphicon glyphicon-random";
				break;
			case "random" : 
				saveMode("repeat");
				changeMode.title = "单曲循环";
				changeMode.className = "glyphicon glyphicon-record";
				break;
			case "repeat" : 
				saveMode("repeatAll");
				changeMode.title = "列表循环";
				changeMode.className = "glyphicon glyphicon-retweet";
				break;
		}
	};
	
	var load = function(callback){
		var music = {};
		var setting = {};
		var _setting = {
			name : "default",
			themeColor : "#41A868",
			mode : "repeatAll",
			spectrum : true,
			playing : 0
		};
		var db = new Indexing({
			dbName : "player",
			version : 1,
			space : ["files","setting"],
			authority : "readwrite"
		},function(db){
			db.createObjectStore("files", { keyPath : "name" });
			db.createObjectStore("setting", { keyPath : "name" });
		},function(){
			setting.getThemeColor = function(callback){
				return _setting.themeColor;
			};
			setting.setThemeColor = function(color){
				_setting.themeColor = color;
				db.setting.put(_setting, function(err, result){
					if(!err)
					{
						printThemeColor(_setting);
						console.log("setThemeColor success", result);
					}
				});
			};
			setting.getMode = function(){
				return _setting.mode;
			};
			setting.setMode = function(mode, callback){
				_setting.mode = mode;
				db.setting.put(_setting, function(err, result){
					if(!err)
					{
						console.log("setMode success", result);
					}
				});
			};
			setting.getSpectrum = function(){
				return _setting.spectrum;
			};
			setting.setSpectrum = function(){
				_setting.spectrum = !_setting.spectrum;
				db.setting.put(_setting, function(err, result){
					if(!err)
					{
						console.log("setSpectrum success", result);
					}
				});
			};
			setting.getPlaying = function(){
				return _setting.playing;
			};
			setting.setPlaying = function(playing){
				_setting.playing = playing;
				db.setting.put(_setting, function(err, result){
					if(!err)
					{
						console.log("setPlaying success", result);
					}
				});
			};
			saveMode = setting.setMode;
			getPlaying = setting.getPlaying;
			var doneCount = 2;
			var done = function(){
				if(--doneCount == 0)
					callback();
			};
			db.setting.get("default",function(err, result){
				if(err)
				{
					db.setting.add(_setting,function(err, result){
						printThemeColor(_setting);
						done();
						console.log("初始化设置",result);
					});
				}
				else
				{
					_setting.themeColor = result.themeColor;
					_setting.mode = result.mode;
					_setting.spectrum = result.spectrum;
					_setting.playing = result.playing;
					printThemeColor(_setting);
					setMode(_setting.mode,true);
					done();
				}
			});
			db.files.getAll(function(result){
				music.files = result;
				music.filesIndex = {};
				for(var i = 0;i<music.files.length;i++)
				{
					music.filesIndex[ music.files[i].name ] = i;
				}
				music.getByIndex = function(index){
					return music.files[index];
				};
				music.getByName = function(name){
					// return music.files[ music.filesIndex[name] ];
					return {
						value : music.files[ music.filesIndex[name] ],
						index : music.filesIndex[name]
					}
				};
				music.getByRandom = function(){
					var random = Math.round(((Math.random()*music.files.length)+Date.now()))%music.files.length;
					return {
						value : music.files[random],
						index : random
					};
				};
				music.getLength = function(){
					return music.files.length;
				};
				music.add = function(file,callback){
					db.files.get(file.name, function(err, result){
						if(err)
						{
							db.files.add(file, function(err, result){
								music.files.push(file);
								music.filesIndex[file.name] = music.files.length-1;
								printList(music.files);
								callback();
								console.log("add success",music.files.length);
							});
						}
						else
							console.log("already has")
					});
				};
				music.removeByIndex = function(index){
					db.files.delete(music.files[index].name, function(err, result){
						if(!err)
						{
							delete music.filesIndex[ music.files[index].name ];
							music.files.splice(index, 1);
							printList(music.files);
							console.log("remove success");
						}
							
					});
				};
				music.removeByName = function(name){
					db.files.delete(name, function(err, result){
						if(!err)
						{
							music.files.splice(music.filesIndex[name], 1);
							delete music.filesIndex[name];
							printList(music.files);
							console.log("remove success");
						}
							
					});
				};
				printList(music.files);
				done();
			});
		});
		return {
			music : music,
			setting : setting
		};
	};
	window.load = load;
	window.setMode = setMode;
	window.playingItemInList = playingItemInList;
	window.addListeners = addListeners;
}())