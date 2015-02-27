(function(){
	function Search(id, str)
	{
		this._listElement= document.getElementById(id);
		this._list = this._getListData();
		this._countScore(str);
		this._printScore();
	}
	Search.prototype.suggest = function(){
		var suggest = [];
		for(var i = 0; i < this._list.length; i ++)
		{
			if(this._list[i].score !== 0)
			{
				suggest.push(this._list[i]);
			}
		}
		return suggest;
	};
	Search.prototype._printScore = function(){
		for(var i = 0; i<this._list.length; i++)
		{
			console.log(this._list[i]);
		}
		console.log("----------------------------");
	};
	Search.prototype._getListData = function(){
		var list = this._listElement;
		var li = list.children;
		var data = [];
		for(var i = 0; i<li.length; i++)
		{
			if(li[i].innerText)
				data.push({text : li[i].innerText,score:0});
		}
		return data;
	};
	Search.prototype._base = function(str, list){
		for(var i = 0; i<str.length; i++)
		{
			var lower = list.text.indexOf(str.toLocaleLowerCase());
			var upper = list.text.indexOf(str.toLocaleUpperCase());
			if( lower != -1 || upper != -1 )
			{
				list.score++;
			}
		}
	};
	Search.prototype._group = function(str, list){
		for(var i = 0; i<str.length; i++)
		{
			for(var j = i+1; j<str.length+1; j++)
			{
				var s = str.substr(i,j);
				var lower = list.text.indexOf(s.toLocaleLowerCase());
				var upper = list.text.indexOf(s.toLocaleUpperCase());
				if( lower != -1 || upper != -1)
				{
					var val = 1000- (lower + upper);
					list.score += (j-i) + val;
				}
			}
		}
	};
	Search.prototype._allStrIndexOf = function(str, list){
		if(!str)
			return;
		var lower = list.text.indexOf(str.toLocaleLowerCase());
		var upper = list.text.indexOf(str.toLocaleUpperCase());
		if( lower != -1 || upper != -1)
		{
			list.score += 1000;
		}
	};
	Search.prototype._allEq = function(str, list){
		var lower = list.text == str.toLocaleLowerCase();
		var upper = list.text == str.toLocaleUpperCase();
		if( lower || upper )
		{
			list.score += 10000;
		}
	};
	Search.prototype._countScore = function(str){
		var list = this._list;
		for(var i = 0; i < list.length; i ++)
		{
			this._base(str, list[i]);
			this._group(str, list[i])
			this._allStrIndexOf(str, list[i])
			this._allEq(str, list[i]);
		}
		this._sortList();
	};
	Search.prototype._sortList = function(){
		this._list.sort(function(a,b){
			return b.score - a.score;
		});
	};
	window.Search = Search;
}())