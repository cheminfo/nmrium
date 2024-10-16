import type { FileCollectionItem } from 'filelist-utils';
import type { ParseResult } from 'papaparse';
import papa from 'papaparse';

export async function parseMetaFile(
  file: FileCollectionItem | File,
): Promise<ParseResult<any>> {
  const data = file instanceof File ? file : await file.text();
  return new Promise((complete, error) => {
    papa.parse(data, {
      header: true,
      dynamicTyping: true,
      complete,
      error,
    });
  });
}
