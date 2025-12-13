import { Ball } from "./ball.mjs";
export class Game {
    name = "hub";
    async start(scene, world) {
        let ball = new Ball();
        console.log(ball.name);
        await scene.load("hub", true);
    }
    update(scene, world) {

    }
}