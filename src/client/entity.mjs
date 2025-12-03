import * as CANNON from "../../include/cannon.mjs";
import { world, assets } from "./client.mjs";
import { Sprite } from "./sprite.mjs";
export class Entity {
    get pos() { return this.rigidbody.position; }
    constructor(pos = new vec3(), src = "", root = false) {
        this.info = { pos: pos, src: src, root: root };
    }
    async getAssetsNames() {
        if (this.assetsNames) return this.assetsNames;
        let info = await assets.load("entities/" + this.info.src, "json", this.info.root);
        this.assetsNames = [
            { attribute: "spriteTexture", src: "sprites/" + info.sprite.src, type: "texture", root: info.sprite.root },
            { attribute: "shadowTexture", src: "sprites/shadow.png", type: "sheetTexture", root: true }
        ];
        info.pos = this.info.pos; this.info = info;
        return this.assetsNames;
    }
    async loadAssets() {
        await this.getAssetsNames();
        this.assets = await assets.loadObj(this.assetsNames);
    }
    initGraphics() {
        this.sprite = new Sprite(this.assets.spriteTexture, this.info.anchor);
        this.shadow = new Sprite(this.assets.shadowTexture);
        this.shadow.anim = "big_shadow";
        this.shadow.alpha = 0.35;
    }
    initPhysics() {
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
    async init() {
        await this.loadAssets();
        this.initGraphics();
        this.initPhysics();
    }
    drawShadow(pos) {
        let ray = new CANNON.Ray(
            new CANNON.Vec3(pos.x, pos.y, pos.z + 0.1),
            new CANNON.Vec3(pos.x, pos.y, pos.z - 10)
        );
        ray.mode = CANNON.RAY_MODES.CLOSEST;
        ray.skipBackfaces = true;
        let result = new CANNON.RaycastResult();
        ray.intersectBodies(world.bodies, result);
        let z = result.hitPointWorld.z;
        if (result.hasHit) {
            this.shadow.visible = true;
            let shadowPos = { x: pos.x, y: pos.y, z: z };
            this.shadow.draw(shadowPos);
            if (this.shadow.zIndex > this.sprite.zIndex) //so that shadow is behind sprite
                this.shadow.zIndex = this.sprite.zIndex - 0.000001;
        } else {
            this.shadow.visible = false;
        }
    }
    draw() {
        let pos = this.rigidbody.position;
        pos = { x: pos.x, y: pos.y, z: pos.z - this.size.z / 2 };
        this.sprite.draw(pos);
        this.drawShadow(pos);
    }
    update() { }
}