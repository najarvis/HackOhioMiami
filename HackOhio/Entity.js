"use strict";
class Entity {
	
    constructor(handler, x, y, width, height, color) {
		this.handler = handler;
		this.type = "";
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;

        this.pos = new vector(x, y);
        this.vel = new vector(0, 0);
        this.shape = "circle";
    }

	// Draws a rectangle for the entity at it's position and in it's dimensions.
	draw() {
        if (this.shape == "rectangle") {
            var ctx = gameSpace.context;
            ctx.fillStyle = this.color;
            ctx.fillRect((this.x - this.width / 2), (this.y - this.height / 2), this.width, this.height);
            ctx.strokeStyle = "#000000";
            ctx.strokeRect((this.x - this.width / 2), (this.y - this.height / 2), this.width, this.height);

        } else if (this.shape == "circle"){
            var ctx = gameSpace.context;
            var r = 16;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = this.color;
            ctx.fill();

            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();

        } else if (this.shape == "triangle") {
            
            var ctx = gameSpace.context;
            ctx.fillStyle = this.color;
            ctx.strokeStyle = "#000000";
            
            ctx.beginPath();
            ctx.moveTo(this.x - this.width / 2, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
            ctx.lineTo(this.x, this.y - this.height / 2);
            ctx.closePath();
            
            ctx.fill();
            ctx.stroke();
        }
	}

	update() {
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

class Obstacle extends Entity{
	constructor(handler, x, y, width, height){
	    super(handler, x, y, width, height, "#aaaaaa");
		this.shape = "rectangle";
	}

	update() {
		return;
	}

}

class Guard extends Entity {
    
    constructor(handler, x, y, width, height) {
        super(handler, x, y, width, height, "#ff0000");
        this.shape = "triangle";
    }
}
