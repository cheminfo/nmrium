import FormatNumber from '../../utility/FormatNumber';

export class ColumnsHelper {
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

  addColumn(
    columns,
    flagKey,
    formatKey,
    columnKey,
    columnLabel,
    columnIndex,
    formatPrefix = '',
    formatSuffix = '',
    showPrefixSuffixCallback = () => true,
  ) {
    const preferences = this.preferences || this.defaultPreference;

    if (this.checkPreferences(preferences, flagKey)) {
      this.setCustomColumn(columns, columnIndex, columnLabel, (row) => {
        const format =
          preferences &&
          Object.prototype.hasOwnProperty.call(preferences, formatKey)
            ? preferences[formatKey]
            : this.defaultPreference[formatKey];

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
