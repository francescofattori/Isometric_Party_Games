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
        this.shadowTexture = await assets.load("shadow", "assets/sprites/shadow", "sheetTexture", true);
        this.sprite = new PIXI.Sprite(texture); this.sprite.anchor.set(0.5, 0.5);
        if (data.anchor) { this.sprite.anchor.set(data.anchor.x / texture.width, data.anchor.y / texture.height); }
        pixi.stage.addChild(this.sprite);
        this.shadow = new PIXI.AnimatedSprite(this.shadowTexture.animations.big_shadow);
        this.shadow.alpha = 0.35;
        pixi.stage.addChild(this.shadow);
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
        //Shadow (the same as player, merge)
        let ray = new CANNON.Ray(
            new CANNON.Vec3(pos.x, pos.y, pos.z + 0.1),
            new CANNON.Vec3(pos.x, pos.y, pos.z - 10)
        );
        ray.mode = CANNON.RAY_MODES.CLOSEST;
        ray.skipBackfaces = true;
        let result = new CANNON.RaycastResult();
        ray.intersectBodies(world.bodies, result);
        let z = result.hitPointWorld.z;
        if (result.hasHit) {
            this.shadow.visible = true;
            let shadowPos = { x: pos.x, y: pos.y, z: z };
            p = camera.worldToCanvas(shadowPos);
            this.shadow.x = p.x; this.shadow.y = p.y;
            this.shadow.scale = { x: camera.zoom, y: camera.zoom };
            this.shadow.zIndex = p.zIndex;
            if (this.shadow.zIndex > this.sprite.zIndex) //so that shadow is behind sprite
                this.shadow.zIndex = this.sprite.zIndex - 0.000001;
        } else {
            this.shadow.visible = false;
        }
    }
}