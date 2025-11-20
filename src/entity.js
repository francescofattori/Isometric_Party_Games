class Entity {
    async load(alias, src, root = false) {
        let data = await assets.load(alias, "assets/entities/" + src, "json", root);
        this.rigidbody = new CANNON.Body({
            mass: data.collider.mass,
            fixedRotation: true,
        });
        let shape;
        switch (data.collider.type) {
            case "box":
                shape = new CANNON.Box(new CANNON.Vec3(data.collider.size.x / 2, data.collider.size.y / 2, data.collider.size.z / 2));
                break;
        }
        shape.material = world.materials[data.collider.material];
        this.rigidbody.addShape(shape);
        this.size = data.collider.size;
        this.rigidbody.tag = "ground";
        this.rigidbody.mass = data.collider.mass;
        world.addBody(this.rigidbody);
        //Sprite management
        let texture = await assets.load(data.sprite, "assets/sprites/" + data.sprite, "texture", root);
        this.sprite = new PIXI.Sprite(texture); this.sprite.anchor.set(0.5, 0.5);
        if (data.anchor) { this.sprite.anchor.set(data.anchor.x / texture.width, data.anchor.y / texture.height); }
        pixi.stage.addChild(this.sprite);
        this.draw();
    }
    update() {

    }
    draw() {
        let pos = this.rigidbody.position;
        pos = { x: pos.x, y: pos.y, z: pos.z - this.size.z / 2 };
        let p = camera.worldToCanvas(pos);
        this.sprite.x = p.x;
        this.sprite.y = p.y;
        this.sprite.scale = new vec2(1.0, 1.0).times(camera.zoom);
        this.sprite.zIndex = p.zIndex;
    }
}