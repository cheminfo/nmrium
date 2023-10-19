import type { ClipboardItemDataType } from 'clipboard-polyfill';

export function readText(): Promise<string> {
  return import('clipboard-polyfill').then((c) => c.readText());
}

export function read(): Promise<ClipboardItems> {
  return import('clipboard-polyfill').then((c) => c.read());
}

export function writeText(data: string): Promise<void> {
  return import('clipboard-polyfill').then((c) => c.writeText(data));
}

export interface ClipboardItemInterface {
  readonly presentationStyle?: PresentationStyle;
  readonly lastModified?: number;
  readonly delayed?: boolean;
  readonly types: readonly string[];
  getType(type: string): Promise<Blob>;
}
export function write(data: ClipboardItemInterface[]): Promise<void> {
  return import('clipboard-polyfill').then((c) => c.write(data));
}

export function newClipboardItem(
  items: Record<string, ClipboardItemDataType>,
  options?: ClipboardItemOptions,
): Promise<ClipboardItem> {
  return import('clipboard-polyfill').then(
    (c) => new c.ClipboardItem(items, options),
  );
}
