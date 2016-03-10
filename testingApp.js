/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var MovingObject = __webpack_require__ (1);
	var Util = __webpack_require__ (2);
	var Game = __webpack_require__(3);
	var GameView = __webpack_require__(6);
	var Player = __webpack_require__(4);


	var canvas = document.getElementById('game-canvas');
	var ctx = canvas.getContext('2d');
	var game = new Game();
	var gameView = new GameView(ctx, game);

	gameView.start();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__ (2);

	function MovingObject(options) {
	  this.pos = options.pos;
	  this.vel = options.vel;
	  this.radius = options.radius;
	  this.color = options.color;
	  this.game = options.game;
	}

	MovingObject.prototype.draw = function(ctx) {
	  ctx.fillStyle = this.color;
	  ctx.beginPath();
	  ctx.arc(this.pos[0], this.pos[1], this.radius, 2 * Math.PI, 0, true);
	  ctx.fill();
	  ctx.lineWidth = 1;
	  ctx.strokeStyle = 'white';
	  ctx.stroke();
	};

	MovingObject.prototype.move = function() {
	  this.pos[0] += this.vel[0];
	  this.pos[1] += this.vel[1];
	};

	MovingObject.prototype.wrap = function () {
	  var outOfBounds = this.game.isOutOfBounds(this.pos);
	  if (outOfBounds === 'X') {
	      this.vel[0] = this.vel[0] * -1;
	  } else if (outOfBounds === 'Y') {
	      this.vel[1] = this.vel[1] * -1;
	  }
	};

	MovingObject.prototype.isCollidedWith = function(otherObject) {
	  return utils.distanceBetween(this.pos, otherObject.pos) <
	                              (this.radius + otherObject.radius);
	};

	module.exports = MovingObject;


