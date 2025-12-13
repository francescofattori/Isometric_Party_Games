//CLIENT
import { Player as CommonPlayer } from "../common/player.mjs";
import { Entity } from "./entity.mjs";
import { Sprite } from "./sprite.mjs";
import { Controller } from "./controller.mjs";
import { vec3 } from "../common/vector.mjs";
import { world, camera, localPlayers, remotePlayers } from "./client.mjs";
export class Player extends CommonPlayer(Entity) {
    genAssetsNames() {
        return [
            { attribute: "spriteTexture", src: "sprites/player.png", type: "sheetTexture", root: true },
            { attribute: "shadowTexture", src: "sprites/shadow.png", type: "sheetTexture", root: true },
            { attribute: "handTexture", src: "sprites/hand.png", type: "texture", root: true }
        ];
    }
    async init() {
        await super.init();
        this.controller = new Controller(this);
    }
    destroy() {
        super.destroy();
        this.rightHand.sprite.destroy();
        this.leftHand.sprite.destroy();
        let index = localPlayers.indexOf(this);
        if (index > -1) localPlayers.splice(index, 1);
        index = remotePlayers.indexOf(this);
        if (index > -1) remotePlayers.splice(index, 1);
    }
    initGraphics() {
        let texture = this.assets.spriteTexture;
        this.sprite = new Sprite(texture); this.sprite.anim = "idle";
        this.sprite.onComplete(() => {
            switch (this.sprite.anim) {
                case "land": this.sprite.anim = "idle"; break;
            }
        });
        this.shadow = new Sprite(this.assets.shadowTexture);
        this.shadow.alpha = 0.35;
        this.rightHand.sprite = new Sprite(this.assets.handTexture);
        this.leftHand.sprite = new Sprite(this.assets.handTexture);
    }
    update() {
        super.update(world);
    }
    drawHands() {
        let pos = new vec3(this.rigidbody.position).minus(0, 0, this.size.z * 0.5);
        this.calcHandsPos();
        let rHandPos = this.rightHand.pos.plus(pos);
        this.rightHand.sprite.draw(rHandPos, false);
        rHandPos.z = pos.z; this.rightHand.sprite.zIndex = camera.zIndex(rHandPos);
        let lHandPos = this.leftHand.pos.plus(pos);
        this.leftHand.sprite.draw(lHandPos, false);
        lHandPos.z = pos.z; this.leftHand.sprite.zIndex = camera.zIndex(lHandPos);
    }
    draw() {
        super.draw();
        this.drawHands();
        this.controller.draw();
    }
}