class Scene {
    constructor() {
        this.entities = [];
    }
    async load(){
        await fetchJSON("scenes/hub.json");
    }
}