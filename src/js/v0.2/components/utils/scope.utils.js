define([], function () {
    'use strict';

    return {
        onRoot: function (scope, eventName, func) {
            scope.$on('$destroy', scope.$root.$on(eventName, function (event, data) {
                func(data);
            }));
        },
        safeListen: function safeListen(scope, listener) {
            scope.$on('$destroy', listener);
        }
    };
});
