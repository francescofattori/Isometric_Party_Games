function updateDebug(loop) {
    let t = performance.now();
    let dt = t - loop.lastUpdate;
    loop.lastUpdate = t;
    loop.previousDt.push(dt); if (loop.previousDt.length > 10) loop.previousDt.shift();
    loop.meanDt = loop.previousDt.reduce((a, b) => a + b, 0) / loop.previousDt.length;
    loop.varDt = loop.previousDt.reduce((a, b) => a + (b - loop.meanDt) * (b - loop.meanDt), 0) / loop.previousDt.length;
    if (loop.previousDt.length >= 10) console.log("mean:" + loop.meanDt.toFixed(2), "var:" + loop.varDt.toFixed(2));
}

function cycle(fun, loop) {
    if (!loop.run) return;
    let t = performance.now();
    loop.sync.dt = t - loop.sync.lastUpdate;
    loop.sync.lastUpdate = t;
    loop.sync.delay = loop.sync.dt - (loop.cycles * loop.iRate - loop.sync.delay);
    for (let n = 1; n < loop.cycles; n++) {
        setTimeout(() => { fun(loop); if (loop.debug) updateDebug(loop); }, n * loop.iRate - loop.sync.delay);
    }
    if (loop.sync.delay > 300) { loop.sync.delay = 0; loop.throttleCount++; loop.throttled = true; }
    setTimeout(() => { cycle(fun, loop); }, loop.cycles * loop.iRate - loop.sync.delay);
    fun(loop); if (loop.debug) updateDebug(loop);
}

export function startLoop(fun, rate = 100, debug = false, cycles = 2) {
    const loop = {
        run: true, iRate: 1000.0 / rate, cycles: cycles, sync: { dt: 0, lastUpdate: performance.now(), delay: 0 },
        throttled: false, throttleCount: 0
    };
    if (debug) {
        loop.debug = true; loop.previousDt = []; loop.meanDt = 0; loop.varDt = 0; loop.lastUpdate = performance.now();
    }
    cycle(fun, loop);
    return loop;
}

export function endLoop(loop) {
    loop.run = false;
}