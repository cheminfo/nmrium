import { NmrLoadersFilter } from 'nmr-load-save/lib/types/Options/ParsingOptions';

export interface Source {
  fileCollection: {
    relativePath: string;
    name: string;
    lastModified: number;
    size: number;
  }[];
  filter: NmrLoadersFilter;
}
