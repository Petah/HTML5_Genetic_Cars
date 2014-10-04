var templates = {
	'health-bar': '<div class="health"><div class="health-bar"></div><div class="health-text"></div></div>',
	'mini-map-marker': '<div class="mini-map-marker"></div>'
};

function template(name) {
	var node = document.createElement('div');
	node.innerHTML = templates[name];
	return node.firstChild;
};
var enable_ghost = true;

function ghost_create_replay() {
    if (!enable_ghost)
        return null;

    return {
        num_frames: 0,
        frames: [],
    }
}

function ghost_create_ghost() {
    if (!enable_ghost)
        return null;

    return {
        replay: null,
        frame: 0,
        dist: -100
    }
}

function ghost_reset_ghost(ghost) {
    if (!enable_ghost)
        return;
    if (ghost == null)
        return;
    ghost.frame = 0;
}

function ghost_pause(ghost) {
    if (ghost != null)
        ghost.old_frame = ghost.frame;
    ghost_reset_ghost(ghost);
}

function ghost_resume(ghost) {
    if (ghost != null)
        ghost.frame = ghost.old_frame;
}

function ghost_get_position(ghost) {
    if (!enable_ghost)
        return;
    if (ghost == null)
        return;
    if (ghost.frame < 0)
        return;
    if (ghost.replay == null)
        return;
    var frame = ghost.replay.frames[ghost.frame];
    return frame.pos;
}

function ghost_compare_to_replay(replay, ghost, max) {
    if (!enable_ghost)
        return;
    if (ghost == null)
        return;
    if (replay == null)
        return;

    if (ghost.dist < max) {
        ghost.replay = replay;
        ghost.dist = max;
        ghost.frame = 0;
    }
}

function ghost_move_frame(ghost) {
    if (!enable_ghost)
        return;
    if (ghost == null)
        return;
    if (ghost.replay == null)
        return;
    ghost.frame++;
    if (ghost.frame >= ghost.replay.num_frames)
        ghost.frame = ghost.replay.num_frames - 1;
}

function ghost_add_replay_frame(replay, car) {
    if (!enable_ghost)
        return;
    if (replay == null)
        return;

    var frame = ghost_get_frame(car);
    replay.frames.push(frame);
    replay.num_frames++;
}

function ghost_draw_frame(ctx, ghost) {
    if (!enable_ghost)
        return;
    if (ghost == null)
        return;
    if (ghost.frame < 0)
        return;
    if (ghost.replay == null)
        return;

    var frame = ghost.replay.frames[ghost.frame];

    // wheel style
    ctx.fillStyle = "#eee";
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1 / zoom;

    for (var i = 0; i < frame.wheels.length; i++) {
        for (w in frame.wheels[i]) {
            ghost_draw_circle(ctx, frame.wheels[i][w].pos, frame.wheels[i][w].rad, frame.wheels[i][w].ang);
        }
    }

    // chassis style
    ctx.strokeStyle = "#fbb";
    ctx.fillStyle = "#fee";
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    for (c in frame.chassis)
        ghost_draw_poly(ctx, frame.chassis[c].vtx, frame.chassis[c].num);
    ctx.fill();
    ctx.stroke();
}

function ghost_get_frame(car) {
    var out = {
        chassis: ghost_get_chassis(car.chassis),
        wheels: [],
        pos: {
            x: car.getPosition().x,
            y: car.getPosition().y
        }
    };

    for (var i = 0; i < car.wheels.length; i++) {
        out.wheels[i] = ghost_get_wheel(car.wheels[i]);
    }

    return out;
}

function ghost_get_chassis(c) {
    var gc = [];

    for (f = c.GetFixtureList(); f; f = f.m_next) {
        s = f.GetShape();

        var p = {
            vtx: [],
            num: 0
        }

        p.num = s.m_vertexCount;

        for (var i = 0; i < s.m_vertexCount; i++) {
            p.vtx.push(c.GetWorldPoint(s.m_vertices[i]));
        }

        gc.push(p);
    }

    return gc;
}

function ghost_get_wheel(w) {
    var gw = [];

    for (f = w.GetFixtureList(); f; f = f.m_next) {
        s = f.GetShape();

        var c = {
            pos: w.GetWorldPoint(s.m_p),
            rad: s.m_radius,
            ang: w.m_sweep.a
        }

        gw.push(c);
    }

    return gw;
}

