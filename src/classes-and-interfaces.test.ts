test('Class implementing an interface', () => {
    interface EgInterface {
        prop: number
        sayHi(): 'hi'
    }
    // get nice type errors if we don't implement it properly
    class EgClass implements EgInterface {
        prop: number = 1
        sayHi(): 'hi' {
            return 'hi'
        }
    }
    // don't have to do it though
    class EgClass2 {
        prop: number = 2
        sayHi(): 'hi' {
            return 'hi'
        }
    }
    function f(thing: EgInterface): string {
        return thing.sayHi();
    }
    // type system knows that the class contains
    expect(f(new EgClass())).toBe('hi');
    // also fine since interface matching is structural
    expect(f(new EgClass2())).toBe('hi');
    // can also use obj literal
    expect(f({
        prop: 5,
        // this gives a type error - pretty smart
        // sayHi: () => 'hii'
        sayHi: () => 'hi'
    })).toBe('hi');
});

test('Class object can also match an interface', () => {
    interface Eg {
        sayHi(): string
    }
    class EgClass {
        static sayHi() { return 'hi' }
        constructor(public val: number) {}
    }
    function f(sayHier: Eg) {
        return sayHier.sayHi();
    }
    // use the Class object like an object
    expect(f(EgClass)).toBe('hi');
});

test('Class def creates the contructor obj and an interface', () => {
    class EgClass {
        constructor(public val: number) {}
    }
    // the constructor and the interface work together obvs
    const x: EgClass = new EgClass(5);
    // The interface is still structural so works by itself
    const y: EgClass = {
        val: 10
    }
    interface EgInterface {
        val: number
    }
    // Constructor can create object that match other interfaces too of course - structural
    const z: EgInterface = new EgClass(1);
});

test('Private properties make the created interface not use structural matching', () => {
    class EgClass1 {
        private branded = true;
        constructor(public val: number) {}
    }
    // Error: Property 'branded' is missing in type '{ val: number; }' but required in type 'EgClass1'
    // const c: EgClass1 = { val: 10 };
    // Error: Type '{ val: number; branded: true; }' is not assignable to type 'EgClass1'.
    // const c: EgClass1 = { val: 10, branded: true };
    class EgClass2 {
        private branded = true;
        constructor(public val: number) {}
    }
    // Error: Type 'EgClass2' is not assignable to type 'EgClass1'.
    // const c: EgClass1 = new EgClass2(10);
    class EgClass3 {
        #branded = true;
        constructor(public val: number) {}
    }
    // Error: Property '#branded' is missing in type '{ val: number; }' but required in type 'EgClass3'
    // const c: EgClass3 = { val: 10 };
    class EgClass4 {
        #branded = true;
        constructor(public val: number) {}
    }
    // Error; Type 'EgClass4' is not assignable to type 'EgClass3'.
    // const c: EgClass3 = new EgClass4(10);
    function f(obj: EgClass1) { return obj.val; }
    // nope
    // f(new EgClass2(1))
});

test('Use typeof to get the interface created by a class def', () => {
    class EgClass {
        constructor(public val: number) {}
    }
    // using without 'typeof' would use the EgClass generated interface
    function make(classObj: typeof EgClass, val: number): EgClass {
        return new classObj(val);
    }
    expect(make(EgClass, 10).val).toBe(10);
});

test('Use constructor literal', () => {
    class EgClass {
        constructor(public val: number) {}
    }
    function make(classObj: new (val: number) => EgClass, val: number) {
        return new classObj(val);
    }
    expect(make(EgClass, 10).val).toBe(10);
});

test('Object type literals with constructor', () => {
    class EgClass {
        constructor(public val: number) {}
        static prop: number = 5
    }
    function make(classObj: {
        new (val: number): EgClass
        prop: number
    }, val: number) {
        return new classObj(val + classObj.prop);
    }
    expect(make(EgClass, 10).val).toBe(15);

    // don't have to include all of EgClass's members though of course
    function make2(classObj: {
        new (val: number): EgClass
    }, val: number) {
        return new classObj(val);
    }
    expect(make2(EgClass, 10).val).toBe(10);
});

test('Generic type for Class objects', () => {
    type Class<T> = {
        new (...args: any[]): T
    }
    // demonstrate with
    class MyClass {
        constructor(public prop: number) {}
    }
    const x: Class<MyClass> = MyClass; // this refers to the Class object
    const y: MyClass = new x(10); // create a new instance of that class. Uses the generated interface

    // can now write a generic make function
    function make<T>(classObj: Class<T>, ...constructorParams: any[]): T {
        return new classObj(...constructorParams);
    }

    // type inference works nicely here - type is MyClass
    const z = make(MyClass, 10);
    expect(z.prop).toBe(10);
});

test('Runtime type checking using generic type/interface for Class object', () => {
    interface Class<T> {
        new (...args: any[]): T
        name: string
    }
    function cast<T>(targetClass: Class<T>, source: any): T {
        if (source instanceof targetClass) {
            return source;
        } else {
            throw new Error(`${source} is not of class ${targetClass.name}`);
        }
    }
    class Eg {}
    const x: Eg = new Eg();
    // Type inference makes casted of type Eg - good
    const casted = cast(Eg, x);
    expect(casted).toBe(x);
    expect(() => cast(Eg, {})).toThrow(/.*is not of class Eg$/);
    // cast type checking happens at runtime
    expect(() => eval('cast(Eg, {})')).toThrow(/.*is not of class Eg$/);
})