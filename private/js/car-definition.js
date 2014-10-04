var CarDefinition = function() {
}

CarDefinition.prototype.randomise = function() {
    this.wheelCount = 2;

    this.wheel_radius = [];
    this.wheel_density = [];
    this.wheel_vertex = [];
    for (var i = 0; i < this.wheelCount; i++) {
        this.wheel_radius[i] = Math.random() * wheelMaxRadius + wheelMinRadius;
        this.wheel_density[i] = Math.random() * wheelMaxDensity + wheelMinDensity;
    }

    this.chassis_density = Math.random() * chassisMaxDensity + chassisMinDensity

    this.vertex_list = [];
    this.vertex_list.push(new b2Vec2(Math.random() * chassisMaxAxis + chassisMinAxis, 0));
    this.vertex_list.push(new b2Vec2(Math.random() * chassisMaxAxis + chassisMinAxis, Math.random() * chassisMaxAxis + chassisMinAxis));
    this.vertex_list.push(new b2Vec2(0, Math.random() * chassisMaxAxis + chassisMinAxis));
    this.vertex_list.push(new b2Vec2(-Math.random() * chassisMaxAxis - chassisMinAxis, Math.random() * chassisMaxAxis + chassisMinAxis));
    this.vertex_list.push(new b2Vec2(-Math.random() * chassisMaxAxis - chassisMinAxis, 0));
    this.vertex_list.push(new b2Vec2(-Math.random() * chassisMaxAxis - chassisMinAxis, -Math.random() * chassisMaxAxis - chassisMinAxis));
    this.vertex_list.push(new b2Vec2(0, -Math.random() * chassisMaxAxis - chassisMinAxis));
    this.vertex_list.push(new b2Vec2(Math.random() * chassisMaxAxis + chassisMinAxis, -Math.random() * chassisMaxAxis - chassisMinAxis));

    var left = [];
    for (var i = 0; i < 8; i++) {
        left.push(i);
    }
    for (var i = 0; i < this.wheelCount; i++) {
        var indexOfNext = Math.floor(Math.random() * left.length);
        this.wheel_vertex[i] = left[indexOfNext];
        left.splice(indexOfNext, 1);
    }

    return this;
};

CarDefinition.prototype.generate = function() {
    var parent1 = cw_getParents();
    var parent2 = parent1;
    while (parent2 == parent1) {
        parent2 = cw_getParents();
    }
    var newborn = cw_makeChild(this.scores[0].car_def, this.scores[1].car_def);
    newborn = cw_mutate(newborn);
    return newborn;
};
