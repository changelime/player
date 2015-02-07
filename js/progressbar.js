(function(){
	function Progressbar(elenemt)
	{
		this.target = document.querySelector(elenemt);
		this.inside = document.createElement("div");
		this.flag = document.createElement("div");
		this.inside.className = "inside";
		this.flag.className = "flag";
		this.target.appendChild(this.inside);
		this.target.appendChild(this.flag);
		this._fragtion = 0;//进度条比例0~1
		this._pressFlag = false;
		this._lock = false;
		this._addEventListener();
	}
	Progressbar.prototype = new EventTarget();
	Progressbar.prototype._addEventListener = function(){
		var that = this;
		this.target.addEventListener("mousedown",function(event){//在进度条上点击
			that._setPosition(event);
			that.emit({type:"pressBar",message:event});
		},true);
		this.flag.addEventListener("mousedown",function(event){
			if( !that._pressFlag )
			{
				that._pressFlag = true;
				that.emit({type:"startDraggingFlag",message:event});
			}	
		},false);
		document.addEventListener("mousemove",function(event){
			if(that._pressFlag)
			{
				that._setPosition(event);
				that.emit({type:"draggingFlag",message:event});
			}
		},false);
		document.addEventListener("mouseup",function(event){
			if(that._pressFlag)
			{
				that._pressFlag = false;
				that.emit({type:"stopDraggingFlag",message:event});
			}
		},false);
	};
	Progressbar.prototype._setPosition = function(event,fragtion){
		if(this._lock)
			return;
		var width = this.target.offsetWidth;
		if(fragtion)
		{
			var offleft = 6/width;
			this.inside.style.width = (fragtion * 100) + "%";
			this.flag.style.left = ( (fragtion - offleft) * 100) + "%";
			this._fragtion = fragtion;
			return;
		}
		var position = event.clientX - this.target.offsetLeft;
		if( position <= 0 || position > width)
			return;
		this._fragtion = position / width;
		this.inside.style.width = (this._fragtion * 100) + "%";
		this.flag.style.left = ( ( (position-6) / width ) * 100) + "%";
		console.log(this._fragtion,position);
	};
	Progressbar.prototype.setPosition = function(fragtion){
		if(fragtion <= 1 && fragtion >= 0)
			this._setPosition(null,fragtion);
	};
	Progressbar.prototype.lock = function(){
		this._lock = true;
	};
	Progressbar.prototype.unlock = function(){
		this._lock = false;
	};
	Progressbar.prototype.getPosition = function(){
		return this._fragtion;
	};
	window.Progressbar = Progressbar;
}())