"use strict";

class GameHandler {

    // Initialize the GameHandler. width and height are the width and
    // height of the canvas.
    constructor(width, height) {
    
        this.width = width;
        this.height = height;
        this.level = 1;
        this.timer = 0;
        this.entities = [];
        this.players = [];
		this.player_index = 0;
		this.generation_num = 0;
		this.max_fitness = 0;
        for (var i = 0; i < 8; i++) {
            this.players.push(new Player(this, 200, 400, 32, 32));
        }

        this.rules = {"clamp-border":true, "use-gravity": true};
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    selectiveBreeding() {
        var a = 0;
		for (var i = 0; i < this.players.length; i++) {
			this.max_fitness = Math.max(this.max_fitness, this.players[i].fitness);
            a += this.players[i].fitness;
		}
		this.generation_num += 1;
		console.log("selectiveBreeding - Generation: " + this.generation_num);
		console.log("Max fitness of last generation: " + this.max_fitness);
        console.log("Average fitness of last generation: " + a / this.players.length);

		this.players = this.shuffle(this.players);
		var toTest = [];
		toTest.push(this.players.pop());
		toTest.push(this.players.pop());
		toTest.push(this.players.pop());
		if (toTest[0].fitness < toTest[1].fitness && toTest[0].fitness < toTest[2].fitness) {
			toTest.splice(0, 1);
		} else if (toTest[1] < toTest[0].fitness && toTest[1].fitness < toTest[2].fitness) {
			toTest.splice(1, 1);
		} else {
			toTest.splice(2, 1);
		}
		this.breed(toTest[0], toTest[1]);
		this.players.push(toTest[0]);	
		this.players.push(toTest[1]);
    }

    breed(p1, p2) {
        var newp = new Player(this, 200, 400, 32, 32);
        newp.brain.w1 = p1.brain.w1.add(p2.brain.w1).multiply(0.5);
        newp.brain.w2 = p1.brain.w2.add(p2.brain.w2).multiply(0.5);
        this.mutate(newp.brain.w1);
        this.mutate(newp.brain.w2);
        this.players.push(newp);
		//TODO: Add mutation
    }

    mutate(weights) {
        for (var i = 0; i < weights.size; i++){
            var scalar = Math.floor(Math.random() * 2) == 0 ? 1.05 : 0.95;
            if (Math.random() <= 0.02) {
                weights.set(i, weights.get(i) * scalar);
                //console.log("mutation occured at position: " + i);
            }
        }
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
        this.timer = 0;
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
                    a.players[a.player_index].pos = new vector(element.x * scale, element.y * scale);
                    a.players[a.player_index].maxlevel = a.level
                    a.addEntity(a.players[a.player_index]);

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

    refreshLevel() {
        this.level = 1;
        var levelName = "HackOhio/levels/level-1.json"; 
        var a = this;
        var scale = 100;
        this.timer = 0;
        var p = 0;
		this.players[this.player_index].fitness = 100 / (this.players[this.player_index].pos.distanceTo(this.entities[this.entities.length-1].pos)) + 100 * (this.players[this.player_index].maxlevel -1 );
        this.players[this.player_index].maxlevel = 1;
		console.log("Fitness of player " + this.player_index + ": " + this.players[this.player_index].fitness);
		this.player_index += 1;
		if (this.player_index == this.players.length) {
			this.selectiveBreeding();
			this.player_index = 0;
		}
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].type == "player"){
                p = this.players[this.player_index];
                break;
            }
        }

        //console.log(0.01 - 1/(p.pos.distanceTo(this.entities[this.entities.length-1].pos) + 0.001))
        //p.brain.adjustWeights(0.01 - 1/(p.pos.distanceTo(this.entities[this.entities.length-1].pos) / 10 + 0.001));
        //console.log(p);

        this.clearEntities();
        $.getJSON(levelName, function(data) {
            data.entities.forEach(function(element) {
                if (element.type == "wall") {
                    a.addEntity( new Obstacle(a,
                            element.x * scale,
                            element.y * scale,
                            element.width * scale,
                            element.height * scale));

                }else if (element.type == "enemy") {
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
                }else if (element.type == "player") {
                    p.pos = new vector(element.x * scale, element.y * scale)
                }
            });
        });
        this.addEntity(p);
    }

    update(delta) {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }
        this.timer += delta;
        if (this.timer >= 15000){
            this.refreshLevel();
        }
    }

    draw() {
        for (var i = 0; i < this.entities.length; i++) {    
            this.entities[i].draw();
        }
    }

	shuffle(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	  }

	  return array;
	}
}

