//COMMON
import * as CANNON from "../../include/cannon.mjs";
import { vec3 } from "./vector.mjs";
export class Entity {
    static IDs = [];
    get pos() { return this.rigidbody.position; }
    get vel() { return this.rigidbody.velocity; }
    constructor(pos = new vec3(), src = "", root = false) {
        this.info = { pos: pos, src: src, root: root };
    }
    async getInfo(assets) {
        let info = await assets.load("entities/" + this.info.src, "json", this.info.root);
        info.pos = this.info.pos; this.info = info;
        this.infoLoaded = true;
    }
    genAssetsNames() {
        return [];
    }
    async getAssetsNames(assets) {
        if (this.assetsNames) return this.assetsNames;
        if (!this.infoLoaded) await this.getInfo(assets);
        this.assetsNames = this.genAssetsNames();
        return this.assetsNames;
    }
    async loadAssets(assets) {
        await this.getAssetsNames(assets);
        this.assets = await assets.loadObj(this.assetsNames);
    }
    initPhysics(world) {
        let collider = this.info.collider;
        this.rigidbody = new CANNON.Body({ mass: collider.mass, fixedRotation: true });
        let shape;
        switch (collider.type) {
            case "box":
                shape = new CANNON.Box(new CANNON.Vec3(collider.size.x / 2, collider.size.y / 2, collider.size.z / 2));
                break;
        }
        shape.material = world.materials[collider.material];
        this.rigidbody.addShape(shape); this.size = collider.size;
        this.rigidbody.jumpable = true;
        this.rigidbody.position.set(this.info.pos.x, this.info.pos.y, this.info.pos.z);
        world.addBody(this.rigidbody);
    }
    static #genId() {
        let id = { value: 0 };
        for (const i of Entity.IDs) { id.value = Math.max(id.value, i.value); }
        id.value += 1;
        return id;
    }
    async init(assets, world) {
        this.id = Entity.#genId();
        Entity.IDs.push(this.id);
        await this.loadAssets(assets);
        this.initPhysics(world);
    }
    setPos(v) {
        this.rigidbody.position.set(v.x, v.y, v.z);
    }
    setVel(v) {
        this.rigidbody.velocity.set(v.x, v.y, v.z);
    }
    destroy(scene, world) {
        world.removeBody(this.rigidbody);
        scene.remove(this);
        let index = Entity.IDs.indexOf(this.id);
        if (index > -1) Entity.IDs.splice(index, 1);
    }
    update() { }
}