var player;
async function initPixi() {
    await pixi.init({ background: "#1099bb", resizeTo: htmlViewport });
    htmlViewport.appendChild(pixi.canvas);
}
function initCannon() {
    world.gravity = new CANNON.Vec3(0, 0, -40);
    world.updateTime = 0; world.lastUpdate = 0; world.statTime = 0;
    world.updateTimeSum = 0; world.FPSSum = 0; world.statCount = 0;
    world.run = true; world.dt = 1.0 / 200.0;
    let groundMaterial = new CANNON.Material('ground');
    let playerMaterial = new CANNON.Material('player');
    world.materials = { ground: groundMaterial, player: playerMaterial };
    let contactMaterial1 = new CANNON.ContactMaterial(groundMaterial, playerMaterial, {
        friction: 0.0, restitution: 0.0, contactEquationRelaxation: 10, contactEquationStiffness: 5e8
    });
    world.addContactMaterial(contactMaterial1);
}
async function main() {
    initCannon();
    await initPixi();
    //set scene
    await scene.load("hub", root = true); scene.play();
}
main();