var player;
async function main() {
    await initCannon("materials", true);
    await initPixi();
    //set scene
    await scene.load("hub", true);
    player = new Player(new vec3(0,0,5)); await player.load(); scene.add(player);
    scene.play();
}
main();