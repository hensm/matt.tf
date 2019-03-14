"use strict";

var canvas = document.getElementById("main");
var canvas_objects = [];


function Ball(x, y, r, m, g, rest, fric, vx, vy) {
	this.x = x;
	this.y = y;

	this.r = r;
	this.g = g;

	this.rest = rest;
	this.fric = fric;

	this.vx = vx || 0;
	this.vy = vy || 0;

	canvas_objects.push(this);
}
Ball.prototype = {
	draw: function(ctx) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
	},
	update: function() {
		var boundaries = check_boundaries(canvas.height, canvas.width, this.x, this.y, this.r);

		if (boundaries.top || boundaries.bottom) {
			this.y = (boundaries.top ? this.r : canvas.height - this.r);
			this.vy *= -1;
			this.vy *= this.rest;
			this.vx *= this.fric;
		}
		if (boundaries.left || boundaries.right) {
			this.x = (boundaries.left ? this.r : canvas.width - this.r);
			this.vx *= -1;
			this.vx *= this.rest;
			this.vy *= this.fric;
		}

		this.vy += this.g;
		this.x += this.vx;
		this.y += this.vy;
	}
}


function size_canvas(canvas) {
	canvas.setAttribute("height", window.innerHeight);
	canvas.setAttribute("width", window.innerWidth);
}
function draw() {
	var ctx = canvas.getContext("2d");
	var fill_style_tmp = ctx.fillStyle;
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = fill_style_tmp;

	for (var obj of canvas_objects) {
		obj.update();
		obj.draw(ctx);
	}
	window.requestAnimationFrame(draw);
}


function check_boundaries(h, w, x, y, r) {
	return {
		top: y - r < 0,
		bottom: y + r > h,
		left: x - r < 0,
		right: x + r > w
	}
}


function init() {
	size_canvas(canvas);

	setInterval(function() {
		new Ball(300, 300, Math.random() * (25 - 5) + 10, 1000, 1, 0.75, 0.99, Math.random() * (30 - -30) + -30, Math.random() * (30 - -30) + -30);
		if (canvas_objects.length > 50) {
			//canvas_objects.splice(0, 1);
		}
	}, 20);


	window.addEventListener("resize", function() {
		size_canvas(canvas);
	}, false);

	window.requestAnimationFrame(draw);
}
init();