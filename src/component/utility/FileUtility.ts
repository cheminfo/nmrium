async function loadFile(file, options: { asBuffer?: boolean } = {}) {
  const { asBuffer = false } = options;
  const response = await fetch(file);
  checkStatus(response);
  const data = asBuffer ? response.arrayBuffer() : response.text();
  return data;
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

function extractFileMetaFromPath(path) {
  const meta = path.replace(/^.*[/\\]/, '').split('.');

  return { name: meta[0].toLowerCase(), extension: meta[1].toLowerCase() };
}

export { loadFile, extractFileMetaFromPath };
