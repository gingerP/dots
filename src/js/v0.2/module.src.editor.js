define(['beautify'],
    function () {
        var api;
        var editor;
        var container;
        var history = {};

        function init(container, title) {
            var editor;
            editor = ace.edit(container.get(0));
            editor.getSession().setMode("ace/mode/json");
            editor.$blockScrolling = Infinity;
            //init events
            return {
                setValue: function (value) {
                    value = vkbeautify.json(value);
                    editor.setValue(value);
                    editor.clearSelection();
                },
                getValue: function () {
                    return editor.getValue();
                }
            };
        }

        api = {
            init: function (_container, title) {
                container = _container;
                editor = init(container, title);
                return api;
            },
            setData: function (data) {
                editor.setValue(data);
                return api;
            },
            log: function (number, data) {
                history[number] = data;
                api.setData(history);
            }
        };
        return api;
    }
);