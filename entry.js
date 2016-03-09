var MovingObject = require ("./movingObject");
var Util = require ("./utils");
var Game = require("./game");
var GameView = require("./gameView");
var Player = require("./player");


var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');
var game = new Game();
var gameView = new GameView(ctx, game);

gameView.start();
