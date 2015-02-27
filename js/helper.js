(function(){
	var print = function(element,count,size){
		lineNum = 4;
		var getColor = function(){
			return "#"+(~~(Math.random()*(1<<24))).toString(16);
		};
		var canvas = element;
		var context = canvas.getContext("2d");
		var drawPath = function(x, y, r)
		{
			var i,ang;
			ang = Math.PI*2/lineNum 
			context.save();
			context.fillStyle = getColor();
			context.translate(x, y);
			context.moveTo(0, -r);
			context.beginPath();
			for(i = 0;i < lineNum; i ++)
			{
				context.rotate(ang)
				context.lineTo(0, -r);
			}
			context.closePath();
			context.fill();
			context.restore();
		}
		var step = size/count;
		for(var i = 0;i<count+1; i++)
		{
			for(var j = 0; j<count+1; j++)
			{
				drawPath( i*step, j*step, step);
			}
		}
	};
	var hexToRGBA = function(color,A){
		var cutHex = function(){
			return (color.charAt(0)=="#") ? color.substring(1,7):color;
		};
		var R = parseInt((cutHex()).substring(0,2),16);
		var G = parseInt((cutHex()).substring(2,4),16);
		var B = parseInt((cutHex()).substring(4,6),16);
		return "rgba("+R+","+G+","+B+","+A+")";
	};
	var contextmenuStyle = null;
	var head = document.getElementsByTagName("head")[0];
	var style = document.createElement("style");
	style.type = "text/css";
	head.appendChild(style);
	var printThemeColor = function(setting){
		var inside = document.getElementsByClassName("inside")[0];
		var flag = document.getElementsByClassName("flag")[0];
		var left = document.getElementById("left");
		var color = document.getElementById("color");
		var bottomBar = document.getElementById("bottomBar");
		var searchMain = document.getElementById("searchMain");
		var suggest = document.getElementById("suggest");
		if(contextmenuStyle)
	    	style.removeChild(contextmenuStyle);
	    contextmenuStyle = document.createTextNode('#menu li:hover{background-color: '+setting.themeColor+';cursor: pointer;}.contextmenu{background-color: '+setting.themeColor+';}');
	    style.appendChild(contextmenuStyle);

		inside.style.backgroundColor = setting.themeColor;
		flag.style.backgroundColor = setting.themeColor;
		searchMain.style.backgroundColor = setting.themeColor;
		suggest.style.backgroundColor = hexToRGBA(setting.themeColor,0.3);
		left.style.backgroundColor = hexToRGBA(setting.themeColor,0.3);
		bottomBar.style.backgroundColor = hexToRGBA(setting.themeColor,0.4);
		color.value = setting.themeColor;
	};
	var getPlaying = null;
	var playingItemInList = function(){
		list = document.getElementById("list").childNodes;
		for(var i = 0; i < list.length; i++)
			list[i].className = "";
		console.log(getPlaying());
		if( list.length >0 )
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
						console.log("初始化设置",result);
						done();
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
				music.add = function(file, callback){
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
							console.log("already has");
					});
				};
				music.addAll = function(files, callback){
					var count = files.length;
					var done = function(){
						if(--count == 0)
							callback();
					};
					files.forEach(function(item, index){
						db.files.get(item.name, function(err, result){
							if(err)
							{
								db.files.add(item, function(err, result){
									music.files.push(item);
									music.filesIndex[item.name] = music.files.length-1;
									printList(music.files);
									done();
									console.log("add success",music.files.length);
								});
							}
							else
								console.log("already has")
						});
					});
				};
				music.removeByIndex = function(index, callback){
					db.files.delete(music.files[index].name, function(err, result){
						if(!err)
						{
							var name = music.files[index].name;
							delete music.filesIndex[ name ];
							music.files.splice(index, 1);
							printList(music.files);
							callback(index,name);
							console.log("remove success");
						}
							
					});
				};
				music.removeByName = function(name, callback){
					db.files.delete(name, function(err, result){
						if(!err)
						{
							var playing = music.files[_setting.playing].name;

							var index = music.filesIndex[name];
							music.files.splice(index, 1);//从数组中删除
							music.filesIndex = {};//从建索引
							for(var i = 0;i<music.files.length;i++)
							{
								music.filesIndex[ music.files[i].name ] = i;
								if(playing == music.files[i].name)
									setting.setPlaying(i);
							}
							printList(music.files);//重绘播放列表
							callback(index, name);
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
	window.print = print;
}())