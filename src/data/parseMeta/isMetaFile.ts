import type { FileItem } from 'file-collection';

export function isMetaFile(file: File | FileItem) {
  if (file instanceof File) {
    return ['text/csv', 'text/tsv', 'text/plain'].includes(file?.type);
  }

  const extension = file?.name?.replace(/^.*\./, '').toLowerCase();
  return ['csv', 'tsv', 'text'].includes(extension);
}
