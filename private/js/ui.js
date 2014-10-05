var UI = function() {
};

UI.prototype.initialise = function() {
    this.healthBars = [];
    this.healthBarWrapper = document.getElementById('health-bars');
    this.miniMapMarkers = [];
    this.miniMapMarkersWrapper = document.getElementById('minimapholder');

    for (var i = 0; i < carManager.groups.length; i++) {
        var carGroup = carManager.groups[i];
        for (var j = 0; j < carGroup.allCars.length; j++) {
            var car = carGroup.allCars[j];
            var healthBar = new HealthBar();
            this.healthBarWrapper.appendChild(healthBar.wrapper);
            this.healthBars[i * 1000 + j] = healthBar;

            var miniMapMarker = new MiniMapMarker();
            this.miniMapMarkersWrapper.appendChild(miniMapMarker.marker);
            this.miniMapMarkers[i * 1000 + j] = miniMapMarker;
        }
    }
};

UI.prototype.update = function() {
    var allCars = carManager.getAllCars();

    document.getElementById("generation").innerHTML = "Generation " + gen_counter;
    document.getElementById("population").innerHTML = "Cars alive: " + allCars.length;

    for (var i = 0; i < carManager.groups.length; i++) {
        var carGroup = carManager.groups[i];
        for (var j = 0; j < carGroup.allCars.length; j++) {
            var car = carGroup.allCars[j];
            this.healthBars[i * 1000 + j].bar.style.width = (car.health * 100) + '%';
            this.healthBars[i * 1000 + j].bar.style.backgroundColor = 'rgb(' + carGroup.color[0] + ',' + carGroup.color[1] + ',' + carGroup.color[2] + ')';

            var position = car.getPosition();
            this.miniMapMarkers[i * 1000 + j].marker.style.left = Math.round((position.x + 5) * minimapscale) + 'px';
            if (car.alive) {
                this.miniMapMarkers[i * 1000 + j].marker.style.borderColor = 'rgb(' + carGroup.color[0] + ',' + carGroup.color[1] + ',' + carGroup.color[2] + ')';
            } else {
                this.miniMapMarkers[i * 1000 + j].marker.style.borderColor = 'black';
            }
        }
    }


    var distance = Math.round(carManager.leaderPosition.x * 100) / 100;
    var height = Math.round(carManager.leaderPosition.y * 100) / 100;
    distanceMeter.innerHTML = "Distance: " + distance + " meters<br />";
    distanceMeter.innerHTML += "Height: " + height + " meters";
};

UI.prototype.slowUpdate = function() {
    document.getElementById('cycles-per-second').innerHTML = 'Steps per second: ' + cyclesPerSec;
    cyclesPerSec = 0;
    plot_graphs();
};


var HealthBar = function() {
    this.wrapper = template('health-bar');
    this.bar = this.wrapper.querySelector('.health-bar');
};

var MiniMapMarker = function() {
    this.marker = template('mini-map-marker');
};

document.querySelector('[name=full-speed]').addEventListener('change', function() {
    if (this.checked) {
        Handler.setInterval('sim', function() {
            var time = performance.now() + (1000 / screenfps);
            while (time > performance.now()) {
                simulationStep();
            }
        }, 1);
    } else {
        Handler.setInterval('sim', simulationStep, Math.round(1000 / box2dfps));
    }
});

//Graphs

function plot(data, color, alpha) {
    graphctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')';
    graphctx.beginPath();
    graphctx.moveTo(0, 0);
    for (var i = 0; i < data.length; i++) {
        graphctx.lineTo(400 * (i + 1) / data.length, data[i]);
    }
    graphctx.stroke();
}

function plot_graphs() {
    cw_clearGraphics();
    for (var i = 0; i < carManager.groups.length; i++) {
        var carGroup = carManager.groups[i];
        var data = [];
        for (var generationNumber = 0; generationNumber < carGroup.scores.length; generationNumber++) {
            for (var carNumber = 0; carNumber < carGroup.scores[generationNumber].length; carNumber++) {
                if (!data[carNumber]) {
                    data[carNumber] = [];
                }
                data[carNumber].push(carGroup.scores[generationNumber][carNumber].v);
            }
        }
        for (var carNumber = 0; carNumber < data.length; carNumber++) {
            plot(data[carNumber], carGroup.color, 0.7);
        }
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

