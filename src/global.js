//This file must be included in every game project, it holds global variables and initializers
const pixi = new PIXI.Application();
const world = new CANNON.World();
const scene = new Scene();
const camera = new Camera();
const assets = new AssetsManager();
//HTML
const htmlViewport = document.getElementById("viewport");
const htmlPixelPerfectView = document.getElementById("pixelPerfectView");
const htmlStats = document.getElementById("stats");
//Init
async function initPixi() {
    await pixi.init({ background: "#1099bb", resizeTo: htmlPixelPerfectView });
    htmlPixelPerfectView.appendChild(pixi.canvas);
    window.onresize = () => {
        htmlPixelPerfectView.style.width = 2 * Math.round(htmlViewport.clientWidth / 2) + "px";
        htmlPixelPerfectView.style.height = 2 * Math.round(htmlViewport.clientHeight / 2) + "px";
    };
    window.onresize();
    pixi.resize();
}
async function initCannon(materialsSrc, root = false) {
    world.gravity = new CANNON.Vec3(0, 0, -40);
    world.updateTime = 0; world.lastUpdate = 0; world.statTime = 0;
    world.updateTimeSum = 0; world.FPSSum = 0; world.statCount = 0;
    world.run = true; world.dt = 1.0 / 200.0;
    world.materials = {};
    if (materialsSrc != undefined) {
        let data = await assets.load("materials", "assets/" + materialsSrc, "json", root);
        for (const name of data.names) { world.materials[name] = new CANNON.Material(name); }
        for (let i = 0; i < data.table.length; i++) {
            const row = data.table[i];
            for (let j = 0; j < row.length; j++) {
                const contact = row[j];
                let mat1 = world.materials[data.names[i]]; let mat2 = world.materials[data.names[i + j]];
                let contactMaterial = new CANNON.ContactMaterial(mat1, mat2, {
                    friction: contact.f, restitution: contact.r
                });
                world.addContactMaterial(contactMaterial);
            }
        }
    }
    world.defaultContactMaterial.contactEquationRelaxation = 10;
    world.defaultContactMaterial.contactEquationStiffness = 5e8;
    /*world.addEventListener('beginContact', (event) => {
        console.log(event.bodyA.id, event.bodyB.id);
    })*/
}