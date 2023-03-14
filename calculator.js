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
        run,
        tokenize, // for tests only
        calculate
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
        if (exponentCauses.some(cause => errorMessage.startsWith(cause))) {
            return 'Exponentiation of negative base is not supported';
        }

        if (incompleteCauses.some(cause => errorMessage.startsWith(cause))) {
            return 'Incomplete expression';
        }

        return errorMessage;
    }

    // Since we're using the eval hack, JS errors should be translated into human readable form.
    const incompleteCauses = [
        'Invalid regular', // /
        'unterminated regular', // / firefox
        'Unexpected token', // 2+*2 Chrome/Edge
        'Unexpected end', // 2+ Chrome/Edge
        'expected expression', // Firefox: 2+*2, 2+
    ];

    // Example: -2^3
    // Known issue. Unary requires negative numbers to be enclosed in brackets.
    // Firefox serves a different message
    const exponentCauses = [
        'Unary operator',
        'unparenthesized unary'
    ];

    /* Lexer */

    const tokenList = [
        ['num', /(?:\d*[.,e])?\d+/, 0, parseFloat],
        ['add', /\+/, 1, (a, b) => a + b],
        ['sub', /-/, 1, (a, b) => b - a],// invert order due to rpn stack poping
        ['pow', /(?:\^|\*\*)/, 3, (a, b) => {
            if ((a % 1 !== 0) && (b < 0)) {
                throw Error('Impossible exponentiation');
            }
            return Math.pow(b, a);
        }], // invert order due to rpn stack poping
        ['mul', /(?:\*|×)/, 2, (a, b) => a * b],
        ['div', /(?:\/|÷)/, 2, (a, b) => {
            if (a === 0) {
                throw Error("Can't divide by zero");
            }
            return b / a;
        }],// invert order due to rpn stack poping
        ['ws', /\s/, -1], // whitespace
        ['err', /./, -1], // everything else is invalid
    ].map(([id, token, precedence, fn]) => ([id, token.source, precedence, fn]));

    const lexerRegex = new RegExp(tokenList.map(([, token]) => `(${token})`).join('|'), 'gmu');

    function tokenize(text) {
        const tokens = [];
        let match;

        lexerRegex.lastIndex = 0;

        while (match = lexerRegex.exec(text)) {
            const value = match[0]
            const id = tokenList[match.indexOf(value, 1) - 1][0];

            (id !== 'ws') && tokens.push({
                value: id === 'num' ? parseFloat(value.replace(',', '.')) : value,
                id,
                pos: lexerRegex.lastIndex
            });
        }

        // Hack fix for negative numbers
        const withNegative = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.id === 'sub') {
                if (i === 0 || (tokens[i - 1].id !== 'num')) {
                    const nextToken = tokens[i + 1];

                    if (nextToken?.id === 'num') {
                        withNegative.push({ id: 'num', pos: token.pos, value: -nextToken.value });
                        i++;
                        continue;
                    }
                }
            }
            withNegative.push(token);
        }

        return withNegative;
    }

    /* RPN */

    const precedence = Object.fromEntries(tokenList.map(([id, , precedence]) => [id, precedence]));


    // This could immediately calculate.
    function toRpn(tokens) {
        const result = [];
        const stack = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.id === 'num') {

                result.push(token);

                continue;
            }

            while (stack.length > 0) {
                if (precedence[token.id] > precedence[stack[stack.length - 1].id]) {
                    break;
                }

                result.push(stack.pop());
            }

            stack.push(token);
        }

        return [...result, ...stack.reverse()];
    }

    /* calculate RPN */

    const calculateFns = Object.fromEntries(tokenList.map(([id, , , fn]) => [id, fn]));

    function calculateRpn(tokens) {
        const stack = [];

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.id !== 'num') {
                if (stack.length < 2){
                    throw Error('Incomplete expression')
                }
                token = { id: 'num', value: calculateFns[token.id](stack.pop().value, stack.pop().value) };
            }
            stack.push(token);
        }

        if (stack.length > 1) {
            throw Error('Invalid expression');
        }

        return stack[0].value;
    }

    function calculate(text) {

        try {
            const tokens = tokenize(text);

            if (tokens.some(token => token.id === 'err')) {
                return makeResult(undefined, 'Remove invalid characters');
            }
            const rpn = toRpn(tokens);
            const result = calculateRpn(rpn);

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


})()

