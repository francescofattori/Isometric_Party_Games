import { vec2 } from "../common/vector.mjs";
export class Controller {
    leftStick = new vec2(); leftAngle = -Math.PI / 2;
    rightStick = new vec2(); rightAngle = -Math.PI / 2;
    jump = false; run = false;
    genInputs() {
        this.rightAngle = Math.atan2(this.rightStick.y, this.rightStick.x);
        this.leftAngle = Math.atan2(this.leftStick.y, this.leftStick.x);
    }
}