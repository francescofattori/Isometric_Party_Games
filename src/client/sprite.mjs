import * as PIXI from "../include/pixi.mjs";
import { camera, world, renderer } from "./client.mjs";
import { vec2, clamp } from "../common/vector.mjs";
export class Sprite {
    scale = new vec2(1, 1);
    flip = new vec2(1, 1); back = false;
    animated = false;
    lastFrameChange = 0; //last time the frame changed
    animCounter = 0; //from 0 to 1 progression in frame of animation
    animChanged = false; //true if this frame is the first after the animation changed
    get currentFrame() { return this.pixiSprite.currentFrame; }
    get zIndex() { return this.pixiSprite.zIndex; } set zIndex(v) { this.pixiSprite.zIndex = v; }
    get alpha() { return this.pixiSprite.alpha; } set alpha(v) { this.pixiSprite.alpha = v; }
    get visible() { return this.pixiSprite.visible; } set visible(v) { this.pixiSprite.visible = v; }
    get rotation() { return -this.pixiSprite.rotation; } set rotation(v) { this.pixiSprite.rotation = -v; }
    get skew() { return this.pixiSprite.skew; } set skew(v) { this.pixiSprite.skew = v; }
    get anchor() { return this.pixiSprite.anchor; }
    get tint() { return this.pixiSprite.tint; } set tint(v) { this.pixiSprite.tint = v; }
    constructor(texture, anchor = undefined) {
        this.texture = texture;
        if (texture.animations) {
            this.animated = true;
            let defaultAnim = texture.data.info.default;
            this.pixiSprite = new PIXI.AnimatedSprite(texture.animations[defaultAnim]);
            this.pixiSprite.animationSpeed = texture.data.info[defaultAnim].speed;
            this.pixiSprite.onFrameChange = () => {
                this.lastFrameChange = world.time;
                this.animChanged = false;
            };
            this.pixiSprite.onFrameChange = this.pixiSprite.onFrameChange.bind(this);
            this.pixiSprite.play();
        }
        else {
            this.pixiSprite = new PIXI.Sprite(texture);
            this.pixiSprite.anchor.set(0.5, 0.5);
            if (anchor) { this.pixiSprite.anchor.set(anchor.x / texture.width, anchor.y / texture.height); }
        }
        renderer.pixi.stage.addChild(this.pixiSprite);
    }
    #setAnim(animName) {
        if (!this.animated) return;
        if (animName == "" || this.animName == animName) return;
        this.animName = animName;
        this.pixiSprite.textures = this.texture.animations[animName];
        this.pixiSprite.animationSpeed = this.texture.data.info[animName].speed;
        this.pixiSprite.loop = this.texture.data.info[animName].loop;
        this.pixiSprite.play();
        this.animChanged = true;
    }
    onComplete(fun) {
        this.pixiSprite.onComplete = fun;
        this.pixiSprite.onComplete = this.pixiSprite.onComplete.bind(this);
    }
    draw(pos, zIndex = true) {
        let p = camera.worldToCanvas(pos, zIndex);
        this.pixiSprite.x = p.x; this.pixiSprite.y = p.y;
        this.pixiSprite.scale = { x: this.scale.x * this.flip.x * camera.zoom, y: this.scale.y * this.flip.y * camera.zoom };
        if (zIndex) this.pixiSprite.zIndex = p.zIndex;
        if (!this.animated) return;
        this.animCounter = (world.time - this.lastFrameChange);
        if (this.pixiSprite.animationSpeed == 0) this.animCounter = 1;
        else this.animCounter *= this.pixiSprite.animationSpeed * 60;
        this.animCounter = clamp(this.animCounter, 0, 1);
        if (this.back) this.#setAnim("back_" + this.anim);
        else this.#setAnim(this.anim);
    }
    destroy() { renderer.pixi.stage.removeChild(this.pixiSprite); }
}