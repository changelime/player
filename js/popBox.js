(function(){
	var popBoxs = document.querySelectorAll(".popBox");
	var zIndex = 10;
	[].forEach.call(popBoxs,function(item, index){
		var btn = item.firstElementChild.firstElementChild;
		var isHide = item.dataset.hide == "false" ? false : true;
		if(isHide)
		{
			item.style.top = "-100%";
		}
		var hide = function(){
			if(parseInt(item.style.top) == -100)
				return;
			var top = item.style.top ? (parseInt(item.style.top)-1) +"%" :  "20%";
			item.style.top = top;
			if( parseInt(top) >  -100)
			{
				requestAnimationFrame(hide);
				if(parseInt(top)%3 == 0)
					requestAnimationFrame(hide);
			}
			else
			{
				isHide = true;
				item.classList.add("hide");
			}
		};
		var show = function(){
			if(parseInt(item.style.top) == 20)
				return;
			if( parseInt(item.style.top) < 0 )
			{
				item.style.top = "100%";
				item.classList.remove("hide");
				isHide = false;
				item.style.zIndex = ++zIndex;
			}
			var top = parseInt(item.style.top) - 1;
			item.style.top = top + "%";
			if( top > 20 )
			{
				requestAnimationFrame(show);
				if(parseInt(top)%3 == 0)
					requestAnimationFrame(show);
			}
		};
		item.open = function(){
			requestAnimationFrame(show);
		};
		item.close = function(){
			requestAnimationFrame(hide);
		};
		item.isHide = function(){
			return isHide;
		}
		btn.addEventListener("click",function(event){
			item.close();
		});
	});
}())