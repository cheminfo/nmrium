interface ToStringOptions {
  trueLabel?: string;
  falseLabel?: string;
}

export function booleanToString(flag: boolean, options: ToStringOptions = {}) {
  const { trueLabel = 'Show', falseLabel = 'Hide' } = options;
  return flag ? trueLabel : falseLabel;
}
