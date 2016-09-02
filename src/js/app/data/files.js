import db from "./db";

export default {
	add : function add(file){
		return new Promise((resolve, reject)=>{
			db.files.get(file.id).then((result)=>{
				reject(new Error("already has"));
				console.log("already has");
			}).catch((err)=>{
				db.files.add(file).then((result)=>{
					resolve(result);
					console.log("add success");
				}).catch((err)=>{
					reject(err);
					console.log("add fail");
				});
			});
		});
	},
	addAll : function addAll(files){
		return Promise.all(files.map((file)=>this.add(file)));
	},
	getById: function getById(id) {
		return db.files.get(id);
	},
	removeById: function removeById(id) {
		return db.files.delete(id);
	},
	update: function update(o) {
		return db.files.put(o);
	},
	getByName : function getByName(name){
		return db.files.getAll().then((result)=>{
			return result.filter((item) => item.name === name)[0];
		});
	},
	getAll : function(){
		return db.files.getAll();
	},
	getLength : function(callback){
		return db.files.getAll().then((result)=>result.length);
	}
};