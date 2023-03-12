/* Calculation engine. */

/* Since modules don't work when loading file locally, use old JS.
 * Wrap everything and expose only public api to not pollute the globals */
(() => {

    globalThis.calculate = calculate;

    const decimalFactor = Math.pow(10, 5);
    const validationRegexp = /^(\d|\+|-|\*|\/|e|\s|,|\.)+$/;

    function normalizeText(text) {
        return text
            // people can paste in numbers formatter differently.
            // TODO Detect decimal and thousand separator from the user settings.
            .replace(/,/g, '.')

            // For eval, ^ would be bitwise XOR. Make sure we handle user habits.
            .replace(/\^/g, '**');
    }

    function calculate(text) {

        const normalizedText = normalizeText(text);

        // only accept numbers, spaces, allowed operations and e for scientific notation
        if (!validationRegexp.test(normalizedText)) {
            return {
                result: NaN,
                errorMessage: 'Invalid characters in expression'
            }
        }
        try {
            // Potentially very dangerous, but validationRegexp should help.
            // TODO Implement proper tokenization, RPN.
            // This way brackets and other operations can be supported.
            const result = eval(normalizedText);

            // Round to 5 decimals. Hides precision errors.
            // TODO This could be a configuration option
            const rounded = Math.round(result * decimalFactor) / decimalFactor;

            return {
                result: rounded,
                errorMessage: ''
            }
        } catch (err) {
            // Known issue. Unary requires negative numbers to be enclosed in brackets.
            if (err.message.startsWith('Unary operator')) {
                return {
                    result: NaN,
                    errorMessage: 'Exponentiation of negative base is not supported'
                }
            }
            return {
                result: NaN,
                errorMessage: err.message
            }
        }
    }
})()

