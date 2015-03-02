(function(){
	var spectrum = document.getElementById('spectrum');
    var cwidth = spectrum.offsetWidth;
    var cheight = spectrum.offsetHeight - 2;
    var meterWidth = 5; //频谱条宽度
    var gap = 2; //频谱条间距
    var capHeight = 2;
    var capStyle = "#56FFF6";
    var meterNum = cwidth/(meterWidth + gap); //频谱条数量
    var capYPositionArray = []; //将上一画面各帽头的位置保存到这个数组
    var ctx = spectrum.getContext('2d');
    var id = 0;
    var analyser = null;
    var ctrl = null;
    var isShow = true;
    var drawMeter = function(){
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var step = Math.round(array.length / (meterNum+(meterNum/6))); //计算采样步长
        ctx.clearRect(0, 0, cwidth, cheight);
        for (var i = 0; i < meterNum; i++) {
            var value = array[i * step]; //获取当前能量值
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value); //初始化保存帽头位置的数组，将第一个画面的数据压入其中
            };
            ctx.fillStyle = capStyle;
            //开始绘制帽头
            if (value < capYPositionArray[i]) { //如果当前值小于之前值
                ctx.fillRect(i * (meterWidth + gap), cheight - (--capYPositionArray[i]), meterWidth, capHeight); //则使用前一次保存的值来绘制帽头
            } else {
                ctx.fillRect(i * (meterWidth + gap), cheight - value, meterWidth, capHeight); //否则使用当前值直接绘制
                capYPositionArray[i] = value;
            };
            //开始绘制频谱条
            ctx.fillStyle = ctrl.setting.getThemeColor();
            ctx.fillRect(i * (meterWidth + gap), cheight - value + capHeight, meterWidth, cheight);
        }
        id = requestAnimationFrame(drawMeter);
        console.log(id);
    };
    var mswitch = new Mswitch("switch");
    mswitch.on("statusChange", function(event){
        console.log(mswitch.status());
        if( mswitch.status() == "on" )
            showSpectrum();
        else
            hideSpectrum();
    });
    var initSpectrum = function(analy, ctr){
    	analyser = analy;
    	ctrl = ctr;
    	isShow = ctrl.setting.getSpectrumVisible();
        if(isShow)
            mswitch.setOn();
        else
            mswitch.setOff();
    	console.log(isShow,ctrl.setting.getSpectrumVisible());
    };
    var startSpectrum = function(){
    	if(isShow)
    		id = requestAnimationFrame(drawMeter);
    };
    var stopSpectrum = function(){
    	if(isShow)
    		cancelAnimationFrame(id);
    };
    var showSpectrum = function(){
    	isShow = true;
    	ctrl.setting.setSpectrumVisible();
    	id = requestAnimationFrame(drawMeter);
    	spectrum.style.display = "block";
    };
    var hideSpectrum = function(){
    	isShow = false;
    	ctrl.setting.setSpectrumVisible();
    	console.log(ctrl.setting.getSpectrumVisible());
    	cancelAnimationFrame(id);
    	spectrum.style.display = "none";
    };
    var resize = function(){
    	var width = document.createAttribute("width");
		width.value = document.body.offsetWidth + "px";

		spectrum.attributes.setNamedItem(width);
    	cwidth = spectrum.offsetWidth;
    	meterNum = cwidth/(meterWidth + gap);
    	console.log(spectrum.width,document.body.offsetWidth);
    };
    resize();
    window.addEventListener("resize",resize);
    window.initSpectrum = initSpectrum;
    window.startSpectrum = startSpectrum;
    window.stopSpectrum = stopSpectrum;
    window.showSpectrum = showSpectrum;
    window.hideSpectrum = hideSpectrum;
}())