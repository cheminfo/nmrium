<<<<<<< HEAD:src/component/utility/Evaluate.ts
export default function calculate(code: string, args = null) {
=======
export default function calculate(code: string, args: any = null) {
>>>>>>> 91ebc4ff (refactor: change component/utility from js to ts):src/component/utility/Evaluate.js
  try {
    // eslint-disable-next-line no-new-func
    return new Function('args', `return ${code}`)(args);
  } catch (e) {
    return e;
  }
}
