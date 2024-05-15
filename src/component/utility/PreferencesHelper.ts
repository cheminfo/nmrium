import { readSettings } from '../reducer/preferences/preferencesReducer';

import { getValue } from './LocalStorage';

function GetPreference(preferences, key) {
  const localData = readSettings() || {};
  const val =
    getValue(preferences, `panels.[${key}]`) ||
    getValue(localData, `panels.[${key}]`);
  return val;
}

export { GetPreference };
