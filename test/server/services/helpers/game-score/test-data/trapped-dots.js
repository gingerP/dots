module.exports = {
    name: 'A few trapped dots',
    input: {
        /*
         ┼─┼─┼─┼─┼─┼─┼─┼
         ┼─┼─■─■─■─┼─┼─┼
         ×─■─┼─┼─×─■─┼─┼
         ×─■─┼─×─┼─┼─■─┼
         ×─■─┼─┼─┼─■─┼─┼
         ┼─×─■─■─■─┼─┼─┼
         ┼─┼─┼─┼─┼─┼─┼─┼
         */
        dot: {x: 2, y: 1},
        activePlayerGameData: {
            dots: [
                {x: 3, y: 1}, {x: 4, y: 1}, {x: 1, y: 2}, {x: 5, y: 2}, {x: 1, y: 3}, {x: 6, y: 3}, {x: 1, y: 4},
                {x: 5, y: 4}, {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}
            ]
        },
        opponentGameData: {
            dots: [
                {x: 0, y: 2}, {x: 4, y: 2}, {x: 0, y: 3}, {x: 3, y: 3}, {x: 0, y: 4}, {x: 1, y: 5}
            ]
        }
    },
    output: {
        gameData: {
            active: {
                loops: [
                    {
                        loop: [
                            {x: 3, y: 1}, {x: 4, y: 1}, {x: 1, y: 2}, {x: 5, y: 2}, {x: 1, y: 3}, {x: 6, y: 3},
                            {x: 1, y: 4}, {x: 5, y: 4}, {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}, {x: 2, y: 1}
                        ],
                        trappedDots: [
                            {x: 4, y: 2}, {x: 3, y: 3}
                        ]
                    }
                ]
            },
            opponent: {
                loops: [],
                dots: [],
                losingDots: [
                    {x: 4, y: 2}, {x: 3, y: 3}
                ]
            }
        },
        delta: {
            active: {
                loops: [
                    {
                        loop: [
                            {x: 3, y: 1}, {x: 4, y: 1}, {x: 1, y: 2}, {x: 5, y: 2}, {x: 1, y: 3}, {x: 6, y: 3},
                            {x: 1, y: 4}, {x: 5, y: 4}, {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}, {x: 2, y: 1}
                        ],
                        trappedDots: [
                            {x: 4, y: 2}, {x: 3, y: 3}
                        ]
                    }
                ]
            },
            opponent: {}
        }
    }
};
