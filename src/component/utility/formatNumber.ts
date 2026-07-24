import numeral from 'numeral';

interface FormatOptions {
  prefix?: string;
  suffix?: string;
  defaultFormat?: string;
  scientificFormat?: string;
  scientificThreshold?: number;
}

function shouldUseScientificNotation(value: number, threshold: number) {
  return Number.isFinite(value) && Math.abs(value) >= threshold;
}

function formatNumber(
  value: string | number,
  format: string | undefined,
  options: FormatOptions = {},
) {
  const {
    prefix = '',
    suffix = '',
    defaultFormat = '0.00',
    scientificFormat = '0.00e+0',
    scientificThreshold = 1e6,
  } = options;

  const numericValue = typeof value === 'number' ? value : Number(value);

  const activeFormat = shouldUseScientificNotation(
    numericValue,
    scientificThreshold,
  )
    ? scientificFormat
    : format || defaultFormat;

  const formattedValue = numeral(value).format(activeFormat);

  if (prefix || suffix) {
    return prefix + formattedValue + suffix;
  }
  return formattedValue;
}

export { formatNumber };
