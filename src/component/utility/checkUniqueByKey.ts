import { TestContext, ValidationError } from 'yup';

export function checkUniqueByKey<T>(
  data: T[] | undefined,
  checkKey: keyof T,
  context: TestContext,
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

  const errors: ValidationError[] = [];
  for (const key in matchesFrequencies) {
    const { value, fieldsIndexes } = matchesFrequencies[key];
    if (value > 1) {
      for (const index of fieldsIndexes) {
        errors.push(
          context.createError({
            message: `${key} must be unique`,
            path: `${context.path}[${index}].${String(checkKey)}`,
          }),
        );
      }
    }
  }

  if (errors.length > 0) {
    return new ValidationError(errors);
  }

  return true;
}
