import { Draft } from 'immer';
import { TopicMolecule } from 'openchemlib-utils';

export function deepReplaceDiaIDs(
  data: Draft<object>,
  mappings: ReturnType<TopicMolecule['getDiaIDsMapping']>,
) {
  for (const key in data) {
    if (key !== 'diaIDs') {
      if (typeof data[key] === 'object' && !ArrayBuffer.isView(data[key])) {
        deepReplaceDiaIDs(data[key], mappings);
      }
      continue;
    }
    if (!Array.isArray(data[key])) {
      throw new Error('diaIDs must be an array');
    }
    const diaIDs = data[key];
    for (let i = 0; i < diaIDs.length; i++) {
      const diaID = diaIDs[i];
      if (typeof diaID !== 'string') {
        throw new Error('diaID must be a string');
      }
      const newDiaID = mappings[diaID];
      if (newDiaID) {
        diaIDs[i] = newDiaID;
      }
    }
  }
}
