class Scene {
    state = "inactive";
    map = undefined;
    entities = [];
    cache = new Map();
    async load(alias, root = false) {
        let data = await assets.load("scene_" + alias, "assets/scenes/" + alias, "json", root);
        this.map = new SceneMap(); await this.map.load(data.map.src, data.map.root);
        for (const entity of data.entities) {
            if (entity.type == "player") {
                let player = new Player(entity.pos); await player.load();
                this.add(player);
            }
        }
    }
    add(entity) { this.entities.push(entity); }
    draw = this.draw.bind(this);
    draw() {
        //DEBUG
        if (world.time > 1.0) {
            if (world.time - world.statTime > 1.0) {
                world.statTime = world.time;
                htmlStats.innerText = "FPS: " + (world.FPSSum / world.statCount).toFixed(0) +
                    " UT: " + (world.updateTimeSum / world.statCount).toFixed(2);
                world.updateTimeSum = 0; world.FPSSum = 0; world.statCount = 0;
            }
        }
        world.updateTimeSum += world.updateTime;
        world.FPSSum += pixi.ticker.FPS;
        world.statCount += 1;
        //-----
        this.map.draw();
        for (let entity of this.entities) { entity.draw(); }
    }
    update() {
        for (let entity of this.entities) { entity.update(); }
        let t = performance.now() / 1000.0;
        world.step(world.dt, t - world.lastUpdate);
        world.lastUpdate = t;
    }
    static enterLoop() {//starts physics loop
        let t = performance.now();
        update(); world.updateTime = (performance.now() - t);
        if (!world.run) return;
        setTimeout(Scene.enterLoop, (world.dt * 1000.0) - world.updateTime);
    }
    play() {
        this.state = "active";
        htmlViewport.style.opacity = "1";
        world.run = true;
        Scene.enterLoop();
        pixi.ticker.add(this.draw);
    }
    stop() {
        this.state = "inactive";
        htmlViewport.style.opacity = "0";
        world.run = false;
        for (const entity of this.entities) {
            try { entity.sprite.stop(); } catch (e) { }
        }
        pixi.ticker.remove(this.draw);
    }
}