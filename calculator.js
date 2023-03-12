/* Calculation engine.
 * Uses eval as a hack for a quick solution.
 * Proper implementation would mean edge cases handled properly.
 * It would require some tokenizer, then calculating averything according to the precedence.
 * If brackets were to be added, more sofisticated solution would be advised.
 */

/* Since modules don't work when loading file locally, use old JS.
 * Wrap everything and expose only public api to not pollute the globals */
(() => {

    globalThis.calculator = {
        run
    };

    const decimalFactor = Math.pow(10, 5);
    const validationRegexp = /^(\d|\+|-|\*|\/|e|\s|,|\.)+$/;

    function normalizeText(text) {
        return text
            // people can paste in numbers formatted differently.
            .replace(/,/g, '.')

            // For eval, ^ would be bitwise XOR. Make sure we handle user habits.
            .replace(/\^/g, '**')
    }

    // helper to reduce six lines into one in multiple places
    // Add `hasResult` flag, which easies usage and serves as counterpart to `hasError`.
    function makeResult(result, message, hasError = false) {
        return {
            result,
            hasError,
            hasResult: result !== undefined,
            message
        };
    }

    function run(text = '') {
        // early return on nothing to calculate
        if (!text.length) {
            return makeResult(undefined, 'Enter expression to calculate');
        }

        // only accept numbers, spaces, allowed operations and e for scientific notation
        const normalizedText = normalizeText(text);

        if (!validationRegexp.test(normalizedText)) {
            return makeResult(undefined, 'Remove invalid characters', true);
        }

        try {
            // Potentially very dangerous, but validationRegexp should help.
            const result = eval(normalizedText);

            // No error, but somehow we got weird value
            if (Object.is(result, NaN)) {
                return makeResult(undefined, 'Sorry, failed to calculate', true);
            }

            if (Object.is(result, Infinity) || Object.is(result, -Infinity)) {
                return makeResult(undefined, 'Range exceeded', true);
            }

            // Round to 5 decimals. Hides precision errors.
            const rounded = Math.round(result * decimalFactor) / decimalFactor;

            return makeResult(rounded, '');
        } catch (err) {
            return makeResult(undefined, fixMessage(err.message));
        }
    }

    // Translate JS errors into human readable form
    // This helps hiding the usage of eval.
    function fixMessage(errorMessage) {
        // Known issue. Unary requires negative numbers to be enclosed in brackets.
        if (errorMessage.startsWith('Unary operator')) {
            return 'Exponentiation of negative base is not supported';
        }

        // comment character will be treated as regular expression start
        if (errorMessage.startsWith('Invalid regular')) {
            return 'Incomplete expression';
        }

        if (errorMessage.startsWith('Unexpected end of input')) {
            return 'Incomplete expression';
        }

        if (errorMessage.length) {
            return errorMessage;
        }
    }
})()

