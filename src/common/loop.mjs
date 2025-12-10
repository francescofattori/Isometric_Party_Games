export function startLoop(fun, rate = 100) {
    const loop = { run: true }; const iRate = 1000.0 / rate;
    function cycle(loop) {
        let t = performance.now();
        fun(loop); if (!loop.run) return;
        setTimeout(() => { cycle(loop); }, iRate - (performance.now() - t));
    }
    cycle(loop);
    return loop;
}

export function endLoop(loop) {
    loop.run = false;
}