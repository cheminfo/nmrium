import digitalFilter from '../digitalFilter';

describe('digitalFilter', () => {
  it('simple x, re, im 4 to 8', () => {
    const nbPoints = 8;
    let spectrum = {
      data: {
        re: new Float64Array(nbPoints),
        im: new Float64Array(nbPoints),
        x: new Float64Array(nbPoints),
      },
      info: {
        isComplex: true,
        isFid: true,
      },
      meta: {
        $GRPDLY: 6,
      },
    };
    for (let i = 0; i < nbPoints; i++) {
      spectrum.data.re[i] = i;
    }
    spectrum.data.im = spectrum.data.re.slice();
    spectrum.data.x = spectrum.data.re.slice();
    digitalFilter(spectrum);
    expect(spectrum.data.re).toStrictEqual(
      new Float64Array([
        5.856518618055389,
        2.2761896138307107,
        0,
        0,
        0,
        0,
        0,
        0,
      ]),
    );
  });
});
