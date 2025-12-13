import { SceneMap as CommonMap } from "../common/map.mjs";
import { world, assets } from "./client.mjs";
import { Sprite } from "./sprite.mjs";
import { vec3 } from "../common/vector.mjs";
export class SceneMap extends CommonMap {
    genAssetsNames() {
        let assetsNames = [
            { attribute: "texture", src: this.info.folder + this.info.alias + ".png", type: "texture", root: this.info.root }
        ];
        for (let i = 0; i < this.info.obstacles.length; i++) {
            const obstacle = this.info.obstacles[i];
            assetsNames.push({ attribute: i.toString(), src: this.info.folder + obstacle.src, type: "texture", root: this.info.root });
        }
        return assetsNames;
    }
    initGraphics() {
        this.sprite = new Sprite(this.assets.texture);
        this.sprite.anchor.set(this.info.anchor.x / this.assets.texture.width, this.info.anchor.y / this.assets.texture.height);
        this.obstacles = [];
        for (let i = 0; i < this.info.obstacles.length; i++) {
            const obstacle = this.info.obstacles[i]; let obstacleTexture = this.assets[i.toString()];
            let sprite = new Sprite(obstacleTexture);
            this.obstacles.push({ sprite: sprite, pos: new vec3(obstacle.pos) });
            sprite.anchor.set(obstacle.anchor.x / obstacleTexture.width, obstacle.anchor.y / obstacleTexture.height);
        }
    }
    async init() {
        await super.init(assets, world);
        this.initGraphics();
    }
    draw() {
        this.sprite.draw({ x: 0, y: 0, z: 0 }, false);
        this.sprite.zIndex = -1;
        for (const obstacle of this.obstacles) {
            obstacle.sprite.draw(obstacle.pos);
        }
    }
}