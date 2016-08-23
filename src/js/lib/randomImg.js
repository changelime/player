
var getColors = function(str, len){
	var colors = [];
	len = len * 9;
	var formatStr = function formatStr(str, len) {
		var numStr = "";
		var rex = /[^\d]/g;
		while(numStr.length < len)
		{
			str += btoa(encodeURI(str));
			numStr += str.replace(rex, "");
		}
		return numStr;
	};
	str = formatStr(str, len);
	var getColor = function getColor(str, index) {
		return (+str.slice(index, index + 3)) % 256;
	}
	for(var i = 0; i < len; i += 9)
	{
		colors.push("rgb("+ getColor(str, i) + ", " + getColor(str, i + 3) + ", " + getColor(str, i + 6) + ")");
	}
	return colors;
};
var randomImg = function randomImg(canvas, xCount, str){
	xCount = ~~xCount;
	var lineNum = 4;
	var width = canvas.width;
	var height = canvas.height;
	var step = ~~(width / xCount);
	var yCount = ~~(height / step) + 1;
	var colors = getColors(str, xCount * yCount);
	var context = canvas.getContext("2d");
	var drawPatch = function(x, y, r, color)
	{
			var ang = ((Math.PI * 2) / lineNum);
			context.save();
			context.fillStyle = color;
			context.translate(x, y);
			context.moveTo(0, -r);
			context.beginPath();
			for( var i = 0; i < lineNum; i++)
			{
				context.rotate(ang);
				context.lineTo(0, -r);
			}
			context.closePath();
			context.fill();
			context.restore();
	}

	for(var i = 0; i <= xCount; i++)
	{
		for(var j = 0; j <= yCount; j++)
		{
			drawPatch( i * step, j * step, step, colors[ (i * xCount) + j ]);
		}
	}
	return canvas;
};

export default randomImg;