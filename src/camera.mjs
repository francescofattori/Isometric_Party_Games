import { pixi, scene, world } from "./global.mjs";
import { vec2, vec3 } from "./vector.mjs";
const pixPerUnit = 32;
export class Camera {
    pos = new vec3();
    target = new vec3();
    speed = 1.5;
    softZone = new vec3(1, 1, 2);
    hardZone = new vec3(2, 2, 4);
    set zoom(v) { this._zoom = v / devicePixelRatio; }
    get zoom() { return this._zoom; }
    _zoom = 4 / window.devicePixelRatio;
    zIndex(p) {
        let z = 1.0 + 2.0 * ((2 * p.z - p.x - p.y) - scene.map.maxZIndex) * scene.map.multZIndex;
        if (scene.map.heightAt(p) < 0) z -= 2;
        else if (scene.map.heightAt(p) >= scene.map.size.z) z += 2;
        return z;
    }
    worldToCanvas(p, zIndex = true) {
        let pX = p.x - this.pos.x, pZ = p.z - this.pos.z, pY = p.y - this.pos.y;
        let x = 0.5 * (pX - pY);
        let y = 0.5 * pZ + 0.25 * (pX + pY);
        let v = new vec2(
            Math.floor(pixi.screen.width * 0.5) + x * pixPerUnit * this._zoom,
            Math.floor(pixi.screen.height * 0.5) - y * pixPerUnit * this._zoom
        );
        if (zIndex) v.zIndex = this.zIndex(p);
        return v;
    }
    update() {
        if (!this.target) return;
        let xDiff = 0.5 * ((this.target.x - this.target.y) - (this.pos.x - this.pos.y));
        let yDiff = 0.5 * ((this.target.x + this.target.y) - (this.pos.x + this.pos.y));
        let zDiff = this.target.z - this.pos.z;
        if (this.target.z < scene.map.size.z) zDiff = 0;
        let xS = Math.sign(xDiff) | 0, yS = Math.sign(yDiff) | 0, zS = Math.sign(zDiff) | 0;
        if (xS * xDiff > this.softZone.x) {
            this.pos.x += this.speed * xS * world.dt; this.pos.y -= this.speed * xS * world.dt;
        }
        if (yS * yDiff > this.softZone.y) {
            this.pos.x += this.speed * yS * world.dt; this.pos.y += this.speed * yS * world.dt;
        }
        if (zS * zDiff > this.softZone.z) this.pos.z += this.speed * zS * world.dt;
        if (xS * xDiff > this.hardZone.x) {
            this.pos.x += xDiff - xS * this.hardZone.x; this.pos.y -= xDiff - xS * this.hardZone.x;
        }
        if (yS * yDiff > this.hardZone.y) {
            this.pos.x += yDiff - yS * this.hardZone.y; this.pos.y += yDiff - yS * this.hardZone.y;
        }
    }
}