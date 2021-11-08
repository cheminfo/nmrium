export default function calculate(code: string, args = null) {
  try {
    return new Function('args', `return ${code}`)(args);
  } catch (e) {
    return e;
  }
}
