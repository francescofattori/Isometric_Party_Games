//SERVER
import express from "./node_modules/express/index.js";
import { Server as Socket_IO_Server } from "./node_modules/socket.io/dist/index.js";
import { rooms } from "./server.mjs";
import { Entity } from "./entity.mjs";
import { Player } from "./player.mjs";
import { vec2, vec3 } from "../common/vector.mjs";
export const networkingRate = 100;//times a second
export class Socket {
    static genJoinData(client) {
        const room = client.room;
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
    host(server, port, _public) {
        this.io = new Socket_IO_Server(server, { cors: { origin: "*" } });
        this.io.on("connection", (client) => {
            client.players = [];
            console.log("user" + client.id + " connected");
            client.on("disconnect", () => {
                client.room.removeClient(client);
                let ids = [];
                for (const player of client.players) {
                    ids.push(player.id.value);
                    player.destroy(client.room.globals.scene, client.room.globals.world);
                }
                client.broadcast.to(client.room.id).emit("clientDisconnected", ids);
                console.log("user" + client.id + " disconnected");
            });
            client.on("joinRequest", (data) => {
                let gameName = data.game; let roomId = data.room;
                for (const r of rooms) {
                    if (r.gameName == gameName && r.id == roomId) {
                        r.clients.push(client); client.room = r;
                        client.join(r.id);
                        client.emit("joined");
                        console.log("user" + client.id + " joined room: " + r.id);
                        break;
                    }
                }
            });
            client.on("joinData", async (data) => {
                for (const player of data) {
                    let p = new Player(player.pos); await p.init(client.room.globals.world);
                    p.clientId = player.id; client.players.push(p);
                }
                client.emit("joinData", Socket.genJoinData(client));
                let playersData = [];
                for (const player of client.players) {
                    playersData.push(player.genNetworkingData());
                }
                client.broadcast.to(client.room.id).emit("clientJoined", playersData);
            });
            client.on("update", (data) => {
                if (!client.room) return;
                for (const playerData of data) {
                    const player = Entity.getEntity(client, playerData.id);
                    player.setVel(playerData.vel);
                    player.controller.rightAngle = playerData.rightAngle;
                    player.sprite.anim = playerData.sprite.anim;
                    player.sprite.flip = new vec2(playerData.sprite.flip);
                    player.sprite.back = playerData.sprite.back;
                }
            });
        });
        let ip = _public ? "0.0.0.0" : "localhost";
        server.listen(port, ip, () => {
            console.log("Started " + (_public ? "Public" : "Local") + " server at port:" + port);
        });
    }
    broadcastRoom(id, event, data) {
        this.io.to(id).emit(event, data);
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