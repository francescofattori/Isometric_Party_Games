import * as PIXI from "pixi";
import { __root } from "./global.mjs";
export class AssetsManager {
    cache = new Map();
    static #removeExtension(src) {
        return src.substring(0, src.lastIndexOf("."));
    }
    #loadJSON(src) {
        return new Promise((resolve) => {
            fetch(src).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data);
            })
        });
    }
    #loadTexture(src) {
        if (PIXI.Assets.cache.has(src)) return PIXI.Assets.cache.get(src);
        return PIXI.Assets.load({ alias: src, src: src, data: { scaleMode: "nearest" } });
    }
    async #loadSheetTexture(src) {
        let texture;
        if (PIXI.Assets.cache.has(src)) texture = PIXI.Assets.cache.get(src);
        else {
            let JsonSrc = AssetsManager.#removeExtension(src) + ".json";
            let sheetTexture = await PIXI.Assets.load({
                alias: "sheet" + src,
                src: src,
                data: { scaleMode: "nearest" }
            });
            PIXI.Assets.add({
                alias: src,
                src: JsonSrc,
                data: { texture: sheetTexture }
            });
            texture = PIXI.Assets.load(src);
        }
        return texture;
    }
    async load(src, type, root = false) {
        src = "assets/" + src;
        if (this.cache.has(src)) return this.cache.get(src);
        if (root) src = __root + src;
        switch (type) {
            case "json": return this.#loadJSON(src);
            case "texture": return this.#loadTexture(src);
            case "sheetTexture": return this.#loadSheetTexture(src);
        }
    }
    loadObj(assets) {
        return new Promise((resolve) => {
            let promises = [];
            for (const asset of assets) {
                promises.push(this.load(asset.src, asset.type, asset.root));
            }
            Promise.all(promises).then((data) => {
                let obj = {};
                for (let i = 0; i < assets.length; i++) {
                    obj[assets[i].attribute] = data[i];
                }
                resolve(obj);
            });
        });
    }
    async loadUI(src = "ui.json", root = true) {
        let data = await this.load(src, "json", root);
        this.ui = await this.loadObj(data);
    }
}