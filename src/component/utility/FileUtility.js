export const FILES_TYPES = {
  MOL: 'mol',
  NMRIUM: 'nmrium',
  JSON: 'json',
  DX: 'dx',
  JDX: 'jdx',
  JDF: 'jdf',
  ZIP: 'zip',
  SDF: 'sdf',
};
export const FILES_SIGNATURES = {
  ZIP: '504b0304',
};

function getFileSignature(string) {
  return Buffer.from(string)
    .slice(0, 4)
    .reduce((acc, byte) => (acc += byte.toString(16).padStart(2, '0')), '');
}

async function loadFile(file) {
  const response = await fetch(file);
  checkStatus(response);
  const data = await response.text();
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
  const meta = path
    // eslint-disable-next-line no-useless-escape
    .replace(/^.*[\\\/]/, '')
    .split('.');

  return { name: meta[0].toLowerCase(), extension: meta[1].toLowerCase() };
}

function loadFiles(acceptedFiles, options = {}) {
  return Promise.all(
    [].map.call(acceptedFiles, (file) => {
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
  );
}

async function loadFilesFromZip(files, options = {}) {
  const result = [];
  for (const file of files) {
    try {
      const binary = await file.async(options.asBuffer ? 'uint8array' : 'text');
      const name = getFileName(file.name);
      const extension = getFileExtension(file.name);
      result.push({ binary, name, extension });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
  return result;
}

export {
  loadFiles,
  loadFilesFromZip,
  loadFile,
  getFileExtension,
  getFileName,
  extractFileMetaFromPath,
  getFileSignature,
};
