import type { ToastProps } from '@blueprintjs/core';
import type { SerializedStyles } from '@emotion/react';
import type {
  JpathTableColumn,
  SpectraTableColumn,
} from '@zakodium/nmrium-core';
import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import dlv from 'dlv';
import fileSaver from 'file-saver';

export const browserNotSupportedErrorToast: ToastProps = {
  message:
    'Your browser does not support this feature, please use the latest version of Google Chrome or Firefox',
  intent: 'danger',
};

/**
 * export the experiments result in JSON format
 * @param data
 * @param fileName
 * @param spaceIndent
 * @param isCompressed
 */
async function exportAsJSON(
  data: any,
  fileName = 'experiment',
  spaceIndent = 0,
  isCompressed = false,
) {
  const fileData = JSON.stringify(
    data,
    (key, value: any) =>
      ArrayBuffer.isView(value) ? Array.from(value as any) : value,
    spaceIndent,
  );
  if (!isCompressed) {
    const blob = new Blob([fileData], { type: 'text/plain' });
    fileSaver.saveAs(blob, `${fileName}.nmrium`);
  } else {
    try {
      const zip = new ZipWriter(new BlobWriter());
      await zip.add(`${fileName}.nmrium`, new TextReader(fileData));
      const blob = await zip.close();
      fileSaver.saveAs(blob, `${fileName}.nmrium`);
    } catch (error) {
      // TODO: handle error.
      reportError(error);
    }
  }
}

function exportAsMatrix(
  data: any,
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
        cellsValues.push(dlv(spectrum, jpath, `null`));
      }
    }
    for (const value of re) {
      cellsValues.push(value);
    }
    matrix += `${cellsValues.join('\t')}\n`;
  }

  const blob = new Blob([matrix], { type: 'text/tab-separated-values' });
  fileSaver.saveAs(blob, `${fileName}.tsv`);
}

interface ExportDimensions {
  width?: number;
  height?: number;
}

interface ExportAsSVGOptions extends ExportDimensions {
  fileName?: string;
  rootElement: HTMLElement;
  dpi?: number;
}

function exportAsSVG(targetElementID: string, options: ExportAsSVGOptions) {
  const { fileName, rootElement } = options;
  const { blob } = getBlob(targetElementID, { rootElement });
  fileSaver.saveAs(blob, `${fileName}.svg`);
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
  const { rootElement, fileName = 'experiment' } = options;
  const { blob, width, height } = getBlob(targetElementID, { rootElement });

  const { canvas } = await createCanvas(blob, {
    width,
    height,
    scaleFactor: 1,
  });

  const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
  fileSaver.saveAs(pngBlob, `${fileName}.png`);
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
function copyDataURLClipboardFireFox(image: any) {
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
    new ClipboardItem({
      [image.type]: isSafari ? resolveBlob(image) : image,
    }),
  ]);
}
async function copyBlobToClipboard(canvas: OffscreenCanvas) {
  // Check if the document is focused, If it is not focused, throw an error to inform the user.
  if (!document.hasFocus()) {
    throw new Error(
      'Copy failed because the browser is not focused. Please click the window to focus and try again.',
    );
  }

  const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
  if (!pngBlob) return;
  const isSafari = /^(?<safari>(?!chrome|android).)*safari/i.test(
    navigator.userAgent,
  );
  if (typeof ClipboardItem !== 'undefined') {
    await writeImageToClipboard(pngBlob, isSafari);
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDimensions(
  source: Required<ExportDimensions>,
  target?: ExportDimensions,
) {
  const width = target?.width ?? source.width;
  const height = target?.height ?? source.height;
  const scale = width ? width / source.width : 1;
  return { width, height, scale };
}

interface CopyPNGToClipboardOptions extends ExportDimensions {
  css?: SerializedStyles;
  dpi?: number;
  rootElement: HTMLElement;
}

async function copyPNGToClipboard(
  targetElementID: string,
  options: CopyPNGToClipboardOptions,
) {
  const { rootElement, css } = options;
  const { blob, width, height } = getBlob(targetElementID, {
    rootElement,
    css,
  });

  const { canvas } = await createCanvas(blob, {
    width,
    height,
    scaleFactor: 1,
  });
  return copyBlobToClipboard(canvas);
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

function parseDimension(value: string | null) {
  return Number(value?.replace('px', '') || 0);
}

function getBlob(targetElementID: string, options: GetBlobOptions): BlobObject {
  const { rootElement, css } = options;
  const _svg: any = (rootElement.getRootNode() as Document)
    .querySelector(`#${targetElementID}`)
    ?.cloneNode(true);

  const width = parseDimension(_svg?.getAttribute('width'));
  const height = parseDimension(_svg?.getAttribute('height'));
  const viewBox = _svg?.getAttribute('viewBox') || `0 0 ${width} ${height}`;

  for (const element of _svg.querySelectorAll('[data-no-export="true"]')) {
    element.remove();
  }

  const head = `<svg class="nmr-svg"  viewBox="${viewBox}" width="${width}"  height="${height}"  version="1.1" xmlns="http://www.w3.org/2000/svg">`;
  const style = `
      <style>${css?.styles || ''}</style>
`;
  const svg = `${head + style + _svg.innerHTML}</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });

  return { blob, width, height };
}

export {
  copyPNGToClipboard,
  exportAsJSON,
  exportAsMatrix,
  exportAsPng,
  exportAsSVG,
  getBlob,
};
