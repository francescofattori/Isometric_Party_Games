import { importScripts } from "../../src/common/importScripts.mjs";
export const gameName = "hub";
await importScripts(gameName, [
    { src: "ball.mjs", common: true, root: false },
]);

export async function start(Game) {
    let ball = new Ball();
    console.log(ball.name);
    await Game.scene.load("hub", true);
}

export async function update(Game) {

}