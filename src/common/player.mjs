//COMMON
import * as CANNON from "../../include/cannon.mjs";
import { vec3 } from "../common/vector.mjs";
export function Player(EntityClass) {
    return class PlayerClass extends EntityClass {
        speed = 3.5; jumpForce = 8; grounded = false;
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
                if (e.body.tag == "map") {
                    //snap velocity and position
                    this.rigidbody.velocity.z = e.body.velocity.z;
                    this.rigidbody.position = e.body.position.vadd(e.contact.rj).vsub(e.contact.ri);
                }
                this.grounded = true;
                if (this.sprite.anim == "fall") this.sprite.anim = "land";
            }
        }
    }
}