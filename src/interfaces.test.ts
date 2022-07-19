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

test('When are extra properties allowed', () => {
    interface XY {
        x: number,
        y: number
    }
    function f(p: XY) {
        return p.x + p.y;
    }
    const o = { x: 1, y: 1, z: 1 };
    expect(f({x: 1, y: 1})).toBe(2);
    // type error here
    // expect(f({x: 1, y: 1, z: 1})).toBe(2);
    expect(f(o)).toBe(2);
})