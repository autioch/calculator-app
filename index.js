document.addEventListener('DOMContentLoaded', function setup() {
    const ui = {
        input: document.querySelector('.c-input'),
        output: document.querySelector('.c-output'),
    }

    globalThis.app = {
        insert: decorateInputOperation(insert),
        empty: decorateInputOperation(empty),
        remove: decorateInputOperation(remove),
        tryCalculate
    }

    function insert(cursor, value, text) {
        ui.input.value = value.slice(0, cursor) + text + value.slice(cursor);
        ui.input.setSelectionRange(cursor + 1, cursor + 1);
    }

    function empty() {
        ui.input.value = '';
    }

    function remove(cursor, value) {
        ui.input.value = value.slice(0, cursor - 1) + value.slice(cursor);
        ui.input.setSelectionRange(cursor - 1, cursor - 1);
    }

    function decorateInputOperation(callbackFn) {
        return function decorator(...args) {
            const cursor = ui.input.selectionStart;
            const value = ui.input.value;

            callbackFn(cursor, value, ...args);
            tryCalculate();
            ui.input.focus();
        }
    }

    function tryCalculate() {
        const { result } = calculate(ui.input.value);
        const message = Object.is(result, NaN) ? 'Please enter valid expression' : `Result is: ${result}`;

        ui.output.textContent = message;
    }

});




