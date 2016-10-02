module.exports = {
    wrapListener: function (context, handler) {
        return function () {
            handler.apply(context, arguments);
        };
    },
    emptyPromise: function (data) {
        return new Promise(function (resolve) {
            resolve(data);
        });
    },
    controllerHandler: function (wss, event, handler) {
        return function () {
            wss.addListener(event, handler);
        };
    },
    error: function (logger) {
        return function (error) {
            var message;
            if (error.error) {
                message = error.error.code + ': ' + error.error.message;
            } else {
                message = typeof(error) === 'string' ? error : (error ? error.message : 'No message');
            }
            logger.error(message);
            if (error.stack) {
                logger.error(error.stack);
            }
        };
    }
};
