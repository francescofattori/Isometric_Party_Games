let enviroment;
if (typeof window !== "undefined") enviroment = "client";
else enviroment = "server";
export async function importScripts(gameName, scriptList) {
    let root = "./../../";
    let promises = [];
    for (let script of scriptList) {
        let path = root;
        if (!script.root) path += "games/" + gameName + "/";
        path += "src/";
        if (script.common) path += "common/";
        else path += enviroment + "/";
        promises.push(import(path + script.src));
    }
    const list = await Promise.all(promises);
    if (typeof window !== "undefined") list.forEach((obj) => Object.entries(obj).forEach(([name, exported]) => window[name] = exported));
    else list.forEach((obj) => Object.entries(obj).forEach(([name, exported]) => global[name] = exported));
}