const pixPerUnit = 32.0;
class Camera {
    constructor() {
        this.pos = new vec3();
        this.zoom = 3;
    }
    worldToCanvas(p) {
        if (p.z == undefined) return p;
        let x = 0.5 * (p.x - p.y);
        let y = 0.5 * p.z - 0.25 * (p.y + p.x);
        return new vec2(
            Pixi.screen.width * 0.5 + x * pixPerUnit * this.zoom,
            Pixi.screen.height * 0.5 - y * pixPerUnit * this.zoom
        );
    }
}