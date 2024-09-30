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

interface ExportAsSVGOptions {
  fileName?: string;
  rootElement: HTMLElement;
  width?: number;
  height?: number;
}

function exportAsSVG(targetElementID: string, options: ExportAsSVGOptions) {
  const { fileName, rootElement } = options;
  const { blob } = getBlob(rootElement, targetElementID);
  saveAs(blob, `${fileName}.svg`);
}

interface ExportAsPNGOptions {
  fileName?: string;
  resolution?: number;
  rootElement: HTMLElement;
  width?: number;
  height?: number;
}

interface CreateObjectURLOptions {
  width: number;
  height: number;
  resolution?: number;
}

async function createCanvas(blob: Blob, options: CreateObjectURLOptions) {
  const { resolution, width, height } = options;

  /**
   * Change the canvas size based on DPI
   * 96 is the default DPI for web
   * */

  let scaleFactor = 1;
  let scaledWidth = width;
  let scaledHeight = height;

  if (resolution) {
    scaleFactor = resolution / 96;
    scaledWidth = width * scaleFactor;
    scaledHeight = height * scaleFactor;
  }

  const img = await createImageFromBlob(blob);

  const { canvas, context } = await createCanvasByChunks(img, {
    width: scaledWidth,
    height: scaledHeight,
    scaleFactor,
  });

  return { canvas, context };
}

interface CreateCanvasByChunksOptions {
  width: number;
  height: number;
  chunkSize?: number;
  scaleFactor?: number;
}

async function createCanvasByChunks(
  img: HTMLImageElement,
  options: CreateCanvasByChunksOptions,
): Promise<{ canvas: HTMLCanvasElement; context: CanvasRenderingContext2D }> {
  const { width, height, scaleFactor = 1, chunkSize = 512 } = options;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  // Fill the background with white
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);

  const chunksPromises: Array<Promise<void>> = [];

  const numChunksX = Math.ceil(width / chunkSize);
  const numChunksY = Math.ceil(height / chunkSize);

  for (let chunkX = 0; chunkX < numChunksX; chunkX++) {
    for (let chunkY = 0; chunkY < numChunksY; chunkY++) {
      const x = chunkX * chunkSize;
      const y = chunkY * chunkSize;
      const chunkWidth = Math.min(chunkSize, width - x);
      const chunkHeight = Math.min(chunkSize, height - y);

      const chunkPromise = new Promise<void>((resolve) => {
        context.save();
        context.scale(scaleFactor, scaleFactor);
        context.drawImage(
          img,
          x / scaleFactor,
          y / scaleFactor,
          chunkWidth / scaleFactor,
          chunkHeight / scaleFactor,
          x,
          y,
          chunkWidth,
          chunkHeight,
        );
        context.restore();
        setTimeout(resolve, 0);
      });

      chunksPromises.push(chunkPromise);
    }
  }

  await Promise.all(chunksPromises);

  return { canvas, context };
}
async function exportAsPng(
  targetElementID: string,
  options: ExportAsPNGOptions,
) {
  const {
    rootElement,
    fileName = 'experiment',
    resolution,
    width: externalWidth,
    height: externalHeight,
  } = options;
  const {
    blob,
    width: originWidth,
    height: originHeight,
  } = getBlob(rootElement, targetElementID);

  const width = externalWidth ?? originWidth;
  const height = externalHeight ?? originHeight;

  try {
    const { canvas } = await createCanvas(blob, {
      width,
      height,
      resolution,
    });

    canvas.toBlob((pngBlob) => {
      if (pngBlob) {
        saveAs(pngBlob, `${fileName}.png`);
      }
    }, 'image/png');
  } catch (error) {
    // TODO: handle error.
    reportError(error);
  }
}

function createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.addEventListener('load', () => {
      URL.revokeObjectURL(url);
      resolve(img);
    });
    img.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    });
    img.src = url;
  });
}

// hack way to copy the image to the clipboard
// TODO: remove when Firefox widely supports ClipboardItem
// https://caniuse.com/mdn-api_clipboarditem
function copyDataURLClipboardFireFox(image) {
  const img = document.createElement('img');
  img.src = image;

  img.style.position = 'fixed';
  img.style.pointerEvents = 'none';
  img.style.opacity = '0';

  document.body.append(img);
  const range = document.createRange();
  range.selectNode(img);
  globalThis.getSelection()?.addRange(range);
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
      // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
      await writeImageToClipboard(b, isSafari).catch(reportError);
    } else {
      const png = canvas.toDataURL('image/png', 1);
      copyDataURLClipboardFireFox(png);
      URL.revokeObjectURL(png);
    }
  });
}

interface CopyPNGToClipboardOptions {
  css?: SerializedStyles;
  resolution?: number;
  rootElement: HTMLElement;
}

async function copyPNGToClipboard(
  targetElementID: string,
  options: CopyPNGToClipboardOptions,
) {
  const { rootElement, css, resolution } = options;
  const { blob, width, height } = getBlob(rootElement, targetElementID, css);
  try {
    const { canvas } = await createCanvas(blob, {
      width,
      height,
      resolution,
    });
    await copyBlobToClipboard(canvas);
  } catch (error) {
    if (error instanceof ReferenceError) {
      // eslint-disable-next-line no-alert
      globalThis.alert(
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
  rootRef: HTMLElement,
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
  * {
    font-family: Arial, Helvetica, sans-serif;
  }
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
  const transform = globalThis
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
