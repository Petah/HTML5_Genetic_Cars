function showDistance(distance, height) {
    distanceMeter.innerHTML = "distance: " + distance + " meters<br />";
    distanceMeter.innerHTML += "height: " + height + " meters";
}

function simulationStep() {
    cyclesPerSec++;
    world.Step(1 / box2dfps, 20, 20);
    carManager.step();
}

// initial stuff, only called once (hopefully)
function cw_init() {
    // clone silver dot and health bar
    var mmm = document.getElementsByName('minimapmarker')[0];

    for (var k = 0; k < generationSize; k++) {
        // minimap markers
        var newbar = mmm.cloneNode(true);
        newbar.id = "bar" + k;
        newbar.style.paddingTop = k * 9 + "px";
        minimapholder.appendChild(newbar);
    }
    mmm.parentNode.removeChild(mmm);
    world = new b2World(gravity, doSleep);
    cw_createFloor();
    cw_drawMiniMap();
    carManager.generationZero();
    Handler.setInterval('sim', simulationStep, Math.round(1000 / box2dfps));
    cw_drawInterval = Handler.setInterval('draw', cw_drawScreen, Math.round(1000 / screenfps));

    var ui = new UI();
    ui.initialise();
    Handler.setInterval('ui', ui.update.bind(ui), 100);
    Handler.setInterval('ui-slow', ui.slowUpdate.bind(ui), 1000);
}

cw_init();
