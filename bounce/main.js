"use strict";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");


function size_canvas () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
size_canvas();

window.addEventListener("resize", size_canvas);


function BouncingRect (
		pos,
		dim,
		dir,
		dist,
		color = "blue") {

	let [ _x, _y ] = pos;
	let [ _w, _h ] = dim;
	let [ _dir_e, _dir_s ] = dir;
	let [ _x_dist, _y_dist ] = dist;

	let _color = color;

	return {
		get pos		() { return [ _x, _y			] },
		get dim		() { return [ _w, _h			] },
		get dir		() { return [ _dir_e, _dir_s	] },
		get dist	() { return [ _x_dist, _y_dist	] },

		get x () { return _x },
		get y () { return _y },
		get w () { return _w },
		get h () { return _h },

		get color () { return _color },


		update (canvas) {
			if (_dir_e) {
				if (_x + _w >= canvas.width) {
					_dir_e = false;
				}
			} else {
				if (_x <= 0) {
					_dir_e = true;
				}
			}

			if (_dir_s) {
				if (_y + _h >= canvas.height) {
					_dir_s = false;
				}
			} else {
				if (_y <= 0) {
					_dir_s = true;
				}
			}

			_x += _dir_e ? _x_dist : -_x_dist;
			_y += _dir_s ? _y_dist : -_y_dist;
		},

		draw (ctx) {
			ctx.fillStyle = _color;
			ctx.fillRect(_x, _y, _w, _h);
		}
	}
}

const canvas_objects = [
	new BouncingRect([0, 0], [Math.random() * 100, Math.random() * 100], [true, true], [Math.random() * 10, Math.random() * 10], "green"),
	new BouncingRect([0, 0], [Math.random() * 100, Math.random() * 100], [true, true], [Math.random() * 10, Math.random() * 10], "red"),
	new BouncingRect([0, 0], [Math.random() * 100, Math.random() * 100], [true, true], [Math.random() * 10, Math.random() * 10], "blue"),
	new BouncingRect([0, 0], [Math.random() * 100, Math.random() * 100], [true, true], [Math.random() * 10, Math.random() * 10], "yellow"),
	new BouncingRect([0, 0], [Math.random() * 100, Math.random() * 100], [true, true], [Math.random() * 10, Math.random() * 10], "brown"),
	new BouncingRect([0, 0], [Math.random() * 100, Math.random() * 100], [true, true], [Math.random() * 10, Math.random() * 10], "orange")
];

var colors = ["red", "darkblue", "green", "darkred", "blue", "darkgreen", "yellow"];
let i = 0;

function draw () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (i === colors.length) i = 0;

	canvas_objects.push(new BouncingRect([0, 0], [Math.random() * 100, Math.random() * 100], [true, true], [Math.random() * 10, Math.random() * 10], colors[i++]));

	for (let obj of canvas_objects) {
		obj.update(canvas);
		obj.draw(ctx);
	}

	window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
