class AssetsManager {
    cache = new Map();
    get(alias) {
        return this.cache.get(alias);
    }
    async load(alias, src, type, root = false) {
        if (this.cache.has(type + ": " + alias)) return this.cache.get(alias);
        if (root) src = "/" + src;
        switch (type) {
            case "json": return this.#loadJSON(alias, src);
            case "texture": return this.#loadTexture(alias, src);
            case "sheetTexture": return this.#loadSheetTexture(alias, src);
        }
    }
    async #loadJSON(alias, src) {
        try {
            const response = await fetch(src + ".json");
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const data = await response.json();
            this.cache.set("json: " + alias, data);
            return data;
        } catch (error) { console.error(error.message); }
    }
    async #loadTexture(alias, src) {
        if (PIXI.Assets.cache.has(alias)) return PIXI.Assets.cache.get(alias);
        return await PIXI.Assets.load({ alias: alias, src: src + ".png", data: { scaleMode: "nearest" } });
    }
    async #loadSheetTexture(alias, src) {
        if (PIXI.Assets.cache.has(alias)) return PIXI.Assets.cache.get(alias);
        let sheetTexture = await PIXI.Assets.load({
            alias: alias + "Sheet",
            src: src + ".png",
            data: { scaleMode: "nearest" }
        });
        PIXI.Assets.add({
            alias: alias,
            src: src + ".json",
            data: { texture: sheetTexture }
        });
        let texture = await PIXI.Assets.load("player");
        let data = await this.load("player", src, "json");
        for (const anim in texture.animations) {
            texture.animations[anim].speed = data.info[anim].speed;
            texture.animations[anim].loop = data.info[anim].loop;
        }
        return texture;
    }
}