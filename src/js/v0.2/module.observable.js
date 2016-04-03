define([], function() {
    var Observable = function(){};

    Observable.prototype.addListener = function(property, listener, async) {
        this.listeners = this.listeners || {};
        this.listeners[property] = this.listeners[property] || [];
        if (listener != null && ['object', 'function'].indexOf(typeof(listener)) > -1) {
            this.listeners[property].push({
                async: typeof(async) === 'boolean'? async: false,
                listener: listener
            });
        }
    };

    Observable.prototype.propertyChange = function(property, data) {
        var methodName;
        var inst = this;
        data = Array.isArray(data)? data: [data];
        if (this.listeners && this.listeners[property] && this.listeners[property].length) {
            this.listeners[property].forEach(function(listener) {
                var func;
                var context;
                if (typeof(listener.listener) === 'object') {
                    if (!methodName) {
                        methodName = 'on' + property.charAt(0).toUpperCase() + property.substr(1, property.length - 1) + 'Change';
                    }
                    if (typeof(listener.listener[methodName]) === 'function') {
                        func = listener.listener[methodName];
                        context = listener.listener;
                    }
                } else if (typeof(listener.listener) === 'function') {
                    func = listener.listener;
                    context = null;
                }
                if (listener.async) {
                    setTimeout(function() {
                        inst.__runListener(func, context, data, property);
                    }, 0);
                } else {
                    inst.__runListener(func, context, data, property);
                }
            })
        }
    };

    Observable.prototype.__runListener = function(func, context, data, property) {
        if (typeof(func) == 'function') {
            func.apply(context, data);
        }
    };

    return Observable;
});