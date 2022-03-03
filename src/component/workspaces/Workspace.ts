import { NMRiumPreferences } from '../NMRium';

export interface Workspace {
  version: number;
  label: string;
  display: NMRiumPreferences;
}
