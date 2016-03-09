var Game = require('./game.js');
var key = require('./keymaster.js');

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
    debugger;
    if (this.game.over) {
      this.renderOver();
      clearInterval(gameLoop);
    }
  }.bind(this), 20)
};

GameView.prototype.renderOver = function () {
  this.ctx.fillStyle = 'black';
  this.ctx.fillRect(0,0,this.game.dimX,this.game.dimY + 50);

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
    this.player1.turn(-Math.PI/32);
  }

  if (key.isPressed('d')) {
    this.player1.turn(Math.PI/32);
  }

  if (key.isPressed('z')) {
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
    this.player2.turn(-Math.PI/32);
  }

  if (key.isPressed('l')) {
    this.player2.turn(Math.PI/32);
  }

  if (key.isPressed('n')) {
    this.player2.fire();
  }

  if (key.isPressed('q')) {
    this.game.end();
  }
};

module.exports = GameView;
