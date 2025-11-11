class SceneMap {
    constructor() {
        this.heights = [];
        this.obstacles = [];
        this.objects = [];
    }
    async load(filename) {
        let data = await fetchJSON(filename);
        console.log(data);
    }
}