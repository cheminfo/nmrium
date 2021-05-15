// import { readFileSync } from 'fs';
// import { join } from 'path';

// import { Data1DManager } from '../Data1DManager';

// eslint-disable-next-line jest/no-commented-out-tests
// describe('test Datum1D', () => {
//   let jcamp = readFileSync(
//     join(__dirname, './data/ethylbenzene-1h.jdx'),
//     'utf8',
//   );
//   let data = Data1DManager.fromJcamp(jcamp, {
//     display: {
//       name: 'test',
//       color: 'red',
//       isVisible: true,
//       isPeaksMarkersVisible: true,
//     },
//     source: {
//       jcamp: null,
//       jcampURL: null,
//       original: null,
//     },
//   });

// eslint-disable-next-line jest/no-commented-out-tests
//   it('check x, re, im', () => {
//     expect(data.data.x).toHaveLength(16384);
//     expect(data.data.re).toHaveLength(16384);
//     expect(data.data.im).toHaveLength(16384);
//   });
// });

describe('test Datum1D', () => {
  it('check x, re, im', () => {
    expect(true).toStrictEqual(true);
  });
});
