"use strict";
class Entity {
	
    constructor(handler, x, y, width, height, color) {
		this.handler = handler;
		this.type = "";
		this.rotation = 0
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;

        this.pos = new vector(x, y);
        this.vel = new vector(0, 0);
        this.shape = "circle";
    }

    degreeRad(degree){
    	return degree * (Math.PI/180)
    }

    orient(){
    	this.pos.elements[0] = this.pos.elements[0] * Math.cos(this.degreeRad(this.rotation)) - 
    						this.pos.elements[1] * Math.sin(this.degreeRad(this.rotation))
    	this.pos.elements[1] = this.pos.elements[0] * Math.sin(this.degreeRad(this.rotation)) + 
    						this.pos.elements[1] * Math.cos(this.degreeRad(this.rotation))
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
            var r = this.width / 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = this.color;
            ctx.fill();

            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();

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
		this.orient()
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
		this.type = "obstacle";
	}

	update() {
		return;
	}

}

class Player extends Entity{
	constructor(handler, x, y, width, height){
	    super(handler, x, y, width, height, "#0000ff");
	    this.maxlevel = 1;
		this.shape = "circle";
		this.type = "player"
		this.colliding = false;
		this.debug = true;
		this.basevisiondir = [new vector(Math.cos(Math.PI/6),Math.sin(Math.PI/6)),
						new vector(Math.cos(Math.PI/12),Math.sin(Math.PI/12)),
						new vector(Math.cos(0),Math.sin(0)), 
						new vector(Math.cos(-Math.PI/12),Math.sin(-Math.PI/12)),
						new vector(Math.cos(-Math.PI/6),Math.sin(-Math.PI/6))];
		this.visiondir = [new vector(Math.cos(Math.PI/6),Math.sin(Math.PI/6)),
						new vector(Math.cos(Math.PI/12),Math.sin(Math.PI/12)),
						new vector(Math.cos(0),Math.sin(0)), 
						new vector(Math.cos(-Math.PI/12),Math.sin(-Math.PI/12)),
						new vector(Math.cos(-Math.PI/6),Math.sin(-Math.PI/6))];

		this.visionlayers = 5;
		this.visiondistance = 192;

        this.brain = new Brain(26, 150, 3);
        this.fitness = 0;
	}

	orient(){
    	for (var i = 0; i < this.basevisiondir.length; i++) {
    		this.visiondir[i].elements[0] = this.basevisiondir[i].elements[0] * Math.cos(this.degreeRad(this.rotation)) - 
    						this.basevisiondir[i].elements[1] * Math.sin(this.degreeRad(this.rotation))
    		this.visiondir[i].elements[1] = this.basevisiondir[i].elements[0] * Math.sin(this.degreeRad(this.rotation)) + 
    						this.basevisiondir[i].elements[1] * Math.cos(this.degreeRad(this.rotation))
    	}

    }

