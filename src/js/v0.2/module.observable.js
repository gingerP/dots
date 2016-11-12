define([], function () {
    'use strict';

    var instance;

    function Observable() {
    }

    Observable.prototype.on = function (property, listener, async) {
        var inst = this;
        this.listeners = this.listeners || {};
        this.listeners[property] = this.listeners[property] || [];
        if (listener !== null && ['object', 'function'].indexOf(typeof(listener)) > -1) {
            this.listeners[property].push({
                async: typeof(async) === 'boolean' ? async : false,
                listener: listener
            });
        }
        return function () {
            var index = inst.listeners[property] ? inst.listeners[property].indexOf(listener) : -1;
            if (index > -1) {
                inst.listeners[property].splice(index, 1);
            }
        };
    };

    Observable.prototype.emit = function (property, data) {
        var methodName;
        var inst = this;
        var preparedData = Array.isArray(data) ? data : [data];
        if (this.listeners && this.listeners[property] && this.listeners[property].length) {
            this.listeners[property].forEach(function (listener) {
                var func;
                var context;
                if (typeof(listener.listener) === 'object') {
                    if (!methodName) {
                        methodName = 'on' +
                            property.charAt(0).toUpperCase() +
                            property.substr(1, property.length - 1) + 'Change';
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
                    setTimeout(function () {
                        inst.__runListener(func, context, preparedData, property);
                    }, 0);
                } else {
                    inst.__runListener(func, context, preparedData, property);
                }
            });
        }
    };

    Observable.prototype.__runListener = function (func, context, data) {
        if (typeof(func) === 'function') {
            func(data);
        }
    };

    instance = new Observable();

    return {
        instance: instance,
        class: Observable
    };
});