require.config({
    baseUrl: '/static/js/v0.2',
    paths: {
        angular: '/node_modules/angular/angular',
        'angular-animate': '/node_modules/angular-animate/angular-animate',
        'angular-icons': '/node_modules/angular-material-icons/angular-material-icons',
        storage: '/node_modules/basil.js/build/basil',
        q: '/node_modules/q/q',
        lodash: '/node_modules/lodash/lodash',
        d3: '/node_modules/d3/build/d3',
        jquery: '/node_modules/jquery/dist/jquery',
        socket: '/node_modules/socket.io-client/dist/socket.io'
    },
    shim: {
        angular: {
            exports: 'angular'
        },
        'angular-animate': {
            deps: ['angular']
        },
        'angular-icons': {
            deps: ['angular']
        }
    },
    waitSeconds: 15
});
require([
    'module.observable',
    'common/events',
    'services/business/module.game.business',
    'graphics/module.game.graphics',
    'utils/game-utils',
    'components/components.module'
], function (Observable, Events, Business, Graphics, GameUtils) {
    var observable = Observable.instance;
    observable.on(Events.GAME_PANE_RENDER, function () {
        var X_SIZE = 40;
        var Y_SIZE = 40;
        var vertexes = GameUtils.generateVertexes(X_SIZE, Y_SIZE);
        Business.init();
        Graphics.init('#game-pane', Business, X_SIZE, Y_SIZE, vertexes);
    });
});
