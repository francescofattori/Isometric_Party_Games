let enviroment;
if (typeof window !== "undefined") enviroment = "client";
else enviroment = "server";
export async function importScripts(name, scriptList) {
    let root;
    if (typeof window !== "undefined") root = window.location.href;
    else {
        root = "./../../games/" + name + "/";
    }
    let promises = [];
    for (let script of scriptList) {
        if (script.common) promises.push(import(root + "src/common/" + script.src));
        else promises.push(import(root + "src/" + enviroment + "/" + script.src));
    }
    const list = await Promise.all(promises);
    if (typeof window !== "undefined") list.forEach((obj) => Object.entries(obj).forEach(([name, exported]) => window[name] = exported));
    else list.forEach((obj) => Object.entries(obj).forEach(([name, exported]) => global[name] = exported));
}