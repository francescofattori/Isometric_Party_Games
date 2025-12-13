import { io } from "../../include/socket.io.mjs";
import { startLoop, endLoop } from "../common/loop.mjs";
import { localPlayers, remotePlayers } from "./client.mjs";
import { Entity } from "./entity.mjs";
import { Player } from "./player.mjs";
import { vec2, vec3 } from "../common/vector.mjs";
export const networkingRate = 100;//times a second
export class Socket {
    connect(library, options) {
        this.library = library;
        this.options = options;
        switch (library) {
            case "socket.io":
                this.io = io(options.url + ":" + options.port);
                if (!options.on) options.on = {};
                Socket.mergeProperties(options.on, this.standardOn(library, options));
                for (const event in options.on) {
                    if (event == "disconnect") {
                        this.io.on(event, () => { options.on[event](); endLoop(this.loop); });
                    } else {
                        this.io.on(event, options.on[event]);
                    }
                }
        }
    }
    emit(event, data) {
        this.io.emit(event, data);
    };
    get connected() {
        return this.socket.connected;
    }
    static mergeProperties(a, b) {
        for (const key in b) {
            if (a[key]) continue;
            a[key] = b[key];
        }
    }
    standardOn(library, options) {
        return {
            "connect": () => {
                console.log("Connected to server:" + options.url + ":" + options.port + " using " + library);
            },
            "disconnect": () => {
                console.log("Disconnected from server");
                for (const player of remotePlayers) {
                    player.destroy();
                }
            },
            "log": (data) => {
                console.log(data);
            },
            "joined": () => {
                this.emit("joinData", this.genJoinData());
            },
            "joinData": async (data) => {
                for (const id of data.localIds) {
                    const player = Entity.getEntity(id.local);
                    player.id.value = id.remote;
                }
                for (const playerData of data.remotePlayers) {
                    const player = new Player(playerData.pos); await player.init();
                    remotePlayers.push(player);
                    player.id.value = playerData.id;
                }
                this.loop = startLoop(() => {
                    this.emit("update", this.genUpdateData());
                }, networkingRate);
            },
            "clientJoined": async (data) => {
                for (const playerData of data) {
                    const player = new Player(playerData.pos); await player.init();
                    remotePlayers.push(player);
                    player.id.value = playerData.id;
                }
            },
            "clientDisconnected": (data) => {
                for (const id of data) {
                    const player = Entity.getEntity(id);
                    player.destroy();
                }
            },
            "update": (data) => {
                for (const entityData of data) {
                    const entity = Entity.getEntity(entityData.id);
                    if (!entity) continue;
                    entity.setPos(new vec3(entityData.pos));
                    let index = localPlayers.indexOf(entity);
                    if (index <= -1) entity.setVel(new vec3(entityData.vel));
                    if (entityData.player) {
                        entity.controller.rightAngle = entityData.rightAngle;
                        entity.sprite.anim = entityData.sprite.anim;
                        entity.sprite.flip = new vec2(entityData.sprite.flip);
                        entity.sprite.back = entityData.sprite.back;
                    }
                }
            }
        };
    }
    genJoinData() {
        let data = [];
        for (const player of localPlayers) {
            data.push({ id: player.id.value, pos: player.pos });
        }
        return data;
    }
    genUpdateData() {
        let data = [];
        for (const player of localPlayers) {
            data.push({
                id: player.id.value, vel: player.vel,
                rightAngle: player.controller.rightAngle,
                sprite: { anim: player.sprite.anim, flip: player.sprite.flip, back: player.sprite.back }
            });
        }
        return data;
    }
}