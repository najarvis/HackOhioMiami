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
            var r = 32;
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

class Player extends Entity{
	constructor(handler, x, y, width, height){
	    super(handler, x, y, width, height, "#0000ff");
		this.shape = "circle";
		this.colliding = false;
		this.debug = false;
		this.visiondir = [new vector(Math.cos(Math.PI/6),Math.sin(Math.PI/6)),
						new vector(Math.cos(Math.PI/12),Math.sin(Math.PI/12)),
						new vector(Math.cos(0),Math.sin(0)), 
						new vector(Math.cos(-Math.PI/12),Math.sin(-Math.PI/12)),
						new vector(Math.cos(-Math.PI/6),Math.sin(-Math.PI/6))];

		this.visionlayers = 5;
		this.visiondistance = 128;
	}

	checkCollisions(){
		var numcoll = 0;
		for (var i = 0; i < this.handler.entities.length; i++) {
			if (this.handler.entities[i].shape == "rectangle"){
				if (circleRectCollision(this, this.handler.entities[i])){
					numcoll += 1;
					this.onCollide();
				}
			} else if (this.handler.entities[i].shape == "triangle"){
				if (circleCircleCollision(this, this.handler.entities[i])){
					numcoll += 1;
					this.onCollide();
				}
			}
		}
		if (numcoll == 0){
			this.colliding = false;
		}
	}

	onCollide(object){
		this.vel = this.vel.mul(-1);
		this.colliding = true;

	}

	update(){
		super.update();
		this.checkCollisions();
	}

	draw(){
		var visionpts = [];
		var mult = 5;
		for (var i = 0; i < this.visionlayers-1; i++) {
			visionpts.push(this.visiondir[0].mul(128 * mult/5));
			visionpts.push(this.visiondir[1].mul(128 * mult/5));
			visionpts.push(this.visiondir[2].mul(128 * mult/5));
			visionpts.push(this.visiondir[3].mul(128 * mult/5));
			visionpts.push(this.visiondir[4].mul(128 * mult/5));
			mult -= 1;
		}
		if (this.debug == true){
			var ctx = gameSpace.context;
			var p1 = this.visiondir[0].mul(this.visiondistance).add(this.pos);
			var p2 = this.visiondir[2].mul(this.visiondistance).add(this.pos);
			var p3 = this.visiondir[4].mul(this.visiondistance).add(this.pos);
			ctx.beginPath();
			ctx.moveTo(this.pos.elements[0],this.pos.elements[1]);
			ctx.lineTo(p1.elements[0],p1.elements[1]);
			ctx.stroke();
			ctx.bezierCurveTo(p1.elements[0],p1.elements[1],p2.elements[0],
							p2.elements[1],p3.elements[0],p3.elements[1]);
			ctx.stroke();
			ctx.moveTo(this.pos.elements[0],this.pos.elements[1]);
			ctx.lineTo(p3.elements[0],p3.elements[1]);
			ctx.stroke();
			ctx.closePath();
			super.draw();
			console.log(visionpts.length)
			for (var i = 0; i < visionpts.length; i++) {
				ctx.beginPath();
	            // ctx.arc(visionpts[i].elements[0] + this.pos.elements[0], visionpts[i].elements[1] + this.pos.elements[1], 3, 0, 2 * Math.PI, false);
	            ctx.arc(visionpts[i].elements[0] + this.x, visionpts[i].elements[1] + this.y, 3, 0, 2 * Math.PI, false);
	            ctx.stroke();
	            ctx.closePath();
	        }
		}else{

			super.draw();
			
		}


	}
}

class Guard extends Entity {
    
    constructor(handler, x, y, width, height) {
        super(handler, x, y, width, height, "#ff0000");
        this.shape = "triangle";
        this.visiondir = [new vector(Math.cos(Math.PI/6),Math.sin(Math.PI/6)), 
						new vector(Math.cos(0),Math.sin(0)), 
						new vector(Math.cos(-Math.PI/6),Math.sin(-Math.PI/6)),
						new vector(Math.cos(0),Math.sin(0))];
		this.visiondistance = 64;
    }
}

class Goal extends Entity {
    
    constructor(handler, x, y, width, height) {
        super(handler, x, y, width, height, "#00ff00");
        this.shape = "circle";
    }
}
