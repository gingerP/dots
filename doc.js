/**
 * @typedef {Object|String} MongoId
 * @typedef {{
 * 				x: number,
 * 				y: number
 * 			}} Dot
 * @typedef {{
 * 				loop: Dot[],
 * 				passed: number,
 * 				capturedDots: Dot[],
 * 				trappedDots: Dot[]
 * 			}} LoopCache
 * @typedef {{
 *              _id: MongoId,
 *              created: date,
 *              updated: date,
 *              isOnline: boolean,
 *              name: string
 *          }} Gamer
 * @typedef {{
 *              _id: MongoId,
 *              from: MongoId,
 *              to: MongoId,
 *              activePlayer: MongoId,
 *              status: ['active', 'closed', 'finished'],
 *              timestamp: date
 *          }} Game
 * @typedef {{
 * 				dots: Dot[],
 * 				losingDots: Dot[],
 * 				capturedDots: Dot[],
 * 				loops: Dot[][]
 * 			}} GameDataDelta
 * @typedef {{
 * 				_id: MongoId,
 * 				game: MongoId,
 * 				client: MongoId,
 * 				dots: Dot[],
 * 				losingDots: Dot[],
 * 				loops: Dot[][],
 * 				color: string
 * 			}} GameData
 * @typedef {{
 * 				_id: MongoId,
 * 				gameDataId: MongoId,
 * 				dotsOutsideLoops: Dot[],
 * 				dotsNotCapturedOpponentDots: Dot[],
 * 				cache: LoopCache[]
 * 			}} GameDataCache
 * @typedef {{
 * 				index: number,
 * 				dots: Dot[]
 * 			}} LoopCacheCapturedDotsInfo
 * @typedef {{
 * 				client: SocketClient,
 * 				data: Object,
 * 				callback: function
 * 			}} SocketMessage
 * @typedef {{
 * 				getId: function,
 *          	sendData: function,
 *          	saveSession: function,
 *          	getSession: function,
 *          	updateSession: function,
 *          	getConnection: function,
 *          	equalConnection: function,
 *          	registerListeners: function
 *          }} SocketClient
 *
 */
