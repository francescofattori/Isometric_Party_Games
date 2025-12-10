//CLIENT
import { world, assets } from "./client.mjs";
import { SceneMap } from "./map.mjs";
import { Entity } from "./entity.mjs";
export class Scene {
    map = undefined; entities = [];
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
    update() {
        for (const entity of this.entities) { entity.update(); }
        let t = performance.now() / 1000.0;
        world.step(world.dt, t - world.lastUpdate);
        world.lastUpdate = t;
    }
}