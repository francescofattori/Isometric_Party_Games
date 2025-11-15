class Player {
    constructor(pos = new vec3()) {
        this.anim = "idle";
        this.animName = "idle";
        this.dir = 1; //1 means right, -1 means left
        this.back = false; //true means back
        this.controller = new Controller();
        this.speed = 3.5;
        this.grounded = false;
        this.rigidbody = new CANNON.Body({
            mass: 5, // kg
            fixedRotation: true,
        })
        let sphere = new CANNON.Sphere(0.5);
        sphere.material = World.materials.player;
        this.rigidbody.addShape(sphere);
        this.collide = this.collide.bind(this);
        this.rigidbody.addEventListener('collide', this.collide)
        this.rigidbody.position.set(pos.x, pos.y, pos.z);
        World.addBody(this.rigidbody);
    }
    static async loadTexture() {
        if (PIXI.Assets.cache.has("player")) return PIXI.Assets.cache.get("player");
        let sheetTexture = await PIXI.Assets.load({ src: "player.png", data: { scaleMode: "nearest" } });
        PIXI.Assets.add({
            alias: "player",
            src: "player.json",
            data: { texture: sheetTexture }
        });
        let texture = await PIXI.Assets.load("player");
        let data = await fetchJSON("assets/sprites/player.json");
        for (const anim in texture.animations) {
            texture.animations[anim].speed = data.info[anim].speed;
            texture.animations[anim].loop = data.info[anim].loop;
        }
        return texture;
    }
    async load() {
        //Sprite management
        this.texture = await Player.loadTexture();
        this.sprite = new PIXI.AnimatedSprite(this.texture.animations.idle);
        this.sprite.animationSpeed = this.texture.animations.idle.speed;
        Pixi.stage.addChild(this.sprite);
        this.sprite.play();
        //----------------
        scene.entities.push(this);
    }
    setAnim(anim) {
        if (anim == "" || this.animName == anim) return;
        this.animName = anim;
        this.sprite.textures = this.texture.animations[anim];
        this.sprite.animationSpeed = this.texture.animations[anim].speed;
        this.sprite.loop = this.texture.animations[anim].loop;
        this.sprite.play();
    }
    collide(e) {
        if (e.body.tag == "ground") {
            this.grounded = true;
            this.anim = "idle";
        }
    }
    update() {
        //physics
        let leftStick = this.controller.leftStick.rotated(-Math.PI / 4);
        let speed = this.speed; if (this.controller.run) speed *= 1.33;
        this.rigidbody.velocity.x = speed * leftStick.x;
        this.rigidbody.velocity.y = speed * leftStick.y;
        if (this.controller.jump && this.grounded) {
            this.anim = "jump";
            this.grounded = false;
            this.rigidbody.velocity.z += 10;
        }
        //graphics
        if (this.controller.leftStick.x < 0.0) this.dir = -1;
        if (this.controller.leftStick.x > 0.0) this.dir = 1;
        if (this.controller.leftStick.y > 0.0) this.back = true;
        if (this.controller.leftStick.y < 0.0) this.back = false;
        if (this.grounded) {
            if (this.controller.leftStick.length() == 0) this.anim = "idle";
            else this.anim = "walk";
            let s = Math.abs(this.controller.leftStick.scalar(new vec2(0, 1)));
            if (this.anim == "walk" && this.controller.run && s < 0.75) this.anim = "run";
        }else{
            if(this.rigidbody.velocity.z > 0) this.anim = "ascend";
            else this.anim = "fall";
        }
        if (World.time - this.controller.afkTime > 5) this.anim = "startSit";
    }
    draw() {
        let pos = this.rigidbody.position;
        pos = { x: pos.x, y: pos.y, z: pos.z - 0.5 };
        let p = camera.worldToCanvas(pos);
        this.sprite.x = p.x; this.sprite.y = p.y;
        this.sprite.scale = { x: this.dir * camera.zoom, y: camera.zoom };
        this.sprite.zIndex = p.zIndex;
        if (this.back) this.setAnim("back_" + this.anim);
        else this.setAnim(this.anim);
    }
}