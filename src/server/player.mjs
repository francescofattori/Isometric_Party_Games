//SERVER
import { Player as CommonPlayer } from "../common/player.mjs";
import { Entity } from "./entity.mjs";
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
    update() {
        this.rigidbody.velocity.x = this.inputVel.x;
        this.rigidbody.velocity.y = this.inputVel.y;
    }
    async init(world) {
        await super.init(world);
    }
}