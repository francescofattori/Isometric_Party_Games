import * as PIXI from "pixi";
import * as CANNON from "cannon";
import { Scene } from "./scene.mjs";
import { Camera } from "./camera.mjs";
import { AssetsManager } from "./assets.mjs";
export function makeObjectGlobal(obj) {
    Object.entries(obj).forEach(([name, exported]) => window[name] = exported);
}
export const __root = URL.parse("../../", location.href).href;
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
        background: "#1099bb", autoDensity: true,
        resolution: window.devicePixelRatio
    });
    document.body.appendChild(pixi.canvas);
    window.onresize = () => {
        let w = window.innerWidth * window.devicePixelRatio; let h = window.innerHeight * window.devicePixelRatio;
        w = 2 * Math.round(w / 2) / window.devicePixelRatio; h = 2 * Math.round(h / 2) / window.devicePixelRatio;
        pixi.renderer.resize(w, h);
    };
    window.onresize();
    pixi.resize();
}
export async function initCannon(materialsSrc, root = false) {
    world.gravity = new CANNON.Vec3(0, 0, -40);
    world.updateTime = 0; world.lastUpdate = 0; world.statTime = 0;
    world.updateTimeSum = 0; world.FPSSum = 0; world.statCount = 0;
    world.run = true; world.dt = 1.0 / 200.0;
    world.materials = {};
    if (materialsSrc != undefined) {
        let data = await assets.load("assets/" + materialsSrc, "json", root);
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

export { Player } from "./player.mjs"
export { vec2, vec3 } from "./vector.mjs";
export { Scene } from "./scene.mjs";