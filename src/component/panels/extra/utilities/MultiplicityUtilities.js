import { Multiplets } from '../constants/Multiplets';

const isOnRangeLevel = (multiplicity) => {
  return multiplicity.split('').includes('m');
};

const checkMultiplicity = (multiplicity, rejected = ['m', 's']) => {
  // options to determine whether a singlet, for example, should be considered as rejected multiplicity
  // e.g. with the pre-set rejected ones, we check the given multiplicity for the need of having a coupling constant (massive and singlet do not)
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

export { checkMultiplicity, isOnRangeLevel, translateMultiplicity };
