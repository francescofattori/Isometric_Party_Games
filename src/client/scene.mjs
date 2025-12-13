//CLIENT
import { Scene as CommonScene } from "../common/scene.mjs";
import { assets } from "./client.mjs";
import { Entity } from "./entity.mjs";
import { SceneMap } from "./map.mjs";
export class Scene extends CommonScene {
    async init() {
        await super.init(assets, Entity, SceneMap);
    }
    async load(alias, root = false) {
        await super.load(assets, Entity, SceneMap, alias, root);
    }
}