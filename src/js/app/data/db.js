import $ from "jquery";
import Indexing from "../../lib/indexing";
export default async function(app){
	var db = new Indexing("player", ["files", "setting"]);
	await db.open();
	console.log(db);
	return db;
}; 