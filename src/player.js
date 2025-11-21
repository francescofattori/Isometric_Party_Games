class Player {
    anim = "idle"; animName = "idle";
    dir = 1; //1 means right, -1 means left
    back = false; //true means back
    speed = 3.5; jumpForce = 10; grounded = false;
    rightHand = { sprite: undefined, pos: new vec3() };
    leftHand = { sprite: undefined, pos: new vec3() };
    lastFrameChange = 0; //last time the frame changed
    animCounter = 0; //from 0 to 1 progression in frame of animation
    animChanged = false; //true if this frame is the first after the animation changed
    constructor(pos = new vec3()) {
        this.controller = new Controller();
        this.rigidbody = new CANNON.Body({ mass: 35, fixedRotation: true });
        let upSphere = new CANNON.Sphere(0.25); upSphere.material = world.materials["player"];
        let downSphere = new CANNON.Sphere(0.25); downSphere.material = world.materials["player"];
        let cylinder = new CANNON.Cylinder(0.25, 0.25, 0.5); cylinder.material = world.materials["player"];
        downSphere.tag = "feet";
        let q = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI * 0.5);
        this.rigidbody.addShape(upSphere, new CANNON.Vec3(0, 0, 0.25));
        this.rigidbody.addShape(downSphere, new CANNON.Vec3(0, 0, -0.25));
        this.rigidbody.addShape(cylinder, new CANNON.Vec3(0, 0, 0), q);
        this.rigidbody.position.set(pos.x, pos.y, pos.z);
        this.collide = this.collide.bind(this);
        this.rigidbody.addEventListener("collide", this.collide);
        world.addBody(this.rigidbody);
    }
    async load() {
        //Sprite management
        this.texture = await assets.load("player", "/assets/sprites/player", "sheetTexture");
        this.handTexture = await assets.load("hand", "/assets/sprites/hand", "texture");
        this.shadowTexture = await assets.load("shadow", "/assets/sprites/shadow", "sheetTexture");
        this.sprite = new PIXI.AnimatedSprite(this.texture.animations.idle);
        this.sprite.animationSpeed = this.texture.animations.idle.speed;
        this.sprite.onFrameChange = () => {
            this.lastFrameChange = world.time;
            this.animChanged = false;
        };
        this.sprite.onFrameChange = this.sprite.onFrameChange.bind(this);
        this.sprite.onComplete = () => {
            switch (this.anim) {
                case "land": this.anim = "idle"; break;
            }
        };
        this.sprite.onComplete = this.sprite.onComplete.bind(this);
        pixi.stage.addChild(this.sprite);
        this.sprite.play();
        //Hands
        this.rightHand.sprite = new PIXI.Sprite(this.handTexture);
        this.rightHand.sprite.anchor.set(0.5, 0.5);
        this.leftHand.sprite = new PIXI.Sprite(this.handTexture);
        this.leftHand.sprite.anchor.set(0.5, 0.5);
        pixi.stage.addChild(this.rightHand.sprite);
        pixi.stage.addChild(this.leftHand.sprite);
        //Shadow
        this.shadow = new PIXI.AnimatedSprite(this.shadowTexture.animations.shadow);
        this.shadow.alpha = 0.35;
        pixi.stage.addChild(this.shadow);
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
        if (e.body.tag == "ground" && e.contact.si.tag == "feet" && this.anim != "jump") {
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
        this.animCounter = (world.time - this.lastFrameChange);
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
        if (world.time - this.controller.afkTime > 10) this.anim = "sit";
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
        if (this.animChanged) prevPos = targetPos;
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
        //Shadow
        let ray = new CANNON.Ray(new CANNON.Vec3(pos.x, pos.y, pos.z + 0.1), new CANNON.Vec3(pos.x, pos.y, pos.z - 10));
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
            this.shadow.scale = { x: this.dir * camera.zoom, y: camera.zoom };
            this.shadow.zIndex = p.zIndex;
            if (this.shadow.zIndex > this.sprite.zIndex) //so that shadow is behind player
                this.shadow.zIndex = this.sprite.zIndex - 0.000001;
        } else {
            this.shadow.visible = false;
        }
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