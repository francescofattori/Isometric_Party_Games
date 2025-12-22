import { Worker } from "worker_threads";
export function startLoop(fun, rate = 100, debug = false) {
    const loop = {}
    let loopFun = `
    import { parentPort } from "worker_threads";
    let lastUpdate = performance.now()
    function loop() {
        let t = performance.now();
        if (t - lastUpdate >`+ 1000 / rate + `) {
            lastUpdate = t;
            parentPort.postMessage(0);
        }
        process.nextTick(loop);
    }
    loop();
    `;
    loop.worker = createWorker(loopFun);
    if (debug) {
        loop.debug = true; loop.previousDt = []; loop.meanDt = 0; loop.varDt = 0; loop.lastUpdate = performance.now();
        loop.worker.on("message", () => {
            fun(loop);
            let t = performance.now();
            let dt = t - loop.lastUpdate;
            loop.lastUpdate = t;
            loop.previousDt.push(dt); if (loop.previousDt.length > 10) loop.previousDt.shift();
            loop.meanDt = loop.previousDt.reduce((a, b) => a + b, 0) / loop.previousDt.length;
            loop.varDt = loop.previousDt.reduce((a, b) => a + (b - loop.meanDt) * (b - loop.meanDt), 0) / loop.previousDt.length;
            if (loop.previousDt.length >= 10) console.log("mean:" + loop.meanDt.toFixed(2), "var:" + loop.varDt.toFixed(2));
        });
    } else {
        loop.worker.on("message", () => { fun(loop); });
    }
    return loop;
}

export function endLoop(loop) {
    loop.worker.terminate();
}

function createWorker(s) {
    return new Worker(s, { eval: true });
}