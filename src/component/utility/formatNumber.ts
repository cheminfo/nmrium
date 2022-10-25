import numeral from 'numeral';

interface FormatOptions {
  prefix?: string;
  suffix?: string;
  defaultFormat?: string;
}

function formatNumber(
  value: any,
  format: number | string,
  options: FormatOptions = {},
) {
  const { prefix = '', suffix = '', defaultFormat = '0.00' } = options;

  return (value || value === 0) && !isNaN(value)
    ? prefix + numeral(value).format(format || defaultFormat) + suffix
    : value;
}

function getNumberOfDecimals(value: number | string) {
  value = String(value).trim();
  const lastIndex = value.lastIndexOf('.');
  return lastIndex > 0 ? value.substr(lastIndex).split('').length - 1 : 0;
}

export { formatNumber, getNumberOfDecimals };
