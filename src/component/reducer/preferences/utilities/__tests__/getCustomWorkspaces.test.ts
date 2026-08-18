import { CURRENT_EXPORT_VERSION } from '@zakodium/nmrium-core';
import { expect, test } from 'vitest';

import { getCustomWorkspaces } from '../getCustomWorkspaces.js';

const workspaces = {
  metabolomics: { label: 'Metabolomics', axis: { primaryTicks: {} } },
} as any;

test('workspaces without version are used as is', () => {
  expect(getCustomWorkspaces(workspaces)).toBe(workspaces);
});

test('workspaces with the current version are unchanged', () => {
  expect(
    getCustomWorkspaces({ version: CURRENT_EXPORT_VERSION, workspaces }),
  ).toStrictEqual(workspaces);
});

test('older workspaces are migrated without mutating the input', () => {
  const result = getCustomWorkspaces({ version: 20, workspaces });

  expect(result.metabolomics.axis?.primaryTicks).toStrictEqual({
    tickStyle: { stroke: '#000000', strokeOpacity: 1, strokeWidth: 1 },
  });
  expect(workspaces.metabolomics.axis.primaryTicks).toStrictEqual({});
});

test('missing workspaces default to an empty object', () => {
  expect(getCustomWorkspaces()).toStrictEqual({});
});
