const pixi = new PIXI.Application();
const world = new CANNON.World();
const scene = new Scene();
const camera = new Camera();
const assets = new AssetsManager();
//HTML
const htmlViewport = document.getElementById("viewport");
const htmlStats = document.getElementById("stats");