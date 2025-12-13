//SERVER
import { Entity as CommonEntity } from "../common/entity.mjs";
import { assets } from "./server.mjs";

export class Entity extends CommonEntity {
    async init(world) {
        await super.init(assets, world);
    }
    genNetworkingData() { return { id: this.id.value, pos: this.pos, vel: this.vel }; }
    update() { }
    static getEntity(client, id) {
        let room = client.room;
        for (const roomClient of room.clients) {
            for (const player of roomClient.players) {
                if (player.id.value == id) return player;
            }
        }
        for (const entity of room.globals.scene.entities) {
            if (entity.id.value == id) return entity;
        }
    }
}