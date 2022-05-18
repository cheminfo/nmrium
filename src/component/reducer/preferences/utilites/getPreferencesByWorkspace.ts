import { NMRiumWorkspace } from '../../../NMRium';
import Workspaces from '../../../workspaces';

export function getPreferencesByWorkspace(workspace: NMRiumWorkspace) {
  return Workspaces?.[workspace] || {};
}
