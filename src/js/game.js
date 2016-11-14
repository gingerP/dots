require.config({
    baseUrl: '/static/js/v0.2/',
    paths: {
        angular: '../node_modules/angular/angular.min',
        storage: '../ext/basil.min',
        q: '../node_modules/q/q',
        lodash: '../node_modules/lodash/lodash.min',
        i18n: './module.i18n',
        d3: '../ext/d3.min',
        jquery: '../ext/jquery-2.2.1.min',
        observable: 'module.observable',
        socket: '../ext/socket.io-1.4.5',
        'engine.io': '../ext/engine.io',
        'module.transport': './common/module.transport',
        'module.graph': './module.graph',
        'module.observable': './module.observable',
        'module.backend.service': './common/module.backend.service'
    },
    shim: {
        moduleGameBusiness: 'module.game.business',
        angular: {
            exports: 'angular'
        }
    },
    waitSeconds: 15
});
require([
    'module.observable',
    'common/events',
    'business/module.game.business',
    'graphics/module.game.graphics',
    'utils/game-utils',
    'components/components.module'
], function (Observable, Events, Business, Graphics, GameUtils) {
    var observable = Observable.instance;
    observable.on(Events.GAME_PANE_RENDER, function () {
        var X_SIZE = 40;
        var Y_SIZE = 40;
        var radius = 2;
        var vertexes = GameUtils.generateVertexes(X_SIZE, Y_SIZE, radius);
        Business.init();
        Graphics.init('#game-pane', Business, X_SIZE, Y_SIZE, vertexes);
    });
});
