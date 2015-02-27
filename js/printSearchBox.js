(function(){
	function PrintSearchBox()
	{
		this._searchBox = document.getElementById("searchBox");
		this._search = document.getElementById("search");
		this._suggest = document.getElementById("suggest");
		this._addEventListener();
		EventTarget.call(this);
	}
	PrintSearchBox.prototype = new EventTarget();
	PrintSearchBox.prototype.constructor = PrintSearchBox;
	PrintSearchBox.prototype._printSuggest = function(list, suggest){
		list.innerHTML = "";
		var ul = document.createElement("ul");
		for(var i = 0; i<suggest.length; i++)
		{
			var li = document.createElement("li");
			li.innerText = suggest[i].text;
			ul.appendChild(li);
		}
		list.appendChild(ul);
	};
	PrintSearchBox.prototype._cleanSelected = function(selected){
		if(selected)
			selected.className = "";
	};
	PrintSearchBox.prototype._addNextSelected = function(selected,search){
		if(selected.nextElementSibling)
			selected = selected.nextElementSibling;
		else
			selected = search.parentElement.nextElementSibling.firstElementChild.firstElementChild;
		selected.className = "selectedSaerch";
		selected.scrollIntoView()
	};
	PrintSearchBox.prototype._addPreviousSelected = function(selected,search){
		if(selected.previousElementSibling)
			selected = selected.previousElementSibling;
		else
			selected = search.parentElement.nextElementSibling.firstElementChild.lastElementChild;
		selected.className = "selectedSaerch";
		selected.scrollIntoView();
	};
	PrintSearchBox.prototype._addEventListener = function(){
		var that = this;
		this._search.addEventListener("keyup", function(event){
			if(event.keyCode == 40)
			{
				var selected =  document.getElementsByClassName("selectedSaerch")[0];
				if(!selected)
				{
					selected = this.parentElement.nextElementSibling.firstElementChild.firstElementChild;
					selected.className = "selectedSaerch";
				}
				else
				{
					that._cleanSelected(selected);
					that._addNextSelected(selected,this);
				}	
			}
			else if(event.keyCode == 38)
			{
				var selected =  document.getElementsByClassName("selectedSaerch")[0];
				if(!selected)
				{
					selected = this.parentElement.nextElementSibling.firstElementChild.lastElementChild;
					selected.className = "selectedSaerch";
					selected.scrollIntoView();
				}
				else
				{
					that._cleanSelected(selected);
					that._addPreviousSelected(selected,this);
				}
			}
			else if(event.keyCode == 13)
			{
				var selected =  document.getElementsByClassName("selectedSaerch")[0];
				that.emit({type:"pressEnter",message:selected});
				// console.log(selected);
			}
			else
			{
				var search = new Search("list", this.value);
				var suggest = search.suggest();
				that._printSuggest(document.getElementById("suggest"),suggest);
			}
		});
		this._suggest.addEventListener("mouseover", function(event){
			var target = event.target;
			if(target.localName == "li")
			{
				var selected =  document.getElementsByClassName("selectedSaerch")[0];
				that._cleanSelected(selected);
				target.className = "selectedSaerch";
			}
		});
		this._suggest.addEventListener("mousedown", function(event){
			var target = event.target;
			if(target.localName == "li")
			{
				var selected =  document.getElementsByClassName("selectedSaerch")[0];
				that._cleanSelected(selected);
				target.className = "selectedSaerch";
				that.emit({type:"mousedown",message:selected});
			}
		});
		this._suggest.addEventListener("mouseup", function(event){
			that._search.focus();
		});
		window.addEventListener("keydown",function(event){
			// console.log(event.keyCode);
			if( (event.keyCode == 70 && event.ctrlKey) || (event.keyCode == 27 && that._searchBox.className == "") )
			{
				event.preventDefault();
				that._search.value = "";
				that._searchBox.classList.toggle("hide");
				that._search.focus();
			}
		});
		window.addEventListener("click",function(event){
			if(that._searchBox.className == "" && (event.target.localName != "ul" && event.target.localName != "li" && event.target.localName != "input") )
			{
				that._searchBox.classList.add("hide");
			}
		});
	};
	window.PrintSearchBox = PrintSearchBox;
}())