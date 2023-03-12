document.addEventListener('DOMContentLoaded', function setup() {
    const ui = {
        input: document.querySelector('.c-input'),
        output: document.querySelector('.c-output'),
    }

    // Simple check for pointer devices. When on mobile, try to not show the virtual keyboard.
    const isMobile = window.matchMedia("only screen and (hover: none) and (pointer: coarse)").matches;

    // Make sure that even if input isn't focused, any keyboard action lands in it
    // This causes issues with copying text, but it shouldn't be required.
    if (!isMobile){
        document.addEventListener('keydown', function checkInputFocus() {
            if (document.activeElement !== ui.input) {
                ui.input.focus();
            }
        });

        ui.input.focus();
    }


    // Expose only public API
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

    // Wraps specific operations into common steps
    function decorateInputOperation(callbackFn) {
        return function decorator(...args) {
            const { selectionStart: cursor, value } = ui.input;

            callbackFn(cursor, value, ...args);
            tryCalculate();
            !isMobile && ui.input.focus();
        }
    }

    function tryCalculate() {
        const { hasError, hasResult, message } = handleCalculation(ui.input.value);

        ui.output.textContent = message;
        ui.output.title = message;
        ui.output.classList.toggle('has-error', hasError);
        ui.output.classList.toggle('has-result', hasResult);
    }

    function handleCalculation(value) {
        if (!value.length) {
            return {
                hasError: false,
                hasResult: false,
                message: 'Enter expression to calculate'
            };
        }

        const { result, errorMessage } = calculate(value);

        if (errorMessage.length) {
            return {
                hasError: true,
                hasResult: false,
                message: errorMessage
            };
        }

        if (Object.is(result, NaN)) {
            return {
                hasError: true,
                hasResult: false,
                message: 'Unexpected error'
            };
        }

        return {
            hasError: false,
            hasResult: true,
            message: `Result: ${result}`
        };
    }

});




