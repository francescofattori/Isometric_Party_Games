import * as PIXI from "../include/pixi.mjs";
import { assets, renderer } from "./client.mjs";

export function calcPixSize() {
    renderer.ui.pixSize = Math.round(2 * renderer.ui.guiScale * window.devicePixelRatio) / window.devicePixelRatio;
}
export function calcFontSize() {
    renderer.ui.fontSize = Math.round(16 / window.devicePixelRatio) * window.devicePixelRatio;
}
export class UIElement {
    x = 0; y = 0; width = 0; height = 0;
    sprite;
    get anchor() { return this.sprite.anchor } set anchor(t) { this.sprite.anchor = t }
    constructor(params = {}) {
        this.x = params.x || 0; this.y = params.y || 0; this.width = params.width || 0; this.height = params.height || 0;
        this.resolution = params.resolution || 1; this.zIndex = params.zIndex || 3;
    }
    show() { this.sprite.visible = true; }
    hide() { this.sprite.visible = false; }
    static draw(elem) {
        elem.sprite.x = elem.x; elem.sprite.y = elem.y;
        elem.sprite.width = elem.width; elem.sprite.height = elem.height;
        elem.sprite.tint = elem.tint; elem.sprite.zIndex = elem.zIndex;
    }
    draw() { UIElement.draw(this); }
}
export class UISprite extends UIElement {
    constructor(texture, params = {}) {
        super(params);
        this.sprite = new PIXI.Sprite({
            texture: texture,
            textureStyle: { scaleMode: 'nearest' }
        });
        this.width = this.sprite.width; this.height = this.sprite.height;
        UISprite.draw(this);
        renderer.pixi.stage.addChild(this.sprite);
    }
    static draw(uiSprite) {
        UIElement.draw(uiSprite);
        uiSprite.sprite.scale = { x: uiSprite.resolution * renderer.ui.pixSize, y: uiSprite.resolution * renderer.ui.pixSize };
    }
    draw() { UISprite.draw(this); }
}
export class Box extends UIElement {
    constructor(params = {}) {
        super(params);
        this.border = params.border || "small"; this.tint = params.tint || 0xffffff;
        this.borderSize = 1;
        switch (this.border) {
            case "none": default: this.texture = assets.ui.border; break;
            case "small": this.texture = assets.ui.smallBorder; this.borderSize = 2; break;
            case "round": this.texture = assets.ui.roundBorder; this.borderSize = 3; break;
        }
        this.sprite = new PIXI.NineSliceSprite({
            texture: this.texture,
            leftWidth: this.borderSize, rightWidth: this.borderSize,
            topHeight: this.borderSize, bottomHeight: this.borderSize,
            textureStyle: { scaleMode: 'nearest' }
        });
        Box.draw(this);
        renderer.pixi.stage.addChild(this.sprite);
    }
    static draw(box) {
        UIElement.draw(box);
        box.sprite.scale = { x: box.resolution * renderer.ui.pixSize, y: box.resolution * renderer.ui.pixSize };
    }
    draw() { Box.draw(this); }
}
export class BoxButton extends Box {
    constructor(onClick = () => { }, params = {}) {
        super(params);
        this.onClick = () => { onClick(this); };
        this.sprite.interactive = true; this.sprite.cursor = "pointer";
        this.sprite.on('pointerdown', this.onClick);
        BoxButton.draw(this);
    }
    static draw(boxButton) {
        Box.draw(boxButton);
    }
    draw() { BoxButton.draw(this); }
}
export class Text extends UIElement {
    get text() { return this.sprite.text; } set text(t) { this.sprite.text = t; }
    get tint() { return this.sprite.style.fill; } set tint(t) { this.sprite.style.fill = t; }
    get font() { return this.sprite.style.fontFamily; } set font(f) { this.sprite.style.fontFamily = f; }
    constructor(text = "", params = {}) {
        super(params);
        this.sprite = new PIXI.Text({
            text: text,
            style: {
                fontFamily: params.font || "pixelFont",
                fontSize: Text.fontSize(this.resolution),
                fill: params.tint || 0x000000
            },
            textureStyle: { scaleMode: 'nearest' }
        });
        this.width = this.sprite.width; this.height = this.sprite.height;
        renderer.pixi.stage.addChild(this.sprite);
        Text.draw(this);
    }
    static fontSize(resolution) {
        return Math.round(resolution * renderer.ui.fontSize / window.devicePixelRatio) * window.devicePixelRatio;
    }
    static draw(text) {
        text.sprite.x = text.x; text.sprite.y = text.y;
        text.sprite.tint = text.tint; text.sprite.zIndex = text.zIndex;
        text.sprite.style.fontSize = Text.fontSize(text.resolution);
        text.width = text.sprite.width / renderer.ui.pixSize; text.height = text.sprite.height / renderer.ui.pixSize;
    }
    draw() { Text.draw(this); }
}
export class TextButton extends BoxButton {
    constructor(text = "", onClick = () => { }, params = {}) {
        super(onClick, params);
        this.padding = params.padding || { left: 1, right: 1, top: 1, bottom: 1 };
        this.text = new Text(text, { font: params.font, color: params.textTint, resolution: params.textRes });
        TextButton.draw(this);
    }
    static draw(textButton) {
        textButton.width = textButton.text.width / textButton.resolution + (textButton.padding.left + textButton.padding.right + 2);
        textButton.height = textButton.text.height / textButton.resolution + (textButton.padding.top + textButton.padding.bottom + 2);
        textButton.text.x = textButton.x + (textButton.padding.left + 1) * textButton.resolution * renderer.ui.pixSize;
        textButton.text.y = textButton.y + (textButton.padding.top + 1) * textButton.resolution * renderer.ui.pixSize;
        BoxButton.draw(textButton); Text.draw(textButton.text);
    }
    draw() { TextButton.draw(this); }
    show() { super.show(); this.text.show(); }
    hide() { super.hide(); this.text.hide(); }
}
export class SpriteButton extends UISprite {
    constructor(texture, onClick = () => { }, params = {}) {
        super(texture, params);
        this.onClick = () => { onClick(this); };
        this.sprite.interactive = true; this.sprite.cursor = "pointer";
        this.sprite.on('pointerdown', this.onClick);
        SpriteButton.draw(this);
    }
    static draw(spriteButton) { UISprite.draw(spriteButton); }
    draw() { SpriteButton.draw(this); }
}
export class TextInput extends BoxButton {
    constructor(text = "", onChange = () => { }, params = {}) {
        super(() => { this.focus(); }, params);
        this.font = params.font || "pixelFont"; this.textRes = params.textRes || 1;
        this.minHeight = params.minHeight || 1, this.maxHeight = params.maxHeight || 3, this.maxWidth = params.maxWidth || 10;
        this.onChange = () => { onChange(this); };
        this.input = document.createElement("textarea"); this.input.value = text; this.input.style.resize = "none";
        this.input.style.position = "absolute", this.input.style.left = this.x + "px", this.input.style.top = this.y + "px";
        this.input.style.margin = "0", this.input.style.padding = "0", this.input.style.border = "0";
        this.input.style.outline = "none"; this.input.style.background = "transparent";
        this.input.style.scrollbarWidth = "none"; this.input.style.fieldSizing = "content";
        this.input.addEventListener("input", this.onInput);
        document.body.appendChild(this.input);
        TextInput.draw(this);
    }
    static draw(textInput) {
        textInput.input.style.left = textInput.x + "px", textInput.input.style.top = textInput.y + "px";
        textInput.input.style.fontFamily = textInput.font, textInput.input.style.fontSize = Text.fontSize(textInput.textRes) + "px";
        let padding = 2 * textInput.resolution * renderer.ui.pixSize;
        textInput.input.style.padding = padding + "px";
        textInput.input.style.width = textInput.maxWidth * renderer.ui.fontSize - padding + "px";
        textInput.input.style.minHeight = textInput.minHeight * renderer.ui.fontSize - padding + "px";
        textInput.input.style.maxHeight = textInput.maxHeight * renderer.ui.fontSize - padding + "px";
        textInput.width = textInput.input.getBoundingClientRect().width / renderer.ui.pixSize / textInput.resolution;
        textInput.height = textInput.input.getBoundingClientRect().height / renderer.ui.pixSize / textInput.resolution;
        BoxButton.draw(textInput);
    }
    draw() { TextInput.draw(this); }
    show() {
        super.show(); this.input.style.opacity = "1"; this.input.style.pointerEvents = "all";
    }
    hide() {
        super.hide(); this.input.style.opacity = "0"; this.input.style.pointerEvents = "none";
    }
    onInput = this.onInput.bind(this);
    onInput(e) {
        this.onChange();
        this.draw();
    }
    focus() {
        this.focussed = true;
    }
    unfocus() {
        this.focussed = false;
    }
}
export class Section extends BoxButton {
    name = ""; menu; elements = []; static tabHeight = 7;
    constructor(texture, elements = [], menu) {
        super(() => { this.select(); }, { border: "round", tint: 0xbababa });
        this.menu = menu;
        this.width = 10; this.height = Section.tabHeight + 3;
        this.zIndex = this.menu.zIndex - 0.01;
        this.icon = new UISprite(texture, { zIndex: this.zIndex + 0.02 });
        this.elements = elements;
        this.calcContentWidth();
        this.hide(); this.deselect();
    }
    hide() { super.hide(); this.icon.hide(); for (const element of this.elements) { element.hide(); } }
    show() { super.show(); this.icon.show(); }
    select() {
        for (const element of this.elements) { element.show(); }
        this.zIndex = this.menu.zIndex + 0.01; this.menu.select(this);
    }
    deselect() {
        for (const element of this.elements) { element.hide(); }
        this.zIndex = this.menu.zIndex - 0.01;
    }
    calcContentWidth() {
        this.contentWidth = 0;
        for (const element of this.elements) {
            if (element.width * element.resolution > this.contentWidth) this.contentWidth = element.width * element.resolution;
        }
    }
    drawContent() {
        let dy = 0;
        for (const element of this.elements) {
            element.x = this.menu.x + 2 * renderer.ui.pixSize * this.menu.resolution;
            element.y = this.menu.y + (2 * this.menu.resolution + dy) * renderer.ui.pixSize;
            dy += element.height * element.resolution + 0.5;
            element.draw();
        }
    }
    draw(dx) {
        this.resolution = this.menu.resolution;
        this.x = this.menu.x + (this.menu.width - this.width) * renderer.ui.pixSize * this.menu.resolution - dx;
        this.y = this.menu.y - Section.tabHeight * renderer.ui.pixSize * this.menu.resolution;
        this.sprite.mask = new PIXI.Graphics().rect(
            this.x,
            this.y,
            this.width * renderer.ui.pixSize * this.menu.resolution,
            (this.height - this.borderSize + 1) * renderer.ui.pixSize * this.menu.resolution,
        ).fill();
        this.icon.resolution = this.menu.resolution * 0.5;
        this.icon.x = this.x + (this.width * 0.5 - this.icon.width * 0.25) * renderer.ui.pixSize * this.menu.resolution;
        this.icon.y = this.y + (this.height * 0.5 - this.icon.height * 0.25 - 1) * renderer.ui.pixSize * this.menu.resolution;
        super.draw(); this.icon.draw();
        return dx + (this.width - 1) * renderer.ui.pixSize * this.menu.resolution;
    }
}
export class Menu extends Box {
    sections = {}; selectedSection = undefined; opened = false;
    constructor(sections = {}, params = {}) {
        params.border = "round";
        super(params);
        this.tint = params.tint || 0xbababa;
        this.sections = { ...this.defaultSections(), ...sections };
        this.button = new SpriteButton(assets.ui.menu, () => { this.open(); });
        this.closeButton = new BoxButton(() => { this.close(); },
            { width: 6, height: 7, tint: 0xd14641, visible: false, zIndex: this.zIndex - 0.01 });
        this.closeX = new UISprite(assets.ui.x, { visible: false, zIndex: this.zIndex + 0.005 });
        this.selectedSection = this.sections[Object.keys(this.sections)[0]];
        this.selectedSection.select();
        this.close();
        this.draw();
    }
    defaultSections() {
        document.cookie.split(";").forEach(item => {
            item = item.trim();
            if (item.startsWith("serverAddress=")) this.serverAddress = item.split("=")[1];
        });
        return {
            settings: new Section(assets.ui.wrench, [
                new TextButton("Gui scale:" + renderer.ui.guiScale, (textButton) => {
                    renderer.ui.guiScale = renderer.ui.guiScale % 3 + 1;
                    textButton.text.text = "Gui scale:" + renderer.ui.guiScale;
                    calcPixSize(); calcFontSize();
                    for (const names in this.sections) {
                        const section = this.sections[names];
                        section.drawContent(); section.calcContentWidth();
                        section.drawContent(); section.calcContentWidth();
                    }
                    document.cookie = "guiScale=" + renderer.ui.guiScale + "; expires = Fri, 31 Dec 9999 23:59:59 GMT;";
                }, { resolution: this.resolution * 0.5, tint: 0xcccccc }),
                new TextButton("Toggle Fullscreen", () => { renderer.toggleFullscreen(); },
                    { resolution: this.resolution * 0.5, tint: 0xcccccc }),
            ], this),
            players: new Section(assets.ui.players, [], this),
            networking: new Section(assets.ui.networking, [
                new Text("Server address:"),
                new TextInput(this.serverAddress,
                    (textInput) => {
                        document.cookie = "serverAddress=" + textInput.input.value + "; expires = Fri, 31 Dec 9999 23:59:59 GMT;";
                    }, { resolution: this.resolution * 0.5, tint: 0xcccccc }),
            ], this)
        }
    };
    open() {
        this.opened = true; this.button.hide(); this.show();
        for (const names in this.sections) { const section = this.sections[names]; section.show(); }
        this.closeButton.show(); this.closeX.show(); this.selectedSection.select(); this.draw();
    }
    close() {
        this.opened = false; this.button.show(); this.hide();
        for (const names in this.sections) { const section = this.sections[names]; section.hide(); }
        this.closeButton.hide(); this.closeX.hide(); this.draw();
    }
    select(section) {
        if (section == this.selectedSection) return;
        this.selectedSection.deselect(); this.selectedSection = section;
        this.draw();
    }
    draw() {
        let screenWidth = renderer.pixi.screen.width, pixSize = renderer.ui.pixSize, res = this.resolution;
        if (this.opened) {
            let minWidth = this.closeButton.width, maxWidth = 0, minHeight = 30, maxHeight = 50, height = 0;
            for (const names in this.sections) {
                const section = this.sections[names];
                if (section.contentWidth > maxWidth) maxWidth = section.contentWidth;
                minWidth += section.width - 1;
                if (section.contentHeight > height) height = section.contentHeight;
            }
            this.width = Math.max(minWidth, maxWidth / this.resolution) + this.borderSize + 1;
            this.height = Math.min(Math.max(height, minHeight), maxHeight);
            this.x = screenWidth - (this.width + 1) * pixSize * res, this.y = (Section.tabHeight + 1) * pixSize * res;
            Box.draw(this);
            this.closeButton.resolution = res;
            this.closeButton.x = this.x + (this.width - this.closeButton.width) * pixSize * res;
            this.closeButton.y = this.y - (this.closeButton.height - 3) * pixSize * res;
            this.closeButton.sprite.mask = new PIXI.Graphics().rect(
                this.closeButton.x, this.closeButton.y,
                this.closeButton.width * pixSize * res,
                (this.closeButton.height - this.closeButton.borderSize + 1) * pixSize * res
            ).fill();
            this.closeX.resolution = res / 2;
            this.closeX.x = this.closeButton.x + (this.closeButton.width - this.closeX.width / 2) / 2 * pixSize * res;
            this.closeX.y = this.closeButton.y + (this.closeButton.height - this.closeX.height / 2 - 1.8) / 2 * pixSize * res;
            this.closeX.draw();
            this.closeButton.draw();
            let dx = (this.closeButton.width - 1) * pixSize * res;
            for (const names in this.sections) {
                const section = this.sections[names];
                dx = section.draw(dx);
            }
            this.selectedSection.drawContent(this);
        } else {
            this.button.resolution = res;
            this.button.x = screenWidth - (this.button.width + 1) * pixSize * res, this.button.y = pixSize * res;
            this.button.draw();
        }
    }
}