/* eslint-disable default-param-last */
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

function copyFormattedHtml(html) {
  // Create an iframe (isolated container) for the HTML
  let container = document.createElement('div');
  container.innerHTML = html;

  // Hide element
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.opacity = 0;

  // Detect all style sheets of the page
  let activeSheets = Array.prototype.slice
    .call(document.styleSheets)
    .filter(function (sheet) {
      return !sheet.disabled;
    });

  // Mount the iframe to the DOM to make `contentWindow` available
  document.body.appendChild(container);

  // Copy to clipboard
  window.getSelection().removeAllRanges();

  let range = document.createRange();
  range.selectNode(container);
  window.getSelection().addRange(range);

  document.execCommand('copy');
  for (let i = 0; i < activeSheets.length; i++) {
    activeSheets[i].disabled = true;
  }
  document.execCommand('copy');
  for (let i = 0; i < activeSheets.length; i++) {
    activeSheets[i].disabled = false;
  }

  // Remove the iframe
  document.body.removeChild(container);
}

async function copyHTMLToClipboard(data) {
  try {
    copyFormattedHtml(data);
    return true;
  } catch (err) {
    return false;
  }
}
async function copyTextToClipboard(data) {
  try {
    await navigator.clipboard.writeText(data);
    return true;
  } catch (err) {
    return false;
  }
}
/**
 * export the experiments result in JSON format
 * @param {*} data
 */
async function exportAsJSON(
  data,
  fileName = 'experiment',
  spaceIndent = 0,
  isCompressed = false,
) {
  const fileData = JSON.stringify(
    data,
    (key, value) => (ArrayBuffer.isView(value) ? Array.from(value) : value),
    spaceIndent,
  );
  if (!isCompressed) {
    const blob = new Blob([fileData], { type: 'text/plain' });
    saveAs(blob, `${fileName}.nmrium`);
  } else {
    try {
      const zip = new JSZip();
      zip.file(`${fileName}.nmrium`, fileData);
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9,
        },
      });
      saveAs(blob, `${fileName}.nmrium`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}

function exportAsMatrix(data, options, fileName = 'experiment') {
  // eslint-disable-next-line no-unused-vars
  const { from, to, nbPoints } = options;

  //columns labels
  const columnsLables = ['name', 'experiment'];
  for (const value of data[0].data.x) {
    columnsLables.push(value);
  }
  let matrix = `${columnsLables.join('\t')}\n`;

  for (const spectrum of data) {
    const {
      data: { re },
      info: { experiment },
      display: { name },
    } = spectrum;
    const cellsValues = [name, experiment];
    for (const value of re) {
      cellsValues.push(value);
    }
    matrix += `${cellsValues.join('\t')}\n`;
  }

  const blob = new Blob([matrix], { type: 'text/tab-separated-values' });
  saveAs(blob, `${fileName}.tsv`);
}

function exportAsNMRE(data, fileName = 'experiment') {
  data.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, `${fileName}.zip`);
  });
}

function exportAsMol(data, fileName = 'mol') {
  const blob = new Blob([data], { type: 'text/plain' });
  saveAs(blob, `${fileName}.mol`);
}
/**
 * export the vitalization result as SVG, if you need to remove some content during exportation process enclose the the content with <!-- export-remove --> ${content} <!-- export-remove -->
 */
function exportAsSVG(fileName = 'experiment', elementID) {
  const { blob } = getBlob(elementID);
  saveAs(blob, `${fileName}.svg`);
}

function exportAsPng(fileName = 'experiment', elementID) {
  const { blob, width, height } = getBlob(elementID);
  try {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    let img = new Image();
    let url = URL.createObjectURL(blob);
    img.onload = async function () {
      context.drawImage(img, 0, 0);
      let png = canvas.toDataURL('image/png', 1);
      saveAs(png, `${fileName}.png`);
      URL.revokeObjectURL(png);
    };
    img.src = url;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

function copyDataURLCliboard(image) {
  const img = document.createElement('img');
  img.src = image;

  img.style.position = 'fixed';
  img.style.pointerEvents = 'none';
  img.style.opacity = 0;

  document.body.appendChild(img);
  const range = document.createRange();
  range.selectNode(img);
  window.getSelection().addRange(range);
  document.execCommand('Copy');
  document.body.removeChild(img);
}

function copyBlobToCliboard(canvas) {
  canvas.toBlob((b) => {
    //eslint-disable-next-line no-undef
    const clip = new ClipboardItem({
      [b.type]: b,
    });
    navigator.clipboard.write([clip]).then(
      () => {
        // eslint-disable-next-line no-console
        console.log('experiment copied.');
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      },
    );
  });
}

function copyPNGToClipboard(elementID) {
  const { blob, width, height } = getBlob(elementID);
  try {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    let img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = async function () {
      context.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png', 1);
      if (navigator.clipboard.write) {
        copyBlobToCliboard(canvas);
      } else {
        copyDataURLCliboard(png);
      }

      URL.revokeObjectURL(png);
    };
    img.src = url;
  } catch (e) {
    if (e instanceof ReferenceError) {
      // eslint-disable-next-line no-alert
      alert(
        'Your browser does not support this feature, please use Google Chrome',
      );
    }
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

function getBlob(elementID) {
  // nmrSVG
  let _svg = document.getElementById(elementID).cloneNode(true);
  const width = _svg.getAttribute('width').replace('px', '');
  const height = _svg.getAttribute('height').replace('px', '');
  _svg
    .querySelectorAll('[data-no-export="true"]')
    .forEach((element) => element.remove());
  const head = `<svg class="nmr-svg"  viewBox='0 0 ${width} ${height}' width="${width}"  height="${height}"  version="1.1" xmlns="http://www.w3.org/2000/svg">`;
  const style = `<style>.grid line,.grid path{stroke:none;} .peaks-text{fill:#730000} .x path{stroke-width:1px} .x text{
    font-size: 12px;
    font-weight: bold;
  } 
 
  .nmr-svg,.contours{
    background-color:white;
    fill:white;
  }
  

  
  </style>`;
  const svg = `${head + style + _svg.innerHTML}</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return { blob, width, height };
}

export {
  exportAsSVG,
  exportAsJSON,
  exportAsNMRE,
  exportAsPng,
  copyPNGToClipboard,
  copyTextToClipboard,
  copyHTMLToClipboard,
  exportAsMol,
  exportAsMatrix,
};
