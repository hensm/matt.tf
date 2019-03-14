"use strict";

const GOLDEN = 0.38196;

Object.defineProperties(Array.prototype, {
	head: { get: function () { return this[0]				}},
	last: { get: function () { return this[this.length - 1]	}}
});


const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

function size_canvas () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
size_canvas();

window.addEventListener("resize", size_canvas);


const el_controls = document.querySelector("#controls");
const el_slider = document.querySelector("#speed");
const el_color = document.querySelector("#color");


const el_line_thickness = document.querySelector("#line-thickness");
const el_spiral_thickness = document.querySelector("#spiral-thickness");

// checkboxes
const el_show_lines = document.querySelector("#show-lines");
const el_show_spiral = document.querySelector("#show-spiral");
const el_counter_clockwise = document.querySelector("#counter-clockwise");
const el_clear = document.querySelector("#clear-canvas");

function refresh_colors () {
	const rgb = obj_values(hexToRgb(base_color)).join(",");
	el_controls.style.backgroundColor = `rgba(${rgb}, 0.5)`;
	el_controls.style.borderColor = `rgba(${rgb}, 0.5)`;
	canvas.style.backgroundImage = `linear-gradient(black, rgba(${rgb}, 0.25))`;
}

let factor = 1 + el_slider.value / 1000;
let base_color = el_color.value;
refresh_colors();

let line_thickness = (el_line_thickness.value / 5) + 1;
let spiral_thickness = (el_spiral_thickness.value / 5) + 1;

let show_lines = el_show_lines.checked;
let show_spiral = el_show_spiral.checked;
let counter_clockwise = el_counter_clockwise.checked;
let clear = el_clear.checked;


el_slider.value = (factor - 1) * 1000;
el_color.value = base_color;

el_slider.addEventListener("input", function (e) {
	factor = 1 + e.target.value / 1000;
});

el_color.addEventListener("input", function (e) {
	base_color = e.target.value;
	refresh_colors();
});

el_line_thickness.addEventListener("input", function (e) {
	line_thickness = (e.target.value / 5) + 1;
});
el_spiral_thickness.addEventListener("input", function (e) {
	spiral_thickness = (e.target.value / 5) + 1;
});

el_show_lines.addEventListener("change", function (e) {
	show_lines = e.target.checked;
});
el_show_spiral.addEventListener("change", function (e) {
	show_spiral = e.target.checked;
});
el_counter_clockwise.addEventListener("change", function (e) {
	counter_clockwise = e.target.checked;
});
el_clear.addEventListener("change", function (e) {
	clear = e.target.checked;
});


function Box (x, y, width, height, depth) {
	let _x = x;
	let _y = y;
	let _width = width;
	let _height = height;
	let _depth = depth;

	return  {
		get x		() { return _x		},	set x		(n) { _x		= n },
		get y		() { return _y		},	set y		(n) { _y		= n },
		get width	() { return _width	},	set width	(n) { _width	= n },
		get height	() { return _height	},	set height	(n) { _height	= n },
		get depth	() { return _depth	},


		get_golden () {
			const h = _height * GOLDEN;
			const w = _width * GOLDEN;

			switch (_depth % 4) {
				case 0: return [ _x,				_y,					_width,	h		];
				case 1: return [ _x,				_y,					w,		_height	];
				case 2: return [ _x,				_y + (_height - h),	_width, h		];
				case 3: return [ _x + (_width - w), _y,					w,		_height	];
			}
		},

		draw (ctx) {
			if (show_lines) {
				ctx.lineWidth = line_thickness;
				ctx.strokeRect(_x, _y, _width, _height);
			}

			const h = _height * GOLDEN;
			const w = _width * GOLDEN;

			if (!show_spiral) {
				return;
			}

			ctx.beginPath();

			const orientation = _depth % 4;

			/*

			// old bezier curves
			
			if (orientation === 0) {
				ctx.moveTo(_x, _y + _height);
				ctx.quadraticCurveTo(_x + _width, _y + _height, _x + _width, _y + h);
			} else if (orientation === 1) {
				ctx.moveTo(_x + _width, _y + _height);
				ctx.quadraticCurveTo(_x + _width, _y, _x + w, _y);
			} else if (orientation === 2) {
				ctx.moveTo(_x + _width, _y);
				ctx.quadraticCurveTo(_x, _y, _x, (_y + _height) - h);
			} else if (orientation === 3) {
				ctx.moveTo(_x, _y);
				ctx.quadraticCurveTo(_x, _y + _height, (_x + _width) - w, _y + _height);
			}*/

			const rad_qtr = (Math.PI * 3) / 2;

			if (orientation === 0) {
				ctx.arc(_x, _y + h, _width, 0, -rad_qtr, counter_clockwise);
			} else if (orientation === 1) {
				ctx.arc(_x + w, _y + _height, _height, rad_qtr, 0, counter_clockwise);
			} else if (orientation === 2) {
				ctx.arc(_x + _width, (_y + _height) - h, _width, rad_qtr * 2, rad_qtr, counter_clockwise);
			} else if (orientation === 3) {
				ctx.arc((_x + _width) - w, _y, _height, rad_qtr * 3, rad_qtr * 2, counter_clockwise);
			}

			const tmp_stroke_style = ctx.strokeStyle;

			ctx.lineWidth = spiral_thickness;
			ctx.strokeStyle = base_color;

			ctx.stroke();

			ctx.strokeStyle = tmp_stroke_style;
		},

		update (parent) {
			if (parent) {
				[_x, _y, _width, _height] = parent.get_golden();
			}
		}
	};
}



const initial_width = 210;
const initial_height = 340;

const queue = [new Box((window.innerWidth / 2) - initial_width / 2,
					   (window.innerHeight / 2) - initial_height / 2,
					   initial_width,
					   initial_height,
					   0)];

let depth = 0;
for (let i = 0; i < 25; i++) {
	queue.push(new Box(...queue.last.get_golden(), ++depth));
}

// main loop
function draw () {
	ctx.strokeStyle = `rgb(${obj_values(hexToRgb(base_color)).map(v => Math.floor(v / 2)).join(",")})`;
	if (clear) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	queue.forEach((obj, i, self) => {
		if (obj !== self.head) {
			obj.update(self[i - 1]);
		}
		obj.draw(ctx);
	});


	const head = queue.head;

	head.width *= factor;
	head.height *= factor;
	head.x -= (queue.last.x - head.x) * (factor - 1);
	head.y -= (queue.last.y - head.y) * (factor - 1);

	const next = queue[1];
	if (	next.x < 0 &&
			next.y < 0 &&
			next.width > window.innerWidth &&
			next.height > window.innerHeight) {

		queue.shift();
		queue.push(new Box(...queue.last.get_golden(), ++depth));
	}

	window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
