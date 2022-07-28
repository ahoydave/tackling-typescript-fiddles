test('Asserting a type', () => {
    interface Eg1 {
        prop1: number;
    }
    const x: Object = { prop1: 5 };

    // this gives a type error
    // expect(x.prop1).toBe(5);

    expect((x as Eg1).prop1).toBe(5);
});

test('Revisit the checking for interface match problem', () => {
    interface Eg1 { prop1: number }
    interface Eg2 { prop2: number }

    function f(x: Eg1 | Eg2): number {
        // have to assert as each type. At runtime will be undefined if doesn't exist
        // note this is removing the safety of the type system
        return (x as Eg1).prop1 ?? (x as Eg2).prop2 ?? 0;
    }

    expect(f({ prop1: 1 })).toBe(1);
    expect(f({ prop2: 2 })).toBe(2);
});

test('Outdated alternative syntax for type assertions', () => {
    interface Eg1 { prop: number }
    const x: object = { prop: 1 };
    expect((<Eg1>x).prop).toBe(1);
});

test('Inline interface definitions for asserting', () => {
    const x: object = { prop: 1 };
    expect((x as { prop: number }).prop).toBe(1);
});

test('Non-nullish assertion', () => {
    function f(x: undefined | number): number { return x! }
    expect(f(1)).toBe(1);
    // the type system doesn't think this should happen but we've switched off the check
    expect(f(undefined)).toBeUndefined();
});

test('Definite assignment assertions', () => {
    // class Eg1 {
    //     // Error - Property 'prop' has no initializer and is not definitely assigned in the constructor
    //     prop: number;
    //     constructor() { this.init(); }
    //     init() { this.prop = 1; }
    // }

    // use ! which is definite assignment assertion
    class Eg1 {
        // Error - Property 'prop' has no initializer and is not definitely assigned in the constructor
        prop!: number;
        constructor() { this.init(); }
        init() { this.prop = 1; }
    }
});

test('Narrowing with type guards', () => {
    class EgClass { constructor(public prop1: number) { } }
    interface EgInt { prop2: number }
    
    function f(x: number | EgClass | EgInt): string {
        if (x instanceof EgClass) {
            // now type is narrowed to EgClass
            return x.prop1 + ' from class';
        } else if (typeof x === 'number') {
            // now type is narrowed to number
            return x + ' from number';
        } else if ('prop2' in x) {
            return x.prop2 + ' from interface';
        }
        throw new Error('Unsupported type');
    }

    expect(f(1)).toBe('1 from number');
    // Nope - instanceof checks against EgClass class, not EgClass interface
    // expect(f({ prop1: 2 })).toBe('2 from interface');
    expect(f({ prop2: 2 })).toBe('2 from interface');
    expect(f(new EgClass(3))).toBe('3 from class');
});

test('Discriminated unions for narrowing', () => {
    type StringScore = { kind: 'StringScore', stars: string }
    type NumScore = { kind: 'NumScore', score: number }
    type Score = StringScore | NumScore;

    const getScore = (score: Score): number => {
        if (score.kind === 'StringScore') {
            return score.stars.length;
        }
        // getting here narrows to NumScore
        return score.score;
    }

    expect(getScore({ kind: 'StringScore', stars: '***' })).toBe(3);
    expect(getScore({ kind: 'NumScore', score: 5})).toBe(5);
});

test('Narrowing isn\'t closed over - lost in callbacks', () => {
    function f(x: { prop?: string }) {
        if (x.prop !== undefined) {
            // x narrowed to string here
            const y: string = x.prop;

            // Type Error - Type '(string | undefined)[]' is not assignable to type 'string[]'
            // const z: string[] = [ 0 ].map(item => x.prop);
        }
    }
});

test('Using util type NonNullable', () => {
    type Eg = string | undefined | null;
    type EquivToString = NonNullable<Eg>;
    // can't do
    // const x: EquivToString = undefined;
});

test('User defined type guard', () => {
    // filter doesn't always narrow
    // Type Error: Type '(number | null)[]' is not assignable to type 'number[]'
    // const arr2: number[] = [1, null].filter(x => x !== undefined);

    // Take this fn
    function notNullish<T>(x: T): boolean {
        return x !== null && x !== undefined;
    }
    expect(notNullish(null)).toBe(false);
    expect(notNullish({ a: 1 })).toBe(true);

    // with filter it still doesn't work as a type guard
    // Error - Type '(number | null)[]' is not assignable to type 'number[]'.
    // const arr2: number[] = [1, null].filter(notNullish)

    // BUT tell the compiler that it is a type guard and then it works
    function notNullish2<T>(x: T): x is NonNullable<T> {
        return x !== null && x !== undefined;
    }
    const arr2: number[] = [1, null].filter(notNullish2);
    expect(arr2).toEqual([1]);
});

test('User defined type guards can be implemented incorrectly', () => {
    function isString(x: any): x is string {
        return true;
    }

    // type system thinks this is fine
    const arr: string[] = [1, 2, 'hi'].filter(isString);
    const s: string = arr[0];
    expect(s).toBe(1);  // oh dear
});

test('Implementing typeof check', () => {
    function isTypeOf(value: any, typeString: 'number'): value is number;
    function isTypeOf(value: any, typeString: 'string'): value is string;
    function isTypeOf(value: any, typeString: 'boolean'): value is boolean;
    function isTypeOf(value: any, typeString: string): boolean {
        return typeof value === typeString;
    }
    expect(isTypeOf('hi', 'string')).toBe(true);
    expect(isTypeOf(1, 'string')).toBe(false);
    expect(isTypeOf(1, 'number')).toBe(true);
});

test('Narrowing by user defined assertion functions', () => {
    interface Eg { prop: number }

    // a poorly implemented assertion function
    function assertIsEg(obj: object): asserts obj is Eg {}

    const x = {}
    assertIsEg(x);

    // type system misses this because it believes the assertion function
    expect(x.prop).toBeUndefined();
})