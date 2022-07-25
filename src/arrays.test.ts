test('Typing list arrays', () => {
    const arr1: number[] = [1, 2, 3];
    const arr2: Array<number> = [1, 2, 3];
    // can be of any type
    interface Eg { }
    const arr3: Eg[] = [{}];
    let arr4: Array<() => Eg>;
    let arr5: (number | Eg)[];
});

test('Typle arrays have types determined by their position', () => {
    const arr1: [number, string, number] = [1, 'one', 2];
});

test('Types of array literals are usually ambiguous', () => {
    const arr1: number[][] = [[1, 2], [3, 4]];
    // equivalent to
    const arr2: Array<Array<number>> = [[1, 2], [3, 4]];
    // or tuples?
    const arr3: [[number, number], [number, number]] = [[1, 2], [3, 4]];
    // or combo?
    const arr4: [number, number][] = [[1, 2], [3, 4]];
    const arr5: [number[], number[]] = [[1, 2], [3, 4]];
    // type system defaults to list arrays like arr1/2 - number[][]
    const arr6 = [[1, 2], [3, 4]];
    expect(arr1).toEqual(arr2);
    expect(arr1).toEqual(arr3);
    expect(arr1).toEqual(arr4);
    expect(arr1).toEqual(arr5);
});

test('const assertion for array literal', () => {
    // type inferred as number[]
    const arr1 = [1, 2]
    // type inferred as [1, 2] (most specific type) and marked readonly
    const arr2 = [1, 2] as const;
});

test('Array out of bounds index has unexpected type', () => {
    const arr = [1, 2, 3]
    // type is number not undefined | number
    const elem = arr[5];
    // but runtime value is actually undefined
    expect(elem).toBeUndefined();
});