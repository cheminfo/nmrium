import { z } from 'zod/v4';

const requiredFieldMessage = 'This field is required.';

export function requiredString(message?: string) {
  return z
    .string(message || requiredFieldMessage)
    .min(1, message || requiredFieldMessage);
}

export function checkUniqueByKey<T>(
  data: T[] | undefined,
  checkKey: keyof T,
  onError: (message: string, path: Array<string | number>) => void,
  basePath = '',
) {
  if (!data) return true;

  const matchesFrequencies: Record<
    string,
    { value: number; fieldsIndexes: number[] }
  > = {};
  let index = 0;
  for (const datum of data) {
    let key;
    const matchValue = datum[checkKey];

    if (typeof matchValue === 'string') {
      key = matchValue.toLowerCase();
    }

    if (key) {
      if (matchesFrequencies[key]) {
        ++matchesFrequencies[key].value;
        matchesFrequencies[key].fieldsIndexes.push(index);
      } else {
        matchesFrequencies[key] = { value: 1, fieldsIndexes: [index] };
      }
    }
    index++;
  }

  for (const key in matchesFrequencies) {
    const { value, fieldsIndexes } = matchesFrequencies[key];
    if (value > 1) {
      for (const index of fieldsIndexes) {
        onError(
          `${key} must be unique`,
          basePath
            ? [basePath, index, String(checkKey)]
            : [index, String(checkKey)],
        );
      }
    }
  }

  return true;
}
