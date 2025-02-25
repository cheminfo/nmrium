export function extractChemicalElement(isotope: string) {
  return isotope?.replace(/\d/g, '');
}
