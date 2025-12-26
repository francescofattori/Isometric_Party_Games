import { assets } from "./client.mjs";
import { vec2 } from "../common/vector.mjs";
function handleTouchMove(e, stickDiv) {
    e.preventDefault();
    const touch = e.targetTouches[0]; const stick = stickDiv.children[0];
    const rect = stickDiv.getBoundingClientRect();
    let x = (touch.clientX - (rect.left + rect.right) * 0.5) / rect.width * 2;
    let y = (touch.clientY - (rect.top + rect.bottom) * 0.5) / rect.height * 2;
    let v = new vec2(x, y);
    if (v.length() > 0.75) v = v.normalized().times(0.75);
    stick.style.left = (50 + v.x * 50) + "%";
    stick.style.top = (50 + v.y * 50) + "%";
    stick.x = v.x * 1.333; stick.y = v.y * 1.333; // 1 / 0.75 = 1.333
}
function handleTouchStart(e, stickDiv) {
    handleTouchMove(e, stickDiv);
}
function handleTouchEnd(e, stickDiv) {
    e.preventDefault();
    const stick = stickDiv.children[0];
    stick.style.left = "50%";
    stick.style.top = "50%";
    stick.x = 0; stick.y = 0;
}
function handleButtonTouchStart(e, button) {
    e.preventDefault();
    button.pressed = 1;
}
function handleButtonTouchEnd(e, button) {
    e.preventDefault();
    button.pressed = 0;
}
export function createTouchControls() {
    let css = document.getElementById("touchControlsStyle");
    if (!css) {
        css = document.createElement("link");
        css.id = "touchControlsStyle";
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = assets.root + "src/client/touchControls.css";
    }
    document.head.appendChild(css);
    let div = document.createElement("div");
    div.id = "touchControls";
    let leftStickDiv = document.createElement("div");
    leftStickDiv.classList.add("stickDiv");
    leftStickDiv.style.left = "5vmin"; leftStickDiv.style.bottom = "5vmin";
    leftStickDiv.addEventListener("touchstart", (e) => { handleTouchStart(e, leftStickDiv); });
    leftStickDiv.addEventListener("touchmove", (e) => { handleTouchMove(e, leftStickDiv); });
    leftStickDiv.addEventListener("touchend", (e) => { handleTouchEnd(e, leftStickDiv); });
    let leftStick = document.createElement("div");
    leftStick.classList.add("stick"); leftStick.x = 0; leftStick.y = 0;
    let rightStickDiv = document.createElement("div");
    rightStickDiv.classList.add("stickDiv");
    rightStickDiv.style.right = "5vmin"; rightStickDiv.style.bottom = "5vmin";
    rightStickDiv.addEventListener("touchstart", (e) => { handleTouchStart(e, rightStickDiv); });
    rightStickDiv.addEventListener("touchmove", (e) => { handleTouchMove(e, rightStickDiv); });
    rightStickDiv.addEventListener("touchend", (e) => { handleTouchEnd(e, rightStickDiv); });
    let rightStick = document.createElement("div");
    rightStick.classList.add("stick"); rightStick.x = 0; rightStick.y = 0;
    let jumpButton = document.createElement("div");
    jumpButton.classList.add("touchButton");
    jumpButton.style.right = "5vmin"; jumpButton.style.bottom = "35vmin";
    jumpButton.addEventListener("touchstart", (e) => { handleButtonTouchStart(e, jumpButton); });
    jumpButton.addEventListener("touchend", (e) => { handleButtonTouchEnd(e, jumpButton); });
    leftStickDiv.appendChild(leftStick); rightStickDiv.appendChild(rightStick);
    div.appendChild(leftStickDiv); div.appendChild(rightStickDiv);
    div.appendChild(jumpButton);
    document.body.appendChild(div);
    return {
        div: div,
        leftStick: leftStick,
        rightStick: rightStick,
        jumpButton: jumpButton
    };
}
export function removeTouchControls() {
    let elem = document.getElementById("touchControls");
    if (elem) elem.remove();
}