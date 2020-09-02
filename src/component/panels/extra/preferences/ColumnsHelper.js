import lodash from 'lodash';

import FormatNumber from '../../../utility/FormatNumber';

export default class ColumnsHelper {
  constructor(preferences, defaultPreference) {
    this.preferences = preferences;
    this.defaultPreference = defaultPreference;
  }

  checkPreferences(preferencesToCheck, key) {
    const val =
      preferencesToCheck === undefined ||
      Object.keys(preferencesToCheck).length === 0 ||
      (preferencesToCheck && preferencesToCheck[key] === true)
        ? true
        : false;
    return val;
  }

  setCustomColumn(array, index, columnLabel, cellHandler) {
    array.push({
      orderIndex: index,
      Header: columnLabel,
      sortType: 'basic',
      Cell: ({ row }) => cellHandler(row),
    });
  }
  /**
   * @callback hasPrefix
   * @param {...any}
   * @returns {boolean}
   */

  /**
   *
   * @param {string} columns
   * @param {string} flagKey
   * @param {string} formatKey
   * @param {string} columnKey
   * @param {string} columnLabel
   * @param {string} columnIndex
   * @param {Object=} [option = {}]
   * @param {string} [option.formatPrefix = '']
   * @param {string} [option.formatSuffix = '']
   * @param {hasPrefix}   [option.showPrefixSuffixCallback = ()=>true]
   */
  addColumn(
    columns,
    flagKey,
    formatKey,
    columnKey,
    columnLabel,
    columnIndex,
    options = {},
  ) {
    const preferences = this.preferences || this.defaultPreference;

    if (this.checkPreferences(preferences, flagKey)) {
      this.setCustomColumn(columns, columnIndex, columnLabel, (row) => {
        const format =
          preferences &&
          Object.prototype.hasOwnProperty.call(preferences, formatKey)
            ? preferences[formatKey]
            : this.defaultPreference[formatKey];

        const {
          formatPrefix = '',
          formatSuffix = '',
          showPrefixSuffixCallback = () => true,
        } = options;

        if (showPrefixSuffixCallback(row)) {
          return FormatNumber(
            row.original[columnKey],
            format,
            formatPrefix,
            formatSuffix,
          );
        } else {
          return FormatNumber(row.original[columnKey], format, '', '');
        }
      });
    }
  }
}

export function isCloumnVisible(preferences, key) {
  return lodash.get(preferences, key, false);
}
