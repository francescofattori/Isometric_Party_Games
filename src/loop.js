function updateLoop() {//starts physics loop
    let t = performance.now();
    update(); world.updateTime = (performance.now() - t);
    setTimeout(updateLoop, (world.dt * 1000.0) - world.updateTime);
    if (!world.run) { clearInterval(world.interval); }
}

function update() {
    for (let entity of scene.entities) { entity.update(); }
    let t = performance.now() / 1000.0;
    world.step(world.dt, t - world.lastUpdate);
    world.lastUpdate = t;
}

function draw() {
    htmlStats.innerText = "FPS: " + pixi.ticker.FPS.toFixed(0) + " UT: " + (world.updateTime).toFixed(2);//DEBUG
    scene.map.draw();
    for (let entity of scene.entities) { entity.draw(); }
}