//COMMON
import * as CANNON from "../include/cannon.mjs";
import { vec2, vec3 } from "../common/vector.mjs";
export function Player(EntityClass) {
    return class PlayerClass extends EntityClass {
        speed = 3.5; jumpForce = 8; grounded = false;
        rightHand = { pos: new vec3() };
        leftHand = { pos: new vec3() };
        sprite = { anim: "idle", flip: { x: 1, y: 1 }, back: false };
        landDuration = 3 / 60 / 0.2;//nFrames / 60 / animSpeed
        get pos() { return this.rigidbody.position; }
        async getInfo() {
            this.infoLoaded = true;
        }
        initPhysics() {
            this.rigidbody = new CANNON.Body({ mass: 35, fixedRotation: true });
            let upSphere = new CANNON.Sphere(0.25); upSphere.material = this.world.materials["player"];
            let downSphere = new CANNON.Sphere(0.25); downSphere.material = this.world.materials["player"];
            let cylinder = new CANNON.Cylinder(0.25, 0.25, 0.5); cylinder.material = this.world.materials["player"];
            downSphere.tag = "feet";
            let q = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI * 0.5);
            this.rigidbody.addShape(upSphere, new CANNON.Vec3(0, 0, 0.25));
            this.rigidbody.addShape(downSphere, new CANNON.Vec3(0, 0, -0.25));
            this.rigidbody.addShape(cylinder, new CANNON.Vec3(0, 0, 0), q);
            this.size = new vec3(0.5, 0.5, 1);
            this.rigidbody.position.set(this.info.pos.x, this.info.pos.y, this.info.pos.z);
            this.rigidbody.addEventListener("collide", this.collide);
            this.world.addBody(this.rigidbody);
        }
        collide = this.collide.bind(this);
        collide(e) {
            if (e.body.jumpable && e.contact.si.tag == "feet" && this.sprite.anim != "jump") {
                if (e.body.tag == "map") {
                    //snap velocity and position
                    this.rigidbody.velocity.z = e.body.velocity.z;
                    let newPos = e.body.position.vadd(e.contact.rj).vsub(e.contact.ri);
                    this.rigidbody.position.set(newPos.x, newPos.y, newPos.z);
                }
                this.grounded = true;
                if (this.sprite.anim == "fall") { this.sprite.anim = "land"; this.landTime = this.world.time; }
            }
        }
        update() {
            this.controller.genInputs();
            let velocity = this.controller.leftStick.rotated(-Math.PI / 4);
            let speed = this.speed;
            let scalar = this.controller.leftStick.scalar(this.controller.rightStick);
            if (this.controller.run && scalar > 0.85) speed *= 1.33;
            let percSpeed = (4 + this.controller.leftStick.scalar(this.controller.rightStick)) / 5.0;
            this.rigidbody.velocity.x = percSpeed * speed * velocity.x;
            this.rigidbody.velocity.y = percSpeed * speed * velocity.y;
            if (this.sprite.anim == "jump" && this.controller.jump) { 
                //this.rigidbody.velocity.z += 2.5 * this.jumpForce * this.world.dt;
                this.rigidbody.applyForce(new CANNON.Vec3(0, 0, 2.5 * this.jumpForce*this.rigidbody.mass));
            }
            if (this.controller.jump && this.grounded) {
                this.sprite.anim = "jump";
                this.grounded = false;
                this.rigidbody.velocity.z += this.jumpForce;
            }
            if (this.controller.rightStick.x < 0.0 ||
                (this.controller.rightStick.x == 0.0 && this.controller.leftStick.x < 0.0)) this.sprite.flip.x = -1;
            if (this.controller.rightStick.x > 0.0 ||
                (this.controller.rightStick.x == 0.0 && this.controller.leftStick.x > 0.0)) this.sprite.flip.x = 1;
            if (this.controller.rightStick.y > 0.0 ||
                (this.controller.rightStick.y == 0.0 && this.controller.leftStick.y > 0.0)) this.sprite.back = true;
            if (this.controller.rightStick.y < 0.0 ||
                (this.controller.rightStick.y == 0.0 && this.controller.leftStick.y < 0.0)) this.sprite.back = false;
            if (this.sprite.anim == "land" && this.world.time - this.landTime > this.landDuration) this.sprite.anim = "idle";
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
            //if (this.world.time - this.controller.afkTime > 10000) this.sprite.anim = "sit";
        }
    }
}