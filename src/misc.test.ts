test('Using blocks in TS', () => {
    {
        type myNum = number;
        const v1: myNum = 5;
        expect(v1).toBe(5);
    }
    // nope, lexically scoped to block
    // const v2: myNum = 6;
});