define([], function () {
    'use strict';

    return {
        onRoot: function (scope, event, func) {
            scope.$on('$destroy', scope.$root.$on(event, function (event, data) {
                func(data);
            }));
        }
    }
});