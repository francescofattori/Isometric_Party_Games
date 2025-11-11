const Pixi = new PIXI.Application();
var htmlViewport = document.getElementById("viewport");
var camera = new Camera();
var map = new SceneMap();
var ball1, ball2, ball3;

async function main() {
    await Pixi.init({ background: "#1099bb", resizeTo: htmlViewport });
    await PIXI.Assets.init({
        basePath: "sprites/",
        texturePreference: {
            resolution: window.devicePixelRatio
        }
    });
    await map.load("maps/hub.json");
    htmlViewport.appendChild(Pixi.canvas);
    const texture = await PIXI.Assets.load({
        src: "obstacles/cube.png", data: { scaleMode: "nearest" }
    });
    ball1 = new Entity(texture); ball1.pos = new vec3(0, 0, 0);
    ball2 = new Entity(texture); ball2.pos = new vec3(1, 0, 0);
    ball3 = new Entity(texture); ball3.pos = new vec3(0, 1, 0);
    Pixi.ticker.add((dT) => {
        ball1.draw(); ball2.draw(); ball3.draw();
    });
}
main();