	checkCollisions(){
		var numcoll = 0;
		for (var i = 0; i < this.handler.entities.length; i++) {
			if (this.handler.entities[i].shape == "rectangle"){
				var crect = this.handler.entities[i]
				if (circleRectCollision(this, this.handler.entities[i])){
					if (this.x > crect.x - (crect.width / 2) && this.x < crect.x + (crect.width / 2)){
						this.vel = new vector(this.vel.elements[0],-this.vel.elements[1])
					}else{
						this.vel = new vector(-this.vel.elements[0],this.vel.elements[1])
					}

					numcoll += 1;
					this.onCollide();
				}
			} else if (this.handler.entities[i].type == "guard"){
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

	detectcollisions(){
        

        var inputs = nj.zeros(26);

    	for (var i = 0; i < this.handler.entities.length; i++) {
			if (this.handler.entities[i].type == "guard"){
				for (var j = 0; j < this.visiondir.length; j++) {
					if (eyeCircleCollision(this.visiondir[j], this.handler.entities[i])){
						inputs.set(j, -Math.abs(1/(this.rotation - this.handler.entities[i].rotation)));					
					}
				}
			} 

			if (this.handler.entities[i].type == "obstacle"){
				for (var j = 0; j < this.visiondir.length; j++) {
                    if (eyeRectCollision(this.visiondir[j].add(this.pos), this.handler.entities[i])){
						inputs.set(j, 0.3);
					}
				}
			}
			if (this.handler.entities[i].type == "goal"){
				for (var j = 0; j < this.visiondir.length; j++) {
					if (eyeCircleCollision(this.visiondir[j], this.handler.entities[i])){
						inputs.set(j, -1);
					}
				}
			}
		}

		inputs.set(20, this.x / 1600);
		inputs.set(21, this.y / 900);
		inputs.set(22, this.vel.elements[0] / 2);
		inputs.set(23, this.vel.elements[1] / 2);
		inputs.set(24, this.rotation / 360.0);
		inputs.set(25, 1);

		var p = this;
        this.brain.feedForward(inputs, function(output) {
            p.vel = new vector((output.get(0)-0.5)*4, (output.get(1)-0.5)*4);
            p.rotation += (output.get(2)-0.5) * 2;
        });
    }

	onCollide(object){
		this.colliding = true;
	}

	// onDetect(entity){
 //    	return;
 //    }

	update(){
		this.detectcollisions();
		this.checkCollisions();
		super.update();

		
	}

	draw(){
		var visionpts = [];
		var mult = 4;
		for (var i = 0; i < this.visionlayers-1; i++) {
			visionpts.push(this.visiondir[0].mul(this.visiondistance * mult/4));
			visionpts.push(this.visiondir[1].mul(this.visiondistance * mult/4));
			visionpts.push(this.visiondir[2].mul(this.visiondistance * mult/4));
			visionpts.push(this.visiondir[3].mul(this.visiondistance * mult/4));
			visionpts.push(this.visiondir[4].mul(this.visiondistance * mult/4));
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
			ctx.bezierCurveTo(p1.elements[0],p1.elements[1],p2.elements[0],
							p2.elements[1],p3.elements[0],p3.elements[1]);
			ctx.moveTo(this.pos.elements[0],this.pos.elements[1]);
			ctx.lineTo(p3.elements[0],p3.elements[1]);
			ctx.fillStyle = "rgba(255, 255, 0, 0.75)";
			ctx.fill();
			ctx.closePath();
			super.draw();
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
        this.shape = "circle";
        this.type = "guard";
        this.baserotation = 180;
        this.rotation = 180;
        this.debug = true;
        this.direction = -1;
        this.basevisiondir = [new vector(Math.cos(Math.PI/6),Math.sin(Math.PI/6)), 
						new vector(Math.cos(0),Math.sin(0)), 
						new vector(Math.cos(-Math.PI/6),Math.sin(-Math.PI/6)),
						new vector(Math.cos(0),Math.sin(0))];
		this.visiondir = [new vector(Math.cos(Math.PI/6),Math.sin(Math.PI/6)), 
						new vector(Math.cos(0),Math.sin(0)), 
						new vector(Math.cos(-Math.PI/6),Math.sin(-Math.PI/6)),
						new vector(Math.cos(0),Math.sin(0))];
		this.visiondistance = 64;
    }

    orient(point){
    	for (var i = 0; i < this.basevisiondir.length; i++) {
    		this.visiondir[i].elements[0] = this.basevisiondir[i].elements[0] * Math.cos(this.degreeRad(this.rotation)) - 
    						this.basevisiondir[i].elements[1] * Math.sin(this.degreeRad(this.rotation))
    		this.visiondir[i].elements[1] = this.basevisiondir[i].elements[0] * Math.sin(this.degreeRad(this.rotation)) + 
    						this.basevisiondir[i].elements[1] * Math.cos(this.degreeRad(this.rotation))
    	}
    }

    detectcollisions(){
    	for (var i = 0; i < this.handler.entities.length; i++) {
			if (this.handler.entities[i].type == "player"){
				if (circleRectCollision(this.visiondir[i], this.handler.entities[i])){
					this.onDetect(this.handler.entities[i]);
				}
			} 
		}
    }

    onDetect(entity){
    	return;
    }

    draw(){
		if (this.debug == true){
			var ctx = gameSpace.context;
			var p1 = this.visiondir[0].mul(this.visiondistance).add(this.pos);
			var p2 = this.visiondir[1].mul(this.visiondistance).add(this.pos);
			var p3 = this.visiondir[2].mul(this.visiondistance).add(this.pos);
			var p4 = this.visiondir[3].mul(this.visiondistance/2).add(this.pos);
			ctx.beginPath();
			ctx.moveTo(this.pos.elements[0],this.pos.elements[1]);
			ctx.lineTo(p1.elements[0],p1.elements[1]);
			ctx.bezierCurveTo(p1.elements[0],p1.elements[1],p2.elements[0],
							p2.elements[1],p3.elements[0],p3.elements[1]);
			ctx.moveTo(this.pos.elements[0],this.pos.elements[1]);
			ctx.lineTo(p3.elements[0],p3.elements[1]);
			ctx.fillStyle = "rgba(255, 255, 0, 0.75)";
			ctx.fill();
			ctx.closePath();
			super.draw();
			var plst = [p1,p2,p3,p4];
			for (var i = 0; i < plst.length; i++) {
				ctx.beginPath();
	            ctx.arc(plst[i].elements[0], plst[i].elements[1], 3, 0, 2 * Math.PI, false);
	            ctx.stroke();
	            ctx.closePath();
	        }
		}else{

			super.draw();
			
		}
	}

	sentinel(){
		if (this.rotation >= this.baserotation + 90 || this.rotation <= this.baserotation - 90){
			this.direction *= -1
			this.rotation += 1 * this.direction

		}else{
			this.rotation += .5 * this.direction
		}
	}

    update(){
    	super.update();
    	this.sentinel();
    }

}

class Goal extends Entity {
    
    constructor(handler, x, y, width, height) {
        super(handler, x, y, width, height, "#00ff00");
        this.shape = "circle";
    }

    checkCollisions(){
		for (var i = 0; i < this.handler.entities.length; i++) {
			if (this.handler.entities[i].type == "player") {
				if (circleCircleCollision(this, this.handler.entities[i])){
					this.onCollide();
				}

			}
		}
	}

	onCollide(object){
		console.log("level-" + this.handler.level + ".json")
		this.handler.level += 1;
		if (this.handler.level > 10){
			this.handler.level = 1
		}
		this.handler.loadLevel("HackOhio/levels/level-" + this.handler.level + ".json")

	}

    update(){
		super.update();
		this.checkCollisions();
	}
}

