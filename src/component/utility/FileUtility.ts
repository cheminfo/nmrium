export const FILES_TYPES = {
  MOL: 'mol',
  NMRIUM: 'nmrium',
  JSON: 'json',
  DX: 'dx',
  JDX: 'jdx',
  JDF: 'jdf',
  ZIP: 'zip',
  NMREDATA: 'nmredata',
};
export const FILES_SIGNATURES = {
  ZIP: '504b0304',
};

function getFileSignature(fileArrayBuffer) {
  let uint = '';
  for (const byte of new Uint8Array(fileArrayBuffer).slice(0, 4)) {
    uint += byte.toString(16).padStart(2, '0');
  }
  return uint;
}

async function loadFile(file, options = { asBuffer: false }) {
  const response = await fetch(file);
  checkStatus(response);
  const data = options.asBuffer ? response.arrayBuffer() : response.text();
  return data;
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

function getFileExtension(name) {
  return name.replace(/^.*\./, '').toLowerCase();
}

function getFileName(name) {
  return name.substr(0, name.lastIndexOf('.'));
}

function extractFileMetaFromPath(path) {
  const meta = path.replace(/^.*[\\/]/, '').split('.');

  return { name: meta[0].toLowerCase(), extension: meta[1].toLowerCase() };
}
/**
 *
 * @param {Array<File>} acceptedFiles
 * @param {object} options
 * @param {boolean} options.asBuffer
 * @returns
 */
function loadFiles<T = unknown>(
  acceptedFiles,
  options: { asBuffer?: boolean } = {},
) {
  return Promise.all(
    ([] as Array<T>).map.call(acceptedFiles, (file: any) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onabort = (e) => reject(e);
        reader.onerror = (e) => reject(e);
        reader.onload = () => {
          if (reader.result) {
            const binary = reader.result;
            const name = getFileName(file.name);
            const extension = getFileExtension(file.name);
            resolve({ binary, name, extension });
          }
        };
        if (options.asBuffer) {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsBinaryString(file);
        }
      });
    }),
  ) as Promise<Array<T>>;
}

export {
  loadFiles,
  loadFile,
  getFileExtension,
  getFileName,
  extractFileMetaFromPath,
  getFileSignature,
};
