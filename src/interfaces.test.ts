test('Additional interfact definitions are combined', () => {
    interface MyInterface {
        prop1: number
    }
    interface MyInterface {
        prop2: number
    }
    interface MyInterface {
        // can't change the type of a member
        // prop1: string

        // can repeat them, though
        prop1: number,
        prop3: string
    }
    function f(x: MyInterface) {
        return [x.prop1, x.prop2, x.prop3];
    }
    expect(f({
        prop1: 1, prop2: 2, prop3: 'hi'
    })).toEqual([1, 2, 'hi']);
});

test('Mapped types', () => {
    interface Point {
        x: number,
        y: number
    }
    // not sure what is going on here. See https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types
    type PointCopy = {
        [Key in keyof Point]: Point[Key];
    };
    let a: Point = { x: 1, y: 1 };
    let b: PointCopy = { x: 2, y: 2 }
});

test('Interface with a call member', () => {
    interface UnaryNumberOp {
        (num: number): number
    }
    function f(op: UnaryNumberOp) {
        return op(1);
    }
    expect(f(x => x + 1)).toBe(2);
});

test('Interface with method/function member', () => {
    interface HasFunction {
        callMe(num: number): number
    }
    interface HasMethod {
        callMe: (num: number) => number
    }
    let o1: HasFunction = { callMe: (num: number) => 1 }
    let o2 = o1;
    function f(obj: HasMethod) {
        return obj.callMe(5);
    }
    expect(f(o2)).toBe(1);
});

test('Interface with string index member', () => {
    interface MyLookup {
        [key: string]: string
    }
    function doLookup(dict: MyLookup, key: string) {
        return dict[key];
    }
    const person: MyLookup = {
        'firstname': 'Hulk',
        'lastname': 'Hogan'
    };
    expect(doLookup(person, 'firstname')).toBe('Hulk');
    expect(Object.keys(person)).toEqual(['firstname', 'lastname']);
});

test('An array like interface', () => {
    interface MyArray {
        [i: number]: string
    }
    interface MyIterable extends Iterable<string> {
        [i: number]: string
    }
    let arr2: MyIterable = ['a', 'b', 'c'];
    let arr: MyArray = arr2;
    // note can't do this the other way around

    // can't do this because MyArray doesn't have the props of the iterator interface
    // expect([...arr]).toEqual(['a', 'b', 'c']);
    expect([...arr2]).toEqual(['a', 'b', 'c']);
});

test('Interface with multiple index signatures and other props', () => {
    interface I1 {
        [k: string]: string,
        // once there is an index signature, all props need to return the same (super) type
        [i: number]: string,
        name: string,
        // doesn't work
        // value: number
        value: string,
        // seems like call signatures don't need to obey this?
        (o: object): number
    }
});

test('Extra properties allowed sometimes', () => {
    interface XY {
        x: number,
        y: number
    }
    function f(p: XY) {
        return p.x + p.y;
    }
    const o = { x: 1, y: 1, z: 1 };
    expect(f({ x: 1, y: 1 })).toBe(2);
    // type error here
    // expect(f({x: 1, y: 1, z: 1})).toBe(2);
    expect(f(o)).toBe(2);
});

test('Empty interfaces allow any excess properties', () => {
    interface NoProps { }
    interface OneProp {
        prop: string
    }
    // this is fine
    let x: NoProps = { a: 1, b: 2 };
    // this is not - object literals are strict to catch typos
    // let y: OneProp = { prop: 'nope', a: 1, b: 2 };
    // but can do
    function f(obj: OneProp): string {
        return obj.prop;
    }
    let y = { prop: 'ok', a: 1, b: 2 };
    // not an object literal so assumed there won't be a typo
    expect(f(y)).toBe('ok');
});

test('Object with explicitly no properties', () => {
    interface ReallyNoProps {
        [key: string]: never
    }
    //this works
    let x: ReallyNoProps = {}
    // this does not
    // let y: ReallyNoProps = { a: 1 }
    // and neither does this
    function f(obj: ReallyNoProps) { return 'nope'; }
    let y = { prop: 1 };
    // Error Argument of type '{ prop: number; }' is not assignable to parameter of type 'ReallyNoProps'
    // f(y);
    expect(f({})).toBe('nope');
});

