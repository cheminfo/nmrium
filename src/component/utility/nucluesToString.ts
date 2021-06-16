export default function nucluesToString(nuclues) {
  return typeof nuclues === 'string' ? nuclues : nuclues.join(',');
}
