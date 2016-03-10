var utils = require('./utils.js');
var Bullet = require('./bullet.js');

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
