function startGame() {
    var numInputs = 25;
    var numHidden = 100;
    var numOutputs = 3;
    

    var inputs = nj.array([0, 0, 0, 0, 0,
                           0, 0, 0, 0, 0,
                           0, 0, 0, 1, 0,
                           0, 0, 0, 0, 0,
                           0.25, 0.5, 0, 1, 0.1]);
    
    // Weight layer from input to hidden
    var w1 = nj.random([numInputs, numHidden]);

    var hiddenLayer = nj.dot(inputs, w1);

    // Weight layer from hidden to output
    var w2 = nj.random([numHidden, numOutputs]); 

    var outputLayer = nj.dot(hiddenLayer, w2);
    console.log(outputLayer.inspect());
    console.log("x velocity = " + clamp(outputLayer.get(0), -2, 2) + ", y velocity = " + clamp(outputLayer.get(1), -2, 2) + ", rotational delta = " + clamp(outputLayer.get(2), -1, 1) + ".");
}

function sumRows(m) {
    var sum = nj.zeros(m.shape[1]);
    for (var i = 0; i < m.shape[0]; i++) {
        sum = sum.add(m.pick(i));
    }
    return sum;
}

function clamp(val, min, max){
    return Math.max(min, Math.min(max, val));
}
