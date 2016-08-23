import $ from "jquery";
import levenshteinDistance from "../lib/levenshteinDistance";
export default async function(app) {
	var menuDisplayId = 0;
	var ControlDisplayId = 0;
	var self = {
		pressBar : function(event){
			app._commonFn.playByNowInOffset(app.progressbar.getPosition()*app.audio.getDuration());
		},
		stopDraggingFlag : function(event){
			app._commonFn.playByNowInOffset(app.progressbar.getPosition()*app.audio.getDuration());
		},
		startload : function(event){
			console.log("加载开始");
			app.progressbar.lock();
			app._commonFn.setCoverPaused();
		},
		canplay : function(event){
			console.log("canplay");
			(app._commonFn.switchPlayIco() === "play") && app._commonFn.switchPlayIco();
			app.progressbar.unlock();
			app._commonFn.setCoverRunning();
		},
		proceess : function(event){
			var time = app.audio.getCurrentime();
			var duration = app.audio.getDuration();
			var dM = parseInt(duration/60);
			var dS = parseInt(duration%60);
			app.timeEl.text(`${time.m}:${time.s}/${dM}:${dS}`);
			app.progressbar.setPosition(time.currentTime/duration);
		},
		playend : function(event){
			app._commonFn.playNext();
			console.log("播放结束");
		},
		playBtn : function(event){
			if( app._commonFn.switchPlayIco() === "pause" )
			{
				app._commonFn.playByIndex();
				console.log("按下播放");
			}
			else
			{
				app._commonFn.pause();
				console.log("按下暂停");
			}
		},
		nextBtn : function(event){
			app._commonFn.playNext();
		},
		prevBtn : function(event){
			app._commonFn.playPrev();
		},
		leftSideSwitch : function(event){
			var leftSide = $("#left-side");
			var pos = event.pageX/app.width;
			var lower = 0.02;
			var max = leftSide.width()/app.width + lower;
			if( pos > max && leftSide.hasClass("open") )
			{
				leftSide.removeClass("open");
			}
			else if( pos < lower && !leftSide.hasClass("open") )
			{
				leftSide.addClass("open");
			}
		},
		displayMenu: function(event){
			var menu = $("#menu");
			var leftSide = $("#left-side");
			clearTimeout(menuDisplayId);
			menuDisplayId = setTimeout(function() {
				menu.addClass("close");
			}, 2000);
			if( !leftSide.hasClass("open") )
			{
				menu.removeClass("close");
			}
		},
		displayControl: function(event){
			var control = $("#control");
			clearTimeout(ControlDisplayId);
			ControlDisplayId = setTimeout(function() {
				control.addClass("close");
			}, 2000);
			control.removeClass("close");
		},
		openLeftSide: function(event){
			var menu = $("#menu");
			var leftSide = $("#left-side");
			leftSide.addClass("open");
			menu.addClass("close");
		},
		closeLeftSide: function(event){
			var leftSide = $("#left-side");
			leftSide.removeClass("open");
		},
		enterSelectedItem : function(event){
			var target = $(event.target);
			var menu = $("#list-menu");

			//hover到了不是当前菜单指向的项，删除选中状态，关闭菜单
			if( menu.data("target") && menu.data("target") !=  target.index())
			{
				$("#list>li").removeClass("selected");
				self.closeListMenu(event);
				menu.data("target", null);
			}
			target.addClass("selected");
		},
		leaveSelectedItem : function(event){
			var menu = $("#list-menu");
			if( !(menu.hasClass("show")) )
			{
				$("#list>li").removeClass("selected");
			}
		},
		openListMenu : function(event){
			event.preventDefault();
			var target = $(event.target);
			var menu = $("#list-menu");
			menu.css({
				"left": event.clientX + "px",
				"top": event.clientY + "px"
			}).addClass("show");
			menu.data("target", target.index());
		},
		showListMenu : function(event){
			event.preventDefault();
			var menu = $("#list-menu");
			menu.addClass("show");
		},
		closeListMenu : function(event){
			var menu = $("#list-menu");
			menu.removeClass("show");
		},
		leaveListMenu : function(event){
			self.closeListMenu(event);
		},
		enterListMenu : function(event){
			self.showListMenu(event);
		},
		openList : function(event){
			var list = $("#file-list");
			if( list.hasClass("open") )
			{
				list.removeClass("open");
			}
			else
			{
				list.addClass("open");
			}
		},
		resize : function(event){
			app.width = $("#content").width();
			app.height = $("#content").height();
		},
		dropFiles : function(event, files){
			app._commonFn.addFile(files);
		},
		openFiles : function(event){
			app._commonFn.addFile($("#fileInput")[0].files);
		},
		clickListItem : function(event){
			var target = $(event.target);
			var id = target.data("item-id");
			app.index = +(target.data("item-index"));
			app._commonFn.playById(id);
		},
		clickListMenuItem : function(event){
			var target = $(event.target);
			var action = target.text();
			var selected = $("#list>.selected");
			console.log(selected, selected.index(), app.index);
			app.index = +(selected.data("item-index"));
			var id = selected.data("item-id");
			switch(action)
			{	
				case "播放" : app._commonFn.playById(id);
					break;
				case "删除" : app._commonFn.removeById(id);
					break;
			}
		},
		search: function search(event){
			var target = $(event.target);
			setTimeout(function() {	
				var input = target.val();
				var list = $("#list li");
				input = input.replace(/^\s+/, "");
				input = input.replace(/\s+$/, "");
				if( input == "" )//还原
				{
					list.removeClass("hide");
				}
				else
				{
<<<<<<< 97d48691f9fbaee4a84888ec67f9c036831600c6:src/js/app/events.js
<<<<<<< ad7e15a4af4c8d69eb174175549e67deada676f4:src/js/app/events.js
=======
					// var sortList = [].map.call(list, (item, index)=>{
					// 	item = $(item);
					// 	var name = item.text();
					// 	var distance = levenshteinDistance(input, name);
					// 	item.data("item-levenshteinDistance", distance);
					// 	console.log("map", input, name, distance);
					// 	return item;
					// }).filter((item)=>{
					// 	return +(item.data("item-levenshteinDistance")) > 0;
					// }).sort((a, b)=>{
					// 	var ad = +($(a).data("item-levenshteinDistance"));
					// 	var bd = +($(b).data("item-levenshteinDistance"));
					// 	console.log("sort: ", ad, bd);
					// 	return ad < bd;
					// });
					// sortList.forEach((item)=>{
					// 	console.log("finish", +(item.data("item-levenshteinDistance")));
					// });
>>>>>>> add feature:lib/js/app/events.js
=======
>>>>>>> update:src/js/app/events.js
					list.removeClass("hide");
					var mapedList = [].map.call(list, (item, index)=>{
						item = $(item);
						var name = item.text();
						var distance = levenshteinDistance(input, name);
						item.data("item-levenshteinDistance", distance);
						console.log("map", input, name, distance);
						return item;
					});
					var hideList =  mapedList.filter((item)=>{
						return !(+(item.data("item-levenshteinDistance")) > 0);
					});
					hideList.forEach((item)=>{
						console.log("finish", +(item.data("item-levenshteinDistance")));
					});
					hideList.forEach((item)=>{
						item.addClass("hide");
					});
					
				}
				console.log(input);

			}, 0);
		}
	};
	return self;
}