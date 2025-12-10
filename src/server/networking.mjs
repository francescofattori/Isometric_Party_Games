//SERVER
import express from "../../server/node_modules/express/index.js";
import { Server as Socket_IO_Server } from "../../server/node_modules/socket.io/dist/index.js";
export class Socket {
    host(server, port, _public) {
        this.io = new Socket_IO_Server(server, { cors: { origin: "*" } });
        this.io.on("connection", (client) => {
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
        let ip = _public ? "0.0.0.0" : "localhost";
        server.listen(port, ip, () => {
            console.log("Started " + (_public ? "Public" : "Local") + " server at port:" + port);
        });
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