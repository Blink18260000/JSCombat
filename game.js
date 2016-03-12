var Player = require('./player.js');
var utils = require('./game.js');
var Bullet = require('./bullet.js');

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
  this.groundTile.src = './dirtSheet.png';
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
  ctx.fillStyle = '#663300';
  ctx.fillRect(0, this.dimY, this.dimX, 50);
  ctx.font = '30px Alfa Slab One';
  ctx.fillStyle = '#2db300';
  ctx.fillText("Player 1 lives: " + this.player1.lives, 50, this.dimY + 35);
  ctx.fillText("Player 2 lives: " + this.player2.lives, this.dimX - 290, this.dimY + 35);
};

Game.prototype.drawGround = function (ctx) {
  for (var x = 0; x < 11; x++) {
    for (var y = 0; y < 9; y++) {
      ctx.drawImage(
        this.groundTile,
        0,
        160,
        96,
        96,
        x * 96,
        y * 96,
        96,
        96
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
