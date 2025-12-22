import * as PIXI from "../include/pixi.mjs";
import { assets, gameInfo, localPlayers, remotePlayers, scene, socket, world } from "./client.mjs";
export const pixi = new PIXI.Application();
export const htmlStats = document.getElementById("stats");
export const htmlViewPort = document.getElementById("viewport");
export class Renderer {
    async init() {
        await pixi.init({
            background: "#1099bb", resizeTo: window,
            autoDensity: true, resolution: window.devicePixelRatio,
            //roundPixels: true
        });
        let ui = gameInfo.ui;
        if (ui) await assets.loadUI(ui.src, ui.root);
        htmlViewPort.appendChild(pixi.canvas);
    }
    start() {
        htmlViewPort.style.opacity = "1";
        pixi.ticker.add(Renderer.draw);
    }
    stop() {
        htmlViewPort.style.opacity = "0";
        pixi.ticker.remove(Renderer.draw);
    }
    static draw() {
        //DEBUG
        if (world.time > 1.0) {
            if (world.time - world.statTime > 1.0) {
                world.statTime = world.time;
                htmlStats.innerText =
                    "fps: " + (world.FPSSum / world.statCount).toFixed(0) +
                    " ups: " + (world.statCount / world.updateTimeSum).toFixed(0) +
                    " ping: " + socket.ping.toFixed(0) + "ms";
                world.updateTimeSum = 0; world.FPSSum = 0; world.statCount = 0;
            }
        }
        world.updateTimeSum += world.updateTime;
        world.FPSSum += pixi.ticker.FPS;
        world.statCount += 1;
        //-----
        scene.map.draw();
        for (let entity of scene.entities) { entity.draw(); }
        for (const player of localPlayers) { player.draw(); }
        for (const player of remotePlayers) { player.draw(); }
    }
}