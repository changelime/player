/**
 * Indexing类，封装indexedDB.
 */
class Indexing {

	/**
	 * 创建数据库对象
	 * @param {string} dbName - 数据库名.
	 * @param {Object[] | string[]} ObjectStores - 储存仓库.
	 * @param {string} [ObjectStores[].key=id] - 储存仓库索引.
	 * @param {string} ObjectStores[].name - 储存仓库名.
	 */
	 constructor(dbName, ObjectStores) {
		this._db = null;
		this._connect = null;
		this._ObjectStores = ObjectStores;
		this._set = {
			dbName : dbName,
			version : 1,
			space : ObjectStores.map((ObjectStore)=>(ObjectStore instanceof Object) ? ObjectStore.name : ObjectStore),
			authority : "readwrite",
		};
		this._store = {};
		this._space = this._set.space;
	}

	/**
	 * 打开数据库连接
	 * @return {Promise} 数据库连接promise对象
	 */
	open(){
		return this._connectDB();
	}

	/**
	 * 建立数据库
	 * @param {IDBDatabase} - IDBDatabase对象
	 */
	_upgradeneeded(db) {
		for( let [index, ObjectStore] of this._ObjectStores.entries() )
		{
			let isObject = (ObjectStore instanceof Object);
			db.createObjectStore( isObject ? ObjectStore.name : ObjectStore, { keyPath :  isObject ? ObjectStore.key : "id" });
		}
	}

	/**
	 * 连接数据库，创建储存仓库操作对象
	 * @param {Promise} - Promise
	 */
	_connectDB(){
		return new Promise((resolve, reject)=>{
			var set = this._set;
			var self = this;
			this._connect = indexedDB.open(set.dbName,set.version);
			this._connect.onsuccess = function(event){
				self._db = event.target.result;
				for(let [index, spaceName] of self._space.entries())
				{
					self[spaceName] = {
						get : function(str){
							return new Promise((resolve, reject)=>{
								self._getStore(spaceName);
								var request = self._store[spaceName].get(str);
								request.onsuccess = function(event){
									var result = event.target.result;
									if(result)
									{
										resolve(result);
									}
									else
									{
										reject(new Error("not found"));
									}
								};
							});
						},
						add : function(o){
							return new Promise((resolve, reject)=>{
								self._getStore(spaceName);
								o = Object.assign({
									id: self._genId()
								}, o);
								var request = self._store[spaceName].add(o);
								request.onsuccess = function(event){
									resolve(event);
								};
								request.onerror = function(event){
									reject(new Error(event));
								};
							});
						},
						delete : function(str){
							self._getStore(spaceName);
							return this.get(str).then((result)=>{
								return new Promise((resolve, reject)=>{
									var request = self._store[spaceName].delete(str);
									request.onsuccess = function(event){
										resolve(result);
									};
								});
							});	
						},
						put : function(o){
							return new Promise((resolve, reject)=>{
								self._getStore(spaceName);
								var request = self._store[spaceName].put(o);
								request.onsuccess = function(event){
									resolve(event);
								};
								request.onerror = function(event){
									reject(new Error(event));
								};
							});
						},
						getAll : function(){
							return new Promise((resolve, reject)=>{
								self._getStore(spaceName);
								var all = [];
								var request = self._store[spaceName].openCursor();
								request.onsuccess = function(event){
									var cursor = event.target.result;
									if(cursor)
									{
										all.push(cursor.value);
										cursor.continue();
									}
									else
									{
										resolve(all);
									}
								};
								request.onerror = function(event){
									reject(new Error(event));
								};
							});
						}
					};
				}
				resolve();
				console.log("connect");
			};
			this._connect.onupgradeneeded = function(event){
				if( !self._upgradeneeded )
				{
					reject(new Error("upgradeneeded undefined"));
				}
				self._db = event.target.result;
				self._upgradeneeded(self._db);
				console.log("onupgradeneeded");
			};
			this._connect.onerror=function(err){
                reject(err);
            };
		});
	}

	/**
	 * 生成id
	 * @return {string} - id
	 */
	_genId(){
		var base64 = btoa(`${Math.random()}${(new Date()).toGMTString()}`);
		var str = base64.replace(/=/g,"").substr(0,32).toLocaleLowerCase();
		return str;
	}

	/**
	 * 按照储存仓库名设置当前操作仓库
	 * @param {string} - 储存仓库名
	 */
	_getStore(spaceName){
		var set = this._set;
		this._store[spaceName] = this._db.transaction(spaceName,set.authority).objectStore(spaceName);
	}
}
export default Indexing;