function ghost_draw_poly(ctx, vtx, n_vtx) {
    ctx.moveTo(vtx[0].x, vtx[0].y);
    for (var i = 1; i < n_vtx; i++) {
        ctx.lineTo(vtx[i].x, vtx[i].y);
    }
    ctx.lineTo(vtx[0].x, vtx[0].y);
}

function ghost_draw_circle(ctx, center, radius, angle) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);

    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));

    ctx.fill();
    ctx.stroke();
}
/* ========================================================================= */
/* ==== Floor ============================================================== */

function cw_createFloor() {
    var last_tile = null;
    var tile_position = new b2Vec2(-5, 0);
    cw_floorTiles = new Array();
    Math.seedrandom(floorseed);
    for (var k = 0; k < maxFloorTiles; k++) {
        if (!mutable_floor) {
            // keep old impossible tracks if not using mutable floors
            last_tile = cw_createFloorTile(tile_position, (Math.random() * 3 - 1.5) * 1.5 * k / maxFloorTiles);
        } else {
            // if path is mutable over races, create smoother tracks
            last_tile = cw_createFloorTile(tile_position, (Math.random() * 3 - 1.5) * 1.2 * k / maxFloorTiles);
        }
        cw_floorTiles.push(last_tile);
        last_fixture = last_tile.GetFixtureList();
        last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
        tile_position = last_world_coords;
    }
}


function cw_createFloorTile(position, angle) {
    body_def = new b2BodyDef();

    body_def.position.Set(position.x, position.y);
    var body = world.CreateBody(body_def);
    fix_def = new b2FixtureDef();
    fix_def.shape = new b2PolygonShape();
    fix_def.friction = 0.5;

    var coords = new Array();
    coords.push(new b2Vec2(0, 0));
    coords.push(new b2Vec2(0, -groundPieceHeight));
    coords.push(new b2Vec2(groundPieceWidth, -groundPieceHeight));
    coords.push(new b2Vec2(groundPieceWidth, 0));

    var center = new b2Vec2(0, 0);

    var newcoords = cw_rotateFloorTile(coords, center, angle);

    fix_def.shape.SetAsArray(newcoords);

    body.CreateFixture(fix_def);
    return body;
}

function cw_rotateFloorTile(coords, center, angle) {
    var newcoords = new Array();
    for (var k = 0; k < coords.length; k++) {
        nc = new Object();
        nc.x = Math.cos(angle) * (coords[k].x - center.x) - Math.sin(angle) * (coords[k].y - center.y) + center.x;
        nc.y = Math.sin(angle) * (coords[k].x - center.x) + Math.cos(angle) * (coords[k].y - center.y) + center.y;
        newcoords.push(nc);
    }
    return newcoords;
}

/* ==== END Floor ========================================================== */
/* ========================================================================= */


function cw_drawFloor() {
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#666";
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();

    outer_loop: for (var k = Math.max(0, last_drawn_tile - 20); k < cw_floorTiles.length; k++) {
        var b = cw_floorTiles[k];
        for (f = b.GetFixtureList(); f; f = f.m_next) {
            var s = f.GetShape();
            var shapePosition = b.GetWorldPoint(s.m_vertices[0]).x;
            if ((shapePosition > (camera_x - 5)) && (shapePosition < (camera_x + 10))) {
                cw_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
            }
            if (shapePosition > camera_x + 10) {
                last_drawn_tile = k;
                break outer_loop;
            }
        }
    }
    ctx.fill();
    ctx.stroke();
}
var CarManager = function() {
    this.topScores = [];
    this.groups = [
        new CarGroup('alpha'),
        /*new CarGroup('beta'),
        new CarGroup('charle'),
        new CarGroup('delta'),
        new CarGroup('omega'),
        new CarGroup('emiga'),
        new CarGroup('feta'),
        new CarGroup('gamma'),
        new CarGroup('lama'),
        new CarGroup('zeta')*/
    ];
    this.leaderPosition = {
        x: 0,
        y: 0
    };
}

var proxies = [
    'clear',
    'step',
    'generate',
    'materialise',
    'generationZero',
];
for (var i = 0; i < proxies.length; i++) {
    CarManager.prototype[proxies[i]] = (function(name) {
        return function() {
            for (var i = 0; i < this.groups.length; i++) {
                this.groups[i][name].apply(this.groups[i], arguments)
            }
        }
    }).bind(this)(proxies[i]);
}

