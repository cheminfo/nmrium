import { Integral, Range, Integrals, Ranges } from '../../../types/data1d';
import { getSum } from '../../../utilities/getSum';

export function updateRelatives<Type extends Integral | Range>(
  data: Type extends Integral ? Integrals : Ranges,
  key: keyof Type,
  check: (value: Type) => boolean,
  forceCalculateIntegral = false,
): void {
  const { values, options } = data;

  const currentSum = getSum<Type>(values as Type[], 'absolute', check);

  let factor = 0;
  if (options.sum) {
    if (options.isSumConstant || forceCalculateIntegral) {
      factor = currentSum > 0 ? options.sum / currentSum : 0;
    } else if (values?.[0]) {
      const item = values[0];
      factor = (item[key as string] || options.sum) / item.absolute;
    }
  }

  data.values = values.map((value) => {
    return {
      ...value,
      ...(check(value) && {
        [key as string]: value.absolute * factor,
      }),
    };
  });

  if (!options.isSumConstant && !forceCalculateIntegral) {
    options.sum = getSum<Type>(values as Type[], key, check);
  }
}
