import $ from "jquery";
export default function(app) {
	console.log(app);
	app._addEvents();
	app._commonFn.loadFileList().
		then(app._commonFn.updateCounter).
		then(app.progressbar.lock.call(app.progressbar)).
		catch((err)=>{
			console.log(err);
		});
};