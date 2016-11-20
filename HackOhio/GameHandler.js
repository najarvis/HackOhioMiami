"use strict";

class GameHandler {

    // Initialize the GameHandler. width and height are the width and
    // height of the canvas.
    constructor(width, height) {
    
        this.width = width;
        this.height = height;
        this.entities = [];

        this.rules = {"clamp-border":true, "use-gravity": true};
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    // Removes the given entity from the array
    removeEntity(entity) {
        var i = this.entities.indexOf(entity);
        if (i != -1) this.entities = this.entities.splice(i, 1);
    }

    clearEntities() {
        this.entities = [];
    }

    loadLevel(levelName) {
        var a = this;
        var scale = 100;
        this.clearEntities();
        $.getJSON(levelName, function(data) {
            data.entities.forEach(function(element) {
                if (element.type == "wall") {
                    a.addEntity( new Obstacle(a,
                            element.x * scale,
                            element.y * scale,
                            element.width * scale,
                            element.height * scale));

                } else if (element.type == "player") {
                    a.addEntity(new Player(a,
                            element.x * scale,
                            element.y * scale,
                            element.width * scale,
                            element.height * scale));

                } else if (element.type == "enemy") {
                    a.addEntity(new Guard(a,
                            element.x * scale,
                            element.y * scale,
                            element.width * scale,
                            element.height * scale));
                } else if (element.type == "goal") {
                    a.addEntity(new Goal(a,
                            element.x * scale,
                            element.y * scale,
                            element.width * scale,
                            element.height * scale));
                }
            });
        });
    }

    update() {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }
    }

    draw() {
        for (var i = 0; i < this.entities.length; i++) {    
            this.entities[i].draw();
        }
    }
}

