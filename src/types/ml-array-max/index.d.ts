declare module 'ml-array-max' {
  export default function max(
    input: Array<number>,
    options?: { fromIndex?: number; toIndex?: number },
  ): number;
}
