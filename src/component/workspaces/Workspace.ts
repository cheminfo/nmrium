import { NMRiumPreferences } from '../NMRium';

interface NucleusFormat {
  name: string;
  ppm: string;
  hz: string;
}
interface Controllers {
  dimmedSpectraTransparency: number;
}

export interface Formatting {
  nuclei: Record<string, NucleusFormat>;
  panels: any;
}
export interface Workspace {
  version: number;
  label: string;
  display: NMRiumPreferences;
  controllers: Controllers;
  formatting: Formatting;
}
