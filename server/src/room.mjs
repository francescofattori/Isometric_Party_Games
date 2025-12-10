import { rooms } from "./server.mjs";
import { Scene } from "../../src/server/scene.mjs";
import { World } from "../../src/server/world.mjs";
export class Room {
    static #genId() {
        let id = 0;
        for (const r of rooms) { id = Math.max(id, r.id); }
        return id + 1;
    }
    constructor(gameName) {
        this.gameName = gameName;
        this.id = Room.#genId();
    }
    async start() {
        this.game = { scene: new Scene(), world: new World(this.gameName) };
        this.game.world.init();
        this.main = await import("../../games/" + this.gameName + "/main.mjs");
        this.main.start(this.game);
    }
}