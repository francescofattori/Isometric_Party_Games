const Pixi = new PIXI.Application();
const World = new CANNON.World();
const htmlViewport = document.getElementById("viewport");
const htmlStats = document.getElementById("stats");
const scene = new Scene();
const camera = new Camera();