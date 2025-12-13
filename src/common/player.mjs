//COMMON
import * as CANNON from "../../include/cannon.mjs";
import { vec2, vec3 } from "../common/vector.mjs";
export function Player(EntityClass) {
    return class PlayerClass extends EntityClass {
        speed = 3.5; jumpForce = 10; grounded = false;
        rightHand = { pos: new vec3() };
        leftHand = { pos: new vec3() };
        controller = { rightAngle: -Math.PI / 2 };
        sprite = { anim: "idle", flip: { x: 1, y: 1 }, back: false };
        async getInfo() {
            this.infoLoaded = true;
        }
        initPhysics(world) {
            this.rigidbody = new CANNON.Body({ mass: 35, fixedRotation: true });
            let upSphere = new CANNON.Sphere(0.25); upSphere.material = world.materials["player"];
            let downSphere = new CANNON.Sphere(0.25); downSphere.material = world.materials["player"];
            let cylinder = new CANNON.Cylinder(0.25, 0.25, 0.5); cylinder.material = world.materials["player"];
            downSphere.tag = "feet";
            let q = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI * 0.5);
            this.rigidbody.addShape(upSphere, new CANNON.Vec3(0, 0, 0.25));
            this.rigidbody.addShape(downSphere, new CANNON.Vec3(0, 0, -0.25));
            this.rigidbody.addShape(cylinder, new CANNON.Vec3(0, 0, 0), q);
            this.size = new vec3(0.5, 0.5, 1);
            this.rigidbody.position.set(this.info.pos.x, this.info.pos.y, this.info.pos.z);
            this.rigidbody.addEventListener("collide", this.collide);
            world.addBody(this.rigidbody);
        }
        collide = this.collide.bind(this);
        collide(e) {
            if (e.body.jumpable && e.contact.si.tag == "feet" && this.sprite.anim != "jump") {
                this.grounded = true;
                if (this.sprite.anim == "fall") this.sprite.anim = "land";
            }
        }
        update(world) {
            this.controller.genInputs();
            //Physics
            let velocity = this.controller.leftStick.rotated(-Math.PI / 4);
            let speed = this.speed;
            let scalar = this.controller.leftStick.scalar(this.controller.rightStick);
            if (this.controller.run && scalar > 0.85) speed *= 1.33;
            let percSpeed = (4 + this.controller.leftStick.scalar(this.controller.rightStick)) / 5.0;
            this.rigidbody.velocity.x = percSpeed * speed * velocity.x;
            this.rigidbody.velocity.y = percSpeed * speed * velocity.y;
            if (this.controller.jump && this.grounded) {
                this.sprite.anim = "jump";
                this.grounded = false;
                this.rigidbody.velocity.z += this.jumpForce;
            }
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
            let animLength = PlayerClass.handPos[anim].length;
            let targetPos = PlayerClass.handPos[anim][this.sprite.currentFrame];
            let prevPos = PlayerClass.handPos[anim][(this.sprite.currentFrame + animLength - 1) % animLength];
            if (targetPos == undefined) {
                targetPos = PlayerClass.handPos[anim][0];
                prevPos = PlayerClass.handPos[anim][animLength - 1];
            }
            if (this.sprite.animChanged) prevPos = targetPos;
            let pos = prevPos.lerp(targetPos, 2 * this.sprite.animCounter);
            if (this.sprite.flip.x == -1) { pos.x *= -1; pos.y *= -1; } if (this.sprite.back) { pos.x *= -1; pos.y *= -1; }
            let base = new vec3(PlayerClass.handPos["base"][0]);
            if (this.sprite.anim == "run") base = new vec3(PlayerClass.handPos["base"][1]);
            this.rightHand.pos = new vec3(base.x + pos.x, base.y + pos.y, base.z + pos.z).rotated(this.controller.rightAngle);
            this.leftHand.pos = new vec3(-base.y - pos.x, -base.x - pos.y, base.z + pos.z).rotated(this.controller.rightAngle);
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
}