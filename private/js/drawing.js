/* ========================================================================= */
/* ==== Drawing ============================================================ */

function cw_drawScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    cw_setCameraPosition();
    ctx.translate(600 - (camera_x * zoom), (canvas.height / 2) + (camera_y * zoom));
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


function rgbToHsl(color){
    var r = color[0],
        g = color[1],
        b = color[2];
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function cw_drawCars() {
    for (var j = 0; j < carManager.groups.length; j++) {
        var carGroup = carManager.groups[j],
            cars = carGroup.cars;
        for (var k = (cars.length - 1); k >= 0; k--) {
            myCar = cars[k];
            if (!myCar.alive) {
                continue;
            }
            myCarPos = myCar.getPosition();

            if ((myCarPos.x < (camera_x - 10)) || (myCarPos.x > (camera_x + 20))) {
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

            ctx.strokeStyle = 'rgba(' + carGroup.color[0] + ',' + carGroup.color[1] + ',' + carGroup.color[2] + ',1)';
            var hsl = rgbToHsl(carGroup.color);
            ctx.fillStyle = 'hsl(' + Math.round(hsl[0] * 255) + ',' + Math.round(hsl[1] * 100) + '%,' + densitycolor + ')';

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


function cw_drawFloor() {
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();

    outer_loop:
    for (var k = Math.max(0, last_drawn_tile - 20); k < cw_floorTiles.length; k++) {
        var b = cw_floorTiles[k];
        for (f = b.GetFixtureList(); f; f = f.m_next) {
            var s = f.GetShape();
            var shapePosition = b.GetWorldPoint(s.m_vertices[0]).x;
            if ((shapePosition > (camera_x - 10)) && (shapePosition < (camera_x + 20))) {
                cw_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
            }
        }
    }
    ctx.fill();
    ctx.stroke();
}
