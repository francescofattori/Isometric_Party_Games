//CLIENT
import { World } from "./world.mjs";
import { Renderer } from "./renderer.mjs";
import { Scene } from "./scene.mjs";
import { Camera } from "./camera.mjs";
import { AssetsManager } from "./assets.mjs";
import { Socket } from "./networking.mjs";
import { Controller } from "./controller.mjs";
import { Player } from "./player.mjs";
import { vec3 } from "../common/vector.mjs";
import { startLoop, endLoop } from "../common/loop.mjs";
import { start, update, gameName } from "main";
//global variables
export const world = new World();
export const scene = new Scene();
export const camera = new Camera();
export const assets = new AssetsManager();
export const socket = new Socket();
export const renderer = new Renderer();
export const localPlayers = [];
export const remotePlayers = [];
export const game = { scene: scene, world: world };
export { gameName } from "main";
//HTML
export const isMobile = {//checks if client is on mobile
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Macintosh: function () {
        if (navigator.userAgent.match(/Macintosh/i) && navigator.maxTouchPoints > 1)
            return true;
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Macintosh() || isMobile.Opera() || isMobile.Windows());
    }
};
//MAIN
await renderer.init();
await world.init();
await start(game);
let player = new Player(new vec3(0, 0, 5)); await player.init(); localPlayers.push(player);
camera.target = player.pos;
player.controller = new Controller(player, "keyboardAndMouse");
if (isMobile.any()) player.controller = new Controller(player, "touchControls");
window.addEventListener("gamepadconnected", (e) => {
    player.controller = new Controller(player, "gamepad", e.gamepad.index);
});

renderer.start();

socket.connect("socket.io", {
    url: "http://localhost", port: "5501", on: {
        "connect": () => {
            Socket.standardOn("socket.io", { url: "http://localhost", port: "5501" })["connect"]();
            socket.emit("joinRequest", { game: gameName, room: "0" });
        },
        "msg": (data) => { console.log(data); }
    }
});

startLoop(
    (loop) => {
        camera.update();
        scene.update();
        for (const player of localPlayers) player.update();
        for (const player of remotePlayers) player.update();
    },
    world.updateRate);
