test('Any type can be anything', () => {
    let x: any;
    x = undefined;
    x = 1;
    x = 'hi';
    x = { a: 1 };
    x = null;
    x = NaN;
    x = 1n;
    x = true;
    expect(x * 5).toBe(5);
    expect(x.notAProp).toBeUndefined();
    expect(x[2]).toBeUndefined();
    // no type errors here :)
});

test('Unknown types must be narrowed before use', () => {
    let x: unknown;
    x = 1.1;
    expect((x as number).toFixed(0)).toBe('1');
    let y: unknown;
    y = 'hi';
    if (typeof y === 'string') {
        expect(y).toBe('hi');
    }
});