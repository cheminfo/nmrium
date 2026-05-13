import dlv from 'dlv';

import { formatNumber } from './formatNumber.ts';
import { pathToString } from './pathToString.ts';

function formatValue(value: any, format = '') {
  if (format.trim()) {
    return formatNumber(value, format);
  }
  return value;
}

export function getValueByPath(obj: any, path: string[], format = ' ') {
  const value = dlv(obj, path, '');
  const pathString = pathToString(path);

  if (Array.isArray(value)) {
    if (['info.baseFrequency', 'info.originFrequency'].includes(pathString)) {
      return formatValue(value[0], format);
    }

    return value.map((v: any) => formatValue(v, format)).join(',');
  }

  return formatValue(value, format);
}
