import type { RefinementCtx } from 'zod';

interface CheckUniqueByKeyOptions<T> {
  data?: T[];
  checkKey: keyof T;
  basePath?: string;
  context: RefinementCtx;
}

export function checkUniqueByKey<T>(options: CheckUniqueByKeyOptions<T>) {
  const { data, checkKey, context, basePath = '' } = options;

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
        context.addIssue({
          code: 'custom',
          message: `${key} must be unique`,
          path: basePath
            ? [basePath, index, String(checkKey)]
            : [index, String(checkKey)],
        });
      }
    }
  }

  return true;
}
