//Credit https://gist.github.com/vonWolfehaus/5023015
// limits value to the range min..max
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
}
function circleRectCollision(circle, rectangle){
    // Find the closest point to the circle within the rectangle
    // Assumes axis alignment! ie rect must not be rotated
    var closestX = clamp(circle.X, rectangle.x, rectangle.x + rectangle.width);
    var closestY = clamp(circle.Y, rectangle.y, rectangle.y + rectangle.height);

    // Calculate the distance between the circle's center and this closest point
    var distanceX = circle.X - closestX;
    var distanceY = circle.Y - closestY;

    // If the distance is less than the circle's radius, an intersection occurs
    var distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (circle.Radius * circle.Radius);
}

function circleCircleCollision(circle1,circle2){
    var distance = circle1.pos.distanceTo(circle2)
    if distance <= (circle1.radius + circle2.radius){
        return false
    }else{
        return true
    }
}