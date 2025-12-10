import express from "express";
import http from "http";
import https from "https";
import fs from "fs/promises";
import { Room } from "./room.mjs";
import { startLoop, endLoop } from "../../src/common/loop.mjs";
import { AssetsManager } from "../../src/server/assets.mjs";
import { Socket, Website } from "../../src/server/networking.mjs";
export const rooms = [];
export const assets = new AssetsManager();
export const socket = new Socket();
export const website = new Website();

var options = { port: 5501, public: false, hostWebsite: false, protocol: "http", sslOptions: {} };

//MAIN
try {
    options = JSON.parse(await fs.readFile("options.json", "utf8"));
    if (options.protocol == "https") {
        let keyPath = options.sslOptions.key, certPath = options.sslOptions.cert;
        options.sslOptions = {
            key: await fs.readFile(keyPath, "utf8"),
            cert: await fs.readFile(certPath, "utf8")
        };
    }
} catch (e) { };
const app = express();
var server;
switch (options.protocol) {
    case "https":
        server = https.createServer(options.sslOptions, app);
        break;
    default:
        server = http.createServer(app);
        break;
}
if (options.hostWebsite) website.host(app);
socket.host(server, options.port, options.public);

let room = new Room("hub"); await room.start();
/*
io.on("connection", (client) => {
    console.log("user" + client.id + " connected");
    client.on("disconnect", () => {
        console.log("user" + client.id + " disconnected");
    });
    client.on("joinRequest", (data) => {
        let gameName = data.game; let roomId = data.room;
        for (const r of rooms) {
            if (r.game == gameName && r.id == roomId) {
                r.clients.push(client);
                client.join(r.id);
                break;
            }
        }
    });
});
server.listen(port, () => {
    console.log("server running at http://localhost:" + port);
});

let room = new Room("hub", "0"); await room.init();

startLoop(() => {//logic loop
    for (const room of rooms) {
        room.main.update(room.game);
    }
}, 200);

startLoop(() => {//networking loop
    for (const room of rooms) {
        for (const client of room.clients) {
            //client.emit("update", room.game);
        }
    }
}, 100);
*/
