function showDistance(distance, height) {
    distanceMeter.innerHTML = "distance: " + distance + " meters<br />";
    distanceMeter.innerHTML += "height: " + height + " meters";
}

function simulationStep() {
    cyclesPerSec++;
    world.Step(1 / box2dfps, 20, 20);
    carManager.step();
}

function cw_startSimulation() {
    Handler.setInterval('sim', simulationStep, Math.round(1000 / box2dfps));
    cw_drawInterval = Handler.setInterval('draw', cw_drawScreen, Math.round(1000 / screenfps));
}

function cw_stopSimulation() {
    clearInterval(cw_drawInterval);
}

function cw_resetPopulation() {
    document.getElementById("topscores").innerHTML = "";
    cw_clearGraphics();
    carManager.clear();
    cw_carGeneration = [];
    cw_topScores = [];
    cw_graphTop = [];
    cw_graphElite = [];
    cw_graphAverage = [];
    lastmax = 0;
    lastaverage = 0;
    lasteliteaverage = 0;
    swapPoint1 = 0;
    swapPoint2 = 0;
    cw_generationZero();
}

function cw_resetWorld() {
    doDraw = true;
    cw_stopSimulation();
    for (b = world.m_bodyList; b; b = b.m_next) {
        world.DestroyBody(b);
    }
    floorseed = document.getElementById("newseed").value;
    Math.seedrandom(floorseed);
    cw_createFloor();
    cw_drawMiniMap();
    Math.seedrandom();
    cw_resetPopulation();
    cw_startSimulation();
}

function cw_confirmResetWorld() {
    if (confirm('Really reset world?')) {
        cw_resetWorld();
    } else {
        return false;
    }
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
    floorseed = Math.seedrandom();
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
