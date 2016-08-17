define([], function () {

    function AngularObservable(angularRoot) {
        this.root = angularRoot;
    }

    AngularObservable.prototype.on = function (property, listener) {
        this.root.$on(property, function (event, data) {
            listener(data);
        })
    };

    AngularObservable.prototype.emit = function (property, data) {
        this.root.$emit(property, data);
    };

    return AngularObservable;
});