test('Union type', () => {
    type ErroredNum = 'error' | number;
    function f(n: ErroredNum) {
        // can't do this
        // return n + 1;
        if (typeof n === 'number') {
            // now can do this - compiler knows it is a number
            return n + 1;
        }
    }
});

test('Discriminated unions', () => {
    // discriminant is the shared property
    type ErroredNum = { state: 'errored', message: string } | { state: 'no error', value: number }
    function f(n: ErroredNum): string {
        // can't do this - don't know it has this property
        // return n.value

        // can use any shared properties to discriminate
        switch (n.state) {
            case 'errored': return n.message;
            case 'no error': return String(n.value);
        }
    }
    // note no exhaustiveness check

    // get nice type hints for f
    expect(f({
        state: 'errored',
        message: 'hi'
    })).toBe('hi');
    expect(f({
        state: 'no error',
        value: 10
    })).toBe('10');
});

