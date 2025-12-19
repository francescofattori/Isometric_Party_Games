//SERVER
import express from "express";
import { Server as Socket_IO_Server } from "socket.io";
import { geckos as Geckos_IO_Server, iceServers } from "@geckos.io/server";
import { rooms } from "./server.mjs";
import { Entity } from "./entity.mjs";
import { Player } from "./player.mjs";
import { vec2, vec3 } from "../common/vector.mjs";
//----------
export const networkingRate = 50; //times a second
export class Socket {
    static genJoinData(client) {
        const room = client.gameRoom;
        let data = { localIds: [], map: room.globals.scene.map.info.alias, entities: [], remotePlayers: [] };
        for (const player of client.players) { data.localIds.push({ local: player.clientId, remote: player.id.value }); }
        for (const roomClient of room.clients) {
            if (roomClient == client) continue;
            for (const player of roomClient.players) {
                data.remotePlayers.push(player.genNetworkingData());
            }
        }
        for (const entity of room.globals.scene.entities) { data.entities.push(entity.genNetworkingData()); }
        return data;
    }
    standardOn = this.standardOn.bind(this);
    standardOn(client) {
        return {
            "disconnect": () => {
                client.gameRoom.removeClient(client);
                let ids = [];
                for (const player of client.players) {
                    ids.push(player.id.value);
                    player.destroy(client.gameRoom.globals.scene, client.gameRoom.globals.world);
                }
                this.broadcastToRoom(client, "clientDisconnected", ids);
                console.log("user" + client.id + " disconnected");
            },
            "ping": () => { this.emit(client, "pong"); },
            "joinRequest": (data) => {
                let gameName = data.game; let roomId = data.room;
                for (const r of rooms) {
                    if (r.gameName == gameName && r.id == roomId) {
                        r.clients.push(client);
                        client.gameRoom = r; client.join(r.id);
                        this.emit(client, "joined");
                        console.log("user" + client.id + " joined room: " + r.id);
                        break;
                    }
                }
            },
            "joinData": async (data) => {
                for (const player of data) {
                    let p = new Player(player.pos); await p.init(client.gameRoom.globals.world);
                    p.clientId = player.id; client.players.push(p);
                }
                this.emit(client, "joinData", Socket.genJoinData(client));
                let playersData = [];
                for (const player of client.players) {
                    playersData.push(player.genNetworkingData());
                }
                this.broadcastToRoom(client, "clientJoined", playersData);
            },
            "update": (data) => {
                if (!client.gameRoom) return;
                for (const playerData of data) {
                    const player = Entity.getEntity(client, playerData.id);
                    player.inputVel = playerData.inputVel;
                    player.rigidbody.velocity.z = playerData.inputVel.z;
                    player.controller.rightAngle = playerData.rightAngle;
                    player.sprite.anim = playerData.sprite.anim;
                    player.sprite.flip = new vec2(playerData.sprite.flip);
                    player.sprite.back = playerData.sprite.back;
                }
            }
        }
    }
    host(server, library, port, _public) {
        this.library = library;
        switch (library) {
            case "socket.io":
                this.io = new Socket_IO_Server(server, { cors: { origin: "*" } });
                break;
            case "geckos.io":
                this.io = Geckos_IO_Server({ iceServers: iceServers, portRange: { min: 10000, max: 20000 }, cors: { origin: "*" } });
                this.io.addServer(server);
                break;
        }
        this.on("connection", (client) => {
            client.players = [];
            let clientOns = this.standardOn(client);
            for (const event in clientOns) {
                this.onClient(client, event, clientOns[event]);
            }
        })
        let ip = _public ? "0.0.0.0" : undefined;
        let s = "Started " + (_public ? "Public" : "Local") + " server at port:" + port;
        if (ip) server.listen(port, ip, () => { console.log(s); });
        else server.listen(port, () => { console.log(s); });
    }
    emitToEveryone(event, data) { this.io.emit(event, data); }
    emit(client, event, data) { client.emit(event, data); }
    emitToRoom(roomId, event, data) {
        switch (this.library) {
            case "socket.io": this.io.to(roomId).emit(event, data); break;
            case "geckos.io": this.io.room(roomId).emit(event, data); break;
        }
    }
    broadcastToRoom(client, event, data) {
        switch (this.library) {
            case "socket.io": client.broadcast.to(client.gameRoom.id).emit(event, data); break;
            case "geckos.io": client.broadcast.emit(event, data); break;
        }
    }
    on(event, callback) {
        if (this.library == "geckos.io" && event == "connection") this.io.onConnection(callback);
        else this.io.on(event, callback);
    }
    onClient(client, event, callback) {
        if (this.library == "geckos.io" && event == "disconnect") client.onDisconnect(callback);
        else client.on(event, callback);
    }
};
export class Website {
    host(app) {
        app.use(express.static("../"));
        app.get("/", (req, res) => {
            res.redirect("/games/hub/");
        });
    }
};