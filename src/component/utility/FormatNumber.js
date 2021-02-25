import lodashGet from 'lodash/get';
import Numeral from 'numeral';

import { usePreferences } from '../context/PreferencesContext';
// let getNuclusFormat = memoize(getDefaultNuclusFormat);

function FormatNumber(value, format, prefix = '', suffix = '') {
  return prefix + Numeral(value).format(format) + suffix;
}

/**
 *
 * @param {string|Array} nucleus
 */
export function useFormatNumberByNucleus(nucleus) {
  const preferences = usePreferences();
  const nucleusByKey = lodashGet(preferences, `formatting.nucleusByKey`, {
    ppm: '0.0',
    hz: '0.0',
  });

  const formatFun = (n) => (
    value,
    formatKey = 'ppm',
    prefix = '',
    suffix = '',
  ) => {
    return (
      prefix +
      Numeral(Number(value)).format(
        lodashGet(nucleusByKey, `${n.toLowerCase()}.${formatKey}`, '0.0'),
      ) +
      suffix
    );
  };

  if (!nucleus) {
    return;
  }

  if (typeof nucleus === 'string') {
    return formatFun(nucleus);
  } else if (Array.isArray(nucleus)) {
    return nucleus.map((n) => formatFun(n));
  } else {
    throw Error('nuclus must be string or array of string');
  }
}

/**
 * @param {number|string} value
 */
export function getNumberOfDecimals(value) {
  value = String(value).trim();
  const lastIndex = value.lastIndexOf('.');
  return lastIndex > 0 ? value.substr(lastIndex).split('').length - 1 : 0;
}

export default FormatNumber;
