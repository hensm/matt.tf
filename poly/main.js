"use strict";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");


function size_canvas () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
size_canvas();

window.addEventListener("resize", size_canvas);


let mx;
let my;
window.addEventListener("mousemove", e => {
	mx = e.clientX;
	my = e.clientY;
});


function draw () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let obj of canvas_objects) {
		obj.update(canvas);
		obj.draw(ctx);
	}

	window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);



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
	let _section;

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

		get section () { return _section },


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

			_section = get_section([window.innerWidth, window.innerHeight], [_x, _y]);
		},

		draw (ctx) {
			if (get_dist([_x, _y], [mx, my]) < 150) {
				canvas_objects
					/*.filter(obj => obj.section === _section
								&& obj.section === get_section([
										window.innerWidth,
										window.innerHeight
									], [mx, my]))*/
					.forEach(obj => {
						const p_dist = get_dist([_x, _y], [obj.x, obj.y]);

						if (p_dist < 100) {
							const gradient = ctx.createLinearGradient(_x, _y, obj.x, obj.y);
							gradient.addColorStop(0, "rgba(0, 0, 0, 0.75)");
							gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

							ctx.strokeStyle = gradient;

							ctx.beginPath();
							ctx.moveTo(_x, _y);
							ctx.lineTo(obj.x, obj.y);
							ctx.stroke();
						}
					});

				//ctx.fillStyle = "black";
			} else {
				ctx.fillStyle = _color;
			}

			ctx.fillRect(_x, _y, _w, _h);

		}
	}
}
const canvas_objects = Array(Math.min(Math.floor(window.innerWidth * window.innerHeight / 3000), 800))
	.fill()
	.map(k => new BouncingRect(
		[	crypto_between(0, window.innerWidth),
			crypto_between(0, window.innerHeight)],
		[2, 2],
		[	crypto_random() > 0.5,
			crypto_random() > 0.5],
		[	crypto_random(),
			crypto_random()],
		"rgba(0, 0, 0, 0.15)"));




function get_dist([x1, y1], [x2, y2]) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function get_section ([w, h], [x, y]) {

	const w_half = w / 2;
	const w_quart = w_half / 2;

	const h_half = h / 2;
	const h_quart = h_half / 2;



	if (x < w_half) {
		if (y < h_half) {
			// first quadramt
			if (x < w_quart) {
				if (y < h_quart) {
					return 1;
				} else {
					return 5;
				}
			} else {
				if (y < h_quart) {
					return 2;
				} else {
					return 6;
				}
			}
		} else {
			// third quadramt
			if (x < w_quart) {
				if (y < h_half + h_quart) {
					return 9;
				} else {
					return 13;
				}
			} else {
				if (y < h_half + h_quart) {
					return 10;
				} else {
					return 14;
				}
			}
		}
	} else {
		if (y < h_half) {
			// second quadrant
			if (x < w_half + w_quart) {
				if (y < h_quart) {
					return 3;
				} else {
					return 7;
				}
			} else {
				if (y < h_quart) {
					return 4;
				} else {
					return 8;
				}
			}
		} else {
			// fourth quadramt
			if (x < w_half + w_quart) {
				if (y < h_half + h_quart) {
					return 11;
				} else {
					return 15;
				}
			} else {
				if (y < h_half + h_quart) {
					return 12;
				} else {
					return 16;
				}
			}
		}
	}
}