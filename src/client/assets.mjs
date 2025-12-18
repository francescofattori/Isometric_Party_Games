//CLIENT
import { Assets as PixiAssets } from "../include/pixi.mjs";
export class AssetsManager {
    cache = new Map();
    root = ("parse" in URL) ? URL.parse("../../", location.href).href : location.href + "../../";
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
        if (PixiAssets.cache.has(src)) return PixiAssets.cache.get(src);
        return PixiAssets.load({ alias: src, src: src, data: { scaleMode: "nearest" } });
    }
    async #loadSheetTexture(src) {
        let texture;
        if (PixiAssets.cache.has(src)) texture = PixiAssets.cache.get(src);
        else {
            let JsonSrc = AssetsManager.#removeExtension(src) + ".json";
            let sheetTexture = await PixiAssets.load({
                alias: "sheet" + src,
                src: src,
                data: { scaleMode: "nearest" }
            });
            PixiAssets.add({
                alias: src,
                src: JsonSrc,
                data: { texture: sheetTexture }
            });
            texture = PixiAssets.load(src);
        }
        return texture;
    }
    load(src, type, root = false) {
        src = "assets/" + src;
        if (this.cache.has(src)) return this.cache.get(src);
        if (root) src = this.root + src;
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