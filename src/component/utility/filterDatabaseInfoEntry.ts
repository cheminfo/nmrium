import { getJPathsAsObject } from 'get-jpaths';
import type { DatabaseNMREntry } from 'nmr-processing';

export function filterDatabaseInfoEntry(input: DatabaseNMREntry) {
  return getJPathsAsObject(input, {
    maxArrayElements: 5,
    maxDepth: 10,
    includeJPathRegexps: [/^(smiles|names|meta)\./],
  });
}
