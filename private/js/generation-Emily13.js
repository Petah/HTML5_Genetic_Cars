/* ========================================================================= */
/* ==== Generation ========================================================= */

function cw_generationZero() {
    for (var k = 0; k < generationSize; k++) {
        var car_def = carManager.initialise();
        car_def.index = k;
        cw_carGeneration.push(car_def);
    }
    gen_counter = 0;
    cw_deadCars = 0;
    leaderPosition = {};
    leaderPosition.x = 0;
    leaderPosition.y = 0;
    cw_materializeGeneration();
    document.getElementById("generation").innerHTML = "generation 0";
    document.getElementById("population").innerHTML = "cars alive: " + generationSize;
}

function cw_materializeGeneration() {
    carManager.cars = [];
    for (var k = 0; k < generationSize; k++) {
        carManager.cars.push(new cw_Car(cw_carGeneration[k]));
    }
}

function cw_nextGeneration() {
    console.log('cw_nextGeneration');
    var newGeneration = [];
    var newborn;
    cw_getChampions();
    cw_topScores.push({
        i: gen_counter,
        v: cw_carScores[0].v,
        x: cw_carScores[0].x,
        y: cw_carScores[0].y,
        y2: cw_carScores[0].y2
    });
    plot_graphs();
    for (var k = 0; k < gen_champions; k++) {
        cw_carScores[k].car_def.is_elite = true;
        cw_carScores[k].car_def.index = k;
        newGeneration.push(cw_carScores[k].car_def);
    }
    for (k = gen_champions; k < generationSize; k++) {
        var parent1 = cw_getParents();
        var parent2 = parent1;
        while (parent2 == parent1) {
            parent2 = cw_getParents();
        }
        newborn = cw_makeChild(cw_carScores[parent1].car_def,
            cw_carScores[parent2].car_def);
        newborn = cw_mutate(newborn);
        newborn.is_elite = false;
        newborn.index = k;
        newGeneration.push(newborn);
    }
    cw_carScores = [];
    cw_carGeneration = newGeneration;
    gen_counter++;
    cw_materializeGeneration();
    cw_deadCars = 0;
    leaderPosition = new Object();
    leaderPosition.x = 0;
    leaderPosition.y = 0;
    document.getElementById("generation").innerHTML = "generation " + gen_counter;
    document.getElementById("cars").innerHTML = "";
    document.getElementById("population").innerHTML = "cars alive: " + generationSize;
}

function cw_getChampions() {
    var ret = [];
    cw_carScores.sort(function(a, b) {
        if (a.v > b.v) {
            return -1
        } else {
            return 1
        }
    });
    for (var k = 0; k < generationSize; k++) {
        ret.push(cw_carScores[k].i);
    }
    return ret;
}

function cw_getParents() {
    var r = Math.random();
    if (r == 0)
        return 0;
    return Math.floor(-Math.log(r) * generationSize) % generationSize;
}

function cw_makeChild(car_def1, car_def2) {
    var newCarDef = new Object();
    swapPoint1 = Math.round(Math.random() * (nAttributes - 1));
    swapPoint2 = swapPoint1;
    while (swapPoint2 == swapPoint1) {
        swapPoint2 = Math.round(Math.random() * (nAttributes - 1));
    }
    var parents = [car_def1, car_def2];
    var curparent = 0;
    var wheelParent = 0;

    var variateWheelParents = parents[0].wheelCount == parents[1].wheelCount;

    if (!variateWheelParents) {
        wheelParent = Math.floor(Math.random() * 2);
    }

    newCarDef.wheelCount = parents[wheelParent].wheelCount;

    newCarDef.wheel_radius = [];
    for (var i = 0; i < newCarDef.wheelCount; i++) {
        if (variateWheelParents) {
            curparent = cw_chooseParent(curparent, i);
        } else {
            curparent = wheelParent;
        }
        newCarDef.wheel_radius[i] = parents[curparent].wheel_radius[i];
    }

    newCarDef.wheel_vertex = [];
    for (var i = 0; i < newCarDef.wheelCount; i++) {
        if (variateWheelParents) {
            curparent = cw_chooseParent(curparent, i + 2);
        } else {
            curparent = wheelParent;
        }
        newCarDef.wheel_vertex[i] = parents[curparent].wheel_vertex[i];
    }

    newCarDef.wheel_density = [];
    for (var i = 0; i < newCarDef.wheelCount; i++) {
        if (variateWheelParents) {
            curparent = cw_chooseParent(curparent, i + 12);
        } else {
            curparent = wheelParent;
        }
        newCarDef.wheel_density[i] = parents[curparent].wheel_density[i];
    }

    newCarDef.vertex_list = [];
    curparent = cw_chooseParent(curparent, 4);
    newCarDef.vertex_list[0] = parents[curparent].vertex_list[0];
    curparent = cw_chooseParent(curparent, 5);
    newCarDef.vertex_list[1] = parents[curparent].vertex_list[1];
    curparent = cw_chooseParent(curparent, 6);
    newCarDef.vertex_list[2] = parents[curparent].vertex_list[2];
    curparent = cw_chooseParent(curparent, 7);
    newCarDef.vertex_list[3] = parents[curparent].vertex_list[3];
    curparent = cw_chooseParent(curparent, 8);
    newCarDef.vertex_list[4] = parents[curparent].vertex_list[4];
    curparent = cw_chooseParent(curparent, 9);
    newCarDef.vertex_list[5] = parents[curparent].vertex_list[5];
    curparent = cw_chooseParent(curparent, 10);
    newCarDef.vertex_list[6] = parents[curparent].vertex_list[6];
    curparent = cw_chooseParent(curparent, 11);
    newCarDef.vertex_list[7] = parents[curparent].vertex_list[7];

    curparent = cw_chooseParent(curparent, 14);
    newCarDef.chassis_density = parents[curparent].chassis_density;
    return newCarDef;
}


