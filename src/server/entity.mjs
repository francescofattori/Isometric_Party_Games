//SERVER
import * as CANNON from "../../include/cannon.mjs";
export class Entity {
    get pos() { return this.rigidbody.position; }
    constructor(world, pos = new vec3(), src = "", root = false) {
        this.info = { pos: pos, src: src, root: root };
        this.world = world;
    }
    //needs to load assets (not graphics but still assets)
    initPhysics() {
        let collider = this.info.collider;
        this.rigidbody = new CANNON.Body({ mass: collider.mass, fixedRotation: true });
        let shape;
        switch (collider.type) {
            case "box":
                shape = new CANNON.Box(new CANNON.Vec3(collider.size.x / 2, collider.size.y / 2, collider.size.z / 2));
                break;
        }
        shape.material = this.world.materials[collider.material];
        this.rigidbody.addShape(shape); this.size = collider.size;
        this.rigidbody.jumpable = true;
        this.rigidbody.position.set(this.info.pos.x, this.info.pos.y, this.info.pos.z);
        this.world.addBody(this.rigidbody);
    }
    async init() {
        this.initPhysics();
    }
    update() { }
}