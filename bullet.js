var utils = require('./utils.js');

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
