(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SnakeGame = factory();
  }
})(this, function() {
  var SnakeGame = function(options, listners) {
    var ctx = createCtx(0, 0);

    Object.defineProperties(this, {
      _canvas: {
        value: ctx.canvas
      },
      _context: {
        value: ctx
      },
      _field: {
        value: {}
      },
      style: {
        value: {},
        enumerable: true,
        writable: true
      },
      sizes: {
        value: {},
        enumerable: true,
        writable: true
      },
      buttons: {
        value: {},
        enumerable: true,
        writable: true
      },
      progress: {
        value: {},
        enumerable: true,
        writable: true
      },
      events: {
        value: {},
        enumerable: true
      }
    });

    Object.defineProperty(this.events, 'trigger', {
      value: function(event) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 1);

        this.listners[event].apply(this, args);
      }
    });
    window.addEventListener('keydown', function(position) {
      Keydown.call(this, event);
    }.bind(this), true);

    var animationListner = function(position) {
      moveSnake.call(this, position);
    }.bind(this);

    var stepLevels = 10;
    var boxSize = 12;
    var startSnakeLength = 2;
    Object.defineProperties(this._field, {
      boxSize: {
        value: boxSize
      },
      startSnakeLength: {
        value: startSnakeLength
      },
      stepLevels: {
        value: stepLevels
      },
      animation: {
        value: new GameAnimation(stepLevels, animationListner)
      },
      snake: {
        writable: true
      },
      notification: {
        writable: true
      },
      food: {
        writable: true
      },
      mapRender: {
        writable: true
      },
      sumBoxX: {
        writable: true
      },
      sumBoxY: {
        writable: true
      }
    });

    var progressLevel;
    Object.defineProperties(this.progress, {
      length: {
        value: startSnakeLength + 1,
        enumerable: true,
        writable: true
      },
      score: {
        value: 0,
        enumerable: true,
        writable: true
      },
      level: {
        get: function() {
          return progressLevel;
        },
        set: function(value) {
          value = parseInt(value);
          if (value < 0) {
            throw new PropertyError('level');
          }

          progressLevel = value;
          return value;
        },
        enumerable: true
      }
    });

    this.setButtons(options.style);
    this.setStyle(options.style);
    this.setSizes(options);

    Object.defineProperty(this._field, 'maxLengthSnake', {
      value: this._field.sumBoxX
    });

    options.wrapper.appendChild(this._canvas);
  };
  SnakeGame.prototype.getProgress = function() {
    return {
      level: this.progress.level + 1,
      length: this.progress.length,
      score: this.progress.score
    };
  };
  SnakeGame.prototype.on = function(listners) {
    listners = listners || {};

    this.events.listners = {
      startGame: listners.startGame || function() {},
      gameOver: listners.gameOver || function() {},
      eatFood: listners.eatFood || function() {},
      completeLevel: listners.completeLevel || function() {}
    };
  };
  SnakeGame.prototype.off = function(event) {
    if (!event) {
      this.on();
      return;
    }

    this.events.listners[event] = function() {};
  };
  SnakeGame.prototype.setButtons = function(buttons) {
    buttons = buttons || {};

    Object.defineProperties(this.buttons, {
      left: {
        value: buttons.left || 'ArrowLeft',
        enumerable: true,
        writable: true
      },
      up: {
        value: buttons.up || 'ArrowUp',
        enumerable: true,
        writable: true
      },
      right: {
        value: buttons.right || 'ArrowRight',
        enumerable: true,
        writable: true
      },
      down: {
        value: buttons.down || 'ArrowDown',
        enumerable: true,
        writable: true
      },
      pause: {
        value: buttons.pause || 'Space',
        enumerable: true,
        writable: true
      }
    });
  };
  SnakeGame.prototype.setStyle = function(style) {
    style = style || {};

    style.snakeBody = style.snakeBody || {};
    style.snakeHead = style.snakeHead || {};
    style.food = style.food || {};
    style.stone = style.stone || {};

    Object.defineProperties(this.style, {
      snakeBody: {
        value: {
          fill: style.snakeBody.fill || '#19801c',
          stroke: style.snakeBody.stroke || '#dce80d'
        },
        enumerable: true,
        writable: true
      },
      snakeHead: {
        value: {
          fill: style.snakeHead.fill || '#09560b',
          stroke: style.snakeHead.stroke || '#e89a0d'
        },
        enumerable: true,
        writable: true
      },
      food: {
        value: {
          fill: style.food.fill || '#b74417',
          stroke: style.food.stroke || '#f96868'
        },
        enumerable: true,
        writable: true
      },
      stone: {
        value: {
          fill: style.stone.fill || '#797979',
          stroke: style.stone.stroke || '#000000'
        },
        enumerable: true,
        writable: true
      }
    });
  };
  SnakeGame.prototype.setSizes = function(original) {
    if (original.width > 640)
      original.width = 640;
    if (original.height > 480)
      original.height = 480;

    // calculate the number of boxes
    this._field.sumBoxX = parseInt(original.width / this._field.boxSize);
    this._field.sumBoxY = parseInt(original.height / this._field.boxSize);

    // correct the size relative to the number of boxes
    original.width = this._field.boxSize * this._field.sumBoxX;
    original.height = this._field.boxSize * this._field.sumBoxY;

    // change canvas size
    this._canvas.width = original.width;
    this._canvas.height = original.height;

    // save value of size
    this.sizes.width = original.width;
    this.sizes.height = original.height;
  };
  SnakeGame.prototype.getSizes = function() {
    return this.sizes;
  };
  SnakeGame.prototype.newGame = function() {
    this.progress.score = 0;
    this.nextLevel(0);

    this.events.trigger('startGame', this.getProgress());
  };
  SnakeGame.prototype.nextLevel = function(level) {
    if (level != null)
      this.progress.level = level;
    else
      this.progress.level++;

    this.progress.length = this._field.startSnakeLength;

    this.continueGame();
    this._field.snake = [];
    this._field.mapRender = {};
    this._field.food = null;

    // render level
    var width = this.sizes.width;
    var height = this.sizes.height;
    var levelCreator = new LevelCreator({
      level: this.progress.level,
      _field: this._field,
      style: this.style,
      width: width,
      height: height
    });
    var field = levelCreator.getGameField();

    this._context.clearRect(0, 0, width, height);
    this._context.drawImage(field, 0, 0);

    // start animation snake
    this._field.animation.start(this.progress.level, {
      start: this._field.snake[0],
      end: this._field.snake[1]
    });
  };
  SnakeGame.prototype.setNotification = function(value) {
    this._field.notification = value;
  };
  SnakeGame.prototype.getNotification = function() {
    return this._field.notification;
  };
  SnakeGame.prototype.stopGame = function() {
    this.setNotification('stopGame');
    this._field.animation.stop();
  };
  SnakeGame.prototype.continueGame = function() {
    this.setNotification('game');
  };

  var LevelCreator = function(options) {
    this._field = options._field;

    this.style = options.style;
    this.sumWalls = (options.level % this._field.stepLevels) * 5;

    this.ctx = createCtx(options.width, options.height);
    this.ctx.lineWidth = 1;

    this.mapGeneration = new MapGeneration();
    this.mapGeneration.create({
      maxX: this._field.sumBoxX,
      maxY: this._field.sumBoxY,
      mapRender: this._field.mapRender
    });
  };
  LevelCreator.prototype.getGameField = function() {
    this.generateBorderStones();
    this.generateRandomStones();
    this.generateSnake();
    this.generateFood();

    return this.ctx.canvas;
  };
  LevelCreator.prototype.generateBorderStones = function() {
    var ctx = this.ctx;
    ctx.fillStyle = this.style.stone.fill;
    ctx.strokeStyle = this.style.stone.stroke;

    var map = this.mapGeneration;

    var i, k;
    var x, y, length;
    for (k = 1; k < 4; k++) {
      x = this._field.sumBoxX - k;
      y = k - 1;
      length = this._field.sumBoxY - y;
      for (i = y; i < length; i++) {
        if (k === 1) {
          drawBox.call(this, ctx, k - 1, y, 'stone');
          drawBox.call(this, ctx, x, y, 'stone');
        }
        map.delCell((k - 1) + 'x' + y);
        map.delCell(x + 'x' + y);
        y++;
      }

      x = k;
      y = this._field.sumBoxY - k;
      length = this._field.sumBoxX - k;
      for (i = k; i < length; i++) {
        if (k === 1) {
          drawBox.call(this, ctx, x, k - 1, 'stone');
          drawBox.call(this, ctx, x, y, 'stone');
        }
        map.delCell(x + 'x' + (k - 1));
        map.delCell(x + 'x' + y);
        x++;
      }
    }
  };
  LevelCreator.prototype.generateRandomStones = function() {
    var ctx = this.ctx;
    ctx.fillStyle = this.style.stone.fill;
    ctx.strokeStyle = this.style.stone.stroke;

    var map = this.mapGeneration;

    var keys;
    var mapCell;

    var position;
    var route;

    var startWall, endWall;
    var maxLengthWall;

    var i, j;
    for (i = 0; i < this.sumWalls; i++) {
      // start position of the wall
      keys = map.getKeys();
      startWall = returnRandom(0, keys.length);
      startWall = map.getCell(keys[startWall]);
      if (!startWall) {
        return;
      }

      drawBox.call(this, ctx, startWall.x, startWall.y, 'stone');

      // remaining part of the wall
      endWall = {
        x: startWall.x,
        y: startWall.y
      };
      route = returnRandom(0, 4);
      maxLengthWall = returnRandom(1, this._field.sumBoxY - 7);

      for (j = 0; j < maxLengthWall; j++) {
        // TODO rotate walls
        //
        // k = startRoute;
        // do {
        //   k %= 4;
        //   route = k++;
        position = returnPositionRoute(route, endWall);
        mapCell = map.getCell(position.x + 'x' + position.y);
        // } while (k !== startRoute && !mapCell);
        if (mapCell) {
          endWall.x = position.x;
          endWall.y = position.y;
          drawBox.call(this, ctx, endWall.x, endWall.y, 'stone');
          // startRoute = route;
        } else {
          break;
        }
      }
      map.delRect(startWall, endWall, route);
    }
  };
  LevelCreator.prototype.generateSnake = function() {
    // TODO fix for long startSnakeLength
    // Happens when the snake is generated into itself

    var ctx = this.ctx;
    var box = this._field.boxSize;

    // draw head of snake
    ctx.fillStyle = this.style.snakeHead.fill;
    ctx.strokeStyle = this.style.snakeHead.stroke;

    var position = returnPositionRandom.call(this);
    drawBox.call(this, ctx, position.x, position.y, 'snakeHead');
    this._field.snake.push(position);

    // draw body of snake
    ctx.fillStyle = this.style.snakeBody.fill;
    ctx.strokeStyle = this.style.snakeBody.stroke;

    var startPosition;
    var i, k;
    for (i = 0; i < this._field.startSnakeLength; i++) {
      startPosition = position;
      k = returnRandom(0, 4);

      do {
        position = returnPositionRoute(k, startPosition);
        k++;
        k %= 4;
      } while (this._field.mapRender[position.x + 'x' + position.y]);

      drawBox.call(this, ctx, position.x, position.y, 'snakeBody');
      this._field.snake.push(position);
    }
  };
  LevelCreator.prototype.generateFood = function() {
    generateFood.call(this, this.ctx);
  };

  var MapGeneration = function() {
    Object.defineProperty(this, 'cells', {
      writable: true
    });
  };
  MapGeneration.prototype.create = function(options) {
    this.cells = {};

    var position;
    var i = 0;
    var x, y;
    for (x = 0; x < options.maxX; x++) {
      for (y = 0; y < options.maxY; y++) {
        position = x + 'x' + y;
        if (!options.mapRender[position]) {
          this.addCell(position);
        }
      }
    }
  };
  MapGeneration.prototype.getCell = function(key) {
    return this.cells[key];
  };
  MapGeneration.prototype.addCell = function(key) {
    var position = key.split('x');
    this.cells[key] = {
      x: parseInt(position[0]),
      y: parseInt(position[1])
    };
  };
  MapGeneration.prototype.delCell = function(key) {
    delete this.cells[key];
  };
  MapGeneration.prototype.getKeys = function() {
    return Object.keys(this.cells);
  };
  MapGeneration.prototype.delRect = function(positionStart, positionEnd, route) {
    var radius = 2;
    var start, end;
    if (route === 2 || route === 3) {
      start = positionStart;
      end = positionEnd;
    } else {
      start = positionEnd;
      end = positionStart;
    }

    start.x -= radius;
    start.y -= radius;
    end.x += radius + 1;
    end.y += radius + 1;

    var x, y;
    for (x = start.x; x < end.x; x++) {
      for (y = start.y; y < end.y; y++) {
        this.delCell(x + 'x' + y);
      }
    }
  };

  var GameAnimation = function(stepLevels, handler) {
    Object.defineProperties(this, {
      stepLevels: {
        value: stepLevels
      },
      trigger: {
        value: function(handler) {
          this.timer = setTimeout(this.trigger, this.speed);

          var position = returnPositionRoute(this.route, this.position);
          this.position = position;

          if (handler)
            handler(position);
          return position;
        }.bind(this, handler)
      },
      startGameSpeed: {
        value: 1000
      },
      speedKeyDown: {
        value: -100
      },
      timer: {
        value: null,
        writable: true
      },
      route: {
        value: null,
        writable: true
      },
      speed: {
        value: 1000,
        writable: true
      },
      step: {
        writable: true
      },
      position: {
        writable: true
      }
    });
  };
  GameAnimation.prototype.getRoute = function(position) {
    this.position = position.start;

    var x = position.start.x - position.end.x;
    var y = position.start.y - position.end.y;
    if (x < 0)
      this.route = 'left'
    else if (x > 0)
      this.route = 'right';
    else if (y < 0)
      this.route = 'up';
    else if (y > 0)
      this.route = 'down';
  };
  GameAnimation.prototype.setRoute = function(route) {
    this.stop();
    this.route = route;
    this.continue();
  };
  GameAnimation.prototype.start = function(level, position) {
    var step = level % this.stepLevels;
    this.speed = this.startGameSpeed - (level - step) / this.stepLevels * 100;
    if (this.speed < 1)
      this.speed = 1;

    this.getRoute(position);
  };
  GameAnimation.prototype.continue = function() {
    this.trigger();
  };
  GameAnimation.prototype.stop = function() {
    clearTimeout(this.timer);
    this.timer = null;
  };

  function moveSnake(position) {
    var nextPosition = this._field.mapRender[position.x + 'x' + position.y];
    var tail = this._field.snake[this._field.snake.length - 1];
    if (position.x === tail.x && position.y === tail.y)
      nextPosition = 'default';

    switch (nextPosition) {
      case 'stone':
      case 'snakeBody':
        this._field.animation.stop();
        this.setNotification('gameOver');
        this.events.trigger('gameOver', this.getProgress());
        break;
      case 'food':
        var food = this._field.food;
        clearBox.call(this, this._context, food.x, food.y);

        moveHead.call(this, position);
        computeScore.call(this);

        if (this._field.snake.length > this._field.maxLengthSnake) {
          this._field.animation.stop();
          this.nextLevel();
          this.events.trigger('completeLevel', this.getProgress());
          return;
        }

        generateFood.call(this, this._context);
        this.events.trigger('eatFood', this.getProgress());
        break;
      default:
        moveTail.call(this);
        moveHead.call(this, position);
        break;
    }
  }

  function computeScore() {
    this.progress.length = this._field.snake.length;

    var level = this.progress.level + 1;
    var step = level % this._field.stepLevels;
    this.progress.score += (level - step) / this._field.stepLevels * 10 + 10;
  }

  function moveHead(position) {
    var box = this._field.boxSize;

    var snakeHead = this._field.snake[0];
    drawSnakeBody.call(this, this._context, snakeHead.x, snakeHead.y);

    this._field.snake.unshift(position);
    drawSnakeHead.call(this, this._context, position.x, position.y);
  }

  function moveTail() {
    var bodyEnd = this._field.snake[this._field.snake.length - 1];
    clearBox.call(this, this._context, bodyEnd.x, bodyEnd.y);
    this._field.snake.pop();
  }

  function Keydown(event) {
    if (this.getNotification() === 'gameOver' ||
      this.getNotification() === 'stopGame') {
      return false;
    }

    var key = correctKeysName(event.key);
    var animation = this._field.animation;

    switch (key) {
      case this.buttons.pause:
        if (animation.timer) {
          this.setNotification('pause');
          this._field.animation.stop();
        } else {
          this.continueGame();
          this._field.animation.continue();
        }
        break;
      case this.buttons.left:
        if (animation.route !== 'right') {
          this._field.animation.setRoute('left');
        }
        break;
      case this.buttons.up:
        if (animation.route !== 'down') {
          this._field.animation.setRoute('up');
        }
        break;
      case this.buttons.right:
        if (animation.route !== 'left') {
          this._field.animation.setRoute('right');
        }
        break;
      case this.buttons.down:
        if (animation.route !== 'up') {
          this._field.animation.setRoute('down');
        }
        break;
      default:
        return key;
    }
  }

  function returnRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function returnPositionRoute(route, startPosition) {
    var position = {
      x: startPosition.x,
      y: startPosition.y
    };

    switch (route) {
      case 0:
      case 'left':
        position.x--;
        return position;
      case 1:
      case 'up':
        position.y--;
        return position;
      case 2:
      case 'right':
        position.x++;
        return position;
      case 3:
      case 'down':
        position.y++;
        return position;
    }
  }

  function returnPositionRandom() {
    var position;
    do {
      position = {
        x: returnRandom(1, this._field.sumBoxX - 1),
        y: returnRandom(1, this._field.sumBoxY - 1)
      };
    } while (this._field.mapRender[position.x + 'x' + position.y]);

    return position;
  }

  function drawStone(ctx, x, y) {
    ctx.fillStyle = this.style.snakeHead.fill;
    ctx.strokeStyle = this.style.snakeHead.stroke;

    drawBox.call(this, ctx, x, y, 'stone');
  }

  function drawSnakeHead(ctx, x, y) {
    ctx.fillStyle = this.style.snakeHead.fill;
    ctx.strokeStyle = this.style.snakeHead.stroke;

    drawBox.call(this, ctx, x, y, 'snakeHead');
  }

  function drawSnakeBody(ctx, x, y) {
    ctx.fillStyle = this.style.snakeBody.fill;
    ctx.strokeStyle = this.style.snakeBody.stroke;

    drawBox.call(this, ctx, x, y, 'snakeBody');
  }

  function generateFood(ctx) {
    var position = returnPositionRandom.call(this);
    this._field.food = position;

    drawFood.call(this, ctx, position.x, position.y);
  }

  function drawFood(ctx, x, y) {
    ctx.fillStyle = this.style.food.fill;
    ctx.strokeStyle = this.style.food.stroke;

    drawBox.call(this, ctx, x, y, 'food');
  }

  function drawBox(ctx, x, y, name) {
    var position = x + 'x' + y;
    this._field.mapRender[position] = name;
    this._field.mapRender[position] = name;

    var box = this._field.boxSize;
    x *= box;
    y *= box;
    ctx.fillRect(x, y, box, box);
    ctx.strokeRect(x + 1, y + 1, box - 2, box - 2);
  }

  function clearBox(ctx, x, y) {
    var position = x + 'x' + y;
    delete this._field.mapRender[position]

    var box = this._field.boxSize;
    x *= box;
    y *= box;
    this._context.clearRect(x, y, box, box);
  }

  function createCtx(w, h) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;

    return ctx;
  }

  function correctKeysName(key) {
    switch (key) {
      case 'ArrowDown':
      case 'Down':
        return 'ArrowDown';
      case 'ArrowUp':
      case 'Up':
        return 'ArrowUp';
      case 'ArrowLeft':
      case 'Left':
        return 'ArrowLeft';
      case 'ArrowRight':
      case 'Right':
        return 'ArrowRight';
      case 'Escape':
      case 'Esc':
        return 'Esc';
      case ' ':
      case 'Spacebar':
        return 'Space';
      default:
        return key;
    }
  }

  function PropertyError(property) {
    this.name = 'PropertyError';

    this.property = property;
    this.message = 'Error in property "' + property + '"';

    switch (property) {
      case 'level':
        this.message += '. It should be > 0';
        break;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PropertyError);
    } else {
      this.stack = (new Error()).stack;
    }
  }
  PropertyError.prototype = Object.create(Error.prototype);

  return SnakeGame;
});