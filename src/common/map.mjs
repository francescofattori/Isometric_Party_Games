import * as CANNON from "../../include/cannon.mjs";
export class SceneMap {
    constructor(alias, root) {
        this.info = { alias: alias, root: root };
    }
    async getInfo(assets) {
        if (this.infoLoaded) return;
        let alias = this.info.alias; let root = this.info.root;
        let folder = "maps/" + alias + "/";
        let info = await assets.load(folder + alias + ".json", "json", root);
        info.folder = folder; info.alias = alias; info.root = root;
        this.info = info; this.infoLoaded = true;
    }
    genAssetsNames() {
        return [];
    }
    async getAssetsNames(assets) {
        if (this.assetsNames) return this.assetsNames;
        await this.getInfo(assets);
        this.assetsNames = this.genAssetsNames();
        return this.assetsNames;
    }
    async loadAssets(assets) {
        if (this.loaded) return;
        await this.getAssetsNames(assets);
        this.assets = await assets.loadObj(this.assetsNames);
        this.loaded = true;
    }
    initPhysics(world) {
        //Depth calculations
        this.size = this.info.size;
        this.center = this.info.center;
        this.maxHeight = 10;
        this.maxZIndex = 2.0 * (this.size.z - this.center.z) - this.center.x - this.center.y + 100;
        this.minZIndex = 2.0 * this.center.z - (this.size.x - this.center.x) - (this.size.y - this.center.y) - 100;
        this.multZIndex = 1.0 / (this.maxZIndex - this.minZIndex);
        //Collisions
        this.heights = this.info.heights;
        this.collider = new CANNON.Body({ type: CANNON.Body.STATIC });
        for (let i = 0; i < this.heights.length; i++) {
            const row = this.heights[i];
            for (let j = 0; j < row.length; j++) {
                const height = row[j];
                if (height <= 0 || height >= this.size.z) continue;
                let x = j - this.center.x;
                let y = this.heights.length - 1 - i - this.center.y;
                let pos = new CANNON.Vec3(x, y, height - this.center.z - (height + 1) / 2);
                const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, (height + 1) / 2));
                shape.material = world.materials["map"];
                this.collider.addShape(shape, pos);
            }
        }
        this.collider.jumpable = true;
        this.collider.tag = "map";
        world.addBody(this.collider);
    }
    async init(assets, world) {
        await this.loadAssets(assets);
        this.initPhysics(world);
    }
    heightAt(p) {
        let x = Math.round(p.x + this.center.x);
        let y = Math.round(this.size.y - 1 - (p.y + this.center.y));
        //if outside find closest point on border
        if (x < 0) x = 0; if (x >= this.size.x) x = this.size.x - 1;
        if (y < 0) y = 0; if (y >= this.size.y) y = this.size.y - 1;
        return this.heights[y][x];
    }
    zAt(p) {
        let z = this.heightAt(p);
        if (z <= 0 || z >= this.size.z) return undefined;
        return z - this.center.z;
    }
}