import { Entity as CommonEntity } from "../common/entity.mjs";
import * as CANNON from "../../include/cannon.mjs";
import { assets, world, scene, localPlayers, remotePlayers } from "./client.mjs";
import { Sprite } from "./sprite.mjs";
export class Entity extends CommonEntity {
    genAssetsNames() {
        return [
            { attribute: "spriteTexture", src: "sprites/" + this.info.sprite.src, type: "texture", root: this.info.sprite.root },
            { attribute: "shadowTexture", src: "sprites/shadow.png", type: "sheetTexture", root: true }
        ];
    }
    initGraphics() {
        this.sprite = new Sprite(this.assets.spriteTexture, this.info.anchor);
        this.shadow = new Sprite(this.assets.shadowTexture);
        this.shadow.anim = "big_shadow";
        this.shadow.alpha = 0.35;
    }
    async init() {
        await super.init(assets, world);
        this.initGraphics();
    }
    destroy() {
        super.destroy(scene, world);
        this.sprite.destroy();
        this.shadow.destroy();
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
    static getEntity(id){
        for (const player of localPlayers) {
            if (player.id.value == id) return player;
        }
        for (const player of remotePlayers) {
            if (player.id.value == id) return player;
        }
        for (const entity of scene.entities) {
            if (entity.id.value == id) return entity;
        }
    }
}