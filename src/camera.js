const pixPerUnit = 32;
class Camera {
    constructor() {
        this.pos = new vec3();
        this.zoom = 3;
    }
    zIndex(p){
        return 1.0 + 2.0 * ((2 * p.z - p.x - p.y) - scene.map.maxZIndex) * scene.map.multZIndex;;
    }
    worldToCanvas(p, zIndex = true) {
        let x = 0.5 * (p.x - p.y);
        let y = 0.5 * p.z + 0.25 * (p.x + p.y);
        let v = new vec2(
            Pixi.screen.width * 0.5 + x * pixPerUnit * this.zoom,
            Pixi.screen.height * 0.5 - y * pixPerUnit * this.zoom
        );
        if(zIndex) v.zIndex = this.zIndex(p);
        return v;
    }
}