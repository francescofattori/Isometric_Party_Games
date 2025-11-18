class Entity {
    pos = new vec3();
    constructor(pos = new vec3()) {
        this.pos = pos;
    }
    async load(alias, src) {
        let data = await assets.load(alias, src, "json");
        //Sprite management
        let texture = await assets.load(data.sprite, data.sprite, "texture");
        this.sprite = new PIXI.Sprite(texture); this.sprite.anchor.set(0.5, (texture.height - 1) / texture.height);
        if (data.anchor) { this.sprite.anchor.set((data.anchor.x + 1) / texture.width, (data.anchor.y + 1) / texture.height); }
        pixi.stage.addChild(this.sprite);
        this.draw();
    }
    add(){
        scene.entities.push(this);
    }
    update() {

    }
    draw() {
        let p = camera.worldToCanvas(this.pos);
        this.sprite.x = p.x;
        this.sprite.y = p.y;
        this.sprite.scale = new vec2(1.0, 1.0).times(camera.zoom);
        this.sprite.zIndex = p.zIndex;
    }
}