function cw_mutate1(old, min, range) {
    var span = range * mutation_range;
    var base = old - 0.5 * span;
    if (base < min)
        base = min;
    if (base > min + (range - span))
        base = min + (range - span);
    return base + span * Math.random();
}

function cw_mutatev(car_def, n, xfact, yfact) {
    if (Math.random() >= gen_mutation)
        return;

    var v = car_def.vertex_list[n];
    var x = 0;
    var y = 0;
    if (xfact != 0)
        x = xfact * cw_mutate1(xfact * v.x, chassisMinAxis, chassisMaxAxis);
    if (yfact != 0)
        y = yfact * cw_mutate1(yfact * v.y, chassisMinAxis, chassisMaxAxis);
    car_def.vertex_list.splice(n, 1, new b2Vec2(x, y));
}


function cw_mutate(car_def) {
    for (var i = 0; i < car_def.wheelCount; i++) {
        if (Math.random() < gen_mutation) {
            car_def.wheel_radius[i] = cw_mutate1(car_def.wheel_radius[i], wheelMinRadius, wheelMaxRadius);
        }
    }

    var wheel_m_rate = mutation_range < gen_mutation ? mutation_range : gen_mutation;

    for (var i = 0; i < car_def.wheelCount; i++) {
        if (Math.random() < wheel_m_rate) {
            car_def.wheel_vertex[i] = Math.floor(Math.random() * 8) % 8;
        }
    }

    for (var i = 0; i < car_def.wheelCount; i++) {
        if (Math.random() < gen_mutation) {
            car_def.wheel_density[i] = cw_mutate1(car_def.wheel_density[i], wheelMinDensity, wheelMaxDensity);
        }
    }

    if (Math.random() < gen_mutation) {
        car_def.chassis_density = cw_mutate1(car_def.chassis_density, chassisMinDensity, chassisMaxDensity);
    }

    cw_mutatev(car_def, 0, 1, 0);
    cw_mutatev(car_def, 1, 1, 1);
    cw_mutatev(car_def, 2, 0, 1);
    cw_mutatev(car_def, 3, -1, 1);
    cw_mutatev(car_def, 4, -1, 0);
    cw_mutatev(car_def, 5, -1, -1);
    cw_mutatev(car_def, 6, 0, -1);
    cw_mutatev(car_def, 7, 1, -1);

    return car_def;
}

function cw_chooseParent(curparent, attributeIndex) {
    var ret;
    if ((swapPoint1 == attributeIndex) || (swapPoint2 == attributeIndex)) {
        if (curparent == 1) {
            ret = 0;
        } else {
            ret = 1;
        }
    } else {
        ret = curparent;
    }
    return ret;
}

function cw_setMutation(mutation) {
    gen_mutation = parseFloat(mutation);
}

function cw_setMutationRange(range) {
    mutation_range = parseFloat(range);
}

function cw_setMutableFloor(choice) {
    mutable_floor = (choice == 1);
}

function cw_setGravity(choice) {
    gravity = new b2Vec2(0.0, -parseFloat(choice));
    // CHECK GRAVITY CHANGES
    if (world.GetGravity().y != gravity.y) {
        world.SetGravity(gravity);
    }
}

function cw_setEliteSize(clones) {
    gen_champions = parseInt(clones, 10);
}
