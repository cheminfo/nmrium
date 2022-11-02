export default function getAtom(nucleus: string): string {
  return nucleus?.replace(/\d/g, '') || '';
}
