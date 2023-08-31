export function getDecimalsCount(max: number, format: string) {
  const numberOfDigits = format.replace(/\./, '').length;
  const fractionDigits = format.split('.')[1].length;

  return (
    Math.max(String(max.toFixed(0)).length, numberOfDigits - fractionDigits) +
    fractionDigits
  );
}
