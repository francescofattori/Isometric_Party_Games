import * as CANNON from "cannon";
import * as PIXI from "pixi";
import { pixi, world, camera, assets } from "./global.mjs";
import { vec2, vec3 } from "./vector.mjs";
export class SceneMap {
    async load(alias, root = false) {
        let data = await assets.load("map_" + alias, "assets/maps/" + alias + "/" + alias, "json", root);
        //Sprite management
        let texture = await assets.load("map_" + alias, "assets/maps/" + alias + "/" + alias, "texture", root);
        this.sprite = new PIXI.Sprite(texture); this.sprite.anchor.set(data.anchor.x / texture.width, data.anchor.y / texture.height);
        pixi.stage.addChild(this.sprite);
        this.obstacles = [];
        for (const obstacle of data.obstacles) {
            let obstacleTexture = await assets.load("map_" + alias + "_" + obstacle.sprite,
                "assets/maps/" + alias + "/" + obstacle.sprite, "texture", root);
            let sprite = new PIXI.Sprite(obstacleTexture);
            this.obstacles.push({ sprite: sprite, pos: new vec3(obstacle.pos) });
            sprite.anchor.set(obstacle.anchor.x / obstacleTexture.width, obstacle.anchor.y / obstacleTexture.height);
            pixi.stage.addChild(sprite);
        }
        //Depth calculations
        this.size = data.size;
        this.center = data.center;
        this.maxZIndex = 2.0 * (this.size.z - this.center.z) - this.center.x - this.center.y + 100;
        this.minZIndex = 2.0 * this.center.z - (this.size.x - this.center.x) - (this.size.y - this.center.y) - 100;
        this.multZIndex = 1.0 / (this.maxZIndex - this.minZIndex);
        //Collisions
        this.heights = data.heights;
        this.collider = new CANNON.Body({ type: CANNON.Body.STATIC });
        for (let i = 0; i < this.heights.length; i++) {
            const row = this.heights[i];
            for (let j = 0; j < row.length; j++) {
                const height = row[j];
                if (height <= 0 || height >= this.size.z) continue;
                let x = j - this.center.x;
                let y = this.heights.length - 1 - i - this.center.y;
                let pos = new CANNON.Vec3(x, y, height - this.center.z - (height + 1) / 2);
                const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, (height + 1) / 2));
                shape.material = world.materials["map"];
                this.collider.addShape(shape, pos);
            }
        }
        this.collider.tag = "ground";
        world.addBody(this.collider);
        this.draw();
    }
    draw() {
        let p = camera.worldToCanvas(new vec3(), false);
        this.sprite.x = p.x; this.sprite.y = p.y;
        this.sprite.scale = new vec2(1.0, 1.0).times(camera.zoom);
        this.sprite.zIndex = -1;
        for (const obstacle of this.obstacles) {
            let p = camera.worldToCanvas(obstacle.pos);
            obstacle.sprite.x = p.x; obstacle.sprite.y = p.y;
            obstacle.sprite.scale = new vec2(1.0, 1.0).times(camera.zoom);
            obstacle.sprite.zIndex = p.zIndex;
        }
    }
    heightAt(p) {
        let x = Math.round(p.x + this.center.x);
        let y = Math.round(this.size.y - 1 - (p.y + this.center.y));
        //if outside find closest point on border
        if (x < 0) x = 0; if (x >= this.size.x) x = this.size.x - 1;
        if (y < 0) y = 0; if (y >= this.size.y) y = this.size.y - 1;
        return this.heights[y][x];
    }
    zAt(p) {
        let z = this.heightAt(p);
        if (z <= 0 || z >= this.size.z) return undefined;
        return z - this.center.z;
    }
}