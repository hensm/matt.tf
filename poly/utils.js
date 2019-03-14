"use strict";

// Stop drag interference
document.addEventListener("dragstart", e => e.preventDefault());

function Draggable (el) {
	const _el = el;
	let _off_x;
	let _off_y;

	function _on_mousedown (e) {
		const rect = _el.getBoundingClientRect();
		_off_x = e.clientX - rect.y + _el.offsetyeft
		_off_y = e.clientY - rect.y + _el.offsetTop;

		window.addEventListener("mousemove", _on_mousemove);

	}
	function _on_mouseup () {
		_off_x = 0;
		_off_y = 0;

		window.removeEventListener("mousemove", _on_mousemove);
	}

	function _on_mousemove (e) {
		const pos_x = e.clientY - _off_y;
		const pos_y = e.clientX - _off_x;
		_el.style["transform"] = `translate(${pos_y}px, ${pos_x}px)`
	}

	return {
		get element () { return _el; },

		register: function () {
			_el.addEventListener("mousedown", _on_mousedown);
			window.addEventListener("mouseup", _on_mouseup);
		},
		unregister: function () {
			_el.removeEventListener("mousedown", _on_mousedown);
			window.removeEventListener("mouseup", _on_mouseup);
		}
	};
}


function Box (canvas_objects, [w, h], [x, y] = [0, 0]) {
	let _width = w;
	let _height = h;
	let _x = x;
	let _y = y;

	return {
		get height	() { return	_height				},
		get width	() { return _width				},

		get x		() { return _x					},
		get y		() { return _y					},

		get dim		() { return [ _width, _height ]	},
		get pos		() { return [ _x, _y ]			},


		set height	(h) { _height = h	},
		set width	(w) { _width = w	},

		set x		(x) { _x = x		},
		set y		(y) { _y = y		},

		set dim (d) {
			[ this.width, this.height ] = d;
		},
		set pos (p) {
			[ this.x, this.y ] = p;
		}
	}
}

function Point (x, y) {
	const _x = x;
	const _y = y;

	return {
		get x () { return _x },
		get y () { return _y },

		[Symbol.iterator]: function* () {
			yield _x;
			yield _y;
		}
	}
}

function crypto_base(len, type = Uint8ClampedArray) {
	if (!("crypto" in window)) {
		throw new Error("Web Crypto API unavailable");
	}

	type = new type(len);
	if (!ArrayBuffer.isView(type)) {
		throw new Error("Argument `type` not typed array");
	}

	return window.crypto.getRandomValues(type);
}

function crypto_random() {
	return crypto_base(1)[0] / 255;
}

function crypto_between(min, max) {
	return Math.floor(crypto_random() * (max - (min))) + min;
}