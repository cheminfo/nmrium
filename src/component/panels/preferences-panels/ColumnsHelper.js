import FormatNumber from '../../utility/FormatNumber';

export class ColumnsHelper {
  constructor(preferences, defaultPreference) {
    this.preferences = preferences;
    this.defaultPreference = defaultPreference;
  }

  checkPreferences(rangesPreferences, key) {
    const val =
      rangesPreferences === undefined ||
      Object.keys(rangesPreferences).length === 0 ||
      (rangesPreferences && rangesPreferences[key] === true)
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
  ) {
    const preferences = this.preferences || this.defaultPreference;

    if (this.checkPreferences(preferences, flagKey)) {
      this.setCustomColumn(columns, columnIndex, columnLabel, (row) => {
        const format =
          preferences &&
          Object.prototype.hasOwnProperty.call(preferences, formatKey)
            ? preferences[formatKey]
            : this.defaultPreference[formatKey];

        return FormatNumber(
          row.original[columnKey],
          format,
          formatPrefix,
          formatSuffix,
        );
      });
    }
  }
}
