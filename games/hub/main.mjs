import * as global from "global";
global.makeObjectGlobal(global);

async function main() {
    await initCannon("materials", true);
    await initPixi();
    await scene.load("hub", true);
    let player = new Player(new vec3(0, 0, 5)); await player.load(); scene.add(player);
    scene.play();
}
main();