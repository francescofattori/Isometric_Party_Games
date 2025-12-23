import { geckos as Geckos_IO } from "../include/geckos.io-client.mjs";
import { io as Socket_IO } from "../node_modules/socket.io/client-dist/socket.io.esm.min.js";
import { localPlayers, remotePlayers, world } from "./client.mjs";
import { Entity } from "./entity.mjs";
import { Player } from "./player.mjs";
import { endLoop, startLoop } from "./loop.mjs";
import { vec2, vec3 } from "../common/vector.mjs";

export const networkingRate = 50;//times a second
export const pingRate = 5;//times a second
export class Socket {
    ping = 0; pingTime = 0; pingCount = networkingRate / pingRate;
    connect(library, options) {
        this.library = library;
        this.options = options;
        switch (library) {
            case "socket.io":
                this.io = Socket_IO(options.url + ":" + options.port); break;
            case "geckos.io":
                this.io = Geckos_IO({ port: options.port, url: options.url }); break;
        }
        if (!options.on) options.on = {};
        Socket.mergeProperties(options.on, this.standardOn(library, options));
        for (const event in options.on) {
            if (event == "disconnect") {
                switch (library) {
                    case "socket.io":
                        this.io.on(event, () => { options.on[event](); endLoop(this.loop); }); break;
                    case "geckos.io":
                        this.io.onDisconnect(() => { options.on[event](); endLoop(this.loop); }); break;
                }
            } else if (event == "connect" && library == "geckos.io") {
                this.io.onConnect(options.on[event]);
            }
            else {
                this.io.on(event, options.on[event]);
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
            "connect": (error) => {
                if (error) console.error(error.message);
                else console.log("Connected to server:" + options.url + ":" + options.port + " using " + library);
            },
            "disconnect": () => {
                console.log("Disconnected from server");
                for (const player of remotePlayers) {
                    player.destroy();
                }
            },
            "pong": (data) => {
                this.ping = 0.5 * (performance.now() - this.pingTime);
                world.serverTime = data;
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
                    this.pingCount++;
                    if (this.pingCount >= networkingRate / pingRate) {
                        this.emit("ping"); this.pingTime = performance.now();
                        this.pingCount = 0;
                    }
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
                if (Math.abs(world.serverTime - data.time) > 0.1) return;
                for (const entityData of data.entities) {
                    const entity = Entity.getEntity(entityData.id);
                    if (!entity) continue;
                    entity.setPos(new vec3(entityData.pos).plus(entity.pos).times(0.5));
                    let index = localPlayers.indexOf(entity);
                    if (index > -1) continue;
                    entity.setVel(entityData.vel);
                    if (entityData.player) {
                        entity.controller.rightAngle = entityData.rightAngle;
                        entity.sprite.anim = entityData.sprite.anim;
                        entity.sprite.flip = new vec2(entityData.sprite.flip);
                        entity.sprite.back = entityData.sprite.back;
                    }
                }
            }
        }
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
                id: player.id.value, jump: player.controller.jump, run: player.controller.run,
                leftStick: player.controller.leftStick, rightStick: player.controller.rightStick,
            });
        }
        return data;
    }
}