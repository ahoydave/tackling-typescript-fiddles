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

test('String literal unions kind of like an enum', () => {
    type TOption1 = 'Yes' | 'No';
    enum EOption1 {
        Yes, No
    }
    type TOption2 = 'Yes' | 'No';
    enum EOption2 {
        Yes, No
    }

    // Not allowed because not one of the allowed values
    // const t1: TOption1 = 'Nope';

    // this is allowed because we're just dealing with strings
    const t1: TOption1 = 'Yes';
    const t2: TOption2 = t1;

    const e1: EOption1 = EOption1.Yes;
    // type checker doesn't allow this because they're different types
    // const e2: EOption2 = e1;
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

test('Adding sentinal value to a type', () => {
    const EOF = Symbol('EOF');
    expect(typeof EOF).toBe('symbol');
    type Line = string | typeof EOF;
    let l: Line = EOF;
    l = 'something else';
});

