import { Multiplets } from '../../../../data/constants/Multiplets';

function getMultiplicityNumber(string) {
  const multiplet = Multiplets.find(
    (_multiplet) => string === _multiplet.label || string === _multiplet.value,
  );

  return multiplet ? multiplet.multiplicity : null;
}

function checkMultiplet(multiplet, rejected: Array<any> = []) {
  // options to determine whether a massive (m), for example, should be considered as rejected multiplet
  if (multiplet === undefined || multiplet.length === 0) {
    return false;
  }
  const _multiplet = Multiplets.find(
    (m) => m.value === multiplet || m.label === multiplet,
  );
  return (
    _multiplet &&
    !rejected.includes(_multiplet.value) &&
    !rejected.includes(_multiplet.label)
  );
}

function checkMultiplicity(multiplicity, rejected: Array<string> = []) {
  // options to determine whether a massive (m), for example, should be considered as rejected multiplicity
  if (multiplicity === undefined || multiplicity.length === 0) {
    return false;
  }
  return !multiplicity
    .split('')
    .find((_multiplet) => !checkMultiplet(_multiplet, rejected));
}

function translateMultiplet(multiplet) {
  return multiplet.length === 1
    ? Multiplets.find((_multiplet) => _multiplet.value === multiplet)?.label
    : Multiplets.find((_multiplet) => _multiplet.label === multiplet)?.value;
}

function hasCouplingConstant(multiplet) {
  if (multiplet.length > 1) {
    multiplet = translateMultiplet(multiplet);
  }
  // with the pre-set rejected ones, we check the given multiplicity for the need of having a coupling constant (massive and singlet do not)
  return checkMultiplicity(multiplet, ['m', 's']);
}

function getPascal(n, spin) {
  if (n === undefined || n === 0 || spin === undefined) return [1];
  let mult = 2 * spin + 1;
  let previousLine: Array<any> = [];
  for (let j = 0; j < mult - 1; j++) previousLine.push(1);
  // complete with "1 1" or "1 1 1" for spin 1/2 and 1 respectively
  for (let i = 0; i < n - 1; i++) {
    // copy the line
    let _line = previousLine.slice();
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

export {
  checkMultiplet,
  checkMultiplicity,
  getMultiplicityNumber,
  getPascal,
  hasCouplingConstant,
  translateMultiplet,
};
