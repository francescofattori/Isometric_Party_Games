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
    await scene.load("hub");
}

function initCannon() {
    World.gravity = new CANNON.Vec3(0, 0, -40);
    World.updateTime = 0;
    World.run = true;
    World.dt = 1.0 / 200.0;
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
    initPixi();
    //set scene
    let cube1 = new Entity(new vec3(1, 1, 0)); await cube1.load("cube");
    let cube2 = new Entity(new vec3(1, 0, 0)); await cube2.load("cube");
    let cube3 = new Entity(new vec3(0, 1, 0)); await cube3.load("cube");
    player = new Player(new vec3(0, 0, 7)); await player.load();

    let groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC // can also be achieved by setting the mass to 0
    });
    let shape = new CANNON.Plane();
    shape.material = World.materials.ground;
    groundBody.addShape(shape);
    groundBody.tag = "ground";
    World.addBody(groundBody);

    //start loops
    updateLoop();
    Pixi.ticker.add(draw);
}
main();