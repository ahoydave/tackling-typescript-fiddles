test('Object vs object', () => {
    function f(obj1: Object, obj2: object) {
        // both are of type 'object' - this is true regardless of their prototype chain
        expect(typeof obj1).toBe('object');
        expect(typeof obj2).toBe('object');

        // type checking doesn't ensure the correct prototype - this can break at runtime
        expect(obj1 instanceof Object).toBe(true);
        expect(obj2 instanceof Object).toBe(true);

        // type checking doesn't ensure the correct prototype - can cause this to break
        expect(Object.getPrototypeOf(obj1)).toBe(Object.prototype);
        expect(Object.getPrototypeOf(obj2)).toBe(Object.prototype);

        expect(obj1.toString()).toBe('a');
        // object doesn't specify any properties but seems you can still use them
        expect(obj2.toString()).toBe('b');
    }

    // type checking doesn't seem to handle this well...
    // f(Object.create(null), Object.create(null));
    let a: Object = { toString() { return 'a' } };
    //this would not work because it conflicts with the Object interface
    // let a: Object = { toString() { return 'hello' } };
    let b: Object = { toString() { return 'b' } };
    f(a, b);

    // this passes type check but fails at runtime
    // f('hi', {});
    // the typeof is 'string' - runtime error

    // this gets caught by the typechecker
    // f('hi', 'there');
});