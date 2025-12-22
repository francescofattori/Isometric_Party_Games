//SERVER
import { Player as CommonPlayer } from "../common/player.mjs";
import { Entity } from "./entity.mjs";
import { Controller } from "./controller.mjs";
export class Player extends CommonPlayer(Entity) {
    static getPlayer(client, id) {
        for (const player of client.players) {
            if (player.id.value == id) return player;
        }
    }
    genNetworkingData() {
        let data = super.genNetworkingData();
        data.player = true;
        data.rightAngle = this.controller.rightAngle;
        data.sprite = {
            anim: this.sprite.anim,
            flip: this.sprite.flip,
            back: this.sprite.back
        }
        return data;
    }
    async init(world) {
        await super.init(world);
        this.controller = new Controller();
    }
    update(world) {
        super.update(world);
    }
}