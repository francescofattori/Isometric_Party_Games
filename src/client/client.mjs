//CLIENT
import * as PIXI from "../include/pixi.mjs";
import { AssetsManager } from "./assets.mjs";
import { World } from "../common/world.mjs";
import { Renderer } from "./renderer.mjs";
import { Scene } from "./scene.mjs";
import { Camera } from "./camera.mjs";
import { Socket } from "./networking.mjs";
import { Controller } from "./controller.mjs";
import { Player } from "./player.mjs";
import { vec3 } from "../common/vector.mjs";
import { startLoop, endLoop } from "../common/loop.mjs";
import { Game } from "game";
//global variables
export const assets = new AssetsManager();
export const world = new World();
export const scene = new Scene();
export const camera = new Camera();
export const socket = new Socket();
export const renderer = new Renderer();
export const localPlayers = [];
export const remotePlayers = [];
export const game = new Game();
export const gameInfo = (await assets.load("../games/games.json", "json", true))[game.name];
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
await world.init(gameInfo, assets);
await game.start(scene, world);
let player = new Player(new vec3(0, 0, 5)); await player.init(); localPlayers.push(player);
camera.target = player.pos;
player.controller = new Controller(player, "keyboardAndMouse");
if (isMobile.any()) player.controller = new Controller(player, "touchControls");
window.addEventListener("gamepadconnected", (e) => {
    player.controller = new Controller(player, "gamepad", e.gamepad.index);
});
player.sprite.tint = 0xfcc2c2;

renderer.start();
let url = window.location.protocol + "//" + window.location.hostname;
socket.connect("geckos.io", {
    url: url, port: "5501", on: {
        "connect": (error) => {
            socket.standardOn("geckos.io", { url: url, port: "5501" })["connect"](error);
            socket.emit("joinRequest", { game: game.name, room: 1 });
        }
    }
});
export const updateLoop = startLoop((loop) => {
    camera.update();
    for (const entity of scene.entities) { entity.update(); }
    for (const player of localPlayers) player.update();
    world.update();
    //for (const player of remotePlayers) player.update();
}, world.updateRate);

