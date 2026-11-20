type CorrelationColor = 'green' | 'orange' | 'red' | 'grey';

interface Rule {
  min?: number;
  max?: number;
  color: CorrelationColor;
}

const RULES: Record<string, Rule[]> = {
  cosy: [
    { max: 3, color: 'green' },
    { min: 4, max: 4, color: 'orange' },
    { min: 6, color: 'red' },
  ],
  hsqc: [{ min: 1, max: 1, color: 'green' }, { color: 'red' }],
  hmbc: [
    { max: 3, color: 'green' },
    { min: 4, max: 4, color: 'orange' },
    { min: 5, color: 'red' },
  ],
};
export function getCorrelationColor(
  experiment: string,
  distance: number,
): CorrelationColor {
  experiment = experiment?.toLowerCase();

  const rule = RULES[experiment].find(
    ({ min, max }) =>
      (min === undefined || distance >= min) &&
      (max === undefined || distance <= max),
  );

  return rule?.color ?? 'grey';
}
