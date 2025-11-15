class Controller {
    constructor() {
        this.input = "keyboard"; //or gamepad
        this.leftStick = new vec2();
        this.rightStick = new vec2();
        this.jump = false;
        this.afk = false; this.afkTime = undefined;
        if (this.input == "keyboard") {
            Controller.resetKeyListener();
            this.genInputs = this.genInputs.bind(this);
            this.keyDown = this.keyDown.bind(this);
            this.keyUp = this.keyUp.bind(this);
            document.addEventListener("keydown", this.keyDown);
            document.addEventListener("keyup", this.keyUp);
            documentEventListeners.keydown.push({ listener: this.keyDown, useCapture: false });
            documentEventListeners.keyup.push({ listener: this.keyUp, useCapture: false });
            this.w = false; this.a = false; this.s = false; this.d = false;
        }
        this.genInputs();
    }
    keyDown(e) {
        switch (e.code) {
            case "KeyW": this.w = true; break;
            case "KeyA": this.a = true; break;
            case "KeyS": this.s = true; break;
            case "KeyD": this.d = true; break;
            case "Space": this.jump = true; break;
            case "ShiftLeft": this.shift = true; break;
            default: return;
        }
        this.genInputs();
    }
    keyUp(e) {
        switch (e.code) {
            case "KeyW": this.w = false; break;
            case "KeyA": this.a = false; break;
            case "KeyS": this.s = false; break;
            case "KeyD": this.d = false; break;
            case "Space": this.jump = false; break;
            case "ShiftLeft": this.shift = false; break;
            default: return;
        }
        this.genInputs();
    }
    genInputs() {
        if (this.input == "keyboard") {
            this.leftStick = new vec2(this.d - this.a, this.w - this.s).normalized();
            this.run = this.shift;
            this.afk = !(this.w || this.a || this.s || this.d || this.jump);
            if (this.afk) {
                if (this.afkTime == undefined) this.afkTime = World.time;
            } else this.afkTime = undefined;
        }
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