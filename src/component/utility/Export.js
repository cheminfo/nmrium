import { saveAs } from 'file-saver';

// function removeContent(content) {
//   return content.replace(
//     /&lt;!--[\s]*export-remove[\s]*--&gt.+?&lt;!--[\s]*export-remove[\s]*--&gt;/gi,
//     '',
//   );
// }
/**
 * export the experiments result in JSON format
 * @param {*} data
 */
function exportAsJSON(data) {
  const fileData = JSON.stringify(data, undefined, 2);
  const blob = new Blob([fileData], { type: 'text/plain' });
  saveAs(blob, 'experiment.json');
}
/**
 * export the vitalization result as SVG, if you need to remove some content during exportation process enclose the the content with <!-- export-remove --> ${content} <!-- export-remove -->
 * @param {*} tagID  // tag identifier  ex <div id="main"></div>  tagID=main
 * @param {*} styles // add specific style for the exported svg
 * @param {*} headerProps  // svg tag variables in addition to title="experiments" version="1.1" xmlns="http://www.w3.org/2000/svg"
 */
function exportAsSVG() {
  const { blob } = getBlob();
  saveAs(blob, 'experiments.svg');
}

function exportAsPng() {
  const { blob, width, height } = getBlob();
  try {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    let img = new Image();
    let url = URL.createObjectURL(blob);
    img.onload = async function() {
      context.drawImage(img, 0, 0);
      let png = canvas.toDataURL('image/png', 1);
      saveAs(png, 'experiments.png');
      URL.revokeObjectURL(png);
    };
    img.src = url; //   canvas.appendChild();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}
function copyToClipboard() {
  const { blob, width, height } = getBlob();
  try {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    let img = new Image();
    let url = URL.createObjectURL(blob);
    img.onload = async function() {
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
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

function getBlob() {
  let _svg = document.getElementById('svg-container').cloneNode(true);
  const width = _svg.getAttribute('width');
  const height = _svg.getAttribute('height');
  _svg
    .querySelectorAll('[data-no-export="true"]')
    .forEach((element) => element.remove());
  const head = `<svg width="${width}"  height="${height}" title="experiments" version="1.1" xmlns="http://www.w3.org/2000/svg">`;
  const style = `<style>.grid line,.grid path{stroke:none;} .regular-text{fill:black} .x path{stroke-width:1px} .x text{
    font-size: 12px;
    font-weight: bold;
  } </style>`;
  const svg = `${head + style + _svg.innerHTML}</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return { blob, width, height };
}

export { exportAsSVG, exportAsJSON, exportAsPng, copyToClipboard };
