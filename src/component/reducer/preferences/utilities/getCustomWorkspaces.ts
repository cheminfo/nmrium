import type { CustomWorkspaces } from '@zakodium/nmrium-core';
import { migrateSettings } from '@zakodium/nmrium-core';

import type {
  NMRiumCustomWorkspaces,
  VersionedCustomWorkspaces,
} from '../../../main/index.js';

/**
 * Migrates the workspaces coming from the component when they carry a version.
 */
export function getCustomWorkspaces(
  customWorkspaces: NMRiumCustomWorkspaces = {},
): CustomWorkspaces {
  if (!isVersioned(customWorkspaces)) return customWorkspaces;

  const { version, workspaces } = customWorkspaces;
  return migrateSettings({ version, workspaces: structuredClone(workspaces) })
    .workspaces;
}

function isVersioned(
  customWorkspaces: NMRiumCustomWorkspaces,
): customWorkspaces is VersionedCustomWorkspaces {
  return typeof customWorkspaces.version === 'number';
}
