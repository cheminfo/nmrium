export default function generateChar(index: number): string {
  // a
  const aPosition = 97;
  // z
  const zPosition = 122;
  const len = zPosition - aPosition + 1;

  let charResult = '';
  while (index >= 0) {
    charResult = String.fromCodePoint((index % len) + aPosition) + charResult;
    index = Math.floor(index / len) - 1;
  }
  return charResult;
}
