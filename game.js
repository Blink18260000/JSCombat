var Player = require('./player.js');
var utils = require('./game.js');
var Bullet = require('./bullet.js');

function Game() {
  this.dimX = 1000;
  this.dimY = 800;
  this.player1 = new Player(this, [100, 400], 0, '#000');
  this.player2 = new Player(this, [900, 400], Math.PI, '#f00');
  this.player1.setOpponent(this.player2);
  this.player2.setOpponent(this.player1);
  this.over = false;
  this.map = [[300, 100, 50, 200],
              [150, 250, 150, 50],
              [150, 500, 200, 50],
              [300, 550, 50, 150],
              [450, 350, 100, 100],
              [650, 100, 50, 200],
              [700, 250, 150, 50],
              [650, 500, 200, 50],
              [650, 550, 50, 150]
            ]
  this.bullets = [];
}

Game.prototype.draw = function (ctx) {
  ctx.clearRect(0, 0, this.dimX, this.dimY);
  for (i = 0; i < this.bullets.length; i++) {
    this.bullets[i].draw(ctx);
  }
  this.player1.draw(ctx);
  this.player2.draw(ctx);
  for (var i = 0; i < this.map.length; i++) {
    var obstacle = this.map[i];
    ctx.fillStyle = '#00f';
    ctx.fillRect(obstacle[0], obstacle[1], obstacle[2], obstacle[3]);
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
  console.log(bullet);
};

Game.prototype.end = function() {
  this.over = true;
};

module.exports = Game;
