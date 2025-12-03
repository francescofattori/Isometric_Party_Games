//CLIENT
import * as CANNON from "../../include/cannon.mjs";
import * as PIXI from "../../include/pixi.mjs";
import { Scene } from "./scene.mjs";
import { Camera } from "./camera.mjs";
import { AssetsManager } from "./assets.mjs";
import { Socket } from "./networking.mjs";
import { Controller } from "./controller.mjs";
import { Player } from "./player.mjs";
import { vec3 } from "../common/vector.mjs";
import { start, update } from "main";
//global variables
export const pixi = new PIXI.Application();
export const world = new CANNON.World();
export const scene = new Scene();
export const camera = new Camera();
export const assets = new AssetsManager();
export const socket = new Socket();
export const game = { scene: scene, world: world };
//HTML
export const htmlStats = document.getElementById("stats");
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
//Init
async function initPixi() {
    await pixi.init({
        background: "#1099bb", resizeTo: window,
        autoDensity: true, resolution: window.devicePixelRatio,
        //roundPixels: true
    });
    await assets.loadUI();
    document.body.appendChild(pixi.canvas);
}
async function initCannon(materialsSrc, root = false) {
    world.gravity = new CANNON.Vec3(0, 0, -40);
    world.updateTime = 0; world.lastUpdate = 0; world.statTime = 0;
    world.updateTimeSum = 0; world.FPSSum = 0; world.statCount = 0;
    world.run = true; world.dt = 1.0 / 200.0;
    world.materials = {};
    if (materialsSrc != undefined) {
        let data = await assets.load(materialsSrc, "json", root);
        for (const name of data.names) { world.materials[name] = new CANNON.Material(name); }
        for (let i = 0; i < data.table.length; i++) {
            const row = data.table[i];
            for (let j = 0; j < row.length; j++) {
                const contact = row[j];
                let mat1 = world.materials[data.names[i]]; let mat2 = world.materials[data.names[i + j]];
                let contactMaterial = new CANNON.ContactMaterial(mat1, mat2, {
                    friction: contact.f, restitution: contact.r
                });
                world.addContactMaterial(contactMaterial);
            }
        }
    }
    world.defaultContactMaterial.contactEquationRelaxation = 10;
    world.defaultContactMaterial.contactEquationStiffness = 5e8;
}
//Entry point of client
await initPixi();
await initCannon("materials.json", true);
await start(game);
let player = new Player(new vec3(0, 0, 5)); await player.init();
camera.target = player.pos;
player.controller = new Controller(player, "keyboardAndMouse");
if (isMobile.any()) player.controller = new Controller(player, "touchControls");
window.addEventListener("gamepadconnected", (e) => {
    player.controller = new Controller(player, "gamepad", e.gamepad.index);
});
scene.add(player);

socket.connect("socket.io", { url: "http://localhost", port: "5501" });