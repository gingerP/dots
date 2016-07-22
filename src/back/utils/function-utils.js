module.exports = {
    wrapListener: function (context, handler) {
        return function () {
            handler.apply(context, arguments);
        }
    }
};