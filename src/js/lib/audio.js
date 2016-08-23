import EventTarget from "./event";
class Audio extends EventTarget {
	constructor() {
		super();
		this._audioCtx = new AudioContext();//实例化
		this._buffer = null;
		this._sourceNode = null;
		this._scriptProcessorNode = null;
		this._oldScriptProcessorNode = null;
		this._oldSourceNode = null;
		this._status = "init";//ready,loading,playing,pause,init
		this._currentTime = 0;
		this._duration = 0;
		this._oldTime = new Date();
		this._m = 0;
		this._s = 0;
		this._curt = 0;
		this._proceessTime = 0;
		this._soundName = "";
		this._soundId = "";
	}
	_initNode(){//初始化音源节点
		this._oldSourceNode = this._sourceNode;//备份旧节点
		this._oldScriptProcessorNode = this._scriptProcessorNode;

		this._sourceNode = this._audioCtx.createBufferSource();//创建音源节点，用于读取音源
		this._scriptProcessorNode = this._audioCtx.createScriptProcessor(4096,2,2);
	}
	_disconnectOldNode(){//断开旧节点，在播放新buffer时执行
		try
		{
			this._oldScriptProcessorNode.onaudioprocess = null;
			this._oldSourceNode.onended = null;
			this._oldSourceNode && this._oldSourceNode.disconnect(this._oldScriptProcessorNode);//旧节点断开连接
			this._oldScriptProcessorNode && this._oldScriptProcessorNode.disconnect(this._audioCtx.destination);//旧节点断开连接				
			delete this._oldSourceNode.buffer;
			this._oldSourceNode = null;
			this._oldScriptProcessorNode = null;
		}
		catch(e)
		{
			console.log(e);
		}
	}
	_disconnectNode(){//断开当前节点，在暂停或停止时执行
		try
		{
			this._scriptProcessorNode.onaudioprocess = null;
			this._sourceNode.onended = null;
			this._sourceNode.disconnect(this._scriptProcessorNode);//旧节点断开连接
			this._scriptProcessorNode.disconnect(this._audioCtx.destination);//旧节点断开连接						
			delete this._sourceNode.buffer;
			this._sourceNode = null;
			this._scriptProcessorNode = null;
		}
		catch(e)
		{
			console.log(e);
		}
	}
	_connectNode(){//连接节点，总是连接最新的节点
		this._sourceNode.connect(this._scriptProcessorNode);//连接新节点
		this._scriptProcessorNode.connect(this._audioCtx.destination);//连接新节点
	}
	_refreshCurrentBuffer(data, callback){//读取新音源到新音源节点
		var self = this;
		this._audioCtx.decodeAudioData(data,function(result){
			self._buffer = null;
			self._buffer = result;
			self._status = "ready";
			callback();
			console.log("刷新当前buffer完毕");
		});	
	}
	_readFormCurrentBuffer(){//读取旧音源到新音频节点
		this._initNode();//新建音源节点
		this._sourceNode.buffer = this._buffer;//当前音源赋值给新节点
		this._duration = this._buffer.duration;
		// this._buffer = null;
		this._connectNode();//重新连接
		console.log("读取当前buffer完毕");
	}
	getStatus(){
		return this._status;
	}
	readFile(data, callback){
		this._status = "loading";
		this._refreshCurrentBuffer(data, callback);//刷新当前buffer
		console.log("新文件载入，开始刷新当前buffer");
		this.emit({type:"startload",message:event});
	}
	play(offset){//buffer可能比现在播放的音频新
		if( typeof offset === "number" || this._status === "pause" ||  this._status === "ready" || this._status === "stop")
		{
			this._readFormCurrentBuffer();//读取当前buffer中的音源
			if( this._status === "pause" && (typeof offset !== "number") )//播放前是暂停状态，每个节点只能调用一次，重新读取音源
			{
				this._sourceNode.start(0, this._currentTime/1000);
			}
			else if(typeof offset === "number")
			{
				this._disconnectOldNode();//断开旧连接
				this._currentTime = offset*1000;
				this._sourceNode.start(0,this._currentTime/1000);
			}
			else if( this._status === "stop")
			{
				this._sourceNode.start(0);//播放前是停止状态
			}
			else if( this._status === "ready")//播放前已经载入了一个新buffer
			{
				this._disconnectOldNode();//断开旧连接
				this._currentTime = 0;
				this._sourceNode.start(0);
			}
			var self = this;
			this._oldTime = new Date();
			this._scriptProcessorNode.onaudioprocess = function(event){
				var inputBuffer = event.inputBuffer;
				var outputBuffer = event.outputBuffer;
				var now = Date.now();
				var pastTime = now - self._oldTime;
				for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++)
				{
					let inputData = inputBuffer.getChannelData(channel);
					let outputData = outputBuffer.getChannelData(channel);
					for (let i = 0; i < inputBuffer.length; i++)
						outputData[i] = inputData[i];
				}
				self._currentTime += pastTime;
				self._proceessTime += pastTime;
				self._curt = self._currentTime / 1000;
				self._m = parseInt(self._curt / 60);
				self._s = parseInt(self._curt % 60);
				self._oldTime = now;
				if( self._proceessTime > 500 )
				{
					self._proceessTime = 0;
					self.emit({type:"proceess",message:event});
				}
			};
			this._sourceNode.onended = function(event){
				self._scriptProcessorNode.onaudioprocess = null;
				self._sourceNode.onended = null;
				self._disconnectNode();//断开连接
				self._currentTime = 0;
				self._status = "stop";
				console.log("播放完毕");
				self.emit({type:"playend",message:event});
			};
			this._status = "playing";
			this.emit({type:"canplay",message:this});
			console.log("播放当前buffer");
		}
	}
	getCurrentime(){
		var self = this;
		return {
			m : self._m,
			s : self._s,
			currentTime : self._curt
		};
	}
	pause(){
		if( this._status === "playing" )
		{
			this._sourceNode.stop(0);//停止
			this._disconnectNode();//断开连接
			this._status = "pause";
			console.log("已暂停，当前暂停时间计入播放时间线");
		}
		else
		{
			console.log("未处于播放状态，不能暂停");
		}
	}
	stop(){
		if( this._status === "playing" )
		{
			this._sourceNode.stop(0);//停止
			this._disconnectNode();//断开连接
			this._currentTime = 0;
			this._status = "stop";
			console.log("已停止");
		}
		else
		{
			console.log("未处于播放状态，不能停止");
		}
	}
	getSoundName()
	{
		return this._soundName;
	}
	getSoundId()
	{
		return this._Id;
	}
	readAndPlay(file, id){
		var self = this;
		this._soundName = file.name;
		this._Id = id;
		this.stop();
		var reader = new FileReader();
		reader.readAsArrayBuffer(file);
		reader.onload = function(){
			self.readFile(reader.result, function(){
				self.play();
			});
		};
	}
	getDuration(){
		return this._duration;
	}
}

export default new Audio();

// play.addEventListener("click", function(event){
// 	audioCtrl.play();
// },false);
// pause.addEventListener("click", function(event){
// 	audioCtrl.pause();
// },false);
// stop.addEventListener("click", function(event){
// 	audioCtrl.stop();
// },false);