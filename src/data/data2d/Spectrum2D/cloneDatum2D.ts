export function cloneDatum2D(datum) {
  const data = {};
  for (const key in datum) {
    //shallow cloning for datum 2d
    const { z, ...other } = datum[key];
    data[key] = { z: z.slice(), ...other };
  }
  return data;
}
