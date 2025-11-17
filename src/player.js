class Player {
    pos = new vec3();
    anim = "idle";
    animName = "idle";
    dir = 1; //1 means right, -1 means left
    back = false; //true means back
    speed = 3.5;
    jumpForce = 10;
    grounded = false;
    rightHand = { sprite: undefined, pos: new vec3() };
    leftHand = { sprite: undefined, pos: new vec3() };
    lastFrameChange = 0; //last time the frame changed
    animCounter = 0; //from 0 to 1 progression in frame of animation
    animChanged = false; //true if this frame is the first after the animation changed
    constructor(pos = new vec3()) {
        this.controller = new Controller();
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
    static async loadTextures() {
        let playerTexture, handTexture;
        if (PIXI.Assets.cache.has("player")) playerTexture = PIXI.Assets.cache.get("player");
        else {
            let sheetTexture = await PIXI.Assets.load({ src: "player.png", data: { scaleMode: "nearest" } });
            PIXI.Assets.add({
                alias: "player",
                src: "player.json",
                data: { texture: sheetTexture }
            });
            playerTexture = await PIXI.Assets.load("player");
            let data = await fetchJSON("assets/sprites/player.json");
            for (const anim in playerTexture.animations) {
                playerTexture.animations[anim].speed = data.info[anim].speed;
                playerTexture.animations[anim].loop = data.info[anim].loop;
            }
        }
        if (PIXI.Assets.cache.has("hand")) handTexture = PIXI.Assets.cache.get("hand");
        else handTexture = await PIXI.Assets.load({ alias: "hand", src: "hand.png", data: { scaleMode: "nearest" } });
        return { player: playerTexture, hand: handTexture };
    }
    async load() {
        //Sprite management
        let textures = await Player.loadTextures();
        this.texture = textures.player; this.handTexture = textures.hand;
        this.sprite = new PIXI.AnimatedSprite(this.texture.animations.idle);
        this.sprite.animationSpeed = this.texture.animations.idle.speed;
        this.sprite.onFrameChange = () => {
            this.lastFrameChange = World.time;
            this.animChanged = false;
        };
        this.sprite.onFrameChange = this.sprite.onFrameChange.bind(this);
        this.sprite.onComplete = () => {
            switch (this.anim) {
                case "land": this.anim = "idle"; break;
            }
        };
        this.sprite.onComplete = this.sprite.onComplete.bind(this);
        Pixi.stage.addChild(this.sprite);
        this.sprite.play();
        //Hands
        this.rightHand.sprite = new PIXI.Sprite(this.handTexture);
        this.rightHand.sprite.anchor.set(0.5, 0.5);
        this.leftHand.sprite = new PIXI.Sprite(this.handTexture);
        this.leftHand.sprite.anchor.set(0.5, 0.5);
        Pixi.stage.addChild(this.rightHand.sprite);
        Pixi.stage.addChild(this.leftHand.sprite);
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
        this.animChanged = true;
    }
    collide(e) {
        if (e.body.tag == "ground") {
            this.grounded = true;
            if (this.anim == "fall") this.anim = "land";
        }
    }
    update() {
        this.controller.genInputs();
        //Physics
        let leftStick = this.controller.leftStick.rotated(-Math.PI / 4);
        let speed = this.speed; if (this.controller.run) speed *= 1.33;
        this.rigidbody.velocity.x = speed * leftStick.x;
        this.rigidbody.velocity.y = speed * leftStick.y;
        if (this.controller.jump && this.grounded) {
            this.anim = "jump";
            this.grounded = false;
            this.rigidbody.velocity.z += this.jumpForce;
        }
        //Graphics
        this.animCounter = (World.time - this.lastFrameChange);
        if (this.sprite.animationSpeed == 0) this.animCounter = 1;
        else this.animCounter *= this.sprite.animationSpeed * 60;
        this.animCounter = clamp(this.animCounter, 0, 1);
        if (this.controller.leftStick.x < 0.0) this.dir = -1;
        if (this.controller.leftStick.x > 0.0) this.dir = 1;
        if (this.controller.leftStick.y > 0.0) this.back = true;
        if (this.controller.leftStick.y < 0.0) this.back = false;
        if (this.grounded && this.anim != "land") {
            if (this.controller.leftStick.length() == 0) this.anim = "idle";
            else this.anim = "walk";
            let s = Math.abs(this.controller.leftStick.scalar(new vec2(0, 1)));
            if (this.anim == "walk" && this.controller.run && s < 0.75) this.anim = "run";
        } else if (!this.grounded) {
            if (this.rigidbody.velocity.z < 0) this.anim = "fall";
            else if (this.anim != "jump") this.anim = "ascend";
        }
        if (World.time - this.controller.afkTime > 10) this.anim = "sit";
        this.updateHands();
    }
    updateHands() {
        let animLength = Player.handPos[this.anim].length;
        let targetPos = Player.handPos[this.anim][this.sprite.currentFrame];
        let prevPos = Player.handPos[this.anim][(this.sprite.currentFrame + animLength - 1) % animLength];
        if (targetPos == undefined) {
            targetPos = Player.handPos[this.anim][0];
            prevPos = Player.handPos[this.anim][animLength - 1];
        }
        if(this.animChanged) prevPos = targetPos;
        let pos = prevPos.lerp(targetPos, 2 * this.animCounter);
        if (this.dir == -1) { pos.x *= -1; pos.y *= -1; } if (this.back) { pos.x *= -1; pos.y *= -1; }
        let base = new vec3(Player.handPos["base"][0]);
        if (this.anim == "run") base = new vec3(Player.handPos["base"][1]);
        this.rightHand.pos = new vec3(base.x + pos.x, base.y + pos.y, base.z + pos.z).rotated(this.controller.leftAngle);
        this.leftHand.pos = new vec3(-base.y - pos.x, -base.x - pos.y, base.z + pos.z).rotated(this.controller.leftAngle);
    }
    draw() {
        //Player
        let pos = this.rigidbody.position;
        pos = { x: pos.x, y: pos.y, z: pos.z - 0.5 };
        let p = camera.worldToCanvas(pos);
        this.sprite.x = p.x; this.sprite.y = p.y;
        this.sprite.scale = { x: this.dir * camera.zoom, y: camera.zoom };
        this.sprite.zIndex = p.zIndex;
        if (this.back) this.setAnim("back_" + this.anim);
        else this.setAnim(this.anim);
        //Hands
        let rHandPos = this.rightHand.pos.plus(pos);
        p = camera.worldToCanvas(rHandPos, false);
        this.rightHand.sprite.x = p.x; this.rightHand.sprite.y = p.y;
        this.rightHand.sprite.scale = { x: this.dir * camera.zoom, y: camera.zoom };
        rHandPos.z = pos.z; this.rightHand.sprite.zIndex = camera.zIndex(rHandPos);
        let lHandPos = this.leftHand.pos.plus(pos);
        p = camera.worldToCanvas(lHandPos, false);
        this.leftHand.sprite.x = p.x; this.leftHand.sprite.y = p.y;
        this.leftHand.sprite.scale = { x: this.dir * camera.zoom, y: camera.zoom };
        lHandPos.z = pos.z; this.leftHand.sprite.zIndex = camera.zIndex(lHandPos);
    }
    static handPos = {
        base: [new vec3(-0.124, -0.126, 0.31), new vec3(-0.064, -0.186, 0.31)],//BasePos
        idle: [new vec3(0, 0, 0.025), new vec3(0, 0, -0.05)],//Idle
        walk: [new vec3(0.05, -0.05, 0.05), new vec3(0, 0, 0), new vec3(-0.05, 0.05, 0.05), new vec3(0, 0, 0)],//Walk
        run: [new vec3(0.08, -0.08, 0.05), new vec3(0, 0, 0), new vec3(-0.08, 0.08, 0.05), new vec3(0, 0, 0)],//Run
        jump: [new vec3(0, 0, 0), new vec3(0, 0, 0.15), new vec3(0, 0, 0.15)],//Jump
        ascend: [new vec3(0, 0, 0.15)],//Ascend
        fall: [new vec3(0, 0, 0.05)],//Fall
        land: [new vec3(0, 0, 0.05), new vec3(0, 0, -0.05), new vec3(0, 0, 0.05)],//Land
        sit: [new vec3(0, 0, 0.025), new vec3(0.03, -0.03, -0.15), new vec3(0.03, -0.03, -0.15)]//Sit
    }
}