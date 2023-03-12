// Naive test runner in the browser
document.addEventListener('DOMContentLoaded', () => {

    console.group('calculate');

    const onlyTests = calculateTestCases.some(testCase => testCase.only) ? calculateTestCases.filter(testCase => testCase.only): calculateTestCases;
    const testsToRun = onlyTests.filter(testCase => !testCase.skip);

    testsToRun.forEach((testCase, index) => {
        const { description, input, result, errorMessage } = testCase;

        console.log(index, description);

        let output;

        try {
            output = calculate(input);
        } catch (err) {
            output = {
                result: NaN,
                errorMessage: err.errorMessage
            }
        }

        console.assert(Object.is(result, output.result), 'Expected result %o to equal %o', result, output.result);
        console.assert(Object.is(errorMessage, output.errorMessage), 'Expected errorMessage %o to equal %o', errorMessage, output.errorMessage);


    });

    console.groupEnd();
});

// easier test scoping
const skip = true;
const only = true;

const calculateTestCases = [
    // basic operations
    {
        description: 'Negative value',
        input: '-3',
        result: -3,
        errorMessage: ''
    },
    {
        description: 'Add two positive integers',
        input: '2 + 1',
        result: 3,
        errorMessage: ''
    },
    {
        description: 'Substract two positive integers',
        input: '2 - 2',
        result: 0,
        errorMessage: ''
    },
    {
        description: 'Multiply two positive integers',
        input: '3 * 2',
        result: 6,
        errorMessage: ''
    },
    {
        description: 'Divide two positive integers',
        input: '4 / 2',
        result: 2,
        errorMessage: ''
    },
    {
        description: 'Exponent two positive integers',
        input: '5 ^ 2',
        result: 25,
        errorMessage: '',
    },
    // edge cases
    {
        description: 'Scientific notation',
        input: '2e3',
        result: 2000,
        errorMessage: ''
    },
    {
        description: 'Scientific notation operations',
        input: '1e3 + 1e4 - 1e2',
        result: 10900,
        errorMessage: ''
    },
    {
        description: 'Division by zero',
        input: '5 / 0',
        result: Infinity,
        errorMessage: '',// 'Invalid operation - division by zero'
    },
    {
        description: 'Multiply by zero',
        input: '5*0',
        result: 0,
        errorMessage: ''
    },
    {
        description: 'Add decimals',
        input: '0.1 + 0.2',
        result: 0.3,
        errorMessage: ''
    },
    {
        description: 'Add alternative decimals',
        input: '0,1 + 0,2',
        result: 0.3,
        errorMessage: ''
    },
    {
        description: 'Long numbers resulting in Infinity',
        input: `
        111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
        *
        1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
        `,
        result: Infinity,
        errorMessage: '',
    },
    {
        description: 'Exponent negative base',
        input: '-2^3',
        result: -8,
        errorMessage: '',
        skip // 'Unary operator used immediately before exponentiation expression. Parenthesis must be used to disambiguate operator precedence'
    },
    {
        description: 'Exponent negative power',
        input: '2^-3',
        result: 0.125,
        errorMessage: ''
    },
    {
        description: 'Exponent both negative',
        input: '-2^-3',
        result: -8,
        errorMessage: '',
        skip // 'Unary operator used immediately before exponentiation expression. Parenthesis must be used to disambiguate operator precedence'
    },
    {
        description: 'Exponent decimals',
        input: '2.5^3.5',
        result: 24.70529,
        errorMessage: ''
    },
    {
        description: 'Exponent negative decimals',
        input: '-2.5^-3.5',
        result: -8,
        errorMessage: '',
        skip // 'Unary operator used immediately before exponentiation expression. Parenthesis must be used to disambiguate operator precedence'
    },
    // operator precedence
    {
        description: 'Multiply before adding',
        input: '2 + 2 * 2',
        result: 6,
        errorMessage: ''
    },
    {
        description: 'Divide before substracting',
        input: '2 - 2 / 2',
        result: 1,
        errorMessage: ''
    },
    {
        description: 'Add and substract in order',
        input: '2 - 2 + 2',
        result: 2,
        errorMessage: ''
    },
    {
        description: 'Multiply and divide in order',
        input: '2 * 2 / 2',
        result: 2,
        errorMessage: ''
    },
    {
        description: 'Exponent before multiply',
        input: '2 * 2 ^ 3',
        result: 16,
        errorMessage: ''
    },
    //complex
    {
        description: 'All operations',
        input: '3-4*2/4^2+1.5',
        result: 4,
        errorMessage: ''
    },
    {
        description: 'Extra spaces',
        input: '               3      -       4    *   2  /  4  ^   2    +    1.5',
        result: 4,
        errorMessage: ''
    },
    {
        description: 'Many additions',
        input: new Array(1000).fill(null).map((_, index) => index).join(' + '),
        result: 499500,
        errorMessage: ''
    },
    // invalid
    {
        description: 'Letters',
        input: 'a',
        result: NaN,
        errorMessage: 'Invalid expression'
    },
    {
        description: 'XSS',
        input: `alert('oopsie')`,
        result: NaN,
        errorMessage: 'Invalid expression'
    },
    {
        description: 'Incomplete',
        input: '2 + ',
        result: NaN,
        errorMessage: 'Unexpected end of input'
    },
]
