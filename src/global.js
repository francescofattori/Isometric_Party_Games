const Pixi = new PIXI.Application();
const World = new CANNON.World();
World.gravity = new CANNON.Vec3(0, 0, -30);
World.updateTime = 0;
World.run = true;
World.dt = 1.0 / 200.0;
var htmlViewport = document.getElementById("viewport");
var htmlStats = document.getElementById("stats");
var scene = new Scene();
var camera = new Camera();

//math constants