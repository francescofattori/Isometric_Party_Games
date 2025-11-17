var player;
async function initPixi() {
    await Pixi.init({ background: "#1099bb", resizeTo: htmlViewport });
    await PIXI.Assets.init({
        basePath: "assets/sprites/",
        texturePreference: {
            resolution: window.devicePixelRatio
        }
    });
    htmlViewport.appendChild(Pixi.canvas);
}
function initCannon() {
    World.gravity = new CANNON.Vec3(0, 0, -40);
    World.updateTime = 0; World.lastUpdate = 0;
    World.run = true; World.dt = 1.0 / 200.0;
    let groundMaterial = new CANNON.Material('ground');
    let playerMaterial = new CANNON.Material('player');
    World.materials = { ground: groundMaterial, player: playerMaterial };
    let contactMaterial1 = new CANNON.ContactMaterial(groundMaterial, playerMaterial, {
        friction: 0.0, restitution: 0.0, contactEquationRelaxation: 10, contactEquationStiffness: 5e8
    });
    World.addContactMaterial(contactMaterial1);
}
async function main() {
    initCannon();
    await initPixi();
    //set scene
    await scene.load("hub");
    player = new Player(new vec3(0, 0, 7)); await player.load();
    //start loops
    updateLoop();
    Pixi.ticker.add(draw);
}
main();