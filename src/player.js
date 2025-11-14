class Player {
    constructor(pos = new vec3()) {
        this.dir = 1; //1 means right, -1 means left
        this.back = false; //true means back
        this.controller = new Controller();
        this.speed = 3.5;
        this.grounded = false;
        this.rigidbody = new CANNON.Body({
            mass: 30, // kg
            fixedRotation: true,
        })
        let sphere = new CANNON.Sphere(0.5);
        sphere.material = World.materials.player;
        this.rigidbody.addShape(sphere);
        this.rigidbody.addEventListener('collide', (event) => {
            if (event.body.tag == "ground") {
                this.grounded = true;
            }
        })
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
            texture.animations[anim].speed = data.speeds[anim];
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
        this.sprite.textures = this.texture.animations[anim];
        this.sprite.animationSpeed = this.texture.animations[anim].speed;
        this.sprite.play();
    }
    update() {
        let leftStick = this.controller.leftStick.rotated(-Math.PI / 4);
        this.rigidbody.velocity.x = this.speed * leftStick.x;
        this.rigidbody.velocity.y = this.speed * leftStick.y;
        if (this.controller.jump && this.grounded) {
            console.log("jump");
            this.grounded = false;
            this.rigidbody.velocity.z += 10;
        }
    }
    draw() {
        let pos = this.rigidbody.position;
        pos = { x: pos.x, y: pos.y, z: pos.z - 0.5 };
        let p = camera.worldToCanvas(pos);
        this.sprite.x = p.x; this.sprite.y = p.y;
        this.sprite.scale = { x: this.dir * camera.zoom, y: camera.zoom };
        this.sprite.zIndex = p.zIndex;
    }
}