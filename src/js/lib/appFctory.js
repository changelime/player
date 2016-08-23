class App {
	constructor() {
		this._promise = new Promise((resolve)=>{
			resolve();
		});
	}
	setPropertys(callback){
		var ps = callback();
		for( let p in ps )
		{
			this[p] = ps[p];
		}
	}
	add(name, property){
		this._promise = this._promise.then(()=>{
			return property(this).then((resultAsync)=>{
				console.log(resultAsync);
				this[name] = resultAsync;
			});
		});
		return this;
	}
	init(callback){
		this._promise.then(()=>{
			callback(this);
		});
	}
}
export default function() {
	return new App();
}
