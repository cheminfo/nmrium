export default function getAtom(nucleus: string): string {
  return nucleus.replace(/[0-9]/g, '');
}
