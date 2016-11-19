"use strict";

function startGame() {
	gameSpace.start();
}

// Static object
var gameSpace = {
	canvas : document.createElement("canvas"),

	// Basic setup stuffs.
	start : function() {
		this.canvas.width = $(window).width();
		this.canvas.height = $(window).height();

		this.context = this.canvas.getContext("2d");

		this.gameHandler = new gameHandler(this.canvas.width, this.canvas.height);
		this.gameHandler.addEntity(new entity(this.gameHandler, 20, 20, 32, 32, "#888888"));
        
        this.gameHandler.draw();

		// Every 20 milliseconds (a little slower than 60fps), run the updateAndRender method with this.gameHandler as the parameter.
		setInterval(this.updateAndRender, 20, this.gameHandler);

		document.body.insertBefore(this.canvas, document.body.childNodes[0]);

	},

	// This is in one functions so there is just one interval.
	updateAndRender : function(handler) {
		handler.update();

		gameSpace.clear();
		handler.draw();
	},

	// Creates a random entity in a random location on the screen.
	generateRandomEntity : function(handler) {
		// Random color between red, green, and blue

		var colors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff", "#ffff00"];
		var col = colors[randInt(0, colors.length - 1)];
		handler.addEntity(new entity(handler, randInt(0, handler.width - 32), randInt(0, handler.height - 32), 32, 32, col));
	},

	// Clears the context of the screen, makes it ready to draw.
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

// Main object that handles all the entities.
function gameHandler(width, height) {
	this.height = height;
	this.width = width;

	// Stores all of the entities that are currently present
	this.entities = [];

	this.rules = {"clamp-border" : true, "use-gravity" : false};

	// The function that updates all of the entities in this.entities.
	this.update = function() {
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].update();
		}
	}

	this.draw = function() {
		// Add a screen clearing statement in here, possibly just use gameSpace function.
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].draw();
		}
	}

	// Adds an entities to the entities array.
	this.addEntity = function(new_entity) {
		this.entities.push(new_entity);
	}

	this.clearEntities = function() {
		this.entities = [];
	}
}

// The main entity object, the base for most things that move.
function entity(handler, x, y, width, height, color) {
	this.handler = handler;

	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;

	this.pos = new vector(x, y);
	//this.vel = new vector(randSign(randInt(4, 10)), randSign(randInt(4, 10)));
    this.vel = new vector(0, 0);
    this.shape = "triangle";


	// Draws a rectangle for the entity at it's position and in it's dimensions.
	this.draw = function() {
        if (this.shape == "square") {
            var ctx = gameSpace.context;
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(this.x, this.y, this.width, this.height);

        } else if (this.shape == "circle"){
            var ctx = gameSpace.context;
            var r = 16;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();

        } else if (this.shape == "triangle") {
            
            var ctx = gameSpace.context;
            ctx.fillStyle = color;
            ctx.strokeStyle = "#000000";
            
            ctx.beginPath();
            ctx.moveTo(this.x - this.width / 2, this.y + this.height / 2);
            ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
            ctx.moveTo(this.x, this.y - this.height / 2);
            ctx.closePath();
            
            ctx.fill();
            ctx.stroke();
            console.log(this.x + " " + (this.x + this.width / 2) + " " + (this.y + this.height / 2));
        }
	}

	this.update = function() {
		// If gravity is enabled, it pulls it to the bottom of the screen.
		if (this.handler.rules["use-gravity"]){
			if (this.y < this.handler.height - this.height) {
				this.y += 1; // Gravity Constant
			}
		}

		this.pos = this.pos.add(this.vel);
		this.x = this.pos.elements[0];
		this.y = this.pos.elements[1];

		// If clamp-border is enabled, the entity is automatically brought back into the borders of the screen.
		if (this.handler.rules["clamp-border"]) {
			if (this.x < 0) {
				this.x = 0;
				this.vel.elements[0] *= -1;
			}
			
			if (this.x > this.handler.width - this.width) {
				this.x = this.handler.width - this.width;
				this.vel.elements[0] *= -1;
			}

			if (this.y < 0) {
				this.y = 0;
				this.vel.elements[1] *= -1;
			}

			if (this.y > this.handler.height - this.height) {
				this.y = this.handler.height - this.height;
				this.vel.elements[1] *= -1;
			}
		}
	}
}

// http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randSign(val) {
	return (randInt(0, 1) == 1) ? -val : val;
}
