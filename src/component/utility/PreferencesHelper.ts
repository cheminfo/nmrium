import { readSettings } from '../reducer/preferences/preferencesReducer.js';

import { getValue } from './LocalStorage.js';

function GetPreference(preferences, key) {
  const localData = readSettings() || {};
  const val =
    getValue(preferences, `panels.[${key}]`) ||
    getValue(localData, `panels.[${key}]`);
  return val;
}

export { GetPreference };
