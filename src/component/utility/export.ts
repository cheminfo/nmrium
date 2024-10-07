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
  dpi?: number;
}

function exportAsSVG(targetElementID: string, options: ExportAsSVGOptions) {
  const { fileName, rootElement } = options;
  const { blob } = getBlob(targetElementID, { rootElement });
  saveAs(blob, `${fileName}.svg`);
}

interface ExportAsPNGOptions {
  fileName?: string;
  dpi?: number;
  rootElement: HTMLElement;
  width?: number;
  height?: number;
}

interface CreateObjectURLOptions {
  width: number;
  height: number;
  scaleFactor?: number;
}

async function createCanvas(blob: Blob, options: CreateObjectURLOptions) {
  const { width, height, scaleFactor = 1 } = options;

  const img = await createImageFromBlob(blob);

  const { canvas, context } = await createCanvasByChunks(img, {
    width,
    height,
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

interface DrawImageOptions {
  context: OffscreenCanvasRenderingContext2D;
  chunkX: number;
  chunkY: number;
  chunkSize: number;
  width: number;
  height: number;
  scaleFactor: number;
  img: HTMLImageElement;
}

function drawImage(options: DrawImageOptions) {
  const {
    context,
    img,
    scaleFactor,
    chunkX,
    chunkY,
    chunkSize,
    width,
    height,
  } = options;

  const sourceX = (chunkX * chunkSize) / scaleFactor;
  const sourceY = (chunkY * chunkSize) / scaleFactor;
  const sourceWidth = Math.min(chunkSize / scaleFactor, width - sourceX);
  const sourceHeight = Math.min(chunkSize / scaleFactor, height - sourceY);

  const destX = chunkX * chunkSize;
  const destY = chunkY * chunkSize;
  const destWidth = sourceWidth * scaleFactor;
  const destHeight = sourceHeight * scaleFactor;

  return new Promise<void>((resolve, reject) => {
    try {
      context.save();
      context.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight,
      );
      context.restore();
      setTimeout(resolve, 0);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      reject(error);
    }
  });
}

async function createCanvasByChunks(
  img: HTMLImageElement,
  options: CreateCanvasByChunksOptions,
): Promise<{
  canvas: OffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D;
}> {
  const { width, height, scaleFactor = 1, chunkSize = 512 } = options;
  const canvas = new OffscreenCanvas(width, height);
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
      const chunkPromise = drawImage({
        context,
        img,
        chunkSize,
        chunkX,
        chunkY,
        width,
        height,
        scaleFactor,
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
    width: externalWidth,
    height: externalHeight,
  } = options;
  const {
    blob,
    width: originWidth,
    height: originHeight,
  } = getBlob(targetElementID, { rootElement });

  const width = externalWidth ?? originWidth;
  const height = externalHeight ?? originHeight;
  const scaleFactor = externalWidth ? externalWidth / originWidth : 1
  try {
    const { canvas } = await createCanvas(blob, {
      width,
      height,
      scaleFactor,
    });

    const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
    saveAs(pngBlob, `${fileName}.png`);
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

function transferToCanvas(offscreenCanvas: OffscreenCanvas) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  // Transfer the offscreen canvas to the main canvas
  context.drawImage(offscreenCanvas, 0, 0);

  return canvas;
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
async function copyBlobToClipboard(canvas: OffscreenCanvas) {
  const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
  if (!pngBlob) return;
  const isSafari = /^(?<safari>(?!chrome|android).)*safari/i.test(
    navigator.userAgent,
  );
  if (typeof ClipboardItem !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
    await writeImageToClipboard(pngBlob, isSafari).catch(reportError);
  } else {
    const screenCanvas = transferToCanvas(canvas);
    if (!screenCanvas) {
      return null;
    }
    const png = screenCanvas.toDataURL('image/png', 1);
    copyDataURLClipboardFireFox(png);
    URL.revokeObjectURL(png);
  }
}

interface CopyPNGToClipboardOptions {
  css?: SerializedStyles;
  dpi?: number;
  rootElement: HTMLElement;
  width?: number;
  height?: number;
}

async function copyPNGToClipboard(
  targetElementID: string,
  options: CopyPNGToClipboardOptions,
) {
  const {
    rootElement,
    css,
    width: externalWidth,
    height: externalHeight,
  } = options;
  const {
    blob,
    width: originWidth,
    height: originHeight,
  } = getBlob(targetElementID, {
    rootElement,
    css,
  });

  const width = externalWidth ?? originWidth;
  const height = externalHeight ?? originHeight;
  const scaleFactor = externalWidth ? externalWidth / originWidth : 1

  try {
    const { canvas } = await createCanvas(blob, {
      width,
      height,
      scaleFactor,
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

interface GetBlobOptions {
  rootElement: HTMLElement;
  css?: SerializedStyles;
}

function getBlob(targetElementID: string, options: GetBlobOptions): BlobObject {
  const { rootElement, css } = options;
  const _svg: any = (rootElement.getRootNode() as Document)
    .querySelector(`#${targetElementID}`)
    ?.cloneNode(true);

  const width = Number(_svg?.getAttribute('width').replace('px', ''));
  const height = Number(_svg?.getAttribute('height').replace('px', ''));

  for (const element of _svg.querySelectorAll('[data-no-export="true"]')) {
    element.remove();
  }

  //append the floating molecules in svg element
  const floatingMoleculesGroup = getMoleculesElement(rootElement);
  _svg.append(floatingMoleculesGroup);

  const nmrCss = `
     
  * {
    font-family: Arial, Helvetica, sans-serif;
  }
  .grid line,.grid path{stroke:none;} .peaks-text{fill:#730000} .x path{stroke-width:1px} .x text{
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
      `translate(${matrix.m41} ${matrix.m42 + actionHeaderElement.clientHeight
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
