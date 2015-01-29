(function(){
	function Progressbar(elenemt)
	{
		this.target = document.querySelector(elenemt);
		this.inside = document.createElement("div");
		this.flag = document.createElement("div");
		this.inside.className = "inside";
		this.flag.className = "flag";
		this.inside.appendChild(this.flag);
		this.target.appendChild(this.inside);
		this.bar = {
			target : this.target,
			inside : this.inside,
			dragging : null,
			canDrag : false,
			time : 0,
			width : this.target.offsetWidth,
			past : 12,
			pastTime : 0,
			per : 0
		};
		var that = this;

		this.target.addEventListener("mousedown",function(event){
			var insideWith = event.clientX-12;
			if(!event.clientX == 0 && insideWith < that.bar.target.offsetWidth && that.bar.canDrag)
			{
				that.bar.inside.style.width = insideWith + "px";
				that.bar.past = insideWith;
				that.bar.pastTime = (that.bar.past/that.bar.target.offsetWidth)*that.bar.time;
				that.emit({type:"pressProgress",message:event});
			}
		},true);
		this.flag.addEventListener("mousedown",function(event){
			if(that.bar.canDrag)
			{
				that.bar.dragging = event.target;
				that.emit({type:"startDragging",message:event});
			}
		},false);
		document.addEventListener("mousemove",function(event){
			if(that.bar.dragging !== null && that.bar.canDrag)
			{
				var insideWith = event.clientX-12;
				if(!event.clientX == 0 && insideWith < that.bar.target.offsetWidth )
				{
					that.bar.inside.style.width = insideWith + "px";
					that.bar.past = insideWith;
					that.bar.pastTime = (that.bar.past/that.bar.target.offsetWidth)*that.bar.time;
				}
				that.emit({type:"draggingFlag",message:event});
			}
		},false);
		document.addEventListener("mouseup",function(event){
			if(that.bar.canDrag)
			{
				that.bar.dragging = null;
				that.emit({type:"stopDragging",message:event});
			}	
		},false);
	}
	Progressbar.prototype = new EventTarget();
	Progressbar.prototype.fire = function(progress){
		this.bar.per = (this.bar.width/progress.time);
		this.bar.time = progress.time;
		this.bar.past = (progress.pastTime*this.bar.per) + this.bar.per;
		if(this.bar.past > 12)
			this.inside.style.width = this.bar.past + "px";
	};
	Progressbar.prototype.canDrag = function(){
		this.bar.canDrag = true;
	};
	Progressbar.prototype.getPastTime = function(){
		return this.bar.pastTime;
	};
	window.Progressbar = Progressbar;
}())