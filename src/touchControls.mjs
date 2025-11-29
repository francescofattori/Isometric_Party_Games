import { __root } from "./global.mjs";
export function createTouchControls() {
    let css = document.getElementById("touchControlsStyle");
    if (!css) {
        css = document.createElement("link");
        css.id = "touchControlsStyle";
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = __root + "src/touchControls.css";
    }
    document.head.appendChild(css);
    let div = document.createElement("div");
    div.id = "touchControls";
    let leftStickDiv = document.createElement("div");
    leftStickDiv.classList.add("stickDiv");
    leftStickDiv.style.left = "5vmin"; leftStickDiv.style.bottom = "5vmin";
    let leftStick = document.createElement("div");
    leftStick.classList.add("stick");
    let rightStickDiv = document.createElement("div");
    rightStickDiv.classList.add("stickDiv");
    rightStickDiv.style.right = "5vmin"; rightStickDiv.style.bottom = "5vmin";
    let rightStick = document.createElement("div");
    rightStick.classList.add("stick");
    let jumpButton = document.createElement("div");
    jumpButton.classList.add("touchButton");
    jumpButton.style.right = "5vmin"; jumpButton.style.bottom = "35vmin";
    leftStickDiv.appendChild(leftStick); rightStickDiv.appendChild(rightStick);
    div.appendChild(leftStickDiv); div.appendChild(rightStickDiv);
    div.appendChild(jumpButton);
    document.body.appendChild(div);
}
export function removeTouchControls() {
    let elem = document.getElementById("touchControls");
    if (elem) elem.remove();
}