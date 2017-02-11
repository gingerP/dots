define([], function () {
    return {
        input: [
            /* 0 1 2 3 4 5 6
             0─┼─┼─┼─┼─┼─┼─┼
             1─┼─┼─┼─■─┼─┼─┼
             2─┼─┼─■─┼─■─┼─┼
             3─┼─■─┼─┼─■─┼─┼
             4─┼─┼─■─┼─■─┼─┼
             5─┼─┼─┼─■─┼─┼─┼
             6─┼─┼─┼─┼─┼─┼─┼
             */
            // rev 00
            [
                {x: 3, y: 1},
                {x: 2, y: 2},
                {x: 4, y: 2},
                {x: 1, y: 3},
                {x: 4, y: 3},
                {x: 2, y: 4},
                {x: 4, y: 4},
                {x: 3, y: 5}
            ]
        ],
        output: [
            {start: {x: 3, y: 1}, finish: {x: 4, y: 2}},
            {start: {x: 4, y: 2}, finish: {x: 4, y: 3}},
            {start: {x: 4, y: 3}, finish: {x: 4, y: 4}},
            {start: {x: 4, y: 4}, finish: {x: 3, y: 5}},
            {start: {x: 3, y: 5}, finish: {x: 2, y: 4}},
            {start: {x: 2, y: 4}, finish: {x: 1, y: 3}},
            {start: {x: 1, y: 3}, finish: {x: 2, y: 2}},
            {start: {x: 2, y: 2}, finish: {x: 3, y: 1}}
        ]
    };
});
