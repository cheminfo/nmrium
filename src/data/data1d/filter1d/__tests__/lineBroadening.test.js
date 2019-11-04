import lineBroadening from '../lineBroadening';

describe('lineBroadening', () => {
  it('simple x, re, im to 1', () => {
    let spectrum = {
      data: {
        re: [1, 1, 1, 1],
        im: [0, 0, 0, 0],
        x: [0, 1, 2, 3],
      },
      info: {
        isComplex: true,
        isFid: true,
      },
    };
    lineBroadening(spectrum, 1);
    expect(spectrum.data).toStrictEqual({
      re: new Float64Array([
        1.0,
        0.06598803584531254,
        0.004354420874722253,
        0.00028733968076674924,
      ]), // not correct... but just testing...
      im: new Float64Array([0, 0, 0, 0]),
      x: new Float64Array([0, 1, 2, 3]),
    });
  });
});
