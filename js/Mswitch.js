(function(){
	function Mswitch(id)
	{
		this._element = document.getElementById(id);
		this._addEventListener();
		this._status = "on";
		EventTarget.call(this);
	}
	Mswitch.prototype = new EventTarget();
	Mswitch.prototype.constructor = Mswitch;
	Mswitch.prototype.status = function(){
		return this._status;
	};
	Mswitch.prototype.setOn = function(){
		e = this._element.firstElementChild;
		e.classList.remove("switchOff")
		e.classList.add("switchOn");
		this._status = "on";
	};
	Mswitch.prototype.setOff = function(){
		e = this._element.firstElementChild;
		e.classList.remove("switchOn")
		e.classList.add("switchOff");
		this._status = "off";
	};
	Mswitch.prototype._addEventListener = function(){
		var that = this;
		this._element.addEventListener("click", function(event){
			var e = this.firstElementChild;
			if( e.className.indexOf("switchOff") != -1)
				that.setOn();
			else
				that.setOff();
			that.emit({type:"statusChange",message:event});
		});
	};
	window.Mswitch = Mswitch;
}())