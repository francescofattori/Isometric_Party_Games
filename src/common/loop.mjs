const steps = 3;
export function startLoop(fun, rate = 100) {
    const loop = { run: true, dt:0, lastUpdate:performance.now(), delay:0 }; const iRate = 1000.0 / rate;
    function cycle(loop) {
        if (!loop.run) return;
        let t = performance.now();
        loop.dt = t - loop.lastUpdate;
        loop.lastUpdate = t;
        loop.delay = loop.dt - (steps * iRate - loop.delay);
        //console.log(loop.delay);
        for (let n = 1; n < steps; n++) {
            setTimeout(() => { fun(loop); }, n * iRate - loop.delay);
        }
        setTimeout(() => { cycle(loop); }, steps * iRate - loop.delay);
        fun(loop);
    }
    cycle(loop);
    return loop;
}

export function endLoop(loop) {
    loop.run = false;
}