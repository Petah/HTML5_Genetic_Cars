var CarManager = function() {
    this.topScores = [];
    this.groups = [
        new CarGroup('Alpha', '#00FF00'),
        new CarGroup('Bravo', '#0000FF'),
        new CarGroup('Charlie', '#FF0000'),
        new CarGroup('Delta', '#01FFFE'),
        new CarGroup('Echo', '#FFA6FE'),
        new CarGroup('Foxtrot', '#FFDB66'),
        new CarGroup('Golf', '#006401'),
        new CarGroup('Hotel', '#010067'),
        new CarGroup('India', '#95003A'),
        new CarGroup('Juliet', '#007DB5'),
        new CarGroup('Kilo', '#FF00F6'),
        new CarGroup('Lima', '#FFEEE8'),
        new CarGroup('Mike', '#774D00'),
        new CarGroup('November', '#90FB92'),
        new CarGroup('Oscar', '#0076FF'),
        new CarGroup('Papa', '#D5FF00'),
        new CarGroup('Quebec', '#FF937E'),
        new CarGroup('Romeo', '#6A826C'),
        new CarGroup('Sierra', '#FF029D'),
        new CarGroup('Tango', '#FE8900'),
        new CarGroup('Uniform', '#7A4782'),
        new CarGroup('Victor', '#7E2DD2'),
        new CarGroup('Whisky', '#85A900'),
        new CarGroup('X-Ray', '#FF0056'),
        new CarGroup('Yankee', '#A42400'),
        new CarGroup('Zulu', '#00AE7E'),
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
