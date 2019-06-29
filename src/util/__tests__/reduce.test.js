import reduce from '../reduce';

describe('test reduce', () => {
  const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const y = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0];
  test('All', () => {
    let result = {
      x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      y: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
    };
    expect(reduce(x, y, { nbPoints: 20 })).toStrictEqual(result);
  });

  test('Too large', () => {
    let result = {
      x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      y: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
    };
    expect(reduce(x, y, { nbPoints: 20, from: -10, to: 20 })).toStrictEqual(
      result,
    );
  });

  test('Part exact', () => {
    let result = {
      x: [3, 4, 5],
      y: [3, 4, 5],
    };
    expect(reduce(x, y, { from: 3, to: 5, nbPoints: 20 })).toStrictEqual(
      result,
    );
  });

  test('Part rounded close', () => {
    let result = {
      x: [3, 4, 5],
      y: [3, 4, 5],
    };
    expect(reduce(x, y, { from: 3.1, to: 4.9, nbPoints: 20 })).toStrictEqual(
      result,
    );
  });

  test('Part rounded far', () => {
    let result = {
      x: [3, 4, 5],
      y: [3, 4, 5],
    };
    expect(reduce(x, y, { from: 3.6, to: 4.4, nbPoints: 20 })).toStrictEqual(
      result,
    );
  });

  test('Part rounded far', () => {
    let result = reduce(x, y, { nbPoints: 5 });

    expect(result).toStrictEqual({
      x: [0, 2.5, 5, 7.5, 10],
      y: [0, 1, 5, 0, 4],
    });
  });

  test('Part rounded big data', () => {
    let x = [];
    let y = [];
    for (let i = 0; i < 5000000; i++) {
      x.push(i);
      y.push(i);
    }
    let result = reduce(x, y, { nbPoints: 4000 });
    expect(result.x.length).toBe(4001);
    expect(result.y.length).toBe(4001);
  });

  test('Part rounded big data', () => {
    let x = [];
    let y = [];
    for (let i = 0; i < 5000000; i++) {
      x.push(i);
      y.push(i);
    }
    let result = reduce(x, y, { nbPoints: 4000, from: 10, to: 20 });
    expect(result.x).toStrictEqual([
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
    ]);
    expect(result.y).toStrictEqual([
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
    ]);
  });
});
