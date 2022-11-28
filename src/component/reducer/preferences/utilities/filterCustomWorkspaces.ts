import { Workspace } from '../../../workspaces/Workspace';

export function filterCustomWorkspaces(workspaces: Record<string, Workspace>) {
  const mapObject = {};
  for (const key in workspaces) {
    if (!key.startsWith('custom-')) {
      mapObject[key] = workspaces[key];
    }
  }
  return mapObject;
}
