var constants = require('../constants/constants');
/*var cookie = require('cookie');*/

function modifySocket(ws) {
    ws.ws.set('authorization', function(/*data, accept*/) {
/*        // check if there's a cookie header
        if (data.headers.cookie) {
            // if there is, parse the cookie
            data.cookie = cookie.parse(data.headers.cookie);
            // note that you will need to use the same key to grad the
            // session id, as you specified in the Express setup.
            data.sessionID = data.cookie['express.sid'];
        } else {
            // if there isn't, turn down the connection with a message
            // and leave the function.
            return accept('No cookie transmitted.', false);
        }
        // accept the incoming connection
        accept(null, true);*/

    });
}

function modifyHttp(/*web*/) {
}

function SocketExtend() {

}

SocketExtend.prototype.getName = function getName() {
    return 'socket.extend';
};

SocketExtend.prototype.postConstructor = function postConstructor(ioc) {
    this.wss = ioc[constants.WSS];
    this.http = ioc[constants.HTTP];
    /*modifyHttp(this.http);
    modifySocket(this.wss);*/
};

module.exports = {
    class: SocketExtend
};
