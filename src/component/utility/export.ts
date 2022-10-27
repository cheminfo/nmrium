import * as clipboard from 'clipboard-polyfill';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

async function copyHTMLToClipboard(data) {
  return copyToClipboard(data, 'text/html');
}
async function copyTextToClipboard(data) {
  return copyToClipboard(data, 'text/plain');
}

async function copyToClipboard(data, type: 'text/html' | 'text/plain') {
  try {
    if (typeof ClipboardItem !== 'undefined') {
      void navigator.clipboard.write([
        new ClipboardItem({
          [type]: new Promise((resolve) => {
            resolve(new Blob([data], { type }));
          }),
        }),
      ]);
    } else {
      //TODO when Firefox team implement ClipboardItem this code should be removed
      // this library is used mainly to solve the problem of copy HTML to a clipboard in Firefox but we use it for both HTML and plain text
      const item = new clipboard.ClipboardItem({
        [type]: new Blob([data], { type }),
      });
      await clipboard.write([item]);
    }

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
    (key, value) =>
      ArrayBuffer.isView(value) ? Array.from(value as any) : value,
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
    saveAs(content, `${fileName}.nmredata`);
  });
}

function exportAsMol(data, fileName = 'mol') {
  const blob = new Blob([data], { type: 'text/plain' });
  saveAs(blob, `${fileName}.mol`);
}
/**
 * export the vitalization result as SVG, if you need to remove some content during exportation process enclose the the content with <!-- export-remove --> ${content} <!-- export-remove -->
 */

function exportAsSVG(
  rootRef: HTMLDivElement,
  elementID: string,
  fileName = 'experiment',
) {
  const { blob } = getBlob(rootRef, elementID);
  saveAs(blob, `${fileName}.svg`);
}

function exportAsPng(
  rootRef: HTMLDivElement,
  elementID: string,
  fileName = 'experiment',
) {
  const { blob, width, height } = getBlob(rootRef, elementID);
  try {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');

    if (context) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    let img = new Image();
    let url = URL.createObjectURL(blob);
    img.onload = async () => {
      context?.drawImage(img, 0, 0);
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

// hack way to copy the image to the clipboard
function copyDataURLClipboardFireFox(image) {
  const img = document.createElement('img');
  img.src = image;

  img.style.position = 'fixed';
  img.style.pointerEvents = 'none';
  img.style.opacity = '0';

  document.body.appendChild(img);
  const range = document.createRange();
  range.selectNode(img);
  window.getSelection()?.addRange(range);
  document.execCommand('Copy');
  document.body.removeChild(img);
}

function copyBlobToClipboard(canvas) {
  canvas.toBlob((b) => {
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

function copyPNGToClipboard(rootRef: HTMLDivElement, elementID: string) {
  const { blob, width, height } = getBlob(rootRef, elementID);
  try {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');

    if (context) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    let img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = async () => {
      context?.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png', 1);

      // @ts-expect-error write exists in some browsers
      if (navigator.clipboard.write) {
        copyBlobToClipboard(canvas);
      } else {
        copyDataURLClipboardFireFox(png);
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

export interface BlobObject {
  blob: Blob;
  width: number;
  height: number;
}

function getBlob(rootRef: HTMLDivElement, elementID: string): BlobObject {
  let _svg: any = (rootRef.getRootNode() as Document)
    .getElementById(elementID)
    ?.cloneNode(true);
  const width = Number(_svg?.getAttribute('width').replace('px', ''));
  const height = Number(_svg?.getAttribute('height').replace('px', ''));
  _svg
    .querySelectorAll('[data-no-export="true"]')
    .forEach((element) => element.remove());
  _svg
    .querySelectorAll('[data-replace-float-structure="true"]')
    .forEach((element: Element) => {
      element.replaceWith(element.childNodes[0].childNodes[0]);
      return element;
    });
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
  getBlob,
};
