'use strict';

function code (number) {
    return 1000 + number;
}
module.exports = {
    ClientNotFoundError: code(1),
    CouldNotCancelGameError: code(2),
    RouteNotFoundError: code(3),
    RequestValidationError: code(4),
    GameNotFoundError: code(5),
    GameNotActiveError: code(6),
    ClientNotBelongToGameError: code(7),
    DotAlreadyExistsError: code(8),
    InternalError: code(9),
    DotNotAllowed: code(10),
	DotsShouldBeCaptured: code(11),
    GameActionOfferDrawNotAllowed: code(12),
    GameActionOfferCompleteNotAllowed: code(13),
    GameActionGaveUpNotAllowed: code(14),
    GameActionNotAllowed: code(15)
};