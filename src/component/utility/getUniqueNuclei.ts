export function getUniqueNuclei(nuclei: string[]) {
  let uniqueNuclei = {};

  for (const nucleus of nuclei) {
    const _nuclei = nucleus.split(',');
    for (const _nucleus of _nuclei) {
      uniqueNuclei[_nucleus.toUpperCase()] = true;
    }
  }
  return Object.keys(uniqueNuclei);
}
