import $ from "jquery";
import dropFiles from "../lib/dropFiles";
export default async function(app) {
	return function() {
		var events = app._events;
		//尺寸改变
		$(window).on("resize", null, events.resize);
		//菜单按钮
		$(window).on("mousemove", null, events.displayMenu);
		//控制按钮
		// $("#cover").on("mousemove", null, events.displayControl);
		//打开右边栏
		$("#menu").on("click", null, events.openLeftSide);
		//关闭右边栏
		$("#center").on("click", null, events.closeLeftSide);
		//搜索
		$("#searchInput").on("keydown keyup change blur focus", null, events.search);
		//点击按钮
		$("#playBtn").on("click", null, events.playBtn);
		$("#prevBtn").on("click", null, events.prevBtn);
		$("#nextBtn").on("click", null, events.nextBtn);
		//添加、拖放文件
		dropFiles("#file-wrap", events.dropFiles);
		$("#fileInput").on("change", null, events.openFiles);
		//播放列表开关
		$("#file-list>header").on("click", null, events.openList);
		//播放列表项
		$("#list").on("click", "li", events.clickListItem);
		$("#list").on("contextmenu", "li", events.openListMenu);
		$("#list").on("mouseenter", "li", events.enterSelectedItem);
		$("#list").on("mouseleave", "li", events.leaveSelectedItem);
		//播放列表右键菜单
		$("#list-menu").on("mouseenter", null, events.enterListMenu);
		$("#list-menu").on("mouseleave", null, events.leaveListMenu);
		$("#list-menu").on("click", "li", events.clickListMenuItem);
		//播放事件
		app.audio.on("startload", events.startload);
		app.audio.on("canplay", events.canplay);
		app.audio.on("proceess", events.proceess);
		app.audio.on("playend", events.playend);
		//进度条
		app.progressbar.on("pressBar", events.pressBar);
		app.progressbar.on("stopDraggingFlag", events.stopDraggingFlag);
	};
}