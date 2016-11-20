"use strict";

function startGame() {
    gameSpace.start();
}

var gameSpace = {
    canvas : document.createElement("canvas"),

    start : function() {
        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height();

        this.context = this.canvas.getContext("2d");

        this.gameHandler = new GameHandler();
        this.gameHandler.loadLevel("HackOhio/levels/level-1.json");
        this.gameHandler.draw();

        setInterval(this.updateAndRender, 20, this.gameHandler);

        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

    },

    updateAndRender : function(handler) {
        handler.update();

        gameSpace.clear();
        handler.draw();
    },

    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
