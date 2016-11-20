"use strict";

/*
function startGame() {
    var c1 = new ANNBrain(26, 150, 3);
    c1.print();
    c1.feedForward(nj.array([0, 0, 0, 0, 0,
                             0, 0, 0, -0.2, 0,
                             0, 0, 0, 0, 0,
                             0, 0, 0, 0, 0,
                             0.25, 0.5, 1, -0.1, 0.45, 1]),
                   function(output) {
                        console.log("X: " + output.get(0) + ", " +
                                    "Y: " + output.get(1) + ", " +
                                    "dR: " + output.get(2) + ".");
                   });

    var error = -0.1;
    c1.adjustWeights(error);
    c1.print();
}

function clamp(val, min, max){
    return Math.max(min, Math.min(max, val));
}
*/

class Brain {
    
    constructor (i, h, o) {
        this.numInputs = i;
        this.numHidden = h;
        this.numOutputs = o;

        // this.inputs = nj.zeros(i);

        this.w1 = nj.random([this.numInputs, this.numHidden]).add(-0.5).multiply(2);

        // this.hiddenLayer = nj.sigmoid(nj.dot(inputs, w1));

        this.w2 = nj.random([this.numHidden, this.numOutputs]).add(-0.5).multiply(2);

        // this.outputLayer = nj.sigmoid(nj.dot(hiddenLayer, w2));
    }

    adjustWeights(error) {

        var gain = 0.3;
        var sum = this.w2.sum() * error;
        this.w2 = this.w2.add(nj.sigmoid(this.w2).multiply(sum).multiply(gain));

        this.w1 = this.w1.add(nj.sigmoid(this.w1).multiply(sum).multiply(gain));
    }

    print() {
        console.log(this.w1.inspect());
        console.log(this.w2.inspect());
    }

    feedForward(inputs, fun) {
        this.hiddenLayer = nj.sigmoid(nj.dot(inputs, this.w1));
        this.outputLayer = nj.sigmoid(nj.dot(this.hiddenLayer, this.w2));
        fun(this.outputLayer);
    }
}
