import { apply } from '../zeroFillingAndApodization';

describe('zeroFilling', () => {
  it('simple x, re, im 4 to 8', () => {
    let spectrum = {
      data: {
        re: new Float64Array([1, 2, 3, 4]),
        im: new Float64Array([5, 6, 7, 8]),
        x: new Float64Array([10, 20, 30, 40]),
      },
      info: {
        isComplex: true,
        isFid: true,
      },
      filters: [],
    };
    apply(spectrum, {
      apodization: {
        lineBroadeningValue: 0.1,
        gaussBroadeningValue: 0,
        centerValue: 0,
      },
      zeroFilling: {
        size: 8,
      },
    });

    expect(spectrum.data).toStrictEqual({
      re: new Float64Array([
        1, 0.08642783652754452, 0.0056023281951239675, 0.0003227980702812185, 0,
        0, 0, 0,
      ]),
      im: new Float64Array([
        5, 0.2592835095826336, 0.013072099121955925, 0.000645596140562437, 0, 0,
        0, 0,
      ]),
      x: new Float64Array([10, 20, 30, 40, 50, 60, 70, 80]),
    });
  });

  it('simple x, re, im 4 to 2', () => {
    let spectrum = {
      data: {
        re: new Float64Array([1, 2, 3, 4]),
        im: new Float64Array([5, 6, 7, 8]),
        x: new Float64Array([10, 20, 30, 40]),
      },
      info: {
        isComplex: true,
        isFid: true,
      },
      filters: [],
    };

    let originalX = spectrum.data.x;
    let originalRe = spectrum.data.re;
    let originalIm = spectrum.data.im;

    apply(spectrum, {
      apodization: {
        lineBroadeningValue: 0.1,
        gaussBroadeningValue: 0,
        centerValue: 0,
      },
      zeroFilling: {
        size: 2,
      },
    });

    expect(spectrum.data).toStrictEqual({
      re: new Float64Array([1, 0.08642783652754452]),
      im: new Float64Array([5, 0.2592835095826336]),
      x: new Float64Array([10, 20]),
    });
    expect(spectrum.data.x).not.toBe(originalX);
    expect(spectrum.data.re).not.toBe(originalRe);
    expect(spectrum.data.im).not.toBe(originalIm);
  });
});
