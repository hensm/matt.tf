const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

document.body.appendChild(canvas);

const directions = {
	LEFT: 0,
	UP: 1,
	RIGHT: 2,
	DOWN: 3
};


const height = 600;
const width = 600;
canvas.height = height;
canvas.width = width;

let delay = 60;

const objects = [
	new SnakeGrid(width, height, 20)
];

let s = new Snake(1, 1, "white");
s.register();

objects[0].add_snake(s);


function draw () {
	ctx.fillStyle = "white";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	objects.forEach(object => {
		object.update();
		object.draw(ctx);
	});

	window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);



function SnakeGrid (width, height, cell_size) {
	if (width % cell_size !== 0 || height % cell_size !== 0) {
		throw "";
	}

	const _width = width;
	const _height = height;
	const _cell_size = cell_size;

	const _row_count = _height / _cell_size;
	const _column_count = _width / _cell_size;

	const _cells = Array(width / cell_size)
		.fill(Array(height / cell_size).fill(false));

	const _snakes = [];

	let _food_cell = _get_random_coords();

	function _get_random_coords () {
		return [
			crypto_between(0, _column_count - 1),
			crypto_between(0, _row_count - 1)
		];
	}


	return {
		get cell_size () {
			return _cell_size;
		},

		get_cell_coords (x, y) {
			return [x * cell_size, y * cell_size];
		},
		add_snake (snake) {
			_snakes.push(snake);
		},


		update () {
			_snakes.forEach(snake => {
				if (_snakes
						.filter(snake2 => snake2 !== snake)
						.some(snake2 => snake.intersects(snake2))
						|| snake.intersects_self()) {

					snake.kill();
					snake.unregister();
				} else {
					const [ x, y ] = snake.cells[snake.cells.length - 1];
					if (x < 0 || y < 0 || x > _column_count - 1
							|| y > _row_count - 1) {
						snake.kill();
						snake.unregister();
					} else if (x === _food_cell[0] && y === _food_cell[1]) {
						snake.expand();
						_food_cell = _get_random_coords();
					} else {
						snake.update();
					}
				}
			});

			_snakes.forEach(snake => {
				if (!snake.active) {
					delete _snakes[_snakes.indexOf(snake)];
					const [ x, y ] = _get_random_coords();
					const new_snake = new Snake(x, y, "white");
					_snakes.push(new_snake);
					new_snake.register();
					_food_cell = _get_random_coords();
				}
			});
		},
		draw (ctx) {
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, width, height);
			ctx.fillStyle = "white";
			const [ x, y ] = this.get_cell_coords(..._food_cell);
			ctx.fillRect(x, y, _cell_size, _cell_size);
			_snakes.forEach(snake => snake.draw(ctx, this));
		}
	}
}

function Snake (x, y, color) {
	const _cells = [[x, y]];

	let _color = color;
	let _active = true;

	const interval = window.setInterval(_update_movement, delay);
	let _direction = directions.RIGHT;


	function _on_keydown (e) {
		switch (e.key) {
			case "ArrowLeft":
				if (_direction !== directions.RIGHT) {
					_direction = directions.LEFT;
				}
				break;
			case "ArrowUp":
				if (_direction !== directions.DOWN) {
					_direction = directions.UP;
				}
				break;
			case "ArrowRight":
				if (_direction !== directions.LEFT) {
					_direction = directions.RIGHT;
				}
				break;
			case "ArrowDown":
				if (_direction !== directions.UP) {
					_direction = directions.DOWN;
				}
				break;
		}
	}

	function _get_next_cell () {
		const [ x, y ] = _cells[_cells.length - 1];
		switch(_direction) {
			case directions.LEFT:
				return [x - 1, y];
				break;
			case directions.UP:
				return [x, y - 1];
				break;
			case directions.RIGHT:
				return [x + 1, y];
				break;
			case directions.DOWN:
				return [x, y + 1];
		}
	}
	function _update_movement () {
		_cells.push(_get_next_cell());
		_cells.shift();
	}

	return {
		register () {
			window.addEventListener("keydown", _on_keydown);
		},
		unregister () {
			window.clearInterval(interval);
			window.removeEventListener("keydown", _on_keydown);
		},

		get cells () {
			return _cells;
		},
		get length () {
			return _cells.length;
		},
		get active () {
			return _active;
		},

		expand (x, y) {
			if (!x && !y) {
				_cells.push(_get_next_cell());
			} else {
				_cells.push([x, y]);
			}
			if (delay > 20) {
				window.clearInterval(interval);
				window.setInterval(_update_movement, delay--);
			}
		},
		kill () {
			_active = false;
		},
		intersects (snake) {
			return _cells.some(cell => {
				return snake.cells.some(cell2 =>
						cell[0] === cell2[0] && cell[1] === cell2[1]);
			});
		},
		intersects_self () {
			if (_cells
					.reduce((used, curr, i) => {
						if (used) {
							if (used.some(cell => cell[0] === curr[0]
									&& cell[1] === curr[1])) {
								return false;
							}

							const _used = used;
							_used.push(curr);
							return _used;
						} else {
							return used;
						}
					}, [])) {
				return false;
			}

			return true;
		},


		update () {
		},
		draw (ctx, grid) {
			_cells.forEach((cell, i) => {
				const [ x, y ] = grid.get_cell_coords(...cell);

				ctx.fillStyle = _color;
				ctx.globalAlpha = 0.2 + ((i + 1) * (0.8 / _cells.length));
				ctx.fillRect(x, y, grid.cell_size, grid.cell_size);
				ctx.globalAlpha = 1;
			})
		}
	}
}