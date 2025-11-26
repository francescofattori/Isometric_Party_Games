import { pixi, scene } from "./global.mjs";
import { vec2, vec3 } from "./vector.mjs";
const pixPerUnit = 32;
export class Camera {
    pos = new vec3();
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
        let x = 0.5 * (p.x - p.y);
        let y = 0.5 * p.z + 0.25 * (p.x + p.y);
        let v = new vec2(
            pixi.screen.width * 0.5 + x * pixPerUnit * this._zoom,
            pixi.screen.height * 0.5 - y * pixPerUnit * this._zoom
        );
        if (zIndex) v.zIndex = this.zIndex(p);
        return v;
    }
}