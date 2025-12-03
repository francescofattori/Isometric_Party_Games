import express from "express";
import http from "http";
import { Server } from "socket.io";
const rooms = [];
const port = 5501;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/*app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});*/

io.on("connection", (client) => {
    console.log("user" + client.id + " connected");
});
server.listen(port, () => {
    console.log("server running at http://localhost:" + port);
});

//when client connects
//detect game
//import main file of that game, save it in rooms

let game = "hub";
let main = await import("../../games/" + game + "/main.mjs");
rooms.push(main);
main.start();

