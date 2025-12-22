//SERVER
import { startLoop } from "./loop.mjs";
import { World } from "../common/world.mjs";
import { networkingRate } from "./networking.mjs";
import { Scene } from "./scene.mjs";
import { assets, gamesInfo, rooms, socket } from "./server.mjs";
export class Room {
    clients = [];
    static #genId() {
        let id = 0;
        for (const r of rooms) { id = Math.max(id, r.id); }
        return id + 1;
    }
    constructor(gameName) {
        this.gameName = gameName;
        this.id = Room.#genId();
        rooms.push(this);
    }
    async start() {
        this.globals = { world: new World(this.gameName, assets) };
        this.globals.scene = new Scene(this.globals.world);
        await this.globals.world.init(gamesInfo[this.gameName], assets);
        this.game = new (await import("../../games/" + this.gameName + "/" + gamesInfo[this.gameName].serverGame)).Game();
        await this.game.start(this.globals.scene, this.globals.world);
        this.updateLoop = startLoop(() => {
            for (const entity of this.globals.scene.entities) { entity.update(); }
            for (const client of this.clients)
                for (const player of client.players) { player.update(this.globals.world); }
            this.globals.world.update();
            this.game.update(this.globals.scene, this.globals.world);
        }, this.globals.world.updateRate);
        this.networkingLoop = startLoop(() => {
            socket.emitToRoom(this.id, "update", this.genNetworkingData());
        }, networkingRate);
    }
    genNetworkingData() {
        let data = { time: this.globals.world.time, entities: [] };
        for (const entity of this.globals.scene.entities) { data.entities.push(entity.genNetworkingData()); }
        for (const client of this.clients) { this.addClientData(client, data.entities); }
        return data;
    }
    addClientData(client, entities) {
        for (const player of client.players) {
            entities.push(player.genNetworkingData());
        }
    }
    removeClient(client) {
        let index = this.clients.indexOf(client);
        if (index > -1) this.clients.splice(index, 1);
    }
}