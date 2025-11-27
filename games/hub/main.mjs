import * as global from "global";
global.makeObjectGlobal(global);

async function main() {
    await initCannon("materials.json", true);
    await initPixi();
    await scene.load("hub", true);
    let player = new Player(new vec3(0, 0, 5)); await player.init();
    camera.target = player.pos;
    scene.add(player);
    scene.play();
}
main();