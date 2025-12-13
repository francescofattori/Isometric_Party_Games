//SERVER
import fs from "fs/promises";
export class AssetsManager {
    cache = new Map();
    constructor() {
        this.root = new URL("../../", import.meta.dirname.replaceAll("\\", "/") + "/");
    }
    #loadJSON(src) {
        return new Promise((resolve) => {
            fs.readFile(decodeURIComponent(src), "utf8").then((file) => {
                resolve(JSON.parse(file));
            });
        });
    }
    load(src, type, root = false) {
        src = "assets/" + src;
        if (this.cache.has(src)) return this.cache.get(src);
        if (root) src = this.root + src;
        switch (type) {
            case "json": return this.#loadJSON(src);
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
}