CarManager.prototype.getAllCars = function() {
    var allCars = [];
    for (var i = 0; i < this.groups.length; i++) {
        allCars = allCars.concat(this.groups[i].allCars);
    }
    return allCars;
};

CarManager.prototype.getCars = function() {
    var cars = [];
    for (var i = 0; i < this.groups.length; i++) {
        cars = cars.concat(this.groups[i].cars);
    }
    return cars;
};

CarManager.prototype.findLeader = function() {
    this.leaderPosition = {
        x: 0,
        y: 0
    };
    for (var i = 0; i < this.groups.length; i++) {
        if (this.groups[i].leaderPosition.x > this.leaderPosition.x) {
            this.leaderPosition = this.groups[i].leaderPosition;
        }
    }
    return this.leaderPosition;
};
var Handler = {
    references: []
};

Handler.setInterval = function(callback, interval) {
    var reference;
    reference = setInterval(function() {
        try {
            callback();
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            clearInterval(reference);
        }
    }, interval);
    this.references.push(reference);
};

Handler.stop = function() {
    for (var i = 0; i < this.references.length; i++) {
        clearInterval(this.references[i]);
    }
};
var UI = function() {
};

UI.prototype.initialise = function() {
    this.healthBars = [];
    this.healthBarWrapper = document.getElementById('health-bars');
    this.miniMapMarkers = [];
    this.miniMapMarkersWrapper = document.getElementById('minimapholder');

    var allCars = carManager.getAllCars();
    for (var i = 0; i < allCars.length; i++) {
        var healthBar = new HealthBar();
        healthBar.text.innerText = i;
        this.healthBarWrapper.appendChild(healthBar.wrapper);
        this.healthBars.push(healthBar);

        var miniMapMarker = new MiniMapMarker();
        this.miniMapMarkersWrapper.appendChild(miniMapMarker.marker);
        this.miniMapMarkers.push(miniMapMarker);
    }
};

UI.prototype.update = function() {
    var allCars = carManager.getAllCars();

    document.getElementById("generation").innerHTML = "Generation " + gen_counter;
    document.getElementById("population").innerHTML = "Cars alive: " + allCars.length;

    for (var i = 0; i < allCars.length; i++) {
        this.healthBars[i].bar.style.width = (allCars[i].health * 100) + '%';

        var position = allCars[i].getPosition();
        this.miniMapMarkers[i].marker.style.left = Math.round((position.x + 5) * minimapscale) + 'px';
        if (allCars[i].alive) {
            this.miniMapMarkers[i].marker.style.borderColor = 'black';
        } else {
            this.miniMapMarkers[i].marker.style.borderColor = 'red';
        }
    }


    var distance = Math.round(carManager.leaderPosition.x * 100) / 100;
    var height = Math.round(carManager.leaderPosition.y * 100) / 100;
    distanceMeter.innerHTML = "Distance: " + distance + " meters<br />";
    distanceMeter.innerHTML += "Height: " + height + " meters";
    if (distance > minimapfogdistance) {
        fogdistance.width = 800 - Math.round(distance + 15) * minimapscale + "px";
        minimapfogdistance = distance;
    }
};

UI.prototype.slowUpdate = function() {
    document.getElementById('cycles-per-second').innerHTML = 'Steps per second: ' + cyclesPerSec;
    cyclesPerSec = 0;
    plot_graphs();
};


var HealthBar = function() {
    this.wrapper = template('health-bar');
    this.bar = this.wrapper.querySelector('.health-bar');
    this.text = this.wrapper.querySelector('.health-text');
};

var MiniMapMarker = function() {
    this.marker = template('mini-map-marker');
};






//Grpahs
var cw_graphTop = [];
var cw_graphElite = [];
var cw_graphAverage = [];

function plot(data, color) {
    graphctx.strokeStyle = color;
    graphctx.beginPath();
    graphctx.moveTo(0, 0);
    for (var i = 0; i < data.length; i++) {
        graphctx.lineTo(400 * (i + 1) / data.length, data[i]);
    }
    graphctx.stroke();
}

