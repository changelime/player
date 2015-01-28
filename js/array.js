(function(){
	Array.prototype.pickOne = function(){
		var random = Math.round(((Math.random()*this.length)+Date.now()))%this.length;
		return {
			value : this[random],
			index : random
		};
	}
}());