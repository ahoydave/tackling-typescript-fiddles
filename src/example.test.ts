import { addOneToArray } from './example'

test('An example', () => {
    expect(addOneToArray([1, 2, 3])).toEqual([2, 3, 4]);
});