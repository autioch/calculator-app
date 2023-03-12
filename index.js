document.addEventListener('DOMContentLoaded', function setup() {
    const ui = {
        input: document.querySelector('.c-input'),
        output: document.querySelector('.c-output'),
    }

    // Make sure that even if input isn't focused, any keyboard action lands in it
    // This causes issues with copying text, but it shouldn't be required.
    document.addEventListener('keydown', function checkInputFocus() {
        if (document.activeElement !== ui.input) {
            ui.input.focus();
        }
    })

    globalThis.app = {
        insert: decorateInputOperation(insert),
        empty: decorateInputOperation(empty),
        remove: decorateInputOperation(remove),
        tryCalculate
    }

    tryCalculate();

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
            const { selectionStart: cursor, value } = ui.input;

            callbackFn(cursor, value, ...args);
            tryCalculate();
            ui.input.focus();
        }
    }

    function tryCalculate() {
        const { value } = ui.input;

        if (!value.length) {
            ui.output.textContent = 'Start typing expression...';

            return;
        }

        const { result, errorMessage } = calculate(value);

        ui.output.textContent = formatMessage(result, errorMessage);
    }

    function formatMessage(result, errorMessage) {
        if (errorMessage.length) {
            return errorMessage;
        }

        if (Object.is(result, NaN)) {
            return 'Unexpected error';
        }

        return `Result is: ${result}`;
    }

});




