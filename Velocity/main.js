"use strict";

function size_canvas(canvas) {
	canvas.setAttribute("height", window.innerHeight);
	canvas.setAttribute("width", window.innerWidth);
}

function check_boundaries(h, w, x, y, r) {
	return {
		top: y - r < 0,
		bottom: y + r > h,
		left: x - r < 0,
		right: x + r > w
	};
}

function get_angle_velocity(mx, my, cx, cy, rx, ry) {
    return [ (mx - (cx - cy)) - cy, my - cy ];
}

const canvas = document.getElementById("main");
const canvas_objects = [];

let draw_line = false;
let line_origin = [];

let mouse_pos = [];


function Ball (x, y, r, g, rest, fric, vx = 0, vy = 0) {
	let _x = x;
	let _y = y;
	let _r = r;
	let _g = g;

	let _rest = rest;
	let _fric = fric;

	let _vx = vx;
	let _vy = vy;

	return {

		get radius		() { return _r			;},
		get gravity		() { return _g 			;},
		get restitution	() { return _rest		;},
		get friction	() { return _fric		;},
		get position	() { return [_x, _y]	;},
		get velocity	() { return [_vx, _vy]	;},


		draw: function (ctx) {
			ctx.beginPath();
			ctx.arc(_x, _y, _r, 0, 2 * Math.PI);
			ctx.closePath();
			ctx.fill();
		},

		update: function (canvas) {
			const boundaries = check_boundaries(canvas.height, canvas.width, _x, _y, _r);

			if (boundaries.top || boundaries.bottom) {
				_y = (boundaries.top
					? _r
					: canvas.height - _r);
				_vy *= -1;
				_vy *= _rest;
				_vx *= _fric;
			}

			if (boundaries.left || boundaries.right) {
				_x = (boundaries.left
					? _r
					: canvas.width - _r);
				_vx *= -1;
				_vx *= _rest;
				_vy *= _fric;
			}

			_vy += _g;
			_x += _vx;
			_y += _vy;
		},

	};
}


function draw() {
	let ctx = canvas.getContext("2d");
	let fill_style_tmp = ctx.fillStyle;
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = fill_style_tmp;

	if (draw_line) {
        ctx.beginPath();
        ctx.moveTo(...line_origin);
        ctx.lineTo(...mouse_pos);
        ctx.strokeStyle = "#FF0000";
        ctx.stroke();
        ctx.strokeStyle = "#000000";
	}

	for (let obj of canvas_objects) {
		obj.update(canvas);
		obj.draw(ctx);
	}
	window.requestAnimationFrame(draw);
}



function init() {
	size_canvas(canvas);

	canvas.addEventListener("mousemove", function(e) {
		mouse_pos = [ e.clientX, e.clientY ];
	}, false);

	canvas.addEventListener("mousedown", function() {
		draw_line = true;
		line_origin = mouse_pos;

	}, false);
	canvas.addEventListener("mouseup", function() {
		let velo = get_angle_velocity(...line_origin, ...mouse_pos, 50, 50);
		draw_line = false;

		let ball = new Ball(...line_origin, 50, 1, 0.75, 0.99, ...velo.map(x => x / 5));
		canvas_objects.push(ball);
	}, false);


	window.addEventListener("resize", function() {
		size_canvas(canvas);
	}, false);

	window.requestAnimationFrame(draw);
}
init();

function random_between(max, min) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

setInterval(function () {
	let velocity = [random_between(-100, 75), random_between(-100, 75)]
	canvas_objects.push(Ball(canvas.width / 2, canvas.height / 2,
							 random_between(10, 50),
							 1,
							 0.75,
							 0.99,
							 ...velocity));

	if (canvas_objects.length > 35) {
		canvas_objects.shift();
	}
}, 1000);