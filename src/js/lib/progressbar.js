import $ from "jquery";
import EventTarget from "./event";
class Progressbar extends EventTarget {
	constructor(elenemt) {
		super();
		this.target = $(elenemt);
		this.ctrlPoint = this.target.find(".ctrl-point");
		this.inside = this.target.find(".prograss-inside");

		this._fragtion = 0;//进度条比例0~1
		this._pressFlag = false;
		this._lock = false;

		this._addEventListener();
	}
 	_addEventListener(){
 		var that = this;
 		this.ctrlPoint.on("mousedown", null, function(event) {
 			event.preventDefault();
 			if(that._lock)
				return;
 			if( !that._pressFlag )
			{
				that._pressFlag = true;
				that.emit({type:"startDraggingFlag",message:event});
			}
 		});
 		this.target.on("mousedown", null, function(event){//在进度条上点击
 			if(that._lock)
				return;
			that._setPosition(event);
			that.emit({type:"pressBar",message:event});
		});
 		$("body").on("mouseup", null, function(event){
 			if(that._lock)
				return;
			if(that._pressFlag)
			{
				that._pressFlag = false;
				that.emit({type:"stopDraggingFlag",message:event});
			}
		});
		$("body").on("mousemove", null, function(event){
			if(that._lock)
				return;
			if(that._pressFlag)
			{
				that._setPosition(event);
				that.emit({type:"draggingFlag",message:event});
			}
		});
	}
	_setPosition(event,fragtion){
		if(this._lock)
			return;
		var width = this.target.width();
		if(fragtion)
		{
			this._fragtion = fragtion;
			this.inside.width((this._fragtion*100) + "%");
			return;
		}
		var position = event.clientX - this.target.offset().left;
		if( position <= 0 || position > width)
			return;
		this._fragtion = position / width;
		this.inside.width((this._fragtion*100) + "%");
		console.log(this._fragtion);
	}
	setPosition(fragtion){
		if(fragtion <= 1 && fragtion >= 0)
			this._setPosition(null,fragtion);
	}
	lock(){
		this._lock = true;
	}
	unlock(){
		this._lock = false;
	}
	getPosition(){
		return this._fragtion;
	}
}
export default Progressbar;