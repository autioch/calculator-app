// Naive test runner in the browser
function describe(describeLabel, tests, itFn) {
    console.group(describeLabel);

    const onlyTests = tests.some(testCase => testCase.only) ? tests.filter(testCase => testCase.only) : calculateTestCases;
    const testsToRun = onlyTests.filter(testCase => !testCase.skip);

    testsToRun.forEach((testCase, index) => {
        console.log(index, testCase.description);

        try {
            itFn(testCase);
        } catch (err) {
            console.assert(false, 'Unexpected error %o', err.message)
        }
    });

    console.groupEnd();
}

document.addEventListener('DOMContentLoaded', () => {
    describe('tokenize', calculateTestCases, (testCase) => {
        const { input, tokens, errorTokenCount =0 } = testCase;
        const output = calculator.tokenize(input)
        const values = output.map((token) => token.value);

        console.assert(output.filter(token => token.id == 'err').length === errorTokenCount, 'Expected no error tokens', output);
        console.assert(Object.is(tokens.join(','), values.join(',')), 'Expected result %o to equal %o', values, tokens);
    });

    // describe('calculate', calculateTestCases, (testCase) => {
    //     const { input, result, errorMessage } = testCase;
    //     const output = calculator.run(input);

    //     console.assert(Object.is(result, output.result), 'Expected result %o to equal %o', result, output.result);
    //     console.assert(Object.is(errorMessage, output.message), 'Expected message %o to equal %o', errorMessage, output.message);
    // });
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
        errorMessage: '',
        tokens: ['-', '3']
    },
    {
        description: 'Add two positive integers',
        input: '2 + 1',
        result: 3,
        errorMessage: '',
        tokens: ['2', '+', '1']
    },
    {
        description: 'Substract two positive integers',
        input: '2 - 2',
        result: 0,
        errorMessage: '',
        tokens: ['2', '-', '2']
    },
    {
        description: 'Multiply two positive integers',
        input: '3 * 2',
        result: 6,
        errorMessage: '',
        tokens: ['3', '*', '2']
    },
    {
        description: 'Divide two positive integers',
        input: '4 / 2',
        result: 2,
        errorMessage: '',
        tokens: ['4', '/', '2']
    },
    {
        description: 'Exponent two positive integers',
        input: '5 ^ 2',
        result: 25,
        errorMessage: '',
        tokens: ['5', '^', '2']
    },
    // edge cases
    {
        description: 'Scientific notation',
        input: '2e3',
        result: 2000,
        errorMessage: '',
        tokens: ['2e3']
    },
    {
        description: 'Scientific notation operations',
        input: '1e3 + 1e4 - 1e2',
        result: 10900,
        errorMessage: '',
        tokens: ['1e3', '+', '1e4', '-', '1e2']
    },
    {
        description: 'Division by zero',
        input: '5 / 0',
        result: undefined,
        errorMessage: `Can't divide by zero`,
        tokens: ['5', '/', '0']
    },
    {
        description: 'Division by zero in complex expression',
        input: '2 * 2 / 0 ** 2',
        result: undefined,
        errorMessage: `Can't divide by zero`,
        tokens: ['2', '*', '2', '/', '0', '**', '2']
    },
    {
        description: 'Multiply by zero',
        input: '5*0',
        result: 0,
        errorMessage: '',
        tokens: ['5', '*', '0']
    },
    {
        description: 'Multiply other char',
        input: '2×2',
        result: 4,
        errorMessage: '',
        tokens: ['2', '×', '2']
    },
    {
        description: 'Divide other char',
        input: '2÷2',
        result: 1,
        errorMessage: '',
        tokens: ['2', '÷', '2']
    },
    {
        description: 'Add decimals',
        input: '0.1 + 0.2',
        result: 0.3,
        errorMessage: '',
        tokens: ['0.1', '+', '0.2']
    },
    {
        description: 'Add alternative decimals',
        input: '0,1 + 0,2',
        result: 0.3,
        errorMessage: '',
        tokens: ['0,1', '+', '0,2']
    },
    {
        description: 'Add alternative decimals',
        input: '/',
        result: undefined,
        errorMessage: 'Incomplete expression',
        tokens: ['/']
    },
    {
        description: 'Long numbers resulting in Infinity',
        input: `
        111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
        *
        1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
        `,
        result: undefined,
        errorMessage: 'Range exceeded',
        tokens: [
            '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
            '*',
            '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
        ]
    },
    // exponent totals
    {
        description: 'Exponent negative total base',
        input: '-2^3',
        result: -8,
        errorMessage: '',
        tokens: ['-', '2', '^', '3']
    },
    {
        description: 'Exponent negative total power',
        input: '2^-3',
        result: 0.125,
        errorMessage: '',
        tokens: ['2', '^', '-', '3']
    },
    {
        description: 'Exponent both total negative',
        input: '-2^-3',
        result: -0.125,
        errorMessage: '',
        tokens: ['-', '2', '^', '-', '3']
    },
    // exponent zeros
    {
        description: 'Exponent zeros',
        input: '0^0',
        result: 1,
        errorMessage: '',
        tokens: ['0', '^', '0']
    },
    {
        description: 'Exponent zero power',
        input: '10^0',
        result: 1,
        errorMessage: '',
        tokens: ['10', '^', '0']
    },
    {
        description: 'Exponent zero base',
        input: '0^10',
        result: 0,
        errorMessage: '',
        tokens: ['0', '^', '10']
    },
    // exponent decimals
    {
        description: 'Exponent half none',
        input: '2.5^3.5',
        result: 24.70529,
        errorMessage: '',
        tokens: ['2.5', '^', '3.5']
    },
    {
        description: 'Exponent half power',
        input: '2.5^0.5',
        result: 1.58114,
        errorMessage: '',
        tokens: ['2.5', '^', '0.5']
    },
    {
        description: 'Exponent half base',
        input: '0.5^3.5',
        result: 0.08839,
        errorMessage: '',
        tokens: ['0.5', '^', '3.5']
    },
    {
        description: 'Exponent half both',
        input: '0.5^0.5',
        result: 0.70711,
        errorMessage: '',
        tokens: ['0.5', '^', '0.5']
    },
    // exponent negative halves
    {
        description: 'Exponent negative half power',
        input: '-0.5^0.5',
        result: undefined,
        errorMessage: 'Impossible exponentiation',
        tokens: ['-', '0.5', '^', '0.5']
    },
    {
        description: 'Exponent negative half base',
        input: '0.5^-0.5',
        result: 1.41421,
        errorMessage: '',
        tokens: ['0.5', '^', '-', '0.5']
    },
    {
        description: 'Exponent negative half both',
        input: '-0.5^-0.5',
        result: undefined,
        errorMessage: 'Impossible exponentiation',
        tokens: ['-', '0.5', '^', '-', '0.5']
    },

    // operator precedence
    {
        description: 'Multiply before adding',
        input: '2 + 2 * 2',
        result: 6,
        errorMessage: '',
        tokens: ['2', '+', '2', '*', '2']
    },
    {
        description: 'Divide before substracting',
        input: '2 - 2 / 2',
        result: 1,
        errorMessage: '',
        tokens: ['2', '-', '2', '/', '2']
    },
    {
        description: 'Add and substract in order',
        input: '2 - 2 + 2',
        result: 2,
        errorMessage: '',
        tokens: ['2', '-', '2', '+', '2']
    },
    {
        description: 'Multiply and divide in order',
        input: '2 * 2 / 2',
        result: 2,
        errorMessage: '',
        tokens: ['2', '*', '2', '/', '2']
    },
    {
        description: 'Exponent before multiply',
        input: '2 * 2 ^ 3',
        result: 16,
        errorMessage: '',
        tokens: ['2', '*', '2', '^', '3']
    },
    //complex
    {
        description: 'All operations',
        input: '3-4*2/4^2+1.5',
        result: 4,
        errorMessage: '',
        tokens: ['3', '-', '4', '*', '2', '/', '4', '^', '2', '+', '1.5']
    },
    {
        description: 'Extra spaces',
        input: '               3      -       4    *   2  /  4  ^   2    +    1.5',
        result: 4,
        errorMessage: '',
        tokens: ['3', '-', '4', '*', '2', '/', '4', '^', '2', '+', '1.5']
    },
    {
        description: 'Many additions',
        input: new Array(1000).fill(null).map((_, index) => index).join(' + '),
        result: 499500,
        errorMessage: '',
        tokens: new Array(1000).fill(null).map((_, index) => index).join(' + ').split(' ')
    },
    // invalid
    {
        description: 'Letters',
        input: 'a',
        result: undefined,
        errorMessage: 'Remove invalid characters',
        tokens: ['a'],
        errorTokenCount: 1
    },
    {
        description: 'XSS',
        input: `alert('oopsie')`,
        result: undefined,
        errorMessage: 'Remove invalid characters',
        tokens: ['a', 'l', 'e', 'r', 't', '(', '\'', 'o', 'o', 'p', 's', 'i', 'e', '\'', ')'],
        errorTokenCount: `alert('oopsie')`.length
    },
    {
        description: 'Incomplete',
        input: '2 + ',
        result: undefined,
        errorMessage: 'Incomplete expression',
        tokens: ['2', '+']
    },
]
