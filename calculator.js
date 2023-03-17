/* Since modules don't work when loading file locally, use old JS.
 * Wrap everything and expose only public api to not pollute the globals */
(() => {

    globalThis.calculator = {
        tokenize, // for tests only
        calculate
    };

    const decimalFactor = Math.pow(10, 5);

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
    ].map(([id, token, precedence, fn]) => ({ id, token: token.source, precedence, fn }));

    const tokenDict = Object.fromEntries(tokenList.map(token => [token.id, token]));
    const lexerRegex = new RegExp(tokenList.map(({ token }) => `(${token})`).join('|'), 'gmu');

    function tokenize(text) {
        const tokens = [];
        let match;

        lexerRegex.lastIndex = 0;

        while (match = lexerRegex.exec(text)) {
            const value = match[0];
            const { id } = tokenList[match.indexOf(value, 1) - 1];

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
                if (tokenDict[token.id].precedence > tokenDict[stack[stack.length - 1].id].precedence) {
                    break;
                }

                result.push(stack.pop());
            }

            stack.push(token);
        }

        return [...result, ...stack.reverse()];
    }

    /* calculate RPN */

    function calculateRpn(tokens) {
        const stack = [];

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.id !== 'num') {
                if (stack.length < 2) {
                    throw Error('Incomplete expression')
                }
                token = { id: 'num', value: tokenDict[token.id].fn(stack.pop().value, stack.pop().value) };
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
            return makeResult(undefined, err.message);
        }

    }

})();
