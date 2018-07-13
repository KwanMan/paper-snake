import rough from 'roughjs/bin/rough';

function last(arr) {
  return arr[arr.length - 1];
}

var BLOCK = 20;
var WIDTH_IN_BLOCKS = 20;
var HEIGHT_IN_BLOCKS = 30;
var WIDTH = BLOCK * WIDTH_IN_BLOCKS;
var HEIGHT = BLOCK * HEIGHT_IN_BLOCKS;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function createLayer(mount, style) {
  var el = document.createElement('canvas');
  el.style.position = 'absolute';
  el.style.left = BLOCK + 'px';
  el.style.top = BLOCK + 'px';
  el.width = WIDTH;
  el.height = HEIGHT;
  mount.append(el);

  return { el: el, draw: draw };

  function draw(coordinates, overrideStyle) {
    el.getContext('2d').clearRect(0, 0, WIDTH, HEIGHT);
    coordinates = coordinates.map(function (_ref) {
      var x = _ref.x,
          y = _ref.y;
      return [x * BLOCK, y * BLOCK];
    });
    rough.canvas(el).polygon(coordinates, _extends({}, style, overrideStyle));
  }
}

function createBase(mount) {
  var layer = createLayer(mount);
  var el = layer.el;

  var ctx = el.getContext('2d');
  ctx.lineWidth = 0.2;
  var topOffset = 0;
  while (topOffset <= HEIGHT) {
    ctx.beginPath();
    ctx.moveTo(0, topOffset);
    ctx.lineTo(WIDTH, topOffset);
    ctx.stroke();
    topOffset += BLOCK;
  }
  var leftOffset = 0;
  while (leftOffset <= WIDTH) {
    ctx.beginPath();
    ctx.moveTo(leftOffset, 0);
    ctx.lineTo(leftOffset, HEIGHT);
    ctx.stroke();
    leftOffset += BLOCK;
  }
  return layer;
}

function clockwise(direction) {
  return {
    u: 'r',
    r: 'd',
    d: 'l',
    l: 'u',
    up: 'right',
    right: 'down',
    down: 'left',
    left: 'up'
  }[direction];
}

function anticlockwise(direction) {
  return {
    u: 'l',
    l: 'd',
    d: 'r',
    r: 'u',
    up: 'left',
    left: 'down',
    down: 'right',
    right: 'up'
  }[direction];
}

function opposite(direction) {
  return {
    u: 'd',
    d: 'u',
    l: 'r',
    r: 'l',
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  }[direction];
}

function stringify(_ref) {
  var x = _ref.x,
      y = _ref.y;

  return x + ',' + y;
}

function areEqual(a, b) {
  return a && b && stringify(a) === stringify(b);
}

function co(x, y) {
  return { x: x, y: y };
}

var translations = {
  d: function d(_ref2) {
    var x = _ref2.x,
        y = _ref2.y;
    var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return { x: x, y: y + steps };
  },
  u: function u(_ref3) {
    var x = _ref3.x,
        y = _ref3.y;
    var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return { x: x, y: y - steps };
  },
  l: function l(_ref4) {
    var x = _ref4.x,
        y = _ref4.y;
    var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return { x: x - steps, y: y };
  },
  r: function r(_ref5) {
    var x = _ref5.x,
        y = _ref5.y;
    var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return { x: x + steps, y: y };
  }
};

var translate = new Proxy(translations, {
  get: function get(obj, prop) {
    return obj[prop[0]];
  }
});

var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
function createCoordinateMap(width, height, initial) {
  var occupied = _extends$1({}, initial);

  var api = {
    set: function set(_ref, val) {
      var x = _ref.x,
          y = _ref.y;

      occupied[stringify({ x: x, y: y })] = val;
    },
    check: function check(_ref2) {
      var x = _ref2.x,
          y = _ref2.y;

      return !!occupied[stringify({ x: x, y: y })] || x >= width || y >= height || x < 0 || y < 0;
    },
    getFree: function getFree() {
      var coordinates = void 0;
      while (!coordinates || api.check(coordinates)) {
        coordinates = co(random(width - 1), random(height - 1));
      }
      return coordinates;
    }
  };
  return api;
}

