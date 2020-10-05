import { saveAs } from 'file-saver';

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
function exportAsJSON(data, fileName = 'experiment') {
  const fileData = JSON.stringify(data, undefined, 2);
  const blob = new Blob([fileData], { type: 'text/plain' });
  saveAs(blob, `${fileName}.nmrium`);
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
    img.src = url; //   canvas.appendChild();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
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
    let url = URL.createObjectURL(blob);
    img.onload = async function () {
      context.drawImage(img, 0, 0);
      let png = canvas.toDataURL('image/png', 1);
      canvas.toBlob((b) => {
        // eslint-disable-next-line no-undef
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
  const head = `<svg  viewBox='0 0 ${width} ${height}' width="${width}"  height="${height}"  version="1.1" xmlns="http://www.w3.org/2000/svg">`;
  const style = `<style>.grid line,.grid path{stroke:none;} .regular-text{fill:black} .x path{stroke-width:1px} .x text{
    font-size: 12px;
    font-weight: bold;
  } </style>`;
  const svg = `${head + style + _svg.innerHTML}</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return { blob, width, height };
}

export {
  exportAsSVG,
  exportAsJSON,
  exportAsPng,
  copyPNGToClipboard,
  copyTextToClipboard,
  copyHTMLToClipboard,
  exportAsMol,
};
