import numeral from 'numeral';

function formatNumber(value, format, prefix = '', suffix = '') {
  return (value || value === 0) && !isNaN(value)
    ? prefix + numeral(value).format(format) + suffix
    : value;
}

function getNumberOfDecimals(value: number | string) {
  value = String(value).trim();
  const lastIndex = value.lastIndexOf('.');
  return lastIndex > 0 ? value.substr(lastIndex).split('').length - 1 : 0;
}

export { formatNumber, getNumberOfDecimals };
