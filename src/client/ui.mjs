import * as PIXI from "../include/pixi.mjs";
import { assets, renderer } from "./client.mjs";
const pixUnit = Math.round(4 * (1 + window.devicePixelRatio) * 0.5) / window.devicePixelRatio;
const borderHeight = 3;
export const uiSize = 1; // implement gui size
export class TextButton {
    visible = true;
    constructor(text = "", onClick = () => { }, texture = assets.ui.border, borderH = borderHeight) {
        this.onClick = onClick;
        this.sprite = new PIXI.NineSliceSprite({
            texture: texture,
            leftWidth: borderH,
            rightWidth: borderH,
            topHeight: borderH,
            bottomHeight: borderH,
            textureStyle: {
                scaleMode: 'nearest',
            }
        });
        this.text = new PIXI.Text({
            text: text,
            style: {
                fontFamily: "pixelFont",
                fontSize: Math.round(16 / window.devicePixelRatio) * window.devicePixelRatio,
            },
            textureStyle: {
                scaleMode: 'nearest',
            }
        });
        this.sprite.cursor = "pointer";
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.on('pointerdown', this.onClick);
        renderer.pixi.stage.addChild(this.sprite);
        renderer.pixi.stage.addChild(this.text);
        this.draw();
    }
    draw() {
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale = { x: pixUnit, y: pixUnit };
        this.sprite.zIndex = 3;
        this.text.x = this.x + this.sprite.width * this.sprite.scale.x / 2 - this.text.width / 2;
        this.text.y = this.y + this.sprite.height * this.sprite.scale.y / 2 - this.text.height / 2;
        this.text.zIndex = 3.1;
    }
    show() { this.sprite.visible = true; this.text.visible = true; }
    hide() { this.sprite.visible = false; this.text.visible = false; }
}
export class SpriteButton {
    visible = true;
    constructor(texture, onClick = () => { }) {
        this.onClick = onClick;
        this.sprite = new PIXI.Sprite({
            texture: texture,
            textureStyle: {
                scaleMode: 'nearest'
            }
        });
        this.sprite.cursor = "pointer";
        this.sprite.scale = { x: pixUnit, y: pixUnit };
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.on('pointerdown', this.onClick);
        renderer.pixi.stage.addChild(this.sprite);
        this.draw();
    }
    draw() {
        this.sprite.scale = { x: pixUnit, y: pixUnit };
        this.sprite.zIndex = 3;
    }
    show() { this.sprite.visible = true; }
    hide() { this.sprite.visible = false; }
}
export class Section {
    elements = [];
    visible = true;
    height = 40;
    width = 30;
    static iconHeight = 4;
    constructor(menu, texture) {
        this.menu = menu;
        this.icon = new PIXI.Sprite({
            texture: texture,
            anchor: 0.5,
            textureStyle: {
                scaleMode: 'nearest'
            }
        });
        this.background = new PIXI.NineSliceSprite({
            texture: assets.ui.border,
            leftWidth: borderHeight,
            rightWidth: borderHeight,
            topHeight: borderHeight,
            bottomHeight: borderHeight,
            textureStyle: {
                scaleMode: 'nearest'
            }
        });
        this.background.tint = this.menu.background.tint;
        this.background.visible = false;
        this.background.height = 2 * borderHeight + Section.iconHeight + 1;
        this.background.width = 2 * borderHeight + this.icon.width / 4;
        this.background.scale = { x: pixUnit, y: pixUnit };
        this.background.zIndex = 3.05;
        this.background.cursor = "pointer";
        this.background.interactive = true;
        this.background.buttonMode = true;
        this.background.on('pointerdown', this.setSelected);
        this.backgroundMask = new PIXI.Graphics();
        this.backgroundMask.rect(
            this.background.x, this.background.y + borderHeight * pixUnit,
            this.background.width * pixUnit, this.background.height * pixUnit
        ).fill();
        this.background.mask = this.backgroundMask;
        this.icon.scale = { x: pixUnit / 2, y: pixUnit / 2 };
        this.icon.zIndex = 3.1;
        this.icon.visible = false;
        this.icon.cursor = "pointer";
        this.icon.interactive = true;
        this.icon.buttonMode = true;
        this.icon.on('pointerdown', this.setSelected);
        renderer.pixi.stage.addChild(this.icon);
        renderer.pixi.stage.addChild(this.background);
    }
    show = this.show.bind(this);
    show() {
        this.icon.visible = true;
        this.background.visible = true;
        for (const element of this.elements) {
            element.show();
        }
    }
    hide = this.hide.bind(this);
    hide() {
        this.icon.visible = false;
        this.background.visible = false;
        for (const element of this.elements) {
            element.hide();
        }
    }
    toggleVisibility = this.toggleVisibility.bind(this);
    toggleVisibility() {
        if (this.visible) { this.hide(); this.visible = false; }
        else { this.show(); this.visible = true; }
    }
    setSelected = this.setSelected.bind(this);
    setSelected() {
        this.menu.selectedSection = this;
    }
    draw() {
        this.background.zIndex = 3.05;
        for (const element of this.elements) {
            element.draw();
        }
    }
}
export class Menu {
    sections = [];
    selectedSection = undefined;
    opened = false;
    constructor() {
        this.menuButton = new SpriteButton(assets.ui.menu, this.toggle);
        this.closeButton = new TextButton("x", this.close, assets.ui.smallBorder, 2);
        this.closeButton.sprite.width = 6;
        this.closeButton.sprite.height = 7;
        this.closeButton.sprite.tint = 0xd14641;
        this.closeButton.sprite.visible = false;
        this.background = new PIXI.NineSliceSprite({
            texture: assets.ui.border,
            leftWidth: borderHeight,
            rightWidth: borderHeight,
            topHeight: borderHeight,
            bottomHeight: borderHeight,
            textureStyle: {
                scaleMode: 'nearest'
            }
        });
        this.background.tint = 0xbababa;
        this.background.visible = false;
        this.sections = [
            new Section(this, assets.ui.gear),
            new Section(this, assets.ui.players),
            new Section(this, assets.ui.server),
        ];
        this.selectedSection = this.sections[0];
        this.background.height = 0;
        this.background.width = 0; let minWidth = this.closeButton.sprite.width;
        for (const section of this.sections) {
            if (this.background.height < section.height)
                this.background.height = section.height;
            if (this.background.width < section.width)
                this.background.width = section.width;
            minWidth += section.background.width - 1;
        }
        this.background.height = Math.min(this.background.height, 2 * borderHeight + 70);
        this.background.width = Math.max(this.background.width, minWidth + 3);
        renderer.pixi.stage.addChild(this.background);
        this.open();
    }
    close = this.close.bind(this);
    close() {
        this.opened = false;
        this.menuButton.show();
        this.background.visible = false;
        this.closeButton.hide();
        for (const section of this.sections) {
            section.hide();
        }
    }
    open = this.open.bind(this);
    open() {
        this.opened = true;
        this.menuButton.hide();
        this.background.visible = true;
        this.closeButton.show();
        for (const section of this.sections) {
            section.show();
        }
        this.draw();
    }
    toggle = this.toggle.bind(this);
    toggle() {
        if (this.opened) { this.close(); }
        else { this.open(); }
    }
    draw() {
        if (this.opened) {
            let dx = this.drawCloseButton();
            for (let i = 0; i < this.sections.length; i++) {
                dx = this.drawSection(i, dx);
            }
            this.background.x = renderer.pixi.screen.width - (this.background.width + 1) * pixUnit;
            this.background.y = (1 + Section.iconHeight + borderHeight) * pixUnit;
            this.background.scale = { x: pixUnit, y: pixUnit };
            this.background.zIndex = 3;
            if (this.selectedSection) this.selectedSection.draw();
        } else {
            this.menuButton.sprite.x = renderer.pixi.screen.width - this.menuButton.sprite.width - pixUnit;
            this.menuButton.sprite.y = pixUnit;
            this.menuButton.draw();
        }
    }
    drawCloseButton() {
        this.closeButton.x = renderer.pixi.screen.width - this.closeButton.sprite.width * pixUnit - pixUnit;
        this.closeButton.y = this.background.y - this.closeButton.sprite.height * pixUnit + 3 * pixUnit;
        this.closeButton.draw();
        this.closeButton.text.y -= pixUnit;
        return this.closeButton.sprite.width * pixUnit - pixUnit;
    }
    drawSection(i, dx) {
        const section = this.sections[i];
        let newDx = dx + section.background.width * pixUnit;
        section.background.x = this.background.x + this.background.width * pixUnit - newDx;
        section.background.y = pixUnit;
        section.icon.x = section.background.x + section.background.width * pixUnit / 2;
        section.icon.y = section.background.y + section.background.height * pixUnit / 2 - 1.5 * pixUnit;
        section.backgroundMask = new PIXI.Graphics();
        section.backgroundMask.rect(
            section.background.x, section.background.y,
            section.background.width * pixUnit, (section.background.height - borderHeight) * pixUnit
        ).fill();
        section.background.mask = section.backgroundMask;
        section.background.zIndex = 2.9;
        return newDx - pixUnit;
    }
}
