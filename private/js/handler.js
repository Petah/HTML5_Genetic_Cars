var Handler = {
    references: {}
};

Handler.setInterval = function(name, callback, interval) {
    this.clearInterval(name);
    this.references[name] = setInterval(function() {
        try {
            callback();
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            this.clearInterval(name);
        }
    }.bind(this), interval);
};

Handler.clearInterval = function(name) {
    if (this.references[name]) {
        clearInterval(this.references[name]);
        this.references[name] = null;
    }
};

Handler.stop = function() {
    for (var name in this.references) {
        this.clearInterval(name);
    }
};
