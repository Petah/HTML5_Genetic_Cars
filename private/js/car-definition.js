var CarDefinition = function() {
}

CarDefinition.prototype.randomise = function(random) {
    this.wheelCount = 2;

    this.wheel_radius = [];
    this.wheel_density = [];
    this.wheel_vertex = [];
    for (var i = 0; i < this.wheelCount; i++) {
        this.wheel_radius[i] = random.uniform() * wheelMaxRadius + wheelMinRadius;
        this.wheel_density[i] = random.uniform() * wheelMaxDensity + wheelMinDensity;
    }

    this.chassis_density = random.uniform() * chassisMaxDensity + chassisMinDensity

    this.vertex_list = [];
    this.vertex_list.push(new b2Vec2(random.uniform() * chassisMaxAxis + chassisMinAxis, 0));
    this.vertex_list.push(new b2Vec2(random.uniform() * chassisMaxAxis + chassisMinAxis, random.uniform() * chassisMaxAxis + chassisMinAxis));
    this.vertex_list.push(new b2Vec2(0, random.uniform() * chassisMaxAxis + chassisMinAxis));
    this.vertex_list.push(new b2Vec2(-random.uniform() * chassisMaxAxis - chassisMinAxis, random.uniform() * chassisMaxAxis + chassisMinAxis));
    this.vertex_list.push(new b2Vec2(-random.uniform() * chassisMaxAxis - chassisMinAxis, 0));
    this.vertex_list.push(new b2Vec2(-random.uniform() * chassisMaxAxis - chassisMinAxis, -random.uniform() * chassisMaxAxis - chassisMinAxis));
    this.vertex_list.push(new b2Vec2(0, -random.uniform() * chassisMaxAxis - chassisMinAxis));
    this.vertex_list.push(new b2Vec2(random.uniform() * chassisMaxAxis + chassisMinAxis, -random.uniform() * chassisMaxAxis - chassisMinAxis));

    var left = [];
    for (var i = 0; i < 8; i++) {
        left.push(i);
    }
    for (var i = 0; i < this.wheelCount; i++) {
        var indexOfNext = Math.floor(random.uniform() * left.length);
        this.wheel_vertex[i] = left[indexOfNext];
        left.splice(indexOfNext, 1);
    }

    return this;
};
