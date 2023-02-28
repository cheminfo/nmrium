import numeral from 'numeral';

interface FormatOptions {
  prefix?: string;
  suffix?: string;
  defaultFormat?: string;
}

function formatNumber(
  value: string | number,
  format: string | undefined,
  options: FormatOptions = {},
) {
  const { prefix = '', suffix = '', defaultFormat = '0.00' } = options;

  const formattedValue = numeral(value).format(format || defaultFormat);
  if (prefix || suffix) {
    return prefix + formattedValue + suffix;
  }
  return formattedValue;
}

function getNumberOfDecimals(value: number | string) {
  value = String(value).trim();
  const lastIndex = value.lastIndexOf('.');
  return lastIndex > 0 ? value.slice(lastIndex).split('').length - 1 : 0;
}

export { formatNumber, getNumberOfDecimals };