function plot_graphs() {
    for (var i = 0; i < carManager.groups.length; i++) {
        var carGroup = carManager.groups[i];

        cw_graphAverage.push(cw_average(carGroup.scores));
        //cw_graphElite.push(cw_eliteaverage(carGroup.scores));
        //cw_graphTop.push(carGroup.scores[0].v);

        cw_clearGraphics();

        plot(cw_graphAverage, '#00f')
        //plot(cw_graphElite, '#0f0')
        //plot(cw_graphTop, '#f00')
    }


    cw_listTopScores();
}

/*
function cw_eliteaverage(scores) {
    var sum = 0;
    for (var k = 0; k < Math.floor(generationSize / 2); k++) {
        sum += scores[k].v;
    }
    return sum / Math.floor(generationSize / 2);
}
*/

function cw_average(scores) {
    var sum = 0;
    for (var i = 0; i < scores.length; i++) {
        sum += scores[i].v;
    }
    return sum / generationSize;
}

function cw_clearGraphics() {
    graphcanvas.width = graphcanvas.width;
    graphctx.translate(0, graphheight);
    graphctx.scale(1, -1);
    graphctx.lineWidth = 1;
    graphctx.strokeStyle = "#888";
    graphctx.beginPath();
    graphctx.moveTo(0, graphheight / 2);
    graphctx.lineTo(graphwidth, graphheight / 2);
    graphctx.moveTo(0, graphheight / 4);
    graphctx.lineTo(graphwidth, graphheight / 4);
    graphctx.moveTo(0, graphheight * 3 / 4);
    graphctx.lineTo(graphwidth, graphheight * 3 / 4);
    graphctx.stroke();
}

function cw_listTopScores() {
    var html = 'Top Scores:<br />';
    carManager.topScores.sort(function(a, b) {
        return a.v > b.v ? -1 : 1;
    });
    for (var i = 0; i < Math.min(10, carManager.topScores.length); i++) {
        html +=
            '#' + (i + 1) + ': ' +
            carManager.topScores[i].group +
            ' ' + Math.round(carManager.topScores[i].v * 100) / 100 +
            ' d:' + Math.round(carManager.topScores[i].x * 100) / 100 +
            ' h:' + Math.round(carManager.topScores[i].y2 * 100) / 100 + '/' + Math.round(carManager.topScores[i].y * 100) / 100 + 'm (gen ' + carManager.topScores[i].i + ')<br />';
    }
    document.getElementById('topscores').innerHTML = html;
}

// Global Vars
var ghost;

var timeStep = 1.0 / 60.0;

var doDraw = true;
var cw_paused = false;

var box2dfps = 60;
var screenfps = 60;

var cyclesPerSec = 0;

var debugbox = document.getElementById("debug");

var canvas = document.getElementById("mainbox");
var ctx = canvas.getContext("2d");

var cameraspeed = 1;
var camera_y = 0;
var camera_x = 0;
var camera_target = -1; // which car should we follow? -1 = leader
var minimapcamera = document.getElementById("minimapcamera").style;

var graphcanvas = document.getElementById("graphcanvas");
var graphctx = graphcanvas.getContext("2d");
var graphheight = 250;
var graphwidth = 400;

var minimapcanvas = document.getElementById("minimap");
var minimapctx = minimapcanvas.getContext("2d");
var minimapscale = 3;
var minimapfogdistance = 0;
var fogdistance = document.getElementById("minimapfog").style;

var generationSize = 4;
var carManager = new CarManager();

var gen_champions = 1;
var gen_parentality = 0.2;
var gen_mutation = 0.05;
var mutation_range = 1;
var gen_counter = 0;
var nAttributes = 15;

var gravity = new b2Vec2(0.0, -9.81);
var doSleep = true;

var world;

var zoom = 70;

var mutable_floor = false;

var maxFloorTiles = 200;
var cw_floorTiles = [];
var last_drawn_tile = 0;

var groundPieceWidth = 1.5;
var groundPieceHeight = 0.15;

var chassisMaxAxis = 1.1;
var chassisMinAxis = 0.1;
var chassisMinDensity = 30;
var chassisMaxDensity = 300;

var wheelMaxRadius = 0.5;
var wheelMinRadius = 0.2;
var wheelMaxDensity = 100;
var wheelMinDensity = 40;

var velocityIndex = 0;
var deathSpeed = 0.1;
var max_car_health = box2dfps * 10;
var car_health = max_car_health;

var motorSpeed = 20;

