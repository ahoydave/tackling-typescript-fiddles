test('JS class with type inference', () => {
    class Eg {
        #prop = 'initial'
        get prop() { return this.#prop; }
        set prop(val) { this.#prop = val; }
    }
    let x = new Eg();
    x.prop = 'test';
    expect(x.prop).toBe('test');
});

test('Static members are part of Class object', () => {
    class Eg {
        static val = 0;
        prop = 1;
    }
    expect(Eg.val).toBe(0);
    expect(typeof Eg).toBe('function');
    let x = new Eg();
    expect(x.prop).toBe(1);
    expect(typeof x).toBe('object');
});

test('Private and protected', () => {
    class Eg {
        private prop1: string = 'hi'
        #prop2: string = 'there'
        protected prop3: string = 'test'
    }
    class Eg2 extends Eg {
        getProp3(): string { return this.prop3 }
    }
    let x = new Eg();
    // Error: Property 'prop1' is private and only accessible within class 'Eg'
    // x.prop1 
    expect(eval('x.prop1')).toBe('hi'); // can still be accessed at runtime

    expect(eval('x.prop2')).toBeUndefined(); // properly private

    // Error: Property 'prop3' is protected and only accessible within class 'Eg' and its subclasses
    // x.prop3
    expect(eval('x.prop3')).toBe('test'); // can still be accessed at runtime
    let y = new Eg2();
    expect(y.getProp3()).toBe('test');
});

test('Private constructors', () => {
    class Eg {
        #val: string
        get val(): string { return this.#val; }
        private constructor(val: string) { this.#val = val; }
        // Note this is the Class function because createDefault is static
        // the static factory method can also be async
        static async createDefault() {
            return Promise.resolve(new this('default'));
        }
    }
    return Eg.createDefault().then(newEg => expect(newEg.val).toBe('default'));
});

test('Turn off typescript prop initialization checks if needed', () => {
    class Eg {
        // needs the ! otherwise init check fails
        prop!: string
        constructor() {
            this.initProps();
        }
        initProps() {
            this.prop = 'test'
        }
    }
    expect(new Eg().prop).toBe('test');
});

test('Automatic properties from constructor params', () => {
    class Eg {
        // can also do private or protected
        constructor(public prop: string) {}
    }
    expect(new Eg('test').prop).toBe('test');
}); 

test('Abstract classes and methods', () => {
    abstract class EgSuper {
        superHi() {
            return 'Hi from super';
        }
        abstract subHi(): string
    }
    class EgSub extends EgSuper {
        // if class is concrete then needs to implement all the abstract methods
        subHi(): string {
            return 'Hi from sub';
        }
    }
    let x: EgSuper = new EgSub();
    let y: EgSub = new EgSub();
    expect(x.superHi()).toBe('Hi from super');
    expect(y.superHi()).toBe('Hi from super');
    expect(x.subHi()).toBe('Hi from sub'); // type checker seems ok with this
    expect(y.subHi()).toBe('Hi from sub');
    // abstract classes are concrete classes at runtime with the abstract bits missing
    expect(eval('new EgSuper().superHi()')).toBe('Hi from super');
    expect(eval('new EgSuper().subHi')).toBeUndefined();
});

test('Using instanceof with classes', () => {
    class Eg {
        prop: number = 10
    }
    const x = { prop: 10 };
    expect(x instanceof Eg).toBe(false);
    expect(new Eg() instanceof Eg).toBe(true);
})