const mfCheck = /^(?:[A-Z][a-z]?\d* *)+$/;

export default function getAtomsFromMF(mf) {
  if (!mfCheck.test(mf)) {
    throw Error(`MF can not be parsed: ${mf}`);
  }
  const atoms = {};
  const parts = mf.matchAll(/(?<atom>[A-Z][a-z]?)(?<number>[0-9]*)/g);
  for (const part of parts) {
    let { atom, number } = part.groups;
    if (number === '') {
      number = 1;
    } else {
      number = Number(number);
    }
    if (!atoms[atom]) {
      atoms[atom] = 0;
    }
    atoms[atom] += number;
  }

  return atoms;
}
