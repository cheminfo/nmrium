export default function calculate(code: string, args: unknown = null): unknown {
  try {
    // eslint-disable-next-line no-new-func
    return new Function('args', `return ${code}`)(args);
  } catch (error) {
    return error;
  }
}
