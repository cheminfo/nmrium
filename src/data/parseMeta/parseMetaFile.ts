import type { FileItem } from 'file-collection';
import type { ParseResult } from 'papaparse';
import papa from 'papaparse';

export async function parseMetaFile(
  file: FileItem | File,
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