function random(max) {
  return Math.floor(Math.random() * (max + 1));
}

function createWall(startCoordinates, startDirection) {
  var cmds = [startDirection];
  var coordinates = [startCoordinates, translate[startDirection](startCoordinates)];

  function getCoordinates() {
    return [].concat(coordinates);
  }
  function getCoordinatesReverse() {
    return getCoordinates().reverse();
  }

  function rotateFront(clockwise$$1) {
    var direction = last(cmds);
    var newDirection = clockwise$$1 ? clockwise(direction) : anticlockwise(direction);
    removeFront();
    addFront(newDirection);
  }

  function addFront(direction) {
    var newFrontCoordinate = translate[direction](coordinates[coordinates.length - 1]);
    if (last(cmds) === direction) {
      coordinates[coordinates.length - 1] = newFrontCoordinate;
    } else {
      coordinates.push(newFrontCoordinate);
    }
    cmds.push(direction);
  }

  function removeBack() {
    var direction = cmds[0];
    if (cmds[0] !== cmds[1]) {
      coordinates.shift();
    } else {
      coordinates[0] = translate[direction](coordinates[0]);
    }
    cmds.shift();
  }

  function removeFront() {
    var direction = last(cmds);
    if (last(cmds) !== cmds[cmds.length - 2]) {
      coordinates.pop();
    } else {
      var frontCoordinate = coordinates[coordinates.length - 1];
      var translateDirection = opposite(direction);
      var newFrontCoordinate = translate[translateDirection](frontCoordinate);
      coordinates[coordinates.length - 1] = newFrontCoordinate;
    }
    cmds.pop();
  }

  return {
    getCoordinates: getCoordinates,
    getCoordinatesReverse: getCoordinatesReverse,
    addFront: addFront,
    removeBack: removeBack,
    removeFront: removeFront,
    rotateFront: rotateFront,
    getCmds: function getCmds() {
      return [].concat(cmds);
    }
  };
}

var _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function createSnake() {
  var dead = false;
  var leftWall = createWall(co(2, 1), 'd');
  var rightWall = createWall(co(1, 1), 'd');
  var history = [{ coordinates: co(1, 1) }];

  var lastDirection = 'd';
  var occupied = createCoordinateMap(WIDTH_IN_BLOCKS, HEIGHT_IN_BLOCKS);
  occupied.set(co(1, 1), true);

  move('down', { extend: true });
  move('down', { extend: true });
  move('down', { extend: true });

  function move(direction) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        food = _ref.food,
        extend = _ref.extend;

    direction = direction[0];
    if (dead || opposite(direction) === lastDirection) {
      return getState();
    }
    var nextCoordinates = translate[direction](last(history).coordinates);
    if (occupied.check(nextCoordinates)) {
      dead = true;
      return _extends$2({
        died: true
      }, getState());
    }

    var foundFood = areEqual(food, nextCoordinates);
    // we need to remove the tail before adding to the head,
    // if not we could crash into the tail even though it
    // should be removed at the same time
    if (!(extend || foundFood)) {
      var _history$shift = history.shift(),
          walls = _history$shift.walls,
          coordinates = _history$shift.coordinates;

      walls.forEach(function (wall) {
        if (wall === 'l') {
          leftWall.removeBack();
        } else {
          rightWall.removeBack();
        }
      });
      occupied.set(coordinates, false);
    }

    if (direction === lastDirection) {
      leftWall.addFront(direction);
      rightWall.addFront(direction);
      history[history.length - 1].walls = ['l', 'r'];
    } else {
      var isClockwise = clockwise(lastDirection) === direction;
      var inner = isClockwise ? rightWall : leftWall;
      var outer = isClockwise ? leftWall : rightWall;

      inner.rotateFront(isClockwise);
      outer.addFront(direction);
      outer.addFront(direction);
      history[history.length - 1].walls = isClockwise ? ['l', 'l'] : ['r', 'r'];
    }
    history.push({ coordinates: nextCoordinates });
    lastDirection = direction;
    occupied.set(nextCoordinates, true);

    return _extends$2({
      ateFood: foundFood
    }, getState());
  }

  function getState() {
    return {
      occupied: occupied,
      coordinates: [].concat(_toConsumableArray(leftWall.getCoordinates()), _toConsumableArray(rightWall.getCoordinatesReverse()))
    };
  }

  return { move: move, getState: getState };
}

