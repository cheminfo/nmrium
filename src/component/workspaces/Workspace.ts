import { NMRiumPreferences } from '../NMRium';

interface NucleusFormat {
  key: string;
  name: string;
  ppm: string;
  hz: string;
}
interface Controllers {
  dimmedSpectraTransparency: number;
}

interface Formatting {
  nucleus: NucleusFormat[];
  nucleusByKey: Record<string, NucleusFormat>;
  panels: any;
}
export interface Workspace {
  version: number;
  label: string;
  display: NMRiumPreferences;
  controllers: Controllers;
  formatting: Formatting;
}
