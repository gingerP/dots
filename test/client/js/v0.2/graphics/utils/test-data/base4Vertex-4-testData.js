define([], function () {
    return {
        input: [
            // rev 00
            [
                {x: 100, y: 100},
                {x: 101, y: 101},
                {x: 101, y: 100},
                {x: 100, y: 101}
            ],
            // rev 01
            [
                {x: 100, y: 100},
                {x: 101, y: 100},
                {x: 101, y: 101},
                {x: 100, y: 101}
            ]
        ],
        output: [
            {start: {x: 100, y: 100}, finish: {x: 101, y: 100}},
            {start: {x: 101, y: 100}, finish: {x: 101, y: 101}},
            {start: {x: 101, y: 101}, finish: {x: 100, y: 101}},
            {start: {x: 100, y: 101}, finish: {x: 100, y: 100}}
        ]
    };
});