var keyMap = {
  37: 'left', // Left arrow
  38: 'up', // Up arrow
  39: 'right', // Right arrow
  40: 'down' // Down arrow
};

var SPACE_KEY = 32;

function start(mountNode) {
  createBase(mountNode);
  var snakeLayer = createLayer(mountNode, {
    fill: 'green',
    bowing: 0,
    roughness: 0.5,
    fillStyle: 'zigzag'
  });
  var foodLayer = createLayer(mountNode, {
    fill: 'orange',
    bowing: 1,
    roughness: 0.5,
    fillStyle: 'zigzag'
  });

  var snake = createSnake();

  var state = snake.getState();
  var foodLocation = state.occupied.getFree();

  var gameState = {
    currentDirection: 'down',
    lastDirection: 'down',
    started: false,
    paused: false,
    score: 0,
    tick: 100
  };

  var t = void 0;
  function begin() {
    gameState.started = true;
    setTimeout(function () {
      return nextTick({ begin: true });
    }, gameState.tick);
  }
  function nextTick() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        begin = _ref.begin;

    if (begin) {
      drawSnake(snake);
      drawFood();
    }

    var _snake$move = snake.move(gameState.currentDirection, {
      food: foodLocation
    }),
        ateFood = _snake$move.ateFood,
        died = _snake$move.died;

    gameState.lastDirection = gameState.currentDirection;
    if (died) {
      console.log('YOU LOSE');
      drawSnake(snake, { fill: 'red' });
      setTimeout(function () {
        return drawSnake(snake);
      }, 300);
      setTimeout(function () {
        return drawSnake(snake, { fill: 'red' });
      }, 600);
      setTimeout(function () {
        return drawSnake(snake);
      }, 900);
      setTimeout(function () {
        return drawSnake(snake, { fill: 'red' });
      }, 1200);
      return;
    }
    if (ateFood) {
      gameState.score++;
      gameState.tick = Math.max(calculateNewTick(gameState), 15);
      console.log('score: ' + gameState.score);
      console.log('tick: ' + gameState.tick);
      foodLocation = snake.getState().occupied.getFree();
      drawFood();
    }
    drawSnake(snake);
    if (!gameState.paused) t = setTimeout(nextTick, gameState.tick);
  }

  function pause() {
    gameState.paused = true;
    clearTimeout(t);
    drawSnake(snake, { fill: 'grey' });
    drawFood({ fill: 'grey' });
  }

  function unpause() {
    gameState.paused = false;
    drawSnake(snake, { fill: 'grey' });
    drawFood();
    t = setTimeout(nextTick, gameState.tick);
  }

  function calculateNewTick(_ref2) {
    var score = _ref2.score,
        tick = _ref2.tick;

    if (score < 25) return tick - 2;else if (score < 40) return tick - 1;else if (score < 65) return tick - 0.5;else return tick - 0.25;
  }

  document.onkeydown = function (e) {
    if (!gameState.started) {
      if (e.keyCode === SPACE_KEY) {
        begin();
      }
      return;
    }
    if (gameState.paused) {
      if (e.keyCode === SPACE_KEY) return unpause();
    } else {
      if (e.keyCode === SPACE_KEY) return pause();
      var direction = keyMap[e.keyCode];
      if (direction && opposite(gameState.lastDirection) !== direction) {
        e.preventDefault();
        gameState.currentDirection = direction;
      }
    }
  };

  function drawSnake(snake) {
    var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _snake$getState = snake.getState(),
        coordinates = _snake$getState.coordinates;

    snakeLayer.draw(coordinates, style);
  }

  function drawFood() {
    var style = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var polygonCoordinates = [foodLocation];['r', 'd', 'l'].forEach(function (direction) {
      var prev = last(polygonCoordinates);
      polygonCoordinates.push(translate[direction](prev));
    });
    foodLayer.draw(polygonCoordinates, style);
  }
}

export default start;
