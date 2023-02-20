export function isMetaFile(file: File) {
  return ['text/csv', 'text/tsv', 'text/plain'].includes(file?.type);
}
