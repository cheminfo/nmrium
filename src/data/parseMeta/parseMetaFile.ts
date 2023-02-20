import { parse, ParseResult } from 'papaparse';
import { FileWithPath } from 'react-dropzone';

export async function parseMetaFile(
  file: FileWithPath | File,
): Promise<ParseResult<any>> {
  return new Promise((complete, error) => {
    parse(file, {
      header: true,
      dynamicTyping: true,
      complete,
      error,
    });
  });
}
