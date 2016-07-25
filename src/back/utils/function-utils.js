module.exports = {
    wrapListener: function (context, handler) {
        return function () {
            handler.apply(context, arguments);
        }
    },
    emptyPromise: function (data) {
        return new Promise(function(resolve) {
            resolve(data);
        });
    }
};