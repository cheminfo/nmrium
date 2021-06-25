export default function nucleusToString(nucleus) {
  return typeof nucleus === 'string' ? nucleus : nucleus.join(',');
}
