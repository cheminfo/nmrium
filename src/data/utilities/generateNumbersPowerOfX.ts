export default function generateNumbersPowerOfX(
  start: number,
  end: number,
  options?: { power?: number; format?: (input: number) => string },
) {
  const { power = 2, format = formatNumber } = options || {};
  const values: Array<{ label: string; value: number }> = [];
  for (let i = start; i <= end; i++) {
    const result = power ** i;
    values.push({
      label: format(result),
      value: result,
    });
  }
  return values;
}

function formatNumber(number: number) {
  if (number >= 1024 * 1024) {
    return `${number / (1024 * 1024)}M`;
  } else if (number >= 1024) {
    return `${number / 1024}K`;
  } else {
    return `${number}`;
  }
}
