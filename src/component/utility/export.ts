import { SerializedStyles } from '@emotion/react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import lodashGet from 'lodash/get';
import { JpathTableColumn, SpectraTableColumn } from 'nmr-load-save';

/**
 * export the experiments result in JSON format
 * @param data
 * @param fileName
 * @param spaceIndent
 * @param isCompressed
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
    } catch (error) {
      // TODO: handle error.
      reportError(error);
    }
  }
}

function exportAsMatrix(
  data,
  spectraColumns: SpectraTableColumn[],
  fileName = 'experiment',
) {
  //columns labels
  const columnsLabels: string[] = [];
  // listed the spectra panel columns
  for (const col of spectraColumns) {
    if (col.visible && 'jpath' in col) {
      columnsLabels.push(col.label);
    }
  }

  for (const value of data[0].data.x) {
    columnsLabels.push(value);
  }
  let matrix = `${columnsLabels.join('\t')}\n`;

  for (const spectrum of data) {
    const {
      data: { re },
    } = spectrum;

    const cellsValues: string[] = [];
    // listed the spectra cell values
    for (const col of spectraColumns) {
      if (col.visible && 'jpath' in col) {
        const jpath = (col as JpathTableColumn)?.jpath;
        cellsValues.push(lodashGet(spectrum, jpath, `null`));
      }
    }
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
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (context) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.addEventListener('load', () => {
      context?.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png', 1);
      saveAs(png, `${fileName}.png`);
      URL.revokeObjectURL(png);
    });
    img.src = url;
  } catch (error) {
    // TODO: handle error.
    reportError(error);
  }
}

// hack way to copy the image to the clipboard
function copyDataURLClipboardFireFox(image) {
  const img = document.createElement('img');
  img.src = image;

  img.style.position = 'fixed';
  img.style.pointerEvents = 'none';
  img.style.opacity = '0';

  document.body.append(img);
  const range = document.createRange();
  range.selectNode(img);
  window.getSelection()?.addRange(range);
  document.execCommand('Copy');
  img.remove();
}

async function resolveBlob(b: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    resolve(b);
  });
}

async function writeImageToClipboard(image: Blob, isSafari = false) {
  await navigator.clipboard.write([
    new ClipboardItem({ [image.type]: isSafari ? resolveBlob(image) : image }),
  ]);
}
async function copyBlobToClipboard(canvas: HTMLCanvasElement) {
  canvas.toBlob(async (b) => {
    if (!b) return;
    const isSafari = /^(?<safari>(?!chrome|android).)*safari/i.test(
      navigator.userAgent,
    );
    if (typeof ClipboardItem !== 'undefined') {
      await writeImageToClipboard(b, isSafari).catch(reportError);
    } else {
      const png = canvas.toDataURL('image/png', 1);
      copyDataURLClipboardFireFox(png);
      URL.revokeObjectURL(png);
    }
  });
}

async function copyPNGToClipboard(
  rootRef: HTMLDivElement,
  elementID: string,
  css?: SerializedStyles,
) {
  const { blob, width, height } = getBlob(rootRef, elementID, css);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (context) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.addEventListener('load', async () => {
      context?.drawImage(img, 0, 0);
      await copyBlobToClipboard(canvas);
    });
    img.src = url;
  } catch (error) {
    if (error instanceof ReferenceError) {
      // eslint-disable-next-line no-alert
      alert(
        'Your browser does not support this feature, please use Google Chrome or Firefox',
      );
    }
    // TODO: handle error.
    reportError(error);
  }
}

export interface BlobObject {
  blob: Blob;
  width: number;
  height: number;
}

function getBlob(
  rootRef: HTMLDivElement,
  elementID: string,
  css?: SerializedStyles,
): BlobObject {
  const _svg: any = (rootRef.getRootNode() as Document)
    .querySelector(`#${elementID}`)
    ?.cloneNode(true);

  const width = Number(_svg?.getAttribute('width').replace('px', ''));
  const height = Number(_svg?.getAttribute('height').replace('px', ''));
  for (const element of _svg.querySelectorAll('[data-no-export="true"]')) {
    element.remove();
  }

  //append the floating molecules in svg element
  const floatingMoleculesGroup = getMoleculesElement(rootRef);
  _svg.append(floatingMoleculesGroup);

  const nmrCss = `
  .grid line,.grid path{stroke:none;} .peaks-text{fill:#730000} .x path{stroke-width:1px} .x text{
    font-size: 12px;
    font-weight: bold;
  } 
  .nmr-svg,.contours{
    background-color:white;
    fill:white;
  }
  `;

  const head = `<svg class="nmr-svg"  viewBox='0 0 ${width} ${height}' width="${width}"  height="${height}"  version="1.1" xmlns="http://www.w3.org/2000/svg">`;
  const style = `<style>
  ${css?.styles || nmrCss}
  </style>`;
  const svg = `${head + style + _svg.innerHTML}</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return { blob, width, height };
}

function getMatrix(element) {
  const transform = window
    .getComputedStyle(element)
    .getPropertyValue('transform');
  return new DOMMatrix(transform);
}

function getMoleculesElement(rootRef) {
  const nmriumViewer: any = (rootRef.getRootNode() as Document).querySelector(
    `#nmrium-viewer`,
  );

  const floatingMoleculesGroup = document.createElement('g');

  for (const element of nmriumViewer.querySelectorAll('.draggable-molecule')) {
    const matrix = getMatrix(element);
    const actionHeaderElement = element.querySelector(
      '.float-molecule-actions',
    );
    const molElement = element
      .cloneNode(true)
      .querySelector('svg[id^="molSVG"]');
    const group = document.createElement('g');
    group.append(molElement);
    group.setAttribute(
      'transform',
      `translate(${matrix.m41} ${
        matrix.m42 + actionHeaderElement.clientHeight
      })`,
    );
    floatingMoleculesGroup.append(group);
  }
  return floatingMoleculesGroup;
}

export {
  exportAsSVG,
  exportAsJSON,
  exportAsNMRE,
  exportAsPng,
  copyPNGToClipboard,
  exportAsMol,
  exportAsMatrix,
  getBlob,
};
