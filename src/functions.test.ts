test('Functions vs methods', () => {
    class Eg {
        getMessage() { return this.message; }
        getMessage2 = () => this.message
        constructor(private message: string) { }
    }
    expect(Object.getOwnPropertyNames(Eg.prototype)).toContain('constructor')
    expect(Object.getOwnPropertyNames(Eg.prototype)).toContain('getMessage');
    // Surprised by this - it's not a prop of the prototype?
    expect(Object.getOwnPropertyNames(Eg.prototype)).not.toContain('getMessage2');

    const x = new Eg('original');

    // arrow function is added to final object directly on construction?
    expect(Object.getOwnPropertyNames(x)).toContain('getMessage2');
    expect(Object.getOwnPropertyNames(x)).not.toContain('getMessage');

    // both still work the same
    expect(x.getMessage()).toBe('original');
    expect(x.getMessage2()).toBe('original');

    // Method is just a function attached to object's prototype
    Eg.prototype.getMessage = () => 'extra';
    expect(x.getMessage()).toBe('extra');
    // buuuuut getMessage2 isn't on the prototype so changing it does nothing - makes sense
    Eg.prototype.getMessage2 = () => 'extra2';
    expect(x.getMessage2()).toBe('original');
    // would have to change the method on the final object
    x.getMessage2 = () => 'extra2';
    expect(x.getMessage2()).toBe('extra2');
});

test('Typing a function', () => {
    // type the variable
    const f1: (n: number) => number = (n) => n + 1;
    // type the arrow function def
    const f2 = (n: number): number => n + 2;
    // type the function def
    const f3 = function (n: number): number { return n + 3; };

    // can use these like so
    interface Eg {
        m1(n: number): number
        m2: (n: number) => number
        // the interface can also have a call signature
        (n: number): number
    }
});

test('More crazy function typing', () => {
    type StringPredicate = {
        (str: string): boolean
    }

    //equiv to
    type StringPred2 = (str: string) => boolean

    // using it - type inference does some work for us
    const pred1: StringPredicate = function (str) { return str.length > 0 };

    // can use Paramters and ReturnType to extract these from a type
    const pred2: StringPredicate = function (...[str]: Parameters<StringPredicate>)
        : ReturnType<StringPredicate> {
        return str.length > 0;
    }
});

test('Typing rest paramters', () => {
    // can type rest params as tuple
    function f1(...[s1, n1]: [string, number]): string { return s1 + n1; }
    expect(f1('hi ', 1)).toBe('hi 1');
    // this is a type error
    // f1('hi');

    // can also type as arr
    function f2(...[s1, s2]: string[]): string { return s1 + s2; }
    expect(f2('hi ', 'there')).toBe('hi there');
    // though we're destructuring and using only the first 2 elems
    expect(f2('hi ', 'there', 'ignored')).toBe('hi there');
});

test('Typing named parameters', () => {
    function f({ str, num = 1, num2 = 2 }: // this is the desctructuring
        { str: string, num: number, num2?: number }): string { // this is the typing
        return str + num + num2;
    }
    // can't do this - Property 'num' is missing in type
    // expect(f({ str: 'hi' })).toBe('hi12');
    // also doesn't work - Type 'undefined' is not assignable to type 'number'
    // expect(f({ str: 'hi', num: undefined })).toBe('hi12');
    // the value for num is pretty useless
    expect(f({ str: 'hi', num: 3 })).toBe('hi32');
});

test('Typing the \'this\' parameter', () => {
    interface Eg {
        prop: number
    }
    function f(this: Eg, num: number): number {
        return this.prop + num;
    }
    expect(f.call({ prop: 1 }, 2)).toBe(3);

    // can use this to help make sure we don't mess up using 'this'
    class EgClass {
        constructor(public prop: number) {}
        f(this: EgClass, num: number): number {
            return this.prop + num;
        }
    }
    const x = new EgClass(1);
    expect(x.f(2)).toBe(3);
    const ff = x.f;
    // Error - The 'this' context of type 'void' is not assignable to method's 'this' of type 'EgClass'
    // ff(2);
});

test('Overloading functions with different types', () => {
    // to add either two numbers or an array of numbers
    function f(x: number | number[], y?: number) {
        if (x instanceof Array) {
            return x.reduce((a, b) => a + b, 0);
        }
        return x + (y ?? 0);
    }
    expect(f(1, 2)).toBe(3);
    expect(f([1, 2, 3])).toBe(6);
    // But this is allowed which doesn't quite make sense
    expect(f([1, 2, 3], 4)).toBe(6);

    // Can add overloaded function signatures
    function g(x: number, y: number): number;
    function g(nums: number[]): number;
    // Same implementation
    function g(x: number | number[], y?: number) {
        if (x instanceof Array) {
            return x.reduce((a, b) => a + b, 0);
        }
        return x + (y ?? 0);
    }
    expect(g(2, 3)).toBe(5);
    expect(g([2, 3, 4])).toBe(9);
    // Type Error - Argument of type 'number[]' is not assignable to parameter of type 'number'
    // f([1, 2, 3], 4);
});

test('Overloading in interface defs', () => {
    interface Eg {
        (arr: number[]): number
        (x: number, y: number): number
    }
    const f: Eg = (x: number | number[], y?: number) => {
        if (x instanceof Array) {
            return x.reduce((a, b) => a + b, 0);
        }
        return x + (y ?? 0);
    }
    expect(f([1, 2])).toBe(3);
    expect(f(1, 2)).toBe(3);
    // Type Error - Argument of type 'number[]' is not assignable to parameter of type 'number'
    // f([1, 2, 3], 4);
});

test('When is assignment allowed', () => {
    // here x of left must at least fulfil x of right and return of right must at least fulfil return of left
    // this is fine because RegExp has all properties of Object (since it inherits from it)
    const f1: (x: RegExp) => Object = (x: Object) => /abc/;

    // The above relies on the types generated by Class defs, not the Classes themselves
    interface EgBase {
        prop1: number
    }
    interface EgSpecific extends EgBase {
        prop2: number
    }
    const f2: (x: EgSpecific) => EgBase = (x: EgBase) => ({...x, prop2: 5});
});

test('void return type can be assigned to anything', () => {
    function f(num: number): number { return num ;}
    const x: (num: number) => void = f;
});

test('Function type can have more params than function assigned to it', () => {
    const f: (num: number) => number = () => 1;
    // I guess this is because javascript is permissive with additional params
});