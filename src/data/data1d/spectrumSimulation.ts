export function getSpinSystem() {
  const spinSystem: string[] = [];
  let temp = 'A';
  for (let i = 66; i <= 72; i++) {
    temp += String.fromCodePoint(i);
    spinSystem.push(temp);
  }
  return spinSystem;
}
