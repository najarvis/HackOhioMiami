var worldAABB = new b2AABB();
worldAABB.minVertex.Set(-1000, -1000);
worldAABB.maxVertex.Set(1000, 1000);
var gravity = new b2Vec2(0, 0);
var doSleep = true;
var world = new b2World(worldAABB, gravity, doSleep); 
var circleSd = new b2CircleDef();
circleSd.density = 1.0;
circleSd.radius = 20;
circleSd.restitution = 1.0;
circleSd.friction = 0;
var circleBd = new b2BodyDef();
circleBd.AddShape(circleSd);
circleBd.position.Set(100,100);
var circleBody = world.CreateBody(circleBd);
var ctx;
var canvasWidth = 640; 
var canvasHeight = 480; 
function step(cnt) {
  world.Step(1.0/60, 1);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawWorld(world, ctx); // see demos/draw_world.js
  setTimeout('step(' + (cnt || 0) + ')', 10);
}
Event.observe(window, 'load', function() {
  setupWorld(world); // as you like
  ctx = $('canvas').getContext('2d');
  var canvasElm = $('canvas');
  canvasWidth = parseInt(canvasElm.width);
  canvasHeight = parseInt(canvasElm.height);
  step();
});