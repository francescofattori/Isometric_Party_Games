class Scene {
    constructor() {
        this.entities = [];
    }
    async load(filename){
        let data = await fetchJSON("assets/scenes/" + filename + ".json");
        this.map = new SceneMap(); await this.map.load(data.map);
    }
}