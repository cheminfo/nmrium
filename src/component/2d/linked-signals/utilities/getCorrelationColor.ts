type CorrelationStatus = 'normal' | 'suspicious' | 'unexpected' | 'unknown';

export const CORRELATION_COLORS: Record<CorrelationStatus, string> = {
  normal: 'green',
  suspicious: 'orange',
  unexpected: 'red',
  unknown: 'grey',
};
interface Rule {
  min?: number;
  max?: number;
  correlationStatus: CorrelationStatus;
}

const RULES: Record<string, Rule[]> = {
  cosy: [
    { max: 3, correlationStatus: 'normal' },
    { min: 4, max: 4, correlationStatus: 'suspicious' },
    { min: 6, correlationStatus: 'unexpected' },
  ],
  hsqc: [
    { min: 1, max: 1, correlationStatus: 'normal' },
    { correlationStatus: 'unexpected' },
  ],
  hmbc: [
    { max: 3, correlationStatus: 'normal' },
    { min: 4, max: 4, correlationStatus: 'suspicious' },
    { min: 5, correlationStatus: 'unexpected' },
  ],
};
export function getCorrelationColor(
  experiment: string,
  distance: number,
): string {
  experiment = experiment.toLowerCase();

  const rule = RULES[experiment].find(
    ({ min, max }) =>
      (min === undefined || distance >= min) &&
      (max === undefined || distance <= max),
  );

  return rule
    ? CORRELATION_COLORS[rule.correlationStatus]
    : CORRELATION_COLORS.unknown;
}
