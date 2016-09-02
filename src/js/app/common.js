import $ from "jquery";
import ID3 from "../lib/id3";
import stackBlur from "../lib/StackBlur";
import randomImg from "../lib/randomImg";
import audio from "../lib/audio";
import fileDao from "../app/data/files";


export default async function(app) {
	var switchPlayIco = function switchPlayIco(){
		var e = null;
		if( $(".fa-pause").length !== 0 )
		{
			e = $(".fa-pause");
			e.removeClass("fa-pause");
			e.addClass("fa-play");
			return "play";
		}
		else
		{
			e = $(".fa-play");
			e.removeClass("fa-play");
			e.addClass("fa-pause");
			return "pause";
		}
	};
	var play = function play(file, id){
		audio.readAndPlay(file, id);
		updateCounter();
		loadTag(file, (img, title, artisr)=>{
			setCoverImg(img);
			stackBlur(img, app.bg, 180);
			app.songName.text(title);
			app.songArtist.text(artisr);
		});
	};
	var playNext = function playNext(){
		do
		{
			app.index = (app.index+1) % app.fileCount;
		}
		while( $(`[data-item-index=${app.index}]`).hasClass("hide") )
		
		playByIndex();
		console.log("下一曲");
	};
	var playPrev = function playPrev(){
		do
		{
			app.index = (app.index-1) < 0 ? (app.fileCount-1) : (app.index-1);
		}
		while( $(`[data-item-index=${app.index}]`).hasClass("hide") )
		playByIndex();
		console.log("上一曲");
	};
	var playById = function playById(id){
		return fileDao.getById(id).then((item)=>{
			play(item.file, id);
			$(".playing").removeClass("playing");
			$(`[data-item-id=${id}]`).addClass("playing");
		});
	};
	// var playByName = function playByName(name){
	// 	return fileDao.getByName(name).then((item)=>{
	// 		var file = item.file;
	// 		audio.readAndPlay(file);
	// 		updateCounter();
	// 		loadTag(file, (img, title, artisr)=>{
	// 			setCoverImg(img);
	// 			stackBlur(img, app.bg, 180);
	// 			app.songName.text(title);
	// 			app.songArtist.text(artisr);
	// 		});
	// 	});
	// };
	var updateCounter = function updateCounter(){
		if( app.fileCount > 0 )
		{
			app.counterEl.text(`${app.index + 1} / ${app.fileCount}`);
		}
	};
	var setCoverImg = function setCoverImg(img){
		app.cover.css("background-image", `url("${img}")`);
	};
	var setCoverRunning  = function setCoverRunning(){
		app.cover.addClass("running");
		app.cover.removeClass("paused");
	};
	var setCoverPaused = function setCoverPaused(){
		app.cover.addClass("paused");
		app.cover.removeClass("running");
	};
	var getListItemNameByIndex = function getListItemNameByIndex(index){
		return $("#list li").eq(index).text();
	};
	var getListItemIdByIndex = function getListItemNameByIndex(index){
		// return $("#list li").eq(index).text();
		var item = $(`[data-item-index=${index}]`);
		return item.data("item-id");
	};
	var playByNowInOffset = function playByNowInOffset(offset){
		console.log(offset);
		audio.play(offset);
	};
	var playByIndex = function playByIndex(){
		var id = getListItemIdByIndex(app.index);
		if( audio.getSoundId() != id )//buffer里不是当前需要播放的音频
		{
			playById(id);
		}
		else
		{
			audio.play();
		}
		setCoverRunning();
		console.log(app.index, id);
	};
	var pause = function pause() {
		audio.pause();
		setCoverPaused();
	};
	var removeByName = function removeByName(name){
		console.log(name);
	};
	var removeById = function removeById(id){
		console.log(id);
		var playingId = audio.getSoundId();
		if( id == playingId )
		{
			alert("不能删除当前播放项");
			return;
		}
		return fileDao.removeById(id).then(()=>{
			return fileDao.getAll().then((files)=>{
				return Promise.all(files.map((file, index)=>{
					file.index = index;
					if( file.id == playingId )
					{
						app.index = index;
					}
					return fileDao.update(file);
				}));
			});
		}).then(loadFileList);
	};
	var addFile = function addFile(files){
		files = [...files];
		return fileDao.getLength().then((len)=>{
			fileDao.addAll(files.filter((file)=>file.type === "audio/mp3").map((file, index)=>{
				return {
					name: file.name,
					file: file,
					index: len + index
				};
			})).then(loadFileList);
		});
		 
	};
	var cleanFileList = function cleanFileList(){
		$("#list").html("");
	};
	var loadFileList = function loadFileList(){
		var playingId = audio.getSoundId();
		return fileDao.getAll().then((files)=>{
			if( files.length > 0 )
			{
				var list = $("#list");
				cleanFileList();
				files = files.sort((a, b)=>a.index > b.index);
				for( let file of files )
				{
					var playing = `""`;
					if( file.id == playingId )
					{
						playing = `"playing"`;
					}
					list.append(`<li data-item-index=${file.index} class=${playing} data-item-id=${file.id}>${file.name}</li>`);
				}
				app.fileCount = files.length;
				updateCounter();
				console.log("载入成功", app);
			}
			else
			{
				$("#menu").click();
				console.log("未添加歌曲");
			}
		});
	};
	var loadTag = function loadTag(file, callback){
		ID3.loadTags(file.name, function(){//读取ID3信息
			var tags = ID3.getAllTags(file.name);
			var image = tags.picture;
			var base64String = "";
			var imgUrl = "";
			if(image && image.data)
			{
				for (var i = 0; i < image.data.length; i++)
				{
					base64String += String.fromCharCode(image.data[i]);
				}

				imgUrl = "data:" + image.format + ";base64," + window.btoa(base64String);
			}
			else
			{
				var canvas = document.createElement("canvas");
				canvas.width = 512;
				canvas.height = 512;
				canvas = randomImg(canvas, 10, `${tags.title}${tags.artist}`);
				imgUrl = canvas.toDataURL();
			}
			callback(imgUrl, tags.title, tags.artist);
		},
		{
			tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"],
			dataReader: ID3.FileAPIReader(file)
		});
	};
	return {
		switchPlayIco: switchPlayIco,
		playNext: playNext,
		playPrev: playPrev,
		// playByName: playByName,
		playById: playById,
		pause: pause,
		updateCounter: updateCounter,
		setCoverImg: setCoverImg,
		setCoverRunning: setCoverRunning,
		setCoverPaused: setCoverPaused,
		getListItemNameByIndex: getListItemNameByIndex,
		playByNowInOffset: playByNowInOffset,
		playByIndex: playByIndex,
		removeByName: removeByName,
		removeById: removeById,
		addFile: addFile,
		cleanFileList: cleanFileList,
		loadFileList: loadFileList,
		loadTag: loadTag
	};
}
