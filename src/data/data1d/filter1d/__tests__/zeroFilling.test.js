import zeroFilling from '../zeroFilling';

describe('zeroFilling', () => {
  let result = zeroFilling(
    {
      data: {
        re: [1, 2, 3, 4],
        im: [5, 6, 7, 8],
        x: [10, 20, 30, 40],
      },
    },
    8,
  );

  expect(result.data).toMatch({
    re: [1, 2, 3, 4, 0, 0, 0, 0],
    im: [5, 6, 7, 8, 0, 0, 0, 0],
    x: [10, 20, 30, 40, 50, 60, 70, 80],
  });
});