test('Allowing additional properties in an object', () => {
    interface HasProp { prop: string }
    // error: Type '{ prop: string; a: number; }' is not assignable to type 'HasProp'.
    // let x: HasProp = { prop: 'hi', a: 1 };
    let y = { prop: 'hi', a: 1 }
    let x = y;  // fine because intermediate variable used but x is not of type HasProp now
    let z: HasProp = { prop: 'hi', a: 1 } as HasProp; // fine but now type system won't let you access 'a'

    function f1<T extends HasProp>(obj: T): string {
        return obj.prop;
    }
    f1({ prop: 'hi', a: 1 }); // fine because literal extends HasProp

    interface HasPropPlus {
        prop: string,
        [key: string]: any
    }
    let xx: HasPropPlus = { prop: 'hi', a: 1 }; // fine because we're explicitly adding any prop
    function f2(obj: HasPropPlus) {
        return obj.a; // This is dangerous because now there is no type checking
    }
});

test('Problem where we want excess properties', () => {
    interface Incrementor { inc(): number }

    // Error: Type '{ counter: number; inc(): number; }' is not assignable to type 'Incrementor'.
    // function makeIncrementor(start: number): Incrementor {
    //     return {
    //         counter: start,
    //         inc() {
    //             return ++this.counter;
    //         }
    //     }
    // }

    // Can't do this because T is controlled by the caller so doesn't have to have 'counter'
    // function makeIncrementor2<T extends Incrementor>(start: number): T {
    //     return {
    //         counter: start,
    //         inc() {
    //             return ++this.counter;
    //         }
    //     };
    // }

    // but using an intermediate variable works fine
    function makeIncrementor3(start: number): Incrementor {
        const incrementor = {
            counter: start,
            inc() {
                return ++this.counter;
            }
        }
        return incrementor;
    }
    expect(makeIncrementor3(2).inc()).toBe(3);
});

test('Optional properties', () => {
    interface Eg {
        required: number,
        optional?: number,
        maybe: undefined | number
    }
    let x: Eg = { required: 1, optional: 2, maybe: 3 };
    let xx: Eg = { required: 1, optional: undefined, maybe: undefined }; // optionals can be undefined
    let y: Eg = { required: 1, maybe: 3 }; //optionals can be left out entirely
    // Error: Property 'maybe' is missing in type '{ required: number; }' but required in type 'Eg'
    // let z: Eg = { required: 1 }
});

test('Readonly props', () => {
    interface Eg {
        readonly prop1: number,
        prop2: number
    }
    let x: Eg = { prop1: 1, prop2: 2 }
    // can read both
    expect(x.prop1).toBe(1);
    expect(x.prop2).toBe(2);

    // Error: Cannot assign to 'prop1' because it is a read-only property
    // x.prop1 = 3;
    x.prop2 = 4;
});

test('Inherited properties and types', () => {
    interface Eg {
        prop: number,
        toString(): string
    }
    let x: Eg = { prop: 1, toString() { return 'hi'; }};
    let y: Eg = { prop: 1 }; // also fine because toString is inherited
    let z: Eg = Object.create(null); // kinda weird that this works - guess it is because 'any' type returned
    expect(z.prop).toBeUndefined();
});

test('Checking if obj implements an interface', () => {
    // Does this even make sense since this would be a runtime check?
    interface Eg1 {
        prop1: number
    }
    interface Eg2 {
        prop2: number
    }

    function f(arg: Eg1 | Eg2): number {
        // can't do this - type system complains
        // return arg.prop1 ?? arg.prop2 ?? 0;

        // this is unrelated to the type system - working at runtime
        if ('prop1' in arg) {
            return arg.prop1;
        } else if ('prop2' in arg) {
            return arg.prop2;
        }
        return 0;
    }
    expect(f({ prop1: 1 })).toBe(1);
    expect(f({ prop2: 2 })).toBe(2);
})