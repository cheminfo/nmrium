export default function getAtom(nucleus: string): string {
  return nucleus?.replaceAll(/\d/g, '') || '';
}
