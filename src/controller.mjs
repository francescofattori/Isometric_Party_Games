const documentEventListeners = { keydown: [], keyup: [], mouseDown: [], mouseUp: [], mouseMove: [] }; //for handling key events
import * as CANNON from "cannon";
import { pixPerUnit } from "./camera.mjs";
import { assets, camera, pixi, scene, world } from "./global.mjs";
import { Sprite } from "./sprite.mjs";
import { createTouchControls } from "./touchControls.mjs";
import { clamp } from "./vector.mjs";
export class Controller {
    input = "keyboard"; //or keyboardAndMouse or gamepad or touchControls
    leftStick = new vec2(); leftAngle = -Math.PI / 2;
    rightStick = new vec2(); rightAngle = -Math.PI / 2;
    player = undefined;
    jump = false;
    afk = false; afkTime = undefined;
    prevTime = 0;
    showUI = true;
    constructor(player, input = "keyboard", index = 0) {
        this.input = input; this.player = player;
        switch (this.input) {
            case "keyboard":
                this.initKeyBoard();
                break;
            case "keyboardAndMouse":
                this.initKeyBoard();
                this.initMouse();
                break;
            case "gamepad":
                this.initGamepad(index);
                break;
            case "touchControls":
                this.initTouchControls();
                break;
        }
    }
    initKeyBoard() {
        Controller.resetKeyListener();
        document.addEventListener("keydown", this.keyDown);
        document.addEventListener("keyup", this.keyUp);
        documentEventListeners.keydown.push({ listener: this.keyDown, useCapture: false });
        documentEventListeners.keyup.push({ listener: this.keyUp, useCapture: false });
        this.w = 0; this.a = 0; this.s = 0; this.d = 0;
        this.wValue = 0.0; this.aValue = 0.0; this.sValue = 0.0; this.dValue = 0.0;
        this.up = 0; this.left = 0; this.down = 0; this.right = 0;
        this.upValue = 0.0; this.leftValue = 0.0; this.downValue = 0.0; this.rightValue = 0.0;
        this.fadeRate = 10;
    }
    initMouse() {
        document.addEventListener("mousedown", this.mouseDown);
        document.addEventListener("mouseup", this.mouseUp);
        document.addEventListener("mousemove", this.mouseMove);
        documentEventListeners.mouseDown.push({ listener: this.mouseDown, useCapture: false });
        documentEventListeners.mouseUp.push({ listener: this.mouseUp, useCapture: false });
        documentEventListeners.mouseMove.push({ listener: this.mouseMove, useCapture: false });
        this.mouseX = 0; this.mouseY = 0; this.mouseTargetLine = new vec3(); this.mouseTarget = new vec3();
        this.marker = new Sprite(assets.ui.marker);
    }
    initGamepad(index) {
        let length = navigator.getGamepads().length;
        if (index < length) this.gamepadIndex = index;
    }
    initTouchControls() {
        let obj = createTouchControls();
        this.div = obj.div;
        this.HTMLleftStick = obj.leftStick;
        this.HTMLrightStick = obj.rightStick;
        this.HTMLjumpButton = obj.jumpButton;
    }
    keyDown = this.keyDown.bind(this);
    keyDown(e) {
        switch (e.code) {
            case "KeyW": this.w = 1; break;
            case "KeyA": this.a = 1; break;
            case "KeyS": this.s = 1; break;
            case "KeyD": this.d = 1; break;
            case "ArrowUp": this.up = 1; break;
            case "ArrowLeft": this.left = 1; break;
            case "ArrowDown": this.down = 1; break;
            case "ArrowRight": this.right = 1; break;
            case "Space": this.jump = 1; break;
            case "ShiftLeft": this.shift = 1; break;
            default: return;
        }
    }
    keyUp = this.keyUp.bind(this);
    keyUp(e) {
        switch (e.code) {
            case "KeyW": this.w = 0; break;
            case "KeyA": this.a = 0; break;
            case "KeyS": this.s = 0; break;
            case "KeyD": this.d = 0; break;
            case "ArrowUp": this.up = 0; break;
            case "ArrowLeft": this.left = 0; break;
            case "ArrowDown": this.down = 0; break;
            case "ArrowRight": this.right = 0; break;
            case "Space": this.jump = 0; break;
            case "ShiftLeft": this.shift = 0; break;
            default: return;
        }
    }
    mouseDown = this.mouseDown.bind(this);
    mouseDown(e) {
        switch (e.button) {
            case 0: this.leftClick = 1; break;
            case 1: this.wheelClick = 1; break;
            case 2: this.rightClick = 1; break;
            default: return;
        }
    }
    mouseUp = this.mouseUp.bind(this);
    mouseUp(e) {
        switch (e.button) {
            case 0: this.leftClick = 0; break;
            case 1: this.wheelClick = 0; break;
            case 2: this.rightClick = 0; break;
            default: return;
        }
    }
    mouseMove = this.mouseMove.bind(this);
    mouseMove(e) {
        this.mouseX = e.x;
        this.mouseY = e.y;
    }
    genInputs() {
        switch (this.input) {
            case "keyboard":
                this.genKeyboardInputs();
                break;
            case "keyboardAndMouse":
                this.genKeyboardInputs();
                this.genMouseInputs();
                break;
            case "gamepad":
                this.genGamepadInputs();
                break;
            case "touchControls":
                this.genTouchControlsInputs();
                break;
        }
    }
    genKeyboardInputs() {
        let dt = world.time - this.prevTime;
        //making inputs fade so it allows for smooth transitions 10 is just a big number
        this.wValue += this.w * 10 - this.fadeRate * dt; this.wValue = clamp(this.wValue, 0, 1);
        this.aValue += this.a * 10 - this.fadeRate * dt; this.aValue = clamp(this.aValue, 0, 1);
        this.sValue += this.s * 10 - this.fadeRate * dt; this.sValue = clamp(this.sValue, 0, 1);
        this.dValue += this.d * 10 - this.fadeRate * dt; this.dValue = clamp(this.dValue, 0, 1);
        this.leftStick = new vec2(this.dValue - this.aValue, this.wValue - this.sValue);
        if (this.leftStick.length() > 0.75) this.leftStick.normalize();
        else { this.leftStick = new vec2(); }
        if (this.leftStick.length() > 0.0)
            this.leftAngle = Math.atan2(this.leftStick.y, this.leftStick.x);
        this.upValue += this.up * 10 - this.fadeRate * dt; this.upValue = clamp(this.upValue, 0, 1);
        this.leftValue += this.left * 10 - this.fadeRate * dt; this.leftValue = clamp(this.leftValue, 0, 1);
        this.downValue += this.down * 10 - this.fadeRate * dt; this.downValue = clamp(this.downValue, 0, 1);
        this.rightValue += this.right * 10 - this.fadeRate * dt; this.rightValue = clamp(this.rightValue, 0, 1);
        this.rightStick = new vec2(this.rightValue - this.leftValue, this.upValue - this.downValue);
        if (this.rightStick.length() > 0.75) this.rightStick.normalize();
        else { this.rightStick = new vec2(this.leftStick); }
        if (this.rightStick.length() > 0.0)
            this.rightAngle = Math.atan2(this.rightStick.y, this.rightStick.x);
        this.run = this.shift;
        this.afk = !(this.w || this.a || this.s || this.d || this.jump);
        if (this.afk) {
            if (this.afkTime == undefined) this.afkTime = world.time;
        } else this.afkTime = undefined;
        this.prevTime = world.time;
    }
    genMouseInputs() {
        let dX = 0.25 * (this.mouseX - Math.floor(pixi.screen.width * 0.5)) / pixPerUnit * window.devicePixelRatio;
        let dY = 0.5 * (this.mouseY - Math.floor(pixi.screen.height * 0.5)) / pixPerUnit * window.devicePixelRatio;
        this.mouseTargetLine.x = dX - dY + camera.pos.x;
        this.mouseTargetLine.y = -dX - dY + camera.pos.y;
        this.marker.visible = false;
        let t = scene.map.size.z - scene.map.center.z - 1 + scene.map.maxHeight;
        let b = scene.map.center.z + 3;
        let top = new vec3(this.mouseTargetLine.x - t, this.mouseTargetLine.y - t, t);
        let bottom = new vec3(this.mouseTargetLine.x + b, this.mouseTargetLine.y + b, -b);
        let ray = new CANNON.Ray(
            new CANNON.Vec3(top.x, top.y, top.z),
            new CANNON.Vec3(bottom.x, bottom.y, bottom.z)
        );
        ray.mode = CANNON.RAY_MODES.CLOSEST;
        let result = new CANNON.RaycastResult();
        let index = world.bodies.indexOf(this.player.rigidbody);
        let bodies = world.bodies.slice();
        if (index > -1) {
            bodies.splice(index, 1);
        }
        ray.intersectBodies(bodies, result);
        this.mouseTarget = undefined;
        if (result.hasHit) {
            this.mouseTarget = new vec3(result.hitPointWorld.x, result.hitPointWorld.y, result.hitPointWorld.z);
            if (result.body.tag == "map" && (scene.map.heightAt(this.mouseTargetLine) <= 0 || scene.map.heightAt(this.mouseTargetLine) >= scene.map.size.z))
                this.mouseTarget = new vec3(this.mouseTargetLine.x - this.player.pos.z, this.mouseTargetLine.y - this.player.pos.z, this.player.pos.z);
        } else {
            this.mouseTarget = new vec3(this.mouseTargetLine.x - this.player.pos.z, this.mouseTargetLine.y - this.player.pos.z, this.player.pos.z);
        }
        if (!this.mouseTarget) return;
        if (this.rightClick) {
            this.marker.visible = true;
            this.rightStick = new vec2(new vec3(this.mouseTarget).minus(this.player.pos).rotated(Math.PI / 4).normalized());
            this.rightAngle = Math.atan2(this.rightStick.y, this.rightStick.x);
        }
    }
    genGamepadInputs() {
        let gamepad = navigator.getGamepads()[this.gamepadIndex];
        this.jump = gamepad.buttons[0].pressed;
        this.leftStick = new vec2(gamepad.axes[0], -gamepad.axes[1]);
        this.rightStick = new vec2(gamepad.axes[2], -gamepad.axes[3]);
        if (this.leftStick.length() > 0.9) this.run = true; else this.run = false;
        if (this.leftStick.length() < 0.1) this.leftStick = new vec2(0, 0);
        else { this.leftStick.normalize(); this.leftAngle = Math.atan2(this.leftStick.y, this.leftStick.x); }
        if (this.rightStick.length() < 0.1) { this.rightStick = new vec2(this.leftStick); }
        else { this.rightStick.normalize(); }
        if (this.rightStick.length() > 0.0) this.rightAngle = Math.atan2(this.rightStick.y, this.rightStick.x);
    }
    genTouchControlsInputs(){
        this.leftStick = new vec2(this.HTMLleftStick.x, -this.HTMLleftStick.y);
        this.rightStick = new vec2(this.HTMLrightStick.x, -this.HTMLrightStick.y);
        if (this.leftStick.length() > 0.9) this.run = true; else this.run = false;
        if (this.leftStick.length() < 0.1) this.leftStick = new vec2(0, 0);
        else { this.leftAngle = Math.atan2(this.leftStick.y, this.leftStick.x); }
        if (this.rightStick.length() < 0.1) { this.rightStick = new vec2(this.leftStick); }
        if (this.rightStick.length() > 0.0) this.rightAngle = Math.atan2(this.rightStick.y, this.rightStick.x);
        this.jump = this.HTMLjumpButton.pressed;
    }
    draw() {
        if (!this.mouseTarget) return;
        if (!this.showUI) return;
        this.marker.draw(this.mouseTarget);
        let t = world.time; let h = 2;
        let c = Math.cos(t); let s = Math.sin(t); c *= c; s *= s;
        this.marker.scale = new vec2(Math.sqrt(c + h * h * s), Math.sqrt(s + h * h * c)).times(2 / (1 + h));
        let a1 = Math.atan2(-Math.sin(t), h * Math.cos(t));
        let a2 = Math.atan2(Math.cos(t), h * Math.sin(t));
        this.marker.skew = new vec2(a1 - Math.PI * 0.5, -a2);
    }
    static resetKeyListener() {
        for (const event of documentEventListeners["keydown"]) {
            document.removeEventListener("keydown", event.listener, event.useCapture);
        }
        for (const event of documentEventListeners["keyup"]) {
            document.removeEventListener("keyup", event.listener, event.useCapture);
        }
    }
}