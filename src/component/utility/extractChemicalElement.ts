export function extractChemicalElement(isotope: string) {
  return isotope?.replaceAll(/\d/g, '');
}
