import lodash from 'lodash';
import Numeral from 'numeral';

import { usePreferences } from '../context/PreferencesContext';
// let getNuclusFormat = memoize(getDefaultNuclusFormat);

function FormatNumber(value, format, prefix = '', suffix = '') {
  return prefix + Numeral(value).format(format) + suffix;
}

const getNucleusFormat = (preferences, nucleus) => {
  return lodash.get(
    preferences,
    `formatting.nucleusByKey[${nucleus.toLocaleLowerCase()}]`,
    '0.0',
  );
};

export function useFormatNumberByNucleus(nucleus) {
  const preferences = usePreferences();
  let formatValues = {};
  let nuc = null;
  if (typeof nucleus === 'string') {
    nuc = nucleus.toLowerCase();
    formatValues[nuc] = getNucleusFormat(preferences, nucleus);
  } else if (Array.isArray(nucleus)) {
    formatValues = nucleus.reduce((acc, n) => {
      acc[n.toLowerCase()] = getNucleusFormat(preferences, n);
      return acc;
    }, {});
  } else {
    nuc = 'default';
    formatValues = { [nuc]: '0.0' };
  }

  return (value, n = nuc, prefix = '', suffix = '') => {
    if (n == null) {
      throw Error('nuclues must be specified');
    }
    return (
      prefix +
      Numeral(Number(value)).format(formatValues[n.toLowerCase()]) +
      suffix
    );
  };
}

export default FormatNumber;
