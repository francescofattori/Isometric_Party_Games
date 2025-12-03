import { importScripts } from "../../src/common/importScripts.mjs";
const gameName = "hub";
await importScripts(gameName, [
    { src: "ball.mjs", common: true },
]);

export async function start(Game) {
    let ball = new Ball();
    console.log(ball.name);
    if (!Game) return;
    await Game.scene.load("hub", true);
    Game.scene.play();
}

export async function update(Game) {

}