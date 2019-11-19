import { apply } from '../zeroFilling';

describe('zeroFilling', () => {
  it('simple x, re, im 4 to 8', () => {
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
    apply(spectrum, 8);
    expect(spectrum.data).toStrictEqual({
      re: new Float64Array([1, 2, 3, 4, 0, 0, 0, 0]),
      im: new Float64Array([5, 6, 7, 8, 0, 0, 0, 0]),
      x: new Float64Array([10, 20, 30, 40, 50, 60, 70, 80]),
    });
  });

  it('simple x, re, im 4 to 2', () => {
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
    let originalX = spectrum.data.x;
    let originalRe = spectrum.data.re;
    let originalIm = spectrum.data.im;
    apply(spectrum, 2);
    expect(spectrum.data).toStrictEqual({
      re: new Float64Array([1, 2]),
      im: new Float64Array([5, 6]),
      x: new Float64Array([10, 20]),
    });
    expect(spectrum.data.x).not.toBe(originalX);
    expect(spectrum.data.re).not.toBe(originalRe);
    expect(spectrum.data.im).not.toBe(originalIm);
  });
});
