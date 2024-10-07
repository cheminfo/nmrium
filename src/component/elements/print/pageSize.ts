import { Layout, PageSizeName } from 'nmr-load-save';

export interface PageSize {
  name: PageSizeName;
  portrait: {
    width: number;
    height: number;
  };
  landscape: {
    width: number;
    height: number;
  };
}

export const pageSizes: PageSize[] = [
  {
    name: 'Letter',
    portrait: { width: 21.59, height: 27.94 },
    landscape: { width: 27.94, height: 21.59 },
  },
  {
    name: 'Legal',
    portrait: { width: 21.59, height: 35.56 },
    landscape: { width: 35.56, height: 21.59 },
  },
  {
    name: 'Tabloid',
    portrait: { width: 27.94, height: 43.18 },
    landscape: { width: 43.18, height: 27.94 },
  },
  {
    name: 'Executive',
    portrait: { width: 26.67, height: 18.42 },
    landscape: { width: 18.42, height: 26.67 },
  },
  {
    name: 'Statement',
    portrait: { width: 21.59, height: 13.97 },
    landscape: { width: 13.97, height: 21.59 },
  },
  {
    name: 'Folio',
    portrait: { width: 33.02, height: 21.59 },
    landscape: { width: 21.59, height: 33.02 },
  },
  {
    name: 'A3',
    portrait: { width: 29.7, height: 42 },
    landscape: { width: 42, height: 29.7 },
  },
  {
    name: 'A4',
    portrait: { width: 21, height: 29.7 },
    landscape: { width: 29.7, height: 21 },
  },
  {
    name: 'A5',
    portrait: { width: 14.8, height: 21 },
    landscape: { width: 21, height: 14.8 },
  },
  {
    name: 'B4',
    portrait: { width: 25.7, height: 36.4 },
    landscape: { width: 36.4, height: 25.7 },
  },
  {
    name: 'B5',
    portrait: { width: 18.2, height: 25.7 },
    landscape: { width: 25.7, height: 18.2 },
  },
];

export function getSizesList(layout: Layout) {
  const output: Array<{ label: string; value: PageSizeName }> = [];

  for (const item of pageSizes) {
    const { name, ...otherKeys } = item;
    const { width, height } = otherKeys[layout];
    output.push({ label: `${name} (${width} cm x ${height} cm)`, value: name });
  }

  return output;
}

export function getPageDimension(page: PageSizeName, layout: Layout) {
  return pageSizes.find((pageItem) => pageItem.name === page)?.[layout];
}
