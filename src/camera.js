const pixPerUnit = 32;
class Camera {
    constructor() {
        this.pos = new vec3();
        this.zoom = 3;
    }
    worldToCanvas(p) {
        let x = 0.5 * (p.x - p.y);
        let y = 0.5 * p.z + 0.25 * (p.x + p.y);
        let v = new vec2(
            Pixi.screen.width * 0.5 + x * pixPerUnit * this.zoom,
            Pixi.screen.height * 0.5 - y * pixPerUnit * this.zoom
        );
        v.zIndex = 1.0 + 2.0 * ((2 * p.z - p.x - p.y) - scene.map.maxZIndex) * scene.map.multZIndex;
        return v;
    }
}