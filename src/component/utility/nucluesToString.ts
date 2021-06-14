export default function nucluesToString(
  nuclues: string | Array<string>,
): string {
  return typeof nuclues === 'string' ? nuclues : nuclues.join(',');
}
