test('Enum with initializers - can be number or string', () => {
    enum Options {
        Yes = 1,
        No = 'no', // can have trailing comma
    }
    expect(Options.No).toBe('no');
    expect(Options.Yes).toBe(1);
});

test('Enum without initializers use incremented numbers', () => {
    enum Things {
        A = 3,
        B,
        C
    }
    expect(Things.A).toBe(3);
    expect(Things.B).toBe(4);
    expect(Things.C).toBe(5);
});

test('Can quote the name of Enums', () => {
    enum Options {
        'One',
        'Two'
    }
    expect(Options['One']).toBe(0);
    expect(Options['Two']).toBe(1);
});

test('Numeric values of an enum computed at runtime', () => {
    const r = Math.random();
    enum MyEnum {
        'First' = r,
        'Second' = 0
    }
    expect(MyEnum.First).toBe(r);
    expect(MyEnum.Second).toBe(0);
});

test('Type checking treats numeric enums as numbers', () => {
    enum MyEnum { No, Yes }
    function f(x: MyEnum) {}
    f(90); // no type error
});

test('Type checking for string enums much stricter (better)', () => {
    enum MyEnum { No='No', Yes='Yes' }
    function f(x: MyEnum) {}
    // f('hi') // nope
    // f('No') // nope
    f(MyEnum.No);
});

test('Enums are like objects', () => {
    enum NoYes {
        No = 'No',
        Yes = 'Yes'
    }
    function f(obj: { No: string }) {
        return obj.No;
    }
    expect(f(NoYes)).toBe('No');
});

test('Exhaustiveness check for enum values', () => {
    enum Option {
        A, B, C
    }
    function f(o: Option): string {
        switch(o) {
            case Option.A: return 'a';
            case Option.B: return 'b';
            // error unless this line is also included
            case Option.C: return 'c';
            // Compiler knows that this switch statement is now exhaustive
        }
    }
    expect(f(Option.A)).toBe('a');
    expect(f(Option.C)).not.toBeUndefined();
})