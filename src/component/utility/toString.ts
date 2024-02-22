interface ToStringOptions {
  trueLabel?: string;
  falseLabel?: string;
  negate?: boolean;
}

export function toString(flag: boolean, options: ToStringOptions = {}) {
  const { trueLabel = 'Show', falseLabel = 'Hide' } = options;
  return flag ? trueLabel : falseLabel;
}
