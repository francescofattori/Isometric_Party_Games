import { pixi, world, assets, scene } from "./global.mjs";
import { SceneMap } from "./map.mjs";
import { Entity } from "./entity.mjs";
export class Scene {
    state = "inactive"; map = undefined; entities = [];
    constructor(alias, root = false) {
        this.info = { alias: alias, root: root };
    }
    async getAssetsNames() {
        let info = await assets.load("scenes/" + this.info.alias + ".json", "json", this.info.root);
        let assetsNames = [await new SceneMap(info.map.alias, info.map.root).getAssetsNames()];
        for (const entity of info.entities) {
            assetsNames.push(await new Entity(entity.pos, entity.src, entity.root).getAssetsNames());
        }
        this.info = info;
        return assetsNames;
    }
    async loadAssets() {
        this.loaded = true;
        await assets.loadObj(await this.getAssetsNames());
    }
    async init() {
        if (!this.loaded) await this.loadAssets();
        this.map = new SceneMap(this.info.map.alias, this.info.map.root); await this.map.init();
        for (const _entity of this.info.entities) {
            let entity = new Entity(_entity.pos, _entity.src, _entity.root); await entity.init();
            this.add(entity);
        }
    }
    async load(alias, root = false) {
        this.info = { alias: alias, root: root };
        await this.loadAssets();
        await this.init();
    }
    set(other) {
        this.map = other.map; this.entities = other.entities;
    }
    add(entity) {
        this.entities.push(entity);
    }
    draw = this.draw.bind(this);
    draw() {
        //DEBUG
        if (world.time > 1.0) {
            if (world.time - world.statTime > 1.0) {
                world.statTime = world.time;
                htmlStats.innerText = "FPS: " + (world.FPSSum / world.statCount).toFixed(0) +
                    " UT: " + (world.updateTimeSum / world.statCount).toFixed(2);
                world.updateTimeSum = 0; world.FPSSum = 0; world.statCount = 0;
            }
        }
        world.updateTimeSum += world.updateTime;
        world.FPSSum += pixi.ticker.FPS;
        world.statCount += 1;
        //-----
        this.map.draw();
        for (let entity of this.entities) { entity.draw(); }
    }
    update() {
        for (const entity of this.entities) { entity.update(); }
        camera.update();
        let t = performance.now() / 1000.0;
        world.step(world.dt, t - world.lastUpdate);
        world.lastUpdate = t;
    }
    enterLoop() {//starts physics loop
        let t = performance.now();
        this.update(); world.updateTime = (performance.now() - t);
        if (!world.run) return;
        setTimeout(() => { this.enterLoop(); }, (world.dt * 1000.0) - world.updateTime);
    }
    play() {
        if (this != scene) return;
        this.state = "active";
        document.body.style.opacity = "1";
        world.run = true;
        this.enterLoop();
        pixi.ticker.add(this.draw);
    }
    stop() {
        if (this != scene) return;
        this.state = "inactive";
        htmlViewport.style.opacity = "0";
        world.run = false;
        for (const entity of this.entities) {
            try { entity.sprite.stop(); } catch (e) { }
        }
        pixi.ticker.remove(this.draw);
    }
}