/***/ },
/* 2 */
/***/ function(module, exports) {

	function getRandomIntInclusive(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var Utils = {
	  inherits: function (ChildClass, ParentClass) {
	    function Surrogate() {}
	    Surrogate.prototype = ParentClass.prototype;
	    ChildClass.prototype = new Surrogate;
	    ChildClass.prototype.constructor = ChildClass;
	  },

	  randomVect: function (length) {
	    var randX = length * Math.random();
	    var randY = Math.sqrt(Math.pow(length, 2) - Math.pow(randX, 2));
	    randY = randY * [-1,1][getRandomIntInclusive(0,1)];
	    randX = randX * [-1,1][getRandomIntInclusive(0,1)];
	    return [randX,randY];
	  },

	  distanceBetween: function(pos1, pos2) {
	    var xDistance = Math.abs(pos1[0] - pos2[0]);
	    var yDistance = Math.abs(pos1[1] - pos2[1]);
	    var tDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
	    return tDistance;
	  }
	};

	module.exports = Utils;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Player = __webpack_require__(4);
	var utils = __webpack_require__(3);
	var Bullet = __webpack_require__(5);

	function Game() {
	  this.dimX = 1000;
	  this.dimY = 800;
	  this.player1 = new Player(this, [100, 400], 0, "green");
	  this.player2 = new Player(this, [900, 400], Math.PI, "blue");
	  this.player1.setOpponent(this.player2);
	  this.player2.setOpponent(this.player1);
	  this.over = false;
	  this.map = [
	              [5, 2], [5, 3], [5, 4], [5, 5], [4, 5], [3, 5], [2, 5],
	              [5, 13], [5, 12], [5, 11], [5, 10], [4, 10], [3, 10], [2, 10],
	              [14, 2], [14, 3], [14, 4], [14, 5], [15, 5], [16, 5], [17, 5],
	              [14, 13], [14, 12], [14, 11], [14, 10], [15, 10], [16, 10], [17, 10],
	              [9, 7], [10, 7], [9, 8], [10, 8]
	             ];
	  this.wallTiler();
	  this.wallSprite = new Image();
	  this.wallSprite.src = './sprite-sheet.png';
	  this.groundTile = new Image();
	  this.groundTile.src = './dirt.png';
	  this.bullets = [];
	}

	Game.prototype.wallTiler = function () {
	  this.wallTiles = [];
	  var validWalls = [2, 2, 2, 4, 4, 4, 6, 7];
	  for (var i = 0; i < this.map.length; i++) {
	    var wallInd = Math.floor(Math.random() * 8);
	    this.wallTiles.push(validWalls[wallInd]);
	  }
	};

	Game.prototype.draw = function (ctx) {
	  this.drawGround(ctx);
	  this.drawScore(ctx);
	  for (i = 0; i < this.bullets.length; i++) {
	    this.bullets[i].draw(ctx);
	  }
	  this.player1.draw(ctx);
	  this.player2.draw(ctx);
	  for (var i = 0; i < this.map.length; i++) {
	    var wall = this.map[i];
	    wallInd = this.wallTiles[i];

	    ctx.drawImage(this.wallSprite,
	      wallInd * 84,
	      3 * 84,
	      84,
	      84,
	      wall[0] * 50,
	      wall[1] * 50,
	      50,
	      50
	    );
	  }
	};

	Game.prototype.drawScore = function (ctx) {
	  ctx.fillStyle = 'white';
	  ctx.fillRect(0, this.dimY, this.dimX, 50);
	  ctx.font = '30px sans-serif';
	  ctx.fillStyle = 'black';
	  ctx.fillText("Player 1 lives: " + this.player1.lives, 50, this.dimY + 35);
	  ctx.fillText("Player 2 lives: " + this.player2.lives, this.dimX - 265, this.dimY + 35);
	};

	Game.prototype.drawGround = function (ctx) {
	  for (var x = 0; x < 4; x++) {
	    for (var y = 0; y < 4; y++) {
	      ctx.drawImage(
	        this.groundTile,
	        x * 256,
	        y * 256,
	        256,
	        256
	      );
	    }
	  }
	};

	Game.prototype.step = function (ctx) {
	  this.player1.step();
	  this.player2.step();
	  var remainingBullets = [];
	  for (var i = 0; i < this.bullets.length; i++) {
	    var bulletStep = this.bullets[i].step(this.player1.getPos(), this.player2.getPos());
	    if (bulletStep === "air") {
	      remainingBullets.push(this.bullets[i]);
	    } else if (bulletStep === "player1") {
	      this.player1.hit();
	    } else if (bulletStep === "player2") {
	      this.player2.hit();
	    }
	  }
	  this.bullets = remainingBullets;
	  if (this.player1.lives === 0 || this.player2.lives === 0) {
	    this.over = true;
	  }
	};

	Game.prototype.newBullet = function (bullet) {
	  this.bullets.push(bullet);
	};

	Game.prototype.end = function() {
	  this.over = true;
	};

	module.exports = Game;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var Bullet = __webpack_require__(5);

	function Player(game, initialPosition, initialDirection, color) {
	  this.spawnLoc = initialPosition;
	  this.game = game;
	  this.posX = initialPosition[0];
	  this.posY = initialPosition[1];
	  this.spawnDirection = initialDirection;
	  this.direction = initialDirection;
	  this.lives = 3;
	  if (color === "green") {
	    this.spriteArray = [1, 2, 3, 4, 5, 6, 7, 8];
	  } else {
	    this.spriteArray = [9, 10, 11, 12, 13, 14, 15, 16];
	  }
	  this.spriteIndex = 0;
	  this.spriteSheet = new Image();
	  this.spriteSheet.src = './sprite-sheet.png';
	  this.speed = 2.5;
	  this.fireDelay = 0;
	  this.invuln = 0;
	  this.flash = 0;
	  this.spriteTime = 80;
	}

	Player.prototype.setOpponent = function (otherPlayer) {
	  this.otherPlayer = otherPlayer;
	};

	Player.prototype.getPos = function () {
	  return [this.posX, this.posY];
	};

	Player.prototype.draw = function (ctx) {
	  ctx.translate(this.posX, this.posY);
	  ctx.rotate(this.direction + (Math.PI / 2));
	  if (this.flash < 200) {

	    ctx.drawImage(this.spriteSheet,
	      ((this.spriteArray[this.spriteIndex] % 8) * 84) + 2,
	      (Math.floor(this.spriteArray[this.spriteIndex] / 8) * 84) + 2,
	      80,
	      80,
	      -80 / 2,
	      -80 / 2,
	      80,
	      80);

	    // ctx.fillRect(-25, -25, 50, 50);
	    // ctx.fillRect(-33, -30, 16, 60);
	    // ctx.fillRect(18, -30, 16, 60);
	    // ctx.fillRect(-5, -45, 10, 20);
	  }

	  ctx.setTransform(1, 0, 0, 1, 0, 0);
	};

	Player.prototype.collision = function () {
	  var dX = this.posX - this.otherPlayer.posX;
	  var dY = this.posY - this.otherPlayer.posY;
	  var distance = Math.sqrt(dX * dX + dY * dY);
	  if (distance < 60) {
	    return true;
	  }
	  var map = this.game.map;
	  for (var i = 0; i < map.length; i++) {
	    var obstacle = map[i];
	    if (
	      this.inside([this.posX+30, this.posY+30], obstacle) ||
	      this.inside([this.posX-30, this.posY+30], obstacle) ||
	      this.inside([this.posX-30, this.posY-30], obstacle) ||
	      this.inside([this.posX+30, this.posY-30], obstacle) ||
	      this.inside([this.posX, this.posY-30], obstacle) ||
	      this.inside([this.posX, this.posY+30], obstacle) ||
	      this.inside([this.posX+30, this.posY], obstacle) ||
	      this.inside([this.posX-30, this.posY], obstacle)
	    ) {
	      return true;
	    }
	  }
	  return false;
	};

	Player.prototype.inside = function (checkPnt, obstacle) {
	  if (checkPnt[0] > obstacle[0] * 50 && checkPnt[0] < obstacle[0] * 50 + 50) {
	    if (checkPnt[1] > obstacle[1] * 50 && checkPnt[1] < obstacle[1] * 50 + 50) {
	      return true;
	    }
	  }
	  return false;
	};

	Player.prototype.moveForward = function() {
	  this.posX += Math.cos(this.direction) * this.speed;
	  this.posY += Math.sin(this.direction) * this.speed;
	  if (this.collision()) {
	    this.posX -= Math.cos(this.direction) * this.speed;
	    if (this.collision()) {
	      this.posX += Math.cos(this.direction) * this.speed;
	      this.posY -= Math.sin(this.direction) * this.speed;
	      if (this.collision()) {
	        this.posY -= Math.sin(this.direction) * this.speed;
	        this.posX -= Math.cos(this.direction) * this.speed;
	      }
	    }
	  }
	  if (this.posX < 30) {
	    this.posX = 30;
	  }
	  if (this.posX > 970) {
	    this.posX = 970;
	  }
	  if (this.posY < 30) {
	    this.posY = 30;
	  }
	  if (this.posY > 770) {
	    this.posY = 770;
	  }

	  this.spriteTime -= 20;
	  if (this.spriteTime <= 0) {
	    this.spriteIndex = (this.spriteIndex + 1) % 8;
	    this.spriteTime = 80;
	  }
	};

	Player.prototype.moveBackward = function() {
	  var backwardsPenalty = 0.5;
	  this.posX -= Math.cos(this.direction) * (this.speed * backwardsPenalty);
	  this.posY -= Math.sin(this.direction) * (this.speed * backwardsPenalty);
	  if (this.collision()) {
	    this.posX += Math.cos(this.direction) * (this.speed * backwardsPenalty);
	    if (this.collision()) {
	      this.posX -= Math.cos(this.direction) * (this.speed * backwardsPenalty);
	      this.posY += Math.sin(this.direction) * (this.speed * backwardsPenalty);
	      if (this.collision()) {
	        this.posY += Math.sin(this.direction) * (this.speed * backwardsPenalty);
	        this.posX += Math.cos(this.direction) * (this.speed * backwardsPenalty);
	      }
	    }
	  }
	  if (this.posX < 25) {
	    this.posX = 25;
	  }
	  if (this.posX > 975) {
	    this.posX = 975;
	  }
	  if (this.posY < 25) {
	    this.posY = 25;
	  }
	  if (this.posY > 775) {
	    this.posY = 775;
	  }

	  this.spriteTime += 10;
	  if (this.spriteTime >= 80) {
	    this.spriteIndex = (this.spriteIndex + 7) % 8;
	    this.spriteTime = 0;
	  }
	};

	Player.prototype.turn = function(rotation) {
	  this.direction += rotation;
	};

	Player.prototype.step = function () {
	  if (this.fireDelay > 0 ) {
	    this.fireDelay -= 20;
	  }

	  if (this.invuln > 0) {
	    this.invuln -= 20;
	    if (this.flash <= 0) {
	      this.flash = 400;
	    }
	    this.flash -= 20;
	  } else {
	    this.flash = 0;
	  }

	};

	Player.prototype.fire = function () {
	  if (this.fireDelay <= 0) {
	    this.game.newBullet(new Bullet(
	      this.game,
	      [this.posX + (Math.cos(this.direction) * 40), this.posY + (Math.sin(this.direction) * 40)],
	      this.direction
	    ));
	    this.fireDelay = 600;
	  }
	};

	Player.prototype.hit = function () {
	  if (this.invuln <= 0) {
	    this.lives -= 1;
	    this.posX = this.spawnLoc[0];
	    this.posY = this.spawnLoc[1];
	    this.direction = this.spawnDirection;
	    this.invuln = 2500;
	  }
	};

	module.exports = Player;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);

	function Bullet(game, initialPosition, direction) {
	  this.game = game;
	  this.posX = initialPosition[0];
	  this.posY = initialPosition[1];
	  this.direction = direction;
	  this.color = '#fff';
	  this.speed = 7;
	  this.bulletImage = new Image();
	  this.bulletImage.src = "./sprite-sheet.png";
	}

	Bullet.prototype.draw = function (ctx) {
	  ctx.translate(this.posX, this.posY);
	  ctx.rotate(this.direction + (Math.PI / 2));
	  ctx.fillStyle = this.color;

	  ctx.drawImage(this.bulletImage, (5 * 84) + 10, (2 * 84) + 10, 64, 64, -64 / 2, -64 / 2, 64, 64);

	  ctx.setTransform(1, 0, 0, 1, 0, 0);
	};

	Bullet.prototype.collision = function () {
	  var map = this.game.map;
	  for (var i = 0; i < map.length; i++) {
	    var obstacle = map[i];
	    if (
	      this.inside([this.posX, this.posY-5], obstacle) ||
	      this.inside([this.posX, this.posY+5], obstacle) ||
	      this.inside([this.posX+5, this.posY], obstacle) ||
	      this.inside([this.posX-5, this.posY], obstacle)
	    ) {
	      return true;
	    }
	  }
	  return false;
	};

	Bullet.prototype.inside = function (checkPnt, obstacle) {
	  if (checkPnt[0] > obstacle[0] * 50 && checkPnt[0] < obstacle[0] * 50 + 50) {
	    if (checkPnt[1] > obstacle[1] * 50 && checkPnt[1] < obstacle[1] * 50 + 50) {
	      return true;
	    }
	  }
	  return false;
	};

	Bullet.prototype.insidePlayer = function (checkPnt, player) {
	  if (checkPnt[0] > player[0] - 25 && checkPnt[0] < player[0] + 25) {
	    if (checkPnt[1] > player[1] - 25 && checkPnt[1] < player[1] + 25) {
	      return true;
	    }
	  }
	  return false;
	};

	Bullet.prototype.step = function (player1, player2) {
	  this.posX += Math.cos(this.direction) * this.speed;
	  this.posY += Math.sin(this.direction) * this.speed;
	  if (
	    this.insidePlayer([this.posX, this.posY-5], player1) ||
	    this.insidePlayer([this.posX, this.posY+5], player1) ||
	    this.insidePlayer([this.posX+5, this.posY], player1) ||
	    this.insidePlayer([this.posX-5, this.posY], player1)
	  ) {
	    return "player1"
	  };
	  if (
	    this.insidePlayer([this.posX, this.posY-5], player2) ||
	    this.insidePlayer([this.posX, this.posY+5], player2) ||
	    this.insidePlayer([this.posX+5, this.posY], player2) ||
	    this.insidePlayer([this.posX-5, this.posY], player2)
	  ) {
	    return "player2"
	  };
	  if (this.collision()) {
	    return "wall";
	  }
	  if (this.posX < 5) {
	    return "wall";
	  }
	  if (this.posX > 995) {
	    return "wall";
	  }
	  if (this.posY < 5) {
	    return "wall";
	  }
	  if (this.posY > 795) {
	    return "wall";
	  }
	  return "air";
	};

	module.exports = Bullet;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(3);
	var key = __webpack_require__(7);

	function GameView(ctx, game) {
	  this.game = game;
	  this.ctx = ctx;
	  this.player1 = this.game.player1;
	  this.player2 = this.game.player2;
	}

	GameView.prototype.start = function() {
	  var gameLoop = setInterval(function(renderOver) {
	    this.checkKey();
	    this.game.step();
	    this.game.draw(this.ctx);
	    if (this.game.over) {
	      this.renderOver();
	      clearInterval(gameLoop);
	    }
	  }.bind(this), 20)
	};

	GameView.prototype.renderOver = function () {
	  this.ctx.fillStyle = 'black';
	  this.ctx.fillRect(this.game.dimX / 4, this.game.dimY / 4,
	    this.game.dimX / 2, this.game.dimY / 2);

	  this.ctx.font="50px Courier";
	  this.ctx.fillStyle = "white";
	  if (this.game.player1.lives === 0) {
	    this.ctx.fillText('Player 2 wins!', 285, this.game.dimY / 2);
	  } else {
	    this.ctx.fillText('Player 1 wins!', 285, this.game.dimY / 2);
	  }
	};

	GameView.prototype.checkKey = function () {

	  //Player 1 controls
	  if (key.isPressed('w')) {
	    this.player1.moveForward();
	  }

	  if (key.isPressed('s')) {
	    this.player1.moveBackward();
	  }

	  if (key.isPressed('a')) {
	    this.player1.turn(-Math.PI/64);
	  }

	  if (key.isPressed('d')) {
	    this.player1.turn(Math.PI/64);
	  }

	  if (key.shift) {
	    this.player1.fire();
	  }

	  //Player 2 controls
	  if (key.isPressed('i')) {
	    this.player2.moveForward();
	  }

	  if (key.isPressed('k')) {
	    this.player2.moveBackward();
	  }

	  if (key.isPressed('j')) {
	    this.player2.turn(-Math.PI/64);
	  }

	  if (key.isPressed('l')) {
	    this.player2.turn(Math.PI/64);
	  }

	  if (key.isPressed('space')) {
	    this.player2.fire();
	  }

	  if (key.isPressed('q')) {
	    this.game.end();
	  }
	};

	module.exports = GameView;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	//     keymaster.js
	//     (c) 2011-2013 Thomas Fuchs
	//     keymaster.js may be freely distributed under the MIT license.

	;(function(global){
	  var k,
	    _handlers = {},
	    _mods = { 16: false, 18: false, 17: false, 91: false },
	    _scope = 'all',
	    // modifier keys
	    _MODIFIERS = {
	      '⇧': 16, shift: 16,
	      '⌥': 18, alt: 18, option: 18,
	      '⌃': 17, ctrl: 17, control: 17,
	      '⌘': 91, command: 91
	    },
	    // special keys
	    _MAP = {
	      backspace: 8, tab: 9, clear: 12,
	      enter: 13, 'return': 13,
	      esc: 27, escape: 27, space: 32,
	      left: 37, up: 38,
	      right: 39, down: 40,
	      del: 46, 'delete': 46,
	      home: 36, end: 35,
	      pageup: 33, pagedown: 34,
	      ',': 188, '.': 190, '/': 191,
	      '`': 192, '-': 189, '=': 187,
	      ';': 186, '\'': 222,
	      '[': 219, ']': 221, '\\': 220
	    },
	    code = function(x){
	      return _MAP[x] || x.toUpperCase().charCodeAt(0);
	    },
	    _downKeys = [];

	  for(k=1;k<20;k++) _MAP['f'+k] = 111+k;

	  // IE doesn't support Array#indexOf, so have a simple replacement
	  function index(array, item){
	    var i = array.length;
	    while(i--) if(array[i]===item) return i;
	    return -1;
	  }

	  // for comparing mods before unassignment
	  function compareArray(a1, a2) {
	    if (a1.length != a2.length) return false;
	    for (var i = 0; i < a1.length; i++) {
	        if (a1[i] !== a2[i]) return false;
	    }
	    return true;
	  }

	  var modifierMap = {
	      16:'shiftKey',
	      18:'altKey',
	      17:'ctrlKey',
	      91:'metaKey'
	  };
	  function updateModifierKey(event) {
	      for(k in _mods) _mods[k] = event[modifierMap[k]];
	  };

	  // handle keydown event
	  function dispatch(event) {
	    var key, handler, k, i, modifiersMatch, scope;
	    key = event.keyCode;

	    if (index(_downKeys, key) == -1) {
	        _downKeys.push(key);
	    }

	    // if a modifier key, set the key.<modifierkeyname> property to true and return
	    if(key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
	    if(key in _mods) {
	      _mods[key] = true;
	      // 'assignKey' from inside this closure is exported to window.key
	      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = true;
	      return;
	    }
	    updateModifierKey(event);

	    // see if we need to ignore the keypress (filter() can can be overridden)
	    // by default ignore key presses if a select, textarea, or input is focused
	    if(!assignKey.filter.call(this, event)) return;

	    // abort if no potentially matching shortcuts found
	    if (!(key in _handlers)) return;

	    scope = getScope();

	    // for each potential shortcut
	    for (i = 0; i < _handlers[key].length; i++) {
	      handler = _handlers[key][i];

	      // see if it's in the current scope
	      if(handler.scope == scope || handler.scope == 'all'){
	        // check if modifiers match if any
	        modifiersMatch = handler.mods.length > 0;
	        for(k in _mods)
	          if((!_mods[k] && index(handler.mods, +k) > -1) ||
	            (_mods[k] && index(handler.mods, +k) == -1)) modifiersMatch = false;
	        // call the handler and stop the event if neccessary
	        if((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
	          if(handler.method(event, handler)===false){
	            if(event.preventDefault) event.preventDefault();
	              else event.returnValue = false;
	            if(event.stopPropagation) event.stopPropagation();
	            if(event.cancelBubble) event.cancelBubble = true;
	          }
	        }
	      }
	    }
	  };

	  // unset modifier keys on keyup
	  function clearModifier(event){
	    var key = event.keyCode, k,
	        i = index(_downKeys, key);

	    // remove key from _downKeys
	    if (i >= 0) {
	        _downKeys.splice(i, 1);
	    }

	    if(key == 93 || key == 224) key = 91;
	    if(key in _mods) {
	      _mods[key] = false;
	      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = false;
	    }
	  };

	  function resetModifiers() {
	    for(k in _mods) _mods[k] = false;
	    for(k in _MODIFIERS) assignKey[k] = false;
	  };

	  // parse and assign shortcut
	  function assignKey(key, scope, method){
	    var keys, mods;
	    keys = getKeys(key);
	    if (method === undefined) {
	      method = scope;
	      scope = 'all';
	    }

	    // for each shortcut
	    for (var i = 0; i < keys.length; i++) {
	      // set modifier keys if any
	      mods = [];
	      key = keys[i].split('+');
	      if (key.length > 1){
	        mods = getMods(key);
	        key = [key[key.length-1]];
	      }
	      // convert to keycode and...
	      key = key[0]
	      key = code(key);
	      // ...store handler
	      if (!(key in _handlers)) _handlers[key] = [];
	      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
	    }
	  };

	  // unbind all handlers for given key in current scope
	  function unbindKey(key, scope) {
	    var multipleKeys, keys,
	      mods = [],
	      i, j, obj;

	    multipleKeys = getKeys(key);

	    for (j = 0; j < multipleKeys.length; j++) {
	      keys = multipleKeys[j].split('+');

	      if (keys.length > 1) {
	        mods = getMods(keys);
	      }

	      key = keys[keys.length - 1];
	      key = code(key);

	      if (scope === undefined) {
	        scope = getScope();
	      }
	      if (!_handlers[key]) {
	        return;
	      }
	      for (i = 0; i < _handlers[key].length; i++) {
	        obj = _handlers[key][i];
	        // only clear handlers if correct scope and mods match
	        if (obj.scope === scope && compareArray(obj.mods, mods)) {
	          _handlers[key][i] = {};
	        }
	      }
	    }
	  };

	  // Returns true if the key with code 'keyCode' is currently down
	  // Converts strings into key codes.
	  function isPressed(keyCode) {
	      if (typeof(keyCode)=='string') {
	        keyCode = code(keyCode);
	      }
	      return index(_downKeys, keyCode) != -1;
	  }

	  function getPressedKeyCodes() {
	      return _downKeys.slice(0);
	  }

	  function filter(event){
	    var tagName = (event.target || event.srcElement).tagName;
	    // ignore keypressed in any elements that support keyboard data input
	    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
	  }

	  // initialize key.<modifier> to false
	  for(k in _MODIFIERS) assignKey[k] = false;

	  // set current scope (default 'all')
	  function setScope(scope){ _scope = scope || 'all' };
	  function getScope(){ return _scope || 'all' };

	  // delete all handlers for a given scope
	  function deleteScope(scope){
	    var key, handlers, i;

	    for (key in _handlers) {
	      handlers = _handlers[key];
	      for (i = 0; i < handlers.length; ) {
	        if (handlers[i].scope === scope) handlers.splice(i, 1);
	        else i++;
	      }
	    }
	  };

	  // abstract key logic for assign and unassign
	  function getKeys(key) {
	    var keys;
	    key = key.replace(/\s/g, '');
	    keys = key.split(',');
	    if ((keys[keys.length - 1]) == '') {
	      keys[keys.length - 2] += ',';
	    }
	    return keys;
	  }

	  // abstract mods logic for assign and unassign
	  function getMods(key) {
	    var mods = key.slice(0, key.length - 1);
	    for (var mi = 0; mi < mods.length; mi++)
	    mods[mi] = _MODIFIERS[mods[mi]];
	    return mods;
	  }

	  // cross-browser events
	  function addEvent(object, event, method) {
	    if (object.addEventListener)
	      object.addEventListener(event, method, false);
	    else if(object.attachEvent)
	      object.attachEvent('on'+event, function(){ method(window.event) });
	  };

	  // set the handlers globally on document
	  addEvent(document, 'keydown', function(event) { dispatch(event) }); // Passing _scope to a callback to ensure it remains the same by execution. Fixes #48
	  addEvent(document, 'keyup', clearModifier);

	  // reset modifiers to false whenever the window is (re)focused.
	  addEvent(window, 'focus', resetModifiers);

	  // store previously defined key
	  var previousKey = global.key;

	  // restore previously defined key and return reference to our key object
	  function noConflict() {
	    var k = global.key;
	    global.key = previousKey;
	    return k;
	  }

	  // set window.key and window.key.set/get/deleteScope, and the default filter
	  global.key = assignKey;
	  global.key.setScope = setScope;
	  global.key.getScope = getScope;
	  global.key.deleteScope = deleteScope;
	  global.key.filter = filter;
	  global.key.isPressed = isPressed;
	  global.key.getPressedKeyCodes = getPressedKeyCodes;
	  global.key.noConflict = noConflict;
	  global.key.unbind = unbindKey;

	  if(true) module.exports = assignKey;

	})(this);


/***/ }
/******/ ]);