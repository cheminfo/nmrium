import zeroFilling from '../zeroFilling';

describe('zeroFilling', () => {
  it('simple x, re, im', () => {
    let spectrum = {
      data: {
        re: [1, 2, 3, 4],
        im: [5, 6, 7, 8],
        x: [10, 20, 30, 40],
      },
      info: {
        isComplex: true,
        isFid: true,
      },
    };
    zeroFilling(spectrum, 8);
    expect(true).toBe(true);
    expect(spectrum.data).toStrictEqual({
      re: new Float64Array([1, 2, 3, 4, 0, 0, 0, 0]),
      im: new Float64Array([5, 6, 7, 8, 0, 0, 0, 0]),
      x: new Float64Array([10, 20, 30, 40, 50, 60, 70, 80]),
    });
  });
});
