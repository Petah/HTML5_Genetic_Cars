var CarGroup = function(name, color) {
    this.name = name;
    this.color = color;
    this.cars = [];
    this.allCars = [];
    this.scores = [[]];
    this.leaderPosition = {
        x: 0,
        y: 0
    };
    this.generationNumber = 0;
    this.generation = [];
};

CarGroup.prototype.clear = function() {
    this.cars = [];
    this.allCars = [];
};

CarGroup.prototype.addCar = function(car) {
    this.cars.push(car);
    this.allCars.push(car);
};

CarGroup.prototype.step = function() {
    this.leaderPosition = {
        x: 0,
        y: 0
    };
    for (var i = 0; i < this.cars.length; i++) {
        this.cars[i].frames++;
        position = this.cars[i].getPosition();
        if (this.cars[i].checkDeath()) {
            this.cars[i].kill(this);
            this.cars.splice(i--, 1);

            if (!this.cars.length) {
                this.nextGeneration();
            }
            continue;
        }
        if (position.x > this.leaderPosition.x) {
            this.leaderPosition = position;
            this.leaderPosition.leader = i;
        }
    }
}

CarGroup.prototype.generate = function(i) {
    var parent1 = cw_getParents();
    var parent2 = parent1;
    while (parent2 == parent1) {
        parent2 = cw_getParents();
    }
    var newborn = cw_makeChild(this.scores[this.generationNumber][0].car_def, this.scores[this.generationNumber][1].car_def);
    newborn = cw_mutate(newborn);
    return newborn;
};

CarGroup.prototype.generationZero = function() {
    for (var i = 0; i < generationSize; i++) {
        var car_def = new CarDefinition();
        car_def.randomise();
        car_def.index = i;
        this.generation.push(car_def);
    }
    this.materialise();
};

CarGroup.prototype.nextGeneration = function() {
    var newGeneration = [];
    var newborn;
    this.getChampions();
    carManager.topScores.push({
        group: this.name,
        i: this.generationNumber,
        v: this.scores[this.generationNumber][0].v,
        x: this.scores[this.generationNumber][0].x,
        y: this.scores[this.generationNumber][0].y,
        y2: this.scores[this.generationNumber][0].y2
    });
    for (var k = 0; k < gen_champions; k++) {
        this.scores[k].car_def.is_elite = true;
        this.scores[k].car_def.index = k;
        newGeneration.push(this.scores[k].car_def);
    }
    for (k = gen_champions; k < generationSize; k++) {
        var parent1 = cw_getParents();
        var parent2 = parent1;
        while (parent2 == parent1) {
            parent2 = cw_getParents();
        }
        newborn = cw_makeChild(this.scores[parent1].car_def,
            this.scores[parent2].car_def);
        newborn = cw_mutate(newborn);
        newborn.is_elite = false;
        newborn.index = k;
        newGeneration.push(newborn);
    }
    this.generation = newGeneration;
    this.generationNumber++;
    this.scores[this.generationNumber] = [];
    this.materialise();
    cw_deadCars = 0;
}

CarGroup.prototype.materialise = function() {
    this.clear();
    for (var i = 0; i < this.generation.length; i++) {
        this.addCar(new cw_Car(this.generation[i]));
    }
};

CarGroup.prototype.getChampions = function() {
    var result = [];
    this.scores[this.generationNumber].sort(function(a, b) {
        return a.v > b.v ? -1 : 1;
    });
    for (var i = 0; i < this.scores[this.generationNumber].length; i++) {
        result.push(this.scores[this.generationNumber][i].i);
    }
    return result;
};
