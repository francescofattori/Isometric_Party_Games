//CLIENT
import { Player as CommonPlayer } from "../common/player.mjs";
import { Entity } from "./entity.mjs";
import { Sprite } from "./sprite.mjs";
import { Controller } from "./controller.mjs";
import { vec2, vec3 } from "../common/vector.mjs";
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
        this.controller.genInputs();
        //Physics
        let velocity = this.controller.leftStick.rotated(-Math.PI / 4);
        let speed = this.speed;
        let scalar = this.controller.leftStick.scalar(this.controller.rightStick);
        if (this.controller.run && scalar > 0.85) speed *= 1.33;
        let percSpeed = (4 + this.controller.leftStick.scalar(this.controller.rightStick)) / 5.0;
        this.rigidbody.velocity.x = percSpeed * speed * velocity.x;
        this.rigidbody.velocity.y = percSpeed * speed * velocity.y;
        if (this.sprite.anim == "jump" && this.controller.jump) { this.rigidbody.velocity.z += 2.5 * this.jumpForce * world.dt; }
        if (this.controller.jump && this.grounded) {
            this.sprite.anim = "jump";
            this.grounded = false;
            this.rigidbody.velocity.z += this.jumpForce;
        }
        this.inputVel = new vec3(this.rigidbody.velocity);//expected input velocity not considering collisions
        //Graphics
        if (this.controller.rightStick.x < 0.0 ||
            (this.controller.rightStick.x == 0.0 && this.controller.leftStick.x < 0.0)) this.sprite.flip.x = -1;
        if (this.controller.rightStick.x > 0.0 ||
            (this.controller.rightStick.x == 0.0 && this.controller.leftStick.x > 0.0)) this.sprite.flip.x = 1;
        if (this.controller.rightStick.y > 0.0 ||
            (this.controller.rightStick.y == 0.0 && this.controller.leftStick.y > 0.0)) this.sprite.back = true;
        if (this.controller.rightStick.y < 0.0 ||
            (this.controller.rightStick.y == 0.0 && this.controller.leftStick.y < 0.0)) this.sprite.back = false;
        if (this.grounded && this.sprite.anim != "land") {
            if (this.controller.leftStick.length() == 0) this.sprite.anim = "idle";
            else this.sprite.anim = "walk";
            let s = Math.abs(this.controller.leftStick.scalar(new vec2(0, 1)));
            if (this.sprite.anim == "walk" && this.controller.run && s < 0.75 && scalar > 0.85)
                this.sprite.anim = "run";
        } else if (!this.grounded) {
            if (this.rigidbody.velocity.z < 0) this.sprite.anim = "fall";
            else if (this.sprite.anim != "jump") this.sprite.anim = "ascend";
        }
        if (world.time - this.controller.afkTime > 10000) this.sprite.anim = "sit";
    }
    calcHandsPos() {
        let anim = this.sprite.anim;
        let animLength = Player.handPos[anim].length;
        let targetPos = Player.handPos[anim][this.sprite.currentFrame];
        let prevPos = Player.handPos[anim][(this.sprite.currentFrame + animLength - 1) % animLength];
        if (targetPos == undefined) {
            targetPos = Player.handPos[anim][0];
            prevPos = Player.handPos[anim][animLength - 1];
        }
        if (this.sprite.animChanged) prevPos = targetPos;
        let pos = prevPos.lerp(targetPos, 2 * this.sprite.animCounter);
        if (this.sprite.flip.x == -1) { pos.x *= -1; pos.y *= -1; } if (this.sprite.back) { pos.x *= -1; pos.y *= -1; }
        let base = new vec3(Player.handPos["base"][0]);
        if (this.sprite.anim == "run") base = new vec3(Player.handPos["base"][1]);
        this.rightHand.pos = new vec3(base.x + pos.x, base.y + pos.y, base.z + pos.z).rotated(this.controller.rightAngle);
        this.leftHand.pos = new vec3(-base.y - pos.x, -base.x - pos.y, base.z + pos.z).rotated(this.controller.rightAngle);
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
    static handPos = {
        base: [new vec3(-0.124, -0.126, 0.31), new vec3(-0.064, -0.186, 0.31)],//BasePos
        idle: [new vec3(0, 0, 0.025), new vec3(0, 0, -0.05)],//Idle
        walk: [new vec3(0.05, -0.05, 0.05), new vec3(0, 0, 0), new vec3(-0.05, 0.05, 0.05), new vec3(0, 0, 0)],//Walk
        run: [new vec3(0.08, -0.08, 0.05), new vec3(0, 0, 0), new vec3(-0.08, 0.08, 0.05), new vec3(0, 0, 0)],//Run
        jump: [new vec3(0, 0, 0), new vec3(0, 0, 0.15), new vec3(0, 0, 0.15)],//Jump
        ascend: [new vec3(0, 0, 0.15)],//Ascend
        fall: [new vec3(0, 0, 0.05)],//Fall
        land: [new vec3(0, 0, 0.05), new vec3(0, 0, -0.05), new vec3(0, 0, 0.05)],//Land
        sit: [new vec3(0, 0, 0.025), new vec3(0.03, -0.03, -0.15), new vec3(0.03, -0.03, -0.15)]//Sit
    }
}