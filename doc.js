/**
 * @typedef {Object} MongoId
 * @typedef {{x: number, y: number}} Dot
 * @typedef {{loop: Dot[], passed: number, capturedDots: Dot[], trappedDots: Dot[]}} LoopCache
 * @typedef {{_id: MongoId, game: MongoId, client: MongoId, dots: Dot[], losingDots: Dot[], loops: Dot[][], color: string}} GameData
 * @typedef {{_id: MongoId, gameDataId: MongoId, dots_outside_loops: Dot[], cache: LoopCache[]}} GameDataCache
 * @typedef {[LoopCache, number]} CacheLoopInfo
 */