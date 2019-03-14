var canvas = document.getElementById("mail"),
	ctx = canvas.getContext("2d");

var text = "m@matt.tf";

function draw() {
	var font_size = parseInt(window.getComputedStyle(canvas)["font-size"], 10)
			* (window.devicePixelRatio || 1),
		font = font_size + "px " + window.getComputedStyle(canvas)["font-family"];

	canvas.style.transform = "scale(" + 1 / window.devicePixelRatio + ")";

	ctx.font = font;
	canvas.setAttribute("width", ctx.measureText(text).width);
	canvas.setAttribute("height", font_size);
	ctx.font = font;

	ctx.textBaseline = "top";
	ctx.fillText(text, 0, 0);
}

window.addEventListener("resize", draw, false);
draw();