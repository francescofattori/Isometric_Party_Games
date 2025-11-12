class Entity {
    constructor(pos = new vec3()) {
        this.pos = pos;
    }
    async load(filename) {
        let data = await fetchJSON("assets/entities/" + filename + ".json");
        //Sprite management
        let texture;
        if (PIXI.Assets.cache.has(data.sprite)) {
            texture = PIXI.Assets.cache.get(data.sprite);
        } else {
            texture = await PIXI.Assets.load({ src: data.sprite, data: { scaleMode: "nearest" } });
        }
        this.sprite = new PIXI.Sprite(texture); this.sprite.anchor.set(0.5, (texture.height - 1) / texture.height);
        if (data.anchor) { this.sprite.anchor.set((data.anchor.x + 1) / texture.width, (data.anchor.y + 1) / texture.height); }
        Pixi.stage.addChild(this.sprite);
        //----------------
        scene.entities.push(this);
        this.draw();
    }
    update(){
        
    }
    draw() {
        let p = camera.worldToCanvas(this.pos);
        this.sprite.x = p.x;
        this.sprite.y = p.y;
        this.sprite.scale = new vec2(1.0, 1.0).times(camera.zoom);
        this.sprite.zIndex = p.zIndex;
    }
}