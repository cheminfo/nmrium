import { FileCollectionItem } from 'filelist-utils';
import { parse, ParseResult } from 'papaparse';

export async function parseMetaFile(
  file: FileCollectionItem | File,
): Promise<ParseResult<any>> {
  const data = file instanceof File ? file : await file.text();
  return new Promise((complete, error) => {
    parse(data, {
      header: true,
      dynamicTyping: true,
      complete,
      error,
    });
  });
}
