const mfCheck = /^(?:[A-Z][a-z]?\d* *)+$/;

export default function getAtomsFromMF(mf: string): Record<string, number> {
  if (!mfCheck.test(mf)) {
    throw Error(`MF can not be parsed: ${mf}`);
  }
  const atoms = {};
  const parts = mf.matchAll(/(?<atom>[A-Z][a-z]?)(?<number>[0-9]*)/g);
  for (const part of parts) {
    const { atom, number } = part.groups as { atom: string; number: string };
    if (!atoms[atom]) {
      atoms[atom] = 0;
    }
    atoms[atom] += number === '' ? 1 : Number(number);
  }

  return atoms;
}
