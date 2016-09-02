import $ from "jquery";
import Progressbar from "./lib/progressbar";
import appFctory from "./lib/appFctory";
import db from "./app/data/db";
import common from "./app/common";
import events from "./app/events";
import addEvents from "./app/addEvents";
import initFn from "./app/init";

var app = appFctory();
app.setPropertys(() => {
	return {
		width : $("#content").width(),
		height : $("#content").height(),
		progressbar : new Progressbar("#prograss"),
		timeEl : $("#status-info label").eq(0),
		counterEl : $("#status-info label").eq(1),
		cover : $("#cover"),
		bg : $("#bg")[0],
		songName : $("#song-name"),
		songArtist : $("#song-artist"),
		index : 0,
		fileCount : 0
	};
});
db.open().then(()=>{
	app.add("_commonFn", common).
		add("_events", events).
		add("_addEvents", addEvents).
		init(initFn);
});
