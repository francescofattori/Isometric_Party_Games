import * as global from "global";
global.makeObjectGlobal(global);

export async function main() {
    await initCannon("materials.json", true);
    await initPixi();
    await scene.load("hub", true);
    let player = new Player(new vec3(0, 0, 5)); await player.init();
    camera.target = player.pos;
    player.controller = new Controller(player, "keyboardAndMouse");
    if (isMobile.any()) player.controller = new Controller(player, "touchControls");
    window.addEventListener("gamepadconnected", (e) => {
        player.controller = new Controller(player, "gamepad", e.gamepad.index);
    });
    scene.add(player);
    scene.play();
}