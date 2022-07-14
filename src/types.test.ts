test('Need to be explicit about a tuple otherwise an array is assumed', () => {
    const a = [1, 'hi'];
    const b: [number, string] = [2, 'there'];
    function takesArray(arr: (string | number)[]): boolean {
        return true;
    }
    function takesTuple(tup: [number, string]): boolean {
        return true;
    }
    expect(takesArray(a)).toBe(true);
    expect(takesTuple(b)).toBe(true);
});

test('Function type annotations', () => {
    const toString = (num: number) => String(num);
    expect(toString(1)).toBe('1');
});

test('Return type void', () => {
    let counter = 1;
    // explicit
    const incCounter: () => void = () => {
        counter++;
    };
    // can be inferred
    const incCounter2 = () => {
        counter++;
    };
    // explicit void
    const r1: void = incCounter();
    // inferred void
    const r2 = incCounter2();
    expect(counter).toBe(3);
    expect(r1).toBeUndefined();
    expect(r2).toBeUndefined();
});

test('Optional parameters', () => {
    const f = (a: number, b?: number, c: number = 3) => {
        return a + (b ?? 2) + c;
    };
    expect(f(1)).toBe(6);
});

test('Rest parameters', () => {
    const f = (a: number, ...rest: number[]) => {
        return rest.reduce((acc, num) => acc + num, a);
    };
    expect(f(1, 2, 3)).toBe(6);
});

test('Union type', () => {
    const f = (a: string, b: string|number) => a + ' ' + String(b);
    expect(f('hi', 'there')).toBe('hi there');
    expect(f('hi', 5)).toBe('hi 5');
});

test('Null and undefined need to be explicity included in a type', () => {
    let str: string;
    // nope
    // v = undefined;
    let maybeStr: string|void;
    // equivalent to
    // let maybeStr: string|undefined;
    maybeStr = undefined;
    expect(maybeStr).toBeUndefined();
    // nope
    // maybeStr = null;
    let maybeMaybeStr: string|undefined|null;
    // nope
    // console.log(maybeMaybeStr);
    maybeMaybeStr = null;
    expect(maybeMaybeStr).toBeNull();
});

test('Null params may not be omitted from function call', () => {
    const f = (a?: number) => true;
    const g = (a: number|undefined) => true;
    expect(f()).toBe(true);
    // nope
    // expect(g()).toBe(true);
    expect(g(undefined)).toBe(true);
});

test('Object types are structural not nominal', () => {
    interface Point {
        x: number,
        y: number
    }
    const f = (p: Point) => `x: ${p.x}, y: ${p.y}`;
    const obj = {x: 1, y: 2};
    // obj has correct structure so is a Point
    expect(f(obj)).toBe('x: 1, y: 2');

    interface XY {
        x?: number,
        y?: number
    }
    // obj can structurally match any number of interfaces/types
    const g = (p: XY) => `x: ${p.x}, y: ${p.y}`;
    expect(g(obj)).toBe('x: 1, y: 2');
});

test('A class is also a type and matches structurally', () => {
    class Point {
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
        x: number;
        y: number;
    }
    const f = (p: Point) => `x: ${p.x}, y: ${p.y}`;
    const obj = {x: 1, y: 2};
    // obj has correct structure so is a Point
    expect(f(obj)).toBe('x: 1, y: 2');
    // Explicitly created from class also works
    const myPoint = new Point(1, 2);
    expect(f(myPoint)).toBe('x: 1, y: 2');
    // Object created from class still matches structurally
    interface XY {
        x?: number,
        y?: number
    }
    const g = (p: XY) => `x: ${p.x}, y: ${p.y}`;
    expect(g(myPoint)).toBe('x: 1, y: 2');
});

test('Generic function', () => {
    const f = function<T> (val: T) {
        return String(val);
    };
    // Each f is actually a different version of the function
    expect(f(1)).toBe('1');
    expect(f('hi')).toBe('hi');
    expect(f([1, 2, 3])).toBe('1,2,3');
});

test('Generic interface', () => {
    interface NumMaker<T> {
        toNum(thing: T): number;
    }
    const myNumMaker: NumMaker<number> = {
        toNum(thing: number) {
            return thing;
        }
    }
    const myOtherNumMaker: NumMaker<string> = {
        toNum(thing: string) {
            return Number(thing);
        }
    }
    expect(myNumMaker.toNum(1)).toBe(1);
    expect(myOtherNumMaker.toNum('1')).toBe(1);
})