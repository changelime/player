(function(){
	function EventTarget()
	{
		this.handlers = {};
	}

	EventTarget.prototype = {
		constructor : EventTarget,
		on : function(type, handler){
			if(typeof this.handlers[type] == "undefined")
			{
				this.handlers[type] = [];//如果为空，则为第一次添加此事件，初始化为数组，以便添加多个事件
			}
			this.handlers[type].push(handler);//为该事件添加一个控制器
		},
		emit : function(event){
			if(!event.target)
			{
				event.target = this;
			}
			if(this.handlers[event.type] instanceof Array)
			{
				var handlers = this.handlers[event.type];
				for(var i = 0, len = handlers.length; i < len; i++ )
					handlers[i](event);
			}
		},
		removeHandler : function(type, handler){
			if( this.handlers[type] instanceof Array )
			{
				var handlers = this.handlers[type];
				for(var i = 0, len = handlers.length; i < len ;i++)
				{
					if(handlers[i] === handler)
						break;
				}
			}
			handlers.splice(i,1);
		}
	};
	window.EventTarget = EventTarget;
}())