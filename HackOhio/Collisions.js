//Credit https://gist.github.com/vonWolfehaus/5023015
// limits value to the range min..max
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
}
function circleRectCollision(circle, rectangle){
    // Find the closest point to the circle within the rectangle
    // Assumes axis alignment! ie rect must not be rotated
    var closestX = clamp(circle.x, rectangle.x - (rectangle.width/2), rectangle.x + (rectangle.width/2));
    var closestY = clamp(circle.y, rectangle.y - (rectangle.height/2), rectangle.y + (rectangle.height/2));

    // Calculate the distance between the circle's center and this closest point
    var distanceX = circle.x - closestX;
    var distanceY = circle.y - closestY;

    // If the distance is less than the circle's radius, an intersection occurs
    var distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    var isTouching = (distanceSquared < (circle.width/2 * circle.width/2));
    return isTouching;
}


function circleCircleCollision(circle1,circle2){
    var distance = circle1.pos.distanceTo(circle2.pos)
    if (distance <= (circle1.width/2 + circle2.width/2)){
        return true;
    } else{
        return false;
    }
}

function eyeCircleCollision(circle1,circle2){
    var distance = circle1.distanceTo(circle2.pos)
    if (distance <= (10)){
        console.log("true")
        return true;
    } else{
        return false;
    }
}

function eyeRectCollision(eye, rectangle){
    var closestX = clamp(eye.elements[0], rectangle.x - (rectangle.width/2), rectangle.x + (rectangle.width/2));
    var closestY = clamp(eye.elements[1], rectangle.y - (rectangle.height/2), rectangle.y + (rectangle.height/2));

    // Calculate the distance between the circle's center and this closest point
    var distanceX = eye.elements[0] - closestX;
    var distanceY = eye.elements[1] - closestY;

    // If the distance is less than the circle's radius, an intersection occurs
    var distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    var isTouching = (distanceSquared < (3 * 3));
    //console.log("Working")
    return isTouching;
}
