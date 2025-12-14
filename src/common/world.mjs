//CLIENT
import * as CANNON from "../../include/cannon.mjs";
export class World {
    #updateRate = 200; //times a second
    get updateRate() { return this.#updateRate; }
    get bodies() { return this.cannonWorld.bodies; }
    get time() { return this.cannonWorld.time; }
    gravity = new CANNON.Vec3(0, 0, -40);
    updateTime = 0; lastUpdate = 0; statTime = 0;
    updateTimeSum = 0; FPSSum = 0; statCount = 0;
    run = true; dt = 1.0 / this.#updateRate;
    constructor() {
        this.cannonWorld = new CANNON.World();
    }
    async #getMaterialsTable(gameInfo, assets) {
        let table = gameInfo.materials;
        if (table) return assets.load(table.src, "json", table.root);
        return undefined;
    }
    async init(gameInfo, assets) {
        this.cannonWorld.gravity = this.gravity;
        this.cannonWorld.dt = this.dt;
        this.materials = {};
        let data = await this.#getMaterialsTable(gameInfo, assets);
        if (data != undefined) {
            for (const name of data.names) { this.materials[name] = new CANNON.Material(name); }
            for (let i = 0; i < data.table.length; i++) {
                const row = data.table[i];
                for (let j = 0; j < row.length; j++) {
                    const contact = row[j];
                    let mat1 = this.materials[data.names[i]]; let mat2 = this.materials[data.names[i + j]];
                    let contactMaterial = new CANNON.ContactMaterial(mat1, mat2, {
                        friction: contact.f, restitution: contact.r
                    });
                    this.cannonWorld.addContactMaterial(contactMaterial);
                }
            }
        }
        //this.cannonWorld.defaultContactMaterial.contactEquationRelaxation = 10;
        //this.cannonWorld.defaultContactMaterial.contactEquationStiffness = 5e8;
    }
    addBody(body) {
        this.cannonWorld.addBody(body);
    }
    removeBody(body) {
        this.cannonWorld.removeBody(body);
    }
    update() {
        let t = performance.now() / 1000.0;
        this.cannonWorld.step(this.dt, t - this.lastUpdate);
        this.lastUpdate = t;
    }
}