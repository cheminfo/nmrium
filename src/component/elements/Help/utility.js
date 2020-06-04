async function load(filePath) {
  const response = await fetch(filePath);
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

export { load };
