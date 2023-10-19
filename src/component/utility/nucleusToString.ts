export function is2DNucleus(nucleus: string) {
  return nucleus.includes(',');
}

export default function nucleusToString(nucleus) {
  return typeof nucleus === 'string' ? nucleus : nucleus.join(',');
}
