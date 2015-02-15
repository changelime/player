(function(){
	function Indexing(set,upgradeneeded,callback){
		this._db = null;
		this._connect = null;
		this._set = set;
		this._store = {};
		this._upgradeneeded = upgradeneeded;
		this._space = set.space;
		this.callback = callback;
		this._connectDB();
	}
	Indexing.prototype._connectDB = function(){
		var set = this._set;
		var self = this;
		this._connect = indexedDB.open(set.dbName,set.version);
		this._connect.onsuccess = function(event){
			self._db = event.target.result;
			var space = self._space;
			for(var i = 0; i<space.length; i++)
			{
				(function(spaceName){
					self[spaceName] = {
						get : function(str, callback){
							self._getStore(spaceName);
							var request = self._store[spaceName].get(str);
							request.onsuccess = function(event){
								var result = event.target.result;
								if(result)
									callback(null,result);
								else
									callback(new Error("not found"));
							};
						},
						add : function(o, callback){
							self._getStore(spaceName);
							var request = self._store[spaceName].add(o);
							request.onsuccess = function(event){
								callback(null,event);
							};
							request.onerror = function(event){
								callback(new Error(event));
							};
						},
						delete : function(str, callback){
							self._getStore(spaceName);
							this.get(str,function(err, result){
								if(err)
									callback(new Error("not found"));
								else
								{
									var request = self._store[spaceName].delete(str);
									request.onsuccess = function(event){
										callback(null,event);
									};
								}
							});
						},
						put : function(o, callback){
							self._getStore(spaceName);
							var request = self._store[spaceName].put(o);
							request.onsuccess = function(event){
								callback(null,event);
							};
							request.onerror = function(event){
								callback(new Error(event));
							};
						},
						getAll : function(callback){
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
									callback(all);
							};
						}
					};
					if(spaceName == space[space.length-1])
						self.callback();
				}(space[i]));
			}
		};
		this._connect.onupgradeneeded = function(event){
			if( !self._upgradeneeded )
			{
				throw new Error("upgradeneeded undefined");
			}
			self._db = event.target.result;
			self._upgradeneeded(self._db);
		};
	};
	Indexing.prototype._getStore = function(spaceName){
		var set = this._set;
		this._store[spaceName] = this._db.transaction(spaceName,set.authority).objectStore(spaceName);
	};
	window.Indexing = Indexing;
}())