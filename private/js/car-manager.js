

var CarManager = function() {
    this.topScores = [];
    this.groups = [
        new CarGroup('Alpha',    [0,   255, 0]),
        new CarGroup('Bravo',    [0,   0,   255]),
        new CarGroup('Charlie',  [255, 0,   0]),
        new CarGroup('Delta',    [1,   255, 254]),
        new CarGroup('Echo',     [255, 166, 254]),
        new CarGroup('Foxtrot',  [255, 219, 102]),
        new CarGroup('Golf',     [0,   100, 1]),
        new CarGroup('Hotel',    [1,   0,   103]),
        /*new CarGroup('India',    [149, 0,   58]),
        new CarGroup('Juliet',   [0,   125, 181]),
        new CarGroup('Kilo',     [255, 0,   246]),
        new CarGroup('Lima',     [255, 238, 232]),
        new CarGroup('Mike',     [119, 77,  0]),
        new CarGroup('November', [144, 251, 146]),
        new CarGroup('Oscar',    [0,   118, 255]),
        new CarGroup('Papa',     [213, 255, 0]),
        new CarGroup('Quebec',   [255, 147, 126]),
        new CarGroup('Romeo',    [106, 130, 108]),
        new CarGroup('Sierra',   [255, 2,   157]),
        new CarGroup('Tango',    [254, 137, 0]),
        new CarGroup('Uniform',  [122, 71,  130]),
        new CarGroup('Victor',   [126, 45,  210]),
        new CarGroup('Whisky',   [133, 169, 0]),
        new CarGroup('X-Ray',    [255, 0,   86]),
        new CarGroup('Yankee',   [164, 36,  0]),
        new CarGroup('Zulu',     [0,   174, 126]),*/
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
