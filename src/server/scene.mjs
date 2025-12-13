//SERVER
import { Scene as CommonScene } from "../common/scene.mjs";
import { assets } from "./server.mjs";
import { Entity } from "./entity.mjs";
import { SceneMap } from "../common/map.mjs";
export class Scene extends CommonScene {
    constructor(world, alias, root = false) {
        super(alias, root); this.world = world;
    }
    async init() {
        await super.init(assets, Entity, SceneMap);
    }
    async load(alias, root = false) {
        await super.load(assets, Entity, SceneMap, alias, root);
    }
    genNetworkingData() {
        return undefined;
    };
};