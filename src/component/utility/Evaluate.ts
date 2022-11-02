export default function calculate(code: string, args = null) {
  try {
    // eslint-disable-next-line no-new-func
    return new Function('args', `return ${code}`)(args);
  } catch (error) {
    return error;
  }
}
