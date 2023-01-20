export function isMetaInformationFile(file: File) {
  return ['text/csv', 'text/tsv', 'text/plain'].includes(file?.type);
}
