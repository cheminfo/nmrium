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
      re: [1, 0.9, 0.8, 0.7],// not correct... but just testing...
      im: [0, 0, 0, 0],
   // del: [-2.718281828459045],
   //del: -2.718,
  });
  });
});
