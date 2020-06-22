import { Multiplets } from '../constants/Multiplets';

const getMultiplicity = (string) => {
  const multiplet = Multiplets.find(
    (_multiplet) => string === _multiplet.label || string === _multiplet.value,
  );

  return multiplet ? multiplet.multiplicity : null;
};

const checkMultiplicity = (multiplicity, rejected = []) => {
  // options to determine whether a massive (m), for example, should be considered as rejected multiplicity
  if (multiplicity === undefined || multiplicity.length === 0) {
    return false;
  }
  const multiplet = Multiplets.find(
    (m) => m.value === multiplicity || m.label === multiplicity,
  );
  return multiplet !== undefined && !rejected.includes(multiplet.value);
};

const translateMultiplicity = (multiplicity) => {
  return multiplicity.length === 1
    ? Multiplets.find((_multiplet) => _multiplet.value === multiplicity).label
    : Multiplets.find((_multiplet) => _multiplet.label === multiplicity).value;
};

const hasCouplingConstant = (multiplicity) => {
  // with the pre-set rejected ones, we check the given multiplicity for the need of having a coupling constant (massive and singlet do not)
  return checkMultiplicity(multiplicity, ['m', 's']);
};

const isOnRangeLevel = (multiplicity) => {
  return multiplicity
    .split('')
    .some((_multiplicity) => !checkMultiplicity(_multiplicity, ['m']));
};

const getPascal = (n, spin) => {
  if (n === undefined || n === 0 || spin === undefined) return [1];
  let mult = 2 * spin + 1;
  let previousLine = [];
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
};

export {
  checkMultiplicity,
  getMultiplicity,
  getPascal,
  hasCouplingConstant,
  isOnRangeLevel,
  translateMultiplicity,
};
