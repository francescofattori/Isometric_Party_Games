var documentEventListeners = { keydown: [], keyup: [] }; //for handling key events
class Controller {
    input = "keyboard"; //or gamepad
    leftStick = new vec2(); leftAngle = -Math.PI / 2;
    rightStick = new vec2();
    jump = false;
    afk = false; afkTime = undefined;
    prevTime = 0;
    constructor() {
        if (this.input == "keyboard") {
            Controller.resetKeyListener();
            this.genInputs = this.genInputs.bind(this);
            this.keyDown = this.keyDown.bind(this);
            this.keyUp = this.keyUp.bind(this);
            document.addEventListener("keydown", this.keyDown);
            document.addEventListener("keyup", this.keyUp);
            documentEventListeners.keydown.push({ listener: this.keyDown, useCapture: false });
            documentEventListeners.keyup.push({ listener: this.keyUp, useCapture: false });
            this.w = 0; this.a = 0; this.s = 0; this.d = 0;
            this.wValue = 0.0; this.aValue = 0.0; this.sValue = 0.0; this.dValue = 0.0;
            this.fadeRate = 10;
        }
    }
    keyDown(e) {
        switch (e.code) {
            case "KeyW": this.w = 1; break;
            case "KeyA": this.a = 1; break;
            case "KeyS": this.s = 1; break;
            case "KeyD": this.d = 1; break;
            case "Space": this.jump = 1; break;
            case "ShiftLeft": this.shift = 1; break;
            default: return;
        }
    }
    keyUp(e) {
        switch (e.code) {
            case "KeyW": this.w = 0; break;
            case "KeyA": this.a = 0; break;
            case "KeyS": this.s = 0; break;
            case "KeyD": this.d = 0; break;
            case "Space": this.jump = 0; break;
            case "ShiftLeft": this.shift = 0; break;
            default: return;
        }
    }
    genInputs() {
        let dt = world.time - this.prevTime;
        if (this.input == "keyboard") {
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
            this.run = this.shift;
            this.afk = !(this.w || this.a || this.s || this.d || this.jump);
            if (this.afk) {
                if (this.afkTime == undefined) this.afkTime = world.time;
            } else this.afkTime = undefined;
        }
        this.prevTime = world.time;
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