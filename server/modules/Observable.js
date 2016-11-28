var utils = req('server/utils/utils');

function getListenerName(property) {
    return 'on' + property.charAt(0).toUpperCase() + property.substr(1, property.length - 1) + 'Change';
}

function Observable() {
}

Observable.prototype.addListener = function (property, listener, isAsync) {
    var isAsyncPrepared = utils.hasContent(isAsync) ? !!isAsync : false;
    this.listeners = this.listeners || {};
    this.listeners[property] = this.listeners[property] || [];
    if (listener !== null && ['object', 'function'].indexOf(typeof(listener)) > -1) {
        this.listeners[property].push({
            async: isAsyncPrepared,
            listener: listener
        });
    }
};

Observable.prototype.propertyChange = function (property, data) {
    var methodName;
    var inst = this;
    var dataPrepared = Array.isArray(data) ? data : [data];
    if (this.listeners && this.listeners[property] && this.listeners[property].length) {
        this.listeners[property].forEach(function (listener) {
            var func;
            var context;
            if (typeof(listener.listener) === 'object') {
                if (!methodName) {
                    methodName = getListenerName(property);
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
                    inst.__runListener(func, context, dataPrepared, property);
                }, 0);
            } else {
                inst.__runListener(func, context, dataPrepared, property);
            }
        });
    }
};

Observable.prototype.__runListener = function (func, context, data) {
    if (typeof(func) === 'function') {
        func.apply(context, data);
    }
};

module.exports = {
    class: Observable
};
