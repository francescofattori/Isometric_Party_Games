//CLIENT
import { scene, renderer } from "./client.mjs";
import { vec2, vec3 } from "../common/vector.mjs";
export const pixPerUnit = 32;
export class Camera {
    pos = new vec2();
    target = new vec3();
    followType = "normal"; //normal, smooth, fixed
    recentering = true; recenteringTime = 2; //seconds
    speed = 1.5;
    softZone = new vec2(2, 3);
    hardZone = new vec3(3, 5);
    stillTime = 0; prevTarget = new vec3();
    set zoom(v) { this._zoom = v / devicePixelRatio; }
    get zoom() { return this._zoom; }
    _zoom = Math.round(4 * (1 + window.devicePixelRatio) * 0.5) / window.devicePixelRatio;
    zIndex(p) {//between -1 and 1 (+-2 for outside the map)
        let z = 1.0 + 2.0 * ((2 * p.z - p.x - p.y) - scene.map.maxZIndex) * scene.map.multZIndex;
        if (scene.map.heightAt(p) < 0) z -= 2;
        else if (scene.map.heightAt(p) >= scene.map.size.z) z += 2;
        return z;
    }
    worldToCanvas(p, zIndex = true) {
        let pX = p.x - this.pos.x, pZ = p.z, pY = p.y - this.pos.y;
        let x = 0.5 * (pX - pY);
        let y = 0.5 * pZ + 0.25 * (pX + pY);
        let v = new vec2(
            Math.floor(renderer.pixi.screen.width * 0.5) + x * pixPerUnit * this._zoom,
            Math.floor(renderer.pixi.screen.height * 0.5) - y * pixPerUnit * this._zoom
        );
        if (zIndex) v.zIndex = this.zIndex(p);
        return v;
    }
    draw(dt) {
        this.followTarget(dt);
    }
    followTarget(dt) {
        if (!this.target) return;
        if (this.followType == "fixed") { this.pos = this.target; return; }
        let d = this.worldToCanvas(this.target).minus(
            new vec2(Math.floor(renderer.pixi.screen.width * 0.5), Math.floor(renderer.pixi.screen.height * 0.5))
        ).times(1 / this._zoom / pixPerUnit); d.y *= 2;
        let xS = Math.sign(d.x) || 0, yS = Math.sign(d.y) || 0;
        if (Math.abs(d.x) >= this.hardZone.x * 0.5) {
            this.pos.x += d.x - xS * this.hardZone.x * 0.5; this.pos.y -= d.x - xS * this.hardZone.x * 0.5;
        } else if (Math.abs(d.x) >= this.softZone.x * 0.5 && this.followType == "smooth") {
            this.pos.x += this.speed * xS * dt; this.pos.y -= this.speed * xS * dt;
        }
        if (Math.abs(d.y) >= this.hardZone.y * 0.5) {
            this.pos.x -= d.y - yS * this.hardZone.y * 0.5; this.pos.y -= d.y - yS * this.hardZone.y * 0.5;
        } else if (Math.abs(d.y) >= this.softZone.y * 0.5 && this.followType == "smooth") {
            this.pos.x -= this.speed * yS * dt; this.pos.y -= this.speed * yS * dt;
        }
        if (this.recentering) {
            if (this.prevTarget.equals(this.target)) this.stillTime += dt;
            else this.stillTime = 0;
            if (this.stillTime > this.recenteringTime) {
                if (Math.abs(d.x) > 0.1) {
                    this.pos.x += this.speed * xS * dt; this.pos.y -= this.speed * xS * dt;
                }
                if (Math.abs(d.y) > 0.1) {
                    this.pos.x -= this.speed * yS * dt; this.pos.y -= this.speed * yS * dt;
                }
            }
        }
        this.prevTarget = new vec3(this.target);
    }
}