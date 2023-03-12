document.addEventListener('DOMContentLoaded', function setup() {
    const ui = {
        input: document.querySelector('.c-input'),
        output: document.querySelector('.c-output'),
    }

    // Simple check for pointer devices. When on mobile, try to not show the virtual keyboard.
    const isMobile = window.matchMedia("only screen and (hover: none) and (pointer: coarse)").matches;

    // Make sure that even if input isn't focused, any keyboard action lands in it
    // This causes issues with copying text, but it shouldn't be required.
    if (!isMobile) {
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

    function insert(selectionStart, selectionEnd, value, text) {
        ui.input.setRangeText(text);
        ui.input.setSelectionRange(selectionStart + text.length, selectionStart + text.length);
    }

    function empty() {
        ui.input.value = '';
    }

    function remove(selectionStart, selectionEnd, value) {
        const sliceFrom = selectionStart - ((selectionStart === selectionEnd) ? Number(selectionStart !== 0) : 0);

        ui.input.value = value.slice(0, sliceFrom) + value.slice(selectionEnd);
        ui.input.setSelectionRange(sliceFrom, sliceFrom);
    }

    // Wraps specific operations into common steps
    function decorateInputOperation(callbackFn) {
        return function decorator(...args) {
            const { selectionStart, selectionEnd, value } = ui.input;
            callbackFn(selectionStart, selectionEnd, value, ...args);
            tryCalculate();
            !isMobile && ui.input.focus();
        }
    }

    function tryCalculate() {
        const { value } = ui.input;
        // Not pretty, but there should be no calculation started if there's nothing to calculate.
        const { hasError, hasResult, message } = value.length ? handleCalculation(calculate(value)) : {
            hasError: false,
            hasResult: false,
            message: 'Enter expression to calculate'
        };

        ui.output.textContent = message;
        ui.output.title = message;
        ui.output.classList.toggle('has-error', hasError);
        ui.output.classList.toggle('has-result', hasResult);
    }


    // Translate JS errors into human readable form
    function handleCalculation({ result, errorMessage }) {

        // Known issue. Unary requires negative numbers to be enclosed in brackets.
        if (errorMessage.length && errorMessage.startsWith('Unary operator')) {
            return {
                hasError: true,
                hasResult: false,
                message: 'Exponentiation of negative base is not supported'
            };
        }
        
        // comment character will be treated as regular expression start
        if (errorMessage.length && errorMessage.startsWith('Invalid regular')) {
            return {
                hasError: true,
                hasResult: false,
                message: 'Incomplete expression'
            };
        }
        
        if (errorMessage.length && errorMessage.startsWith('Unexpected')) {
            return {
                hasError: true,
                hasResult: false,
                message: 'Incomplete expression'
            };
        }

        if (errorMessage.length) {
            return {
                hasError: true,
                hasResult: false,
                message: errorMessage
            };
        }

        // No error, but somehow we got weird value
        if (Object.is(result, NaN) || Object.is(result, Infinity) || Object.is(result, -Infinity)) {
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




