(function(){
	var left = document.getElementById("left");
	var setting = document.getElementById("setting");
	var list = document.getElementById("list");
	var position = -left.offsetWidth;
	var isShow = false;
	left.style.left = "-360px"
	var hide = function(){
		var offLeft = left.style.left === "" ? 0 : parseInt(left.style.left);
		if( (offLeft-=30) >= position)
		{
			left.style.left = offLeft + "px";
			requestAnimationFrame(hide);
		}
		else
			isShow = false;
	};
	var show = function(){
		var offLeft = left.style.left === "" ? 0 : parseInt(left.style.left);
		if( (offLeft+=20) <= 0)
		{
			left.style.left = offLeft + "px";
			requestAnimationFrame(show);
		}
		else
			isShow = true;
	};
	document.body.addEventListener("click",function(event){
		if(isShow && event.clientX >= 360)
			requestAnimationFrame(hide);
	});
	document.body.addEventListener("mousemove",function(event){
		if(event.clientX <= 30 && !isShow)
		{
			console.log(event.clientX);
			requestAnimationFrame(show);
		}
	});
	var toggle = function(e){
		if(e.className === "hide")
			e.className = "show";
		else
			e.className = "hide";
	};
	list.parentNode.firstElementChild.addEventListener("click",function(){
		toggle(list);
	});
	setting.parentNode.firstElementChild.addEventListener("click",function(){
		toggle(setting);
	});
}())