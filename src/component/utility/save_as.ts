// eslint-disable-next-line no-restricted-imports
import fileSaver from 'file-saver';

type Extension = `.${string}`;

interface SaveAsOptions {
  blob: Blob;
  name: string;
  extension: Extension;
}

export function saveAs(options: SaveAsOptions) {
  const { blob, name, extension } = options;

  fileSaver(blob, `${name}${extension}`);
}
