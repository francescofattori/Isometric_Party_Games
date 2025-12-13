//COMMON
export class Scene {
    map = undefined; entities = []; world = undefined;
    constructor(alias, root = false) {
        this.info = { alias: alias, root: root };
    }
    async getInfo(assets) {
        if (this.infoLoaded) return;
        let info = await assets.load("scenes/" + this.info.alias + ".json", "json", this.info.root);
        this.info = info; this.infoLoaded = true;
    }
    async getAssetsNames(assets, Entity, SceneMap) {
        await this.getInfo(assets);
        let assetsNames = [await new SceneMap(this.info.map.alias, this.info.map.root).getAssetsNames(assets)];
        for (const entity of this.info.entities) {
            assetsNames.push(await new Entity(entity.pos, entity.src, entity.root).getAssetsNames(assets));
        }
        this.assetsNames = assetsNames;
        return this.assetsNames;
    }
    async loadAssets(assets, Entity, SceneMap) {
        if (this.loaded) return;
        await assets.loadObj(await this.getAssetsNames(assets, Entity, SceneMap));
        this.loaded = true;
    }
    async init(assets, Entity, SceneMap) {
        await this.loadAssets(assets, Entity, SceneMap);
        this.map = new SceneMap(this.info.map.alias, this.info.map.root); await this.map.init(assets, this.world);
        for (const _entity of this.info.entities) {
            let entity = new Entity(_entity.pos, _entity.src, _entity.root); await entity.init(this.world);
            this.add(entity);
        }
    }
    async load(assets, Entity, SceneMap, alias, root = false) {
        this.info = { alias: alias, root: root };
        await this.loadAssets(assets, Entity, SceneMap);
        await this.init(assets, Entity, SceneMap);
    }
    set(other) {
        this.map = other.map; this.entities = other.entities;
    }
    add(entity) {
        this.entities.push(entity);
    }
    remove(entity) {
        let index = this.entities.indexOf(entity);
        if (index > -1) this.entities.splice(index, 1);
    }
}