var swapPoint1 = 0;
var swapPoint2 = 0;

var cw_ghostReplayInterval = null;

var distanceMeter = document.getElementById("distancemeter");

minimapcamera.width = 12 * minimapscale + "px";
minimapcamera.height = 6 * minimapscale + "px";
var cw_Car = function(car_def) {
    this.velocityIndex = 0;
    this.health = 1;
    this.maxPosition = 0;
    this.maxPositiony = 0;
    this.minPositiony = 0;
    this.frames = 0;
    this.car_def = car_def
    this.alive = true;

    this.chassis = cw_createChassis(car_def.vertex_list, car_def.chassis_density);

    this.wheels = [];
    for (var i = 0; i < car_def.wheelCount; i++) {
        this.wheels[i] = cw_createWheel(car_def.wheel_radius[i], car_def.wheel_density[i]);
    }

    var carmass = this.chassis.GetMass();
    for (var i = 0; i < car_def.wheelCount; i++) {
        carmass += this.wheels[i].GetMass();
    }
    var torque = [];
    for (var i = 0; i < car_def.wheelCount; i++) {
        torque[i] = carmass * -gravity.y / car_def.wheel_radius[i];
    }

    var joint_def = new b2RevoluteJointDef();

    for (var i = 0; i < car_def.wheelCount; i++) {
        var randvertex = this.chassis.vertex_list[car_def.wheel_vertex[i]];
        joint_def.localAnchorA.Set(randvertex.x, randvertex.y);
        joint_def.localAnchorB.Set(0, 0);
        joint_def.maxMotorTorque = torque[i];
        joint_def.motorSpeed = -motorSpeed;
        joint_def.enableMotor = true;
        joint_def.bodyA = this.chassis;
        joint_def.bodyB = this.wheels[i];
        var joint = world.CreateJoint(joint_def);
    }

    this.replay = ghost_create_replay();
    ghost_add_replay_frame(this.replay, this);
}

cw_Car.prototype.chassis = null;

cw_Car.prototype.wheels = [];

cw_Car.prototype.getPosition = function() {
    return this.chassis.GetPosition();
}

cw_Car.prototype.draw = function() {
    drawObject(this.chassis);

    for (var i = 0; i < this.wheels.length; i++) {
        drawObject(this.wheels[i]);
    }
}

cw_Car.prototype.kill = function(carGroup) {
    this.health = 0;
    var avgspeed = (this.maxPosition / this.frames) * box2dfps;
    var position = this.maxPosition;
    var score = position + avgspeed;
    ghost_compare_to_replay(this.replay, ghost, score);
    carGroup.scores.push({
        car_def: this.car_def,
        v: score,
        s: avgspeed,
        x: position,
        y: this.maxPositiony,
        y2: this.minPositiony
    });
    world.DestroyBody(this.chassis);

    for (var i = 0; i < this.wheels.length; i++) {
        world.DestroyBody(this.wheels[i]);
    }
    this.alive = false;

    // refocus camera to leader on death
    if (camera_target == this.car_def.index) {
        cw_setCameraTarget(-1);
    }
}

cw_Car.prototype.checkDeath = function() {
    // check health
    var position = this.getPosition();
    if (position.y > this.maxPositiony) {
        this.maxPositiony = position.y;
    }
    if (position.y < this.minPositiony) {
        this.minPositiony = position.y;
    }
    if (position.x > this.maxPosition + 0.02) {
        this.health = 1;
        this.maxPosition = position.x;
    } else {
        if (position.x > this.maxPosition) {
            this.maxPosition = position.x;
        }
        if (Math.abs(this.chassis.GetLinearVelocity().x) < 0.001) {
            this.health -= 0.01;
        }
        this.health -= 0.005;
        if (this.health <= 0) {
            return true;
        }
    }
}

function cw_createChassisPart(body, vertex1, vertex2, density) {
    var vertex_list = [];
    vertex_list.push(vertex1);
    vertex_list.push(vertex2);
    vertex_list.push(b2Vec2.Make(0, 0));
    var fix_def = new b2FixtureDef();
    fix_def.shape = new b2PolygonShape();
    fix_def.density = density;
    fix_def.friction = 10;
    fix_def.restitution = 0.2;
    fix_def.filter.groupIndex = -1;
    fix_def.shape.SetAsArray(vertex_list, 3);

    body.CreateFixture(fix_def);
}

function cw_createChassis(vertex_list, density) {
    var body_def = new b2BodyDef();
    body_def.type = b2Body.b2_dynamicBody;
    body_def.position.Set(0.0, 4.0);

    var body = world.CreateBody(body_def);

    cw_createChassisPart(body, vertex_list[0], vertex_list[1], density);
    cw_createChassisPart(body, vertex_list[1], vertex_list[2], density);
    cw_createChassisPart(body, vertex_list[2], vertex_list[3], density);
    cw_createChassisPart(body, vertex_list[3], vertex_list[4], density);
    cw_createChassisPart(body, vertex_list[4], vertex_list[5], density);
    cw_createChassisPart(body, vertex_list[5], vertex_list[6], density);
    cw_createChassisPart(body, vertex_list[6], vertex_list[7], density);
    cw_createChassisPart(body, vertex_list[7], vertex_list[0], density);

    body.vertex_list = vertex_list;

    return body;
}

function cw_createWheel(radius, density) {
    var body_def = new b2BodyDef();
    body_def.type = b2Body.b2_dynamicBody;
    body_def.position.Set(0, 0);

    var body = world.CreateBody(body_def);

    var fix_def = new b2FixtureDef();
    fix_def.shape = new b2CircleShape(radius);
    fix_def.density = density;
    fix_def.friction = 1;
    fix_def.restitution = 0.2;
    fix_def.filter.groupIndex = -1;

    body.CreateFixture(fix_def);
    return body;
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
/* ========================================================================= */
/* ==== Drawing ============================================================ */

function cw_drawScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    cw_setCameraPosition();
    ctx.translate(200 - (camera_x * zoom), 200 + (camera_y * zoom));
    ctx.scale(zoom, -zoom);
    cw_drawFloor();
    //ghost_draw_frame(ctx, ghost);
    cw_drawCars();
    ctx.restore();
}

function cw_minimapCamera(x, y) {
    minimapcamera.left = Math.round((2 + camera_x) * minimapscale) + "px";
    minimapcamera.top = Math.round((31 - camera_y) * minimapscale) + "px";
}

function cw_setCameraTarget(k) {
    camera_target = k;
}

function cw_setCameraPosition() {
    if (camera_target >= 0) {
        var cameraTargetPosition = carManager.cars[camera_target].getPosition();
    } else {
        var cameraTargetPosition = carManager.findLeader();
    }
    var diff_y = camera_y - cameraTargetPosition.y;
    var diff_x = camera_x - cameraTargetPosition.x;
    camera_y -= cameraspeed * diff_y;
    camera_x -= cameraspeed * diff_x;
    cw_minimapCamera(camera_x, camera_y);
}

function cw_drawGhostReplay() {
    carPosition = ghost_get_position(ghost);
    camera_x = carPosition.x;
    camera_y = carPosition.y;
    cw_minimapCamera(camera_x, camera_y);
    showDistance(Math.round(carPosition.x * 100) / 100, Math.round(carPosition.y * 100) / 100);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(200 - (carPosition.x * zoom), 200 + (carPosition.y * zoom));
    ctx.scale(zoom, -zoom);
    ghost_draw_frame(ctx, ghost);
    ghost_move_frame(ghost);
    cw_drawFloor();
    ctx.restore();
}


function cw_drawCars() {
    var cars = carManager.getCars();
    for (var k = (cars.length - 1); k >= 0; k--) {
        myCar = cars[k];
        if (!myCar.alive) {
            continue;
        }
        myCarPos = myCar.getPosition();

        if (myCarPos.x < (camera_x - 5)) {
            // too far behind, don't draw
            continue;
        }

        ctx.strokeStyle = "#444";
        ctx.lineWidth = 1 / zoom;

        for (var i = 0; i < myCar.wheels.length; i++) {
            b = myCar.wheels[i];
            for (f = b.GetFixtureList(); f; f = f.m_next) {
                var s = f.GetShape();
                var color = Math.round(255 - (255 * (f.m_density - wheelMinDensity)) / wheelMaxDensity).toString();
                var rgbcolor = "rgb(" + color + "," + color + "," + color + ")";
                cw_drawCircle(b, s.m_p, s.m_radius, b.m_sweep.a, rgbcolor);
            }
        }

        var densitycolor = Math.round(100 - (70 * ((myCar.car_def.chassis_density - chassisMinDensity) / chassisMaxDensity))).toString() + "%";

        ctx.strokeStyle = "#c44";
        //ctx.fillStyle = "#fdd";
        ctx.fillStyle = "hsl(0,50%," + densitycolor + ")";

        ctx.beginPath();
        var b = myCar.chassis;
        for (f = b.GetFixtureList(); f; f = f.m_next) {
            var s = f.GetShape();
            cw_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
        }
        ctx.fill();
        ctx.stroke();
    }
}

function toggleDisplay() {
    if (cw_paused) {
        return;
    }
    canvas.width = canvas.width;
    if (doDraw) {
        doDraw = false;
        cw_stopSimulation();

        cw_runningInterval = Handler.setInterval(function() {
            var time = performance.now() + (1000 / screenfps);
            while (time > performance.now()) {
                simulationStep();
                simulationStep();
                simulationStep();
            }
        }, 1);

        //cw_runningInterval = Handler.setInterval(simulationStep, 1); // simulate 1000x per second when not drawing
    } else {
        doDraw = true;
        clearInterval(cw_runningInterval);
        cw_startSimulation();
    }
}

function cw_drawVirtualPoly(body, vtx, n_vtx) {
    // set strokestyle and fillstyle before call
    // call beginPath before call

    var p0 = body.GetWorldPoint(vtx[0]);
    ctx.moveTo(p0.x, p0.y);
    for (var i = 1; i < n_vtx; i++) {
        p = body.GetWorldPoint(vtx[i]);
        ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(p0.x, p0.y);
}

function cw_drawPoly(body, vtx, n_vtx) {
    // set strokestyle and fillstyle before call
    ctx.beginPath();

    var p0 = body.GetWorldPoint(vtx[0]);
    ctx.moveTo(p0.x, p0.y);
    for (var i = 1; i < n_vtx; i++) {
        p = body.GetWorldPoint(vtx[i]);
        ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(p0.x, p0.y);

    ctx.fill();
    ctx.stroke();
}

function cw_drawCircle(body, center, radius, angle, color) {
    var p = body.GetWorldPoint(center);
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI, true);

    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + radius * Math.cos(angle), p.y + radius * Math.sin(angle));

    ctx.fill();
    ctx.stroke();
}

function cw_drawMiniMap() {
    var last_tile = null;
    var tile_position = new b2Vec2(-5, 0);
    minimapfogdistance = 0;
    fogdistance.width = "800px";
    minimapcanvas.width = minimapcanvas.width;
    minimapctx.strokeStyle = "#000";
    minimapctx.beginPath();
    minimapctx.moveTo(0, 35 * minimapscale);
    for (var k = 0; k < cw_floorTiles.length; k++) {
        last_tile = cw_floorTiles[k];
        last_fixture = last_tile.GetFixtureList();
        last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
        tile_position = last_world_coords;
        minimapctx.lineTo((tile_position.x + 5) * minimapscale, (-tile_position.y + 35) * minimapscale);
    }
    minimapctx.stroke();
}
function showDistance(distance, height) {
    distanceMeter.innerHTML = "distance: " + distance + " meters<br />";
    distanceMeter.innerHTML += "height: " + height + " meters";
    if (distance > minimapfogdistance) {
        fogdistance.width = 800 - Math.round(distance + 15) * minimapscale + "px";
        minimapfogdistance = distance;
    }
}

function simulationStep() {
    cyclesPerSec++;
    world.Step(1 / box2dfps, 20, 20);
    carManager.step();
}

function cw_startSimulation() {
    cw_runningInterval = Handler.setInterval(simulationStep, Math.round(1000 / box2dfps));
    cw_drawInterval = Handler.setInterval(cw_drawScreen, Math.round(1000 / screenfps));
}

function cw_stopSimulation() {
    clearInterval(cw_runningInterval);
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
    cw_runningInterval = Handler.setInterval(simulationStep, Math.round(1000 / box2dfps));
    cw_drawInterval = Handler.setInterval(cw_drawScreen, Math.round(1000 / screenfps));

    var ui = new UI();
    ui.initialise();
    Handler.setInterval(ui.update.bind(ui), 100);
    Handler.setInterval(ui.slowUpdate.bind(ui), 1000);
}

cw_init();
