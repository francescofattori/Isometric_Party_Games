class SceneMap {
    constructor() {
        this.heights = [];
        this.obstacles = [];
        this.objects = [];
    }
    async load(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
        } catch (error) { console.error(error.message); }
        //return data;
    }
}