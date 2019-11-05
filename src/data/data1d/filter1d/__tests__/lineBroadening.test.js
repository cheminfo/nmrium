import lineBroadening from '../lineBroadening';

describe('lineBroadening', () => {
  it('simple x, re, im to 1 Hz exp.', () => {
    let spectrum = {
      data: {
        re: new Float64Array([1, 1, 1, 1]), //re: [1, 1, 1, 1], // was not OK...
        im: new Float64Array([0, 0, 0, 0]),
        x: new Float64Array([0, 1, 2, 3]),
      },
      info: {
        isComplex: true,
        isFid: true,
      },
    };
    lineBroadening(spectrum, 1);
    //expect(spectrum.data).toBeCloseTo({
    expect(spectrum.data).toStrictEqual(
      {
        re: new Float64Array([
          1,
          0.06598803584531254, // this is ugly... may not work. toBeCloseTo not for objects
          0.004354420874722253,
          0.00028733968076674924,
        ]),
        im: new Float64Array([0, 0, 0, 0]),
        x: new Float64Array([0, 1, 2, 3]),
      },
      5,
    );
  });
});
