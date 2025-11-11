class Entity {
    constructor() {
        this.pos = new vec3();
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 1.0);
        Pixi.stage.addChild(this.sprite);
    }
    load(){
        
    }
    draw() {
        let p = camera.worldToCanvas(this.pos);
        this.sprite.x = p.x;
        this.sprite.y = p.y;
        this.sprite.scale = new vec2(1.0, 1.0).times(camera.zoom);
    }
}