window.URL = window.URL || window.webkitURL;

export function startLoop(fun, rate = 100, debug = false) {
    const loop = {}
    let loopFun = "setInterval(() => {postMessage(0);}," + 1000 / rate + ");";
    loop.worker = createWorker(loopFun);
    if (debug) {
        loop.debug = true; loop.previousDt = []; loop.meanDt = 0; loop.varDt = 0; loop.lastUpdate = performance.now();
        loop.worker.onmessage = () => {
            fun(loop);
            let t = performance.now();
            let dt = t - loop.lastUpdate;
            loop.lastUpdate = t;
            loop.previousDt.push(dt); if (loop.previousDt.length > 10) loop.previousDt.shift();
            loop.meanDt = loop.previousDt.reduce((a, b) => a + b, 0) / loop.previousDt.length;
            loop.varDt = loop.previousDt.reduce((a, b) => a + (b - loop.meanDt) * (b - loop.meanDt), 0) / loop.previousDt.length;
            if (loop.previousDt.length >= 10) console.log("mean:" + loop.meanDt.toFixed(2), "var:" + loop.varDt.toFixed(2));
        };
    } else {
        loop.worker.onmessage = () => { fun(loop); };
    }
    return loop;
}

export function endLoop(loop) {
    loop.worker.terminate();
}

function createWorker(s) {
    let blob;
    try {
        blob = new Blob([s], { type: 'application/javascript' });
    } catch (e) { // Backwards-compatibility
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder(); blob.append(s); blob = blob.getBlob();
    }
    return new Worker(URL.createObjectURL(blob));
}