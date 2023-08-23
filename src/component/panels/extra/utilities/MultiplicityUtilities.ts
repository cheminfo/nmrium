import {
  translateMultiplet,
  findMultiplet,
  checkMultiplicity,
} from 'nmr-processing';

function getMultiplicityNumber(string) {
  const multiplet = findMultiplet(string);
  return multiplet ? multiplet.multiplicity : null;
}

function hasCouplingConstant(multiplet: string) {
  if (multiplet.length > 1) {
    multiplet = translateMultiplet(multiplet);
  }
  // with the pre-set rejected ones, we check the given multiplicity for the need of having a coupling constant (massive and singlet do not)
  return checkMultiplicity(multiplet, ['m', 's']);
}

function getPascal(n, spin) {
  if (n === undefined || n === 0 || spin === undefined) return [1];
  const mult = 2 * spin + 1;
  let previousLine: any[] = [];
  for (let j = 0; j < mult - 1; j++) previousLine.push(1);
  // complete with "1 1" or "1 1 1" for spin 1/2 and 1 respectively
  for (let i = 0; i < n - 1; i++) {
    // copy the line
    const _line = previousLine.slice();
    for (let j = 1; j < mult; j++) {
      for (let k = 0; k < previousLine.length - 1; k++) {
        _line[k + j] += previousLine[k];
      } // add the previous line
      _line.push(1); // complete the line
    }
    previousLine = _line.slice();
  }
  return previousLine;
}

export { getMultiplicityNumber, getPascal, hasCouplingConstant };
