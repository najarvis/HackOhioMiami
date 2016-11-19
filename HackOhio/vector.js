function vector() {
	// This vector class does not have a limit to how many elements it may contain.
	this.length = arguments.length;

	// Store each element.
	this.elements = [];

	for (var i = 0; i < this.length; i++) {
		this.elements.push(arguments[i]);
	}

	// Adds two vectors together and returns the result as a new vector.
	this.add = function(other) {
		// First checks if both vectors have the same length. If they do not they cannot be added.
		if (this.length != other.length) return null;

		// Create a temporary array to hold the summed elements. First element is null because of how the apply function works.
		var temp = [null];

		// Loop through and sum the elements and push them to the array.
		for (var i = 0; i < this.length; i++) {
			temp.push(this.elements[i] + other.elements[i]);
		}
		// Use the array as the arguments to construct the new vector.
		return new (Function.prototype.bind.apply(vector, temp));
	}

	// Multiplies the given vector by a scalar and returns the new vector.
	this.mul = function(scalar) {
		// Create a temporary array to hold the summed elements. First element is null because of how the apply function works.
		var temp = [null];

		// Loop through and sum the elements and push them to the array.
		for (var i = 0; i < this.length; i++) {
			temp.push(this.elements[i] * scalar);
		}

		// Use the array as the arguments to construct the new vector.
		return new (Function.prototype.bind.apply(vector, temp));
	}

	// Returns the magitude of a vector. Magnitude = sqrt(v_1^2 + v_2^2 + ...v_n^2).
	this.magnitude = function() {
		var sum = 0;
		for (var i = 0; i < this.length; i++) {
			sum += Math.pow(this.elements[i], 2);
		}
		return Math.sqrt(sum);
	}

	// Returns a unit vector in the direction of the original vector. To calculate the normal divide the vector by the magnitude.
	this.normalize = function() {
		// Because division is not defined on our vector, we multiply by 1 over the magitude.
		return this.mul(1 / this.magnitude());
	}

	// Returns the distance to the vector supplied as an argument.
	this.distanceTo = function(other) {
		// First checks if both vectors have the same length. If they do not they cannot be added.
		if (this.length != other.length) return null;
		
		var sum = 0;
		for (var i = 0; i < this.length; i++) {
			sum += Math.pow(this.elements[i] - other.elements[i], 2);
		}

		return Math.sqrt(sum);
	}

	// Returns the vector to the vector supplied as an argument.
	this.fromOther = function(other) {
		// The vector from vector a to vector b is just b - a, so here we just add (-1 * a) to b.
		return other.add(this.mul(-1));
	}

}