import { FileCollectionItem } from 'filelist-utils';

export function isMetaFile(file: File | FileCollectionItem) {
  if (file instanceof File) {
    return ['text/csv', 'text/tsv', 'text/plain'].includes(file?.type);
  }

  const extension = file?.name?.replace(/^.*\./, '').toLowerCase();
  return ['csv', 'tsv', 'text'].includes(extension);
}
