var player;

async function main() {
    await Pixi.init({ background: "#1099bb", resizeTo: htmlViewport });
    await PIXI.Assets.init({
        basePath: "assets/sprites/",
        texturePreference: {
            resolution: window.devicePixelRatio
        }
    });
    htmlViewport.appendChild(Pixi.canvas);
    await scene.load("hub");
    let cube1 = new Entity(new vec3(1, 1, 0)); await cube1.load("cube");
    let cube2 = new Entity(new vec3(1, 0, 0)); await cube2.load("cube");
    let cube3 = new Entity(new vec3(0, 1, 0)); await cube3.load("cube");
    player = new Player(new vec3(0, 0, 7)); await player.load();
    World.addBody(player.rigidbody);

    const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC, // can also be achieved by setting the mass to 0
        shape: new CANNON.Plane(),
    });
    World.addBody(groundBody);

    updateLoop();
    Pixi.ticker.add(draw);
}
main();