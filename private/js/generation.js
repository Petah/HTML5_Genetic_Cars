function cw_getParents(random) {
    var r = random.uniform();
    if (r == 0)
        return 0;
    return Math.floor(-Math.log(r) * generationSize) % generationSize;
}

function cw_makeChild(random, car_def1, car_def2) {
    var newCarDef = new Object();
    swapPoint1 = Math.round(random.uniform() * (nAttributes - 1));
    swapPoint2 = swapPoint1;
    while (swapPoint2 == swapPoint1) {
        swapPoint2 = Math.round(random.uniform() * (nAttributes - 1));
    }
    var parents = [car_def1, car_def2];
    var curparent = 0;
    var wheelParent = 0;

    var variateWheelParents = parents[0].wheelCount == parents[1].wheelCount;

    if (!variateWheelParents) {
        wheelParent = Math.floor(random.uniform() * 2);
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


function cw_mutate1(random, old, min, range) {
    var span = range * mutation_range;
    var base = old - 0.5 * span;
    if (base < min)
        base = min;
    if (base > min + (range - span))
        base = min + (range - span);
    return base + span * random.uniform();
}

function cw_mutatev(random, car_def, n, xfact, yfact) {
    if (random.uniform() >= gen_mutation)
        return;

    var v = car_def.vertex_list[n];
    var x = 0;
    var y = 0;
    if (xfact != 0)
        x = xfact * cw_mutate1(random, xfact * v.x, chassisMinAxis, chassisMaxAxis);
    if (yfact != 0)
        y = yfact * cw_mutate1(random, yfact * v.y, chassisMinAxis, chassisMaxAxis);
    car_def.vertex_list.splice(n, 1, new b2Vec2(x, y));
}


function cw_mutate(random, car_def) {
    for (var i = 0; i < car_def.wheelCount; i++) {
        if (random.uniform() < gen_mutation) {
            car_def.wheel_radius[i] = cw_mutate1(random, car_def.wheel_radius[i], wheelMinRadius, wheelMaxRadius);
        }
    }

    var wheel_m_rate = mutation_range < gen_mutation ? mutation_range : gen_mutation;

    for (var i = 0; i < car_def.wheelCount; i++) {
        if (random.uniform() < wheel_m_rate) {
            car_def.wheel_vertex[i] = Math.floor(random.uniform() * 8) % 8;
        }
    }

    for (var i = 0; i < car_def.wheelCount; i++) {
        if (random.uniform() < gen_mutation) {
            car_def.wheel_density[i] = cw_mutate1(random, car_def.wheel_density[i], wheelMinDensity, wheelMaxDensity);
        }
    }

    if (random.uniform() < gen_mutation) {
        car_def.chassis_density = cw_mutate1(random, car_def.chassis_density, chassisMinDensity, chassisMaxDensity);
    }

    cw_mutatev(random, car_def, 0, 1, 0);
    cw_mutatev(random, car_def, 1, 1, 1);
    cw_mutatev(random, car_def, 2, 0, 1);
    cw_mutatev(random, car_def, 3, -1, 1);
    cw_mutatev(random, car_def, 4, -1, 0);
    cw_mutatev(random, car_def, 5, -1, -1);
    cw_mutatev(random, car_def, 6, 0, -1);
    cw_mutatev(random, car_def, 7, 1, -1);

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
