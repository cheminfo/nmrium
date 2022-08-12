interface InRangeOptions {
  from: number;
  to: number;
  factor?: number;
}

export default function isInRange(value: number, options: InRangeOptions) {
  const { from, to, factor = 100000 } = options;
  return value * factor >= from * factor && value * factor <= to * factor;
}
