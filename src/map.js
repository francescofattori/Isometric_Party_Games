class SceneMap {
    constructor() {

    }
    async load(filename) {
        let data = await fetchJSON("assets/maps/" + filename + ".json");
        //Sprite management
        let texture;
        if (PIXI.Assets.cache.has(data.sprite)) {
            texture = PIXI.Assets.cache.get(data.sprite);
        } else {
            texture = await PIXI.Assets.load({ src: data.sprite, data: { scaleMode: "nearest" } });
        }
        this.sprite = new PIXI.Sprite(texture); this.sprite.anchor.set(data.anchor.x / texture.width, data.anchor.y / texture.height);
        Pixi.stage.addChild(this.sprite);
        this.size = data.size;
        this.center = data.center;
        this.maxZIndex = 2.0 * (this.size.z - this.center.z) - this.center.x - this.center.y + 100;
        this.minZIndex = 2.0 * this.center.z - (this.size.x - this.center.x) - (this.size.y - this.center.y) - 100;
        this.multZIndex = 1.0 / (this.maxZIndex - this.minZIndex);
        //----------------
        this.draw();
    }
    draw() {
        let p = camera.worldToCanvas(new vec3());
        this.sprite.x = p.x; this.sprite.y = p.y;
        this.sprite.scale = new vec2(1.0, 1.0).times(camera.zoom);
        this.sprite.zIndex = -1;
    }
}