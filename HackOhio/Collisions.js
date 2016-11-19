//Credit https://gist.github.com/vonWolfehaus/5023015
// limits value to the range min..max
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
}

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

// expensive alternative:
function intersects(circle, rect) {
    circleDistance.x = Math.abs(circle.x - rect.x);
    circleDistance.y = Math.abs(circle.y - rect.y);

    if (circleDistance.x > (rect.width/2 + circle.r)) { return false; }
    if (circleDistance.y > (rect.height/2 + circle.r)) { return false; }

    if (circleDistance.x <= (rect.width/2)) { return true; } 
    if (circleDistance.y <= (rect.height/2)) { return true; }

    cornerDistanceSq = Math.sqr(circleDistance.x - rect.width/2) +
                        Math.sqr(circleDistance.y - rect.height/2);

    return (cornerDistanceSq <= (Math.sqr(circle.r)));
}