/**
 * @typedef {Object|String} MongoId
 * @typedef {{x: number, y: number}} Dot
 * @typedef {{loop: Dot[], passed: number, capturedDots: Dot[], trappedDots: Dot[]}} LoopCache
 * @typedef {{dots: Dot[], losingDots: Dot[], capturedDots: Dot[], loops: Dot[][]}} GameDataDelta
 * @typedef {{_id: MongoId, game: MongoId, client: MongoId, dots: Dot[], losingDots: Dot[], loops: Dot[][], color: string}} GameData
 * @typedef {{_id: MongoId, gameDataId: MongoId, dotsOutsideLoops: Dot[], dotsNotCapturedOpponentDots: Dot[], cache: LoopCache[]}} GameDataCache
 * @typedef {{index: number, dots: Dot[]}} LoopCacheCapturedDotsInfo
 */