function updateLoop() {//starts physics loop
    let t = performance.now();
    update(); World.updateTime = (performance.now() - t);
    setTimeout(updateLoop, (World.dt * 1000.0) - World.updateTime);
    if (!World.run) { clearInterval(World.interval); }
}

function update() {
    World.step(World.dt);
    for (let entity of scene.entities) { entity.update(); }
}

function draw() {
    htmlStats.innerText = "FPS: " + Pixi.ticker.FPS.toFixed(0) + " UT: " + (World.updateTime).toFixed(2);//DEBUG
    scene.map.draw();
    for (let entity of scene.entities) { entity.draw(); }
}