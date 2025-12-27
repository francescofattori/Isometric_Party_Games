import * as PIXI from "../include/pixi.mjs";
import FontFaceObserver from "../include/fontfaceobserver.mjs";
import { assets, gameInfo, localPlayers, remotePlayers, scene, socket, world, menu } from "./client.mjs";
import { calcPixSize, calcFontSize } from "./ui.mjs";
export const htmlStats = document.getElementById("stats");
export const htmlViewPort = document.getElementById("viewport");
export class Renderer {
    ui = { guiScale: 2, pixSize: 1, fontSize: 16};
    async init() {
        //LOADING FONT
        let font = document.createElement("style");
        font.innerHTML = `
            @font-face{
                font-family:"pixelFont"; src:url(${assets.root}/assets/ui/fonts/ProggyClean.ttf);
            }
        `;
        document.head.appendChild(font);
        let observer = new FontFaceObserver("pixelFont");
        await observer.load();
        //DEBUG
        htmlStats.style.fontFamily = "pixelFont";
        htmlStats.style.fontSize = Math.round(16 / window.devicePixelRatio) * window.devicePixelRatio + "px";
        htmlStats.style.textShadow = `
            0.5px 0.5px black, -0.5px 0.5px black, 0.5px -0.5px black, -0.5px -0.5px black,
            0.5px 0 black, -0.5px 0 black, 0 0.5px black, 0 -0.5px black
        `;
        htmlStats.style.width = "14em";
        htmlStats.style.margin = "10px 5px 0 5px";
        this.pixi = new PIXI.Application();
        await this.pixi.init({
            background: "#1099bb", resizeTo: window,
            autoDensity: true, resolution: window.devicePixelRatio,
            //roundPixels: true
        });
        document.cookie.split(";").forEach(item => {
            item = item.trim();
            if (item.startsWith("guiScale=")) this.ui.guiScale = parseInt(item.split("=")[1]);
        });
        calcPixSize(); calcFontSize();
        let ui = gameInfo.ui;
        if (ui) await assets.loadUI(ui.src, ui.root);
        htmlViewPort.appendChild(this.pixi.canvas);
    }
    start() {
        htmlViewPort.style.opacity = "1";
        this.pixi.ticker.add(this.draw);
    }
    stop() {
        htmlViewPort.style.opacity = "0";
        this.pixi.ticker.remove(this.draw);
    }
    draw = this.draw.bind(this);
    draw() {
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
        world.FPSSum += this.pixi.ticker.FPS;
        world.statCount += 1;
        //-----
        menu.draw();
        scene.map.draw();
        for (let entity of scene.entities) { entity.draw(); }
        for (const player of localPlayers) { player.draw(); }
        for (const player of remotePlayers) { player.draw(); }
    }
    toggleFullscreen() {
        if (!this.fullscreen) { document.body.requestFullscreen(); this.fullscreen = true; }
        else { document.exitFullscreen(); this.fullscreen = false; }
    }
}