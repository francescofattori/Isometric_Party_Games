import * as PIXI from "../include/pixi.mjs";
import * as CANNON from "../include/cannon.mjs";
import { Scene } from "./scene.mjs";
import { Camera } from "./camera.mjs";
import { AssetsManager } from "./assets.mjs";
export function makeObjectGlobal(obj) {
    Object.entries(obj).forEach(([name, exported]) => window[name] = exported);
}
export const __root = ("parse" in URL) ? URL.parse("../../", location.href).href : location.href + "../../";
export const pixi = new PIXI.Application();
export const world = new CANNON.World();
export const scene = new Scene();
export const camera = new Camera();
export const assets = new AssetsManager();
//HTML
export const htmlStats = document.getElementById("stats");
//Init
export async function initPixi() {
    await pixi.init({
        background: "#1099bb", resizeTo: window,
        autoDensity: true, resolution: window.devicePixelRatio,
        //roundPixels: true
    });
    await assets.loadUI();
    document.body.appendChild(pixi.canvas);
}
export async function initCannon(materialsSrc, root = false) {
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

export { Player } from "./player.mjs"
export { vec2, vec3 } from "./vector.mjs";
export { Scene } from "./scene.mjs";
export { Controller } from "./controller.mjs"