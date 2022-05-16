import Numeral from 'numeral';

export function formatNumber(value, format, prefix = '', suffix = '') {
  return prefix + Numeral(value).format(format) + suffix;
}

export function getNumberOfDecimals(value: number | string) {
  value = String(value).trim();
  const lastIndex = value.lastIndexOf('.');
  return lastIndex > 0 ? value.substr(lastIndex).split('').length - 1 : 0;
}
