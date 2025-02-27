import { formatNumber } from '../../../utility/formatNumber.js';

export default class ColumnsHelper {
  private preferences: any;
  private defaultPreference: any;

  public constructor(preferences, defaultPreference) {
    this.preferences = preferences;
    this.defaultPreference = defaultPreference;
  }

  public checkPreferences(preferencesToCheck, key) {
    return (
      preferencesToCheck === undefined ||
      Object.keys(preferencesToCheck).length === 0 ||
      (preferencesToCheck && preferencesToCheck[key] === true)
    );
  }

  public setCustomColumn(array, index, columnLabel, cellHandler) {
    array.push({
      orderIndex: index,
      Header: columnLabel,
      sortType: 'basic',
      Cell: ({ row }) => cellHandler(row),
    });
  }

  public addColumn(
    columns: string,
    flagKey: string,
    formatKey: string,
    columnKey: string,
    columnLabel: string,
    columnIndex: string,
    options: {
      formatPrefix?: string;
      formatSuffix?: string;
      showPrefixSuffixCallback?: (element: any) => boolean;
    } = {},
  ) {
    const preferences = this.preferences || this.defaultPreference;

    if (this.checkPreferences(preferences, flagKey)) {
      this.setCustomColumn(columns, columnIndex, columnLabel, (row) => {
        const format =
          preferences && Object.hasOwn(preferences, formatKey)
            ? preferences[formatKey]
            : this.defaultPreference[formatKey];

        const {
          formatPrefix = '',
          formatSuffix = '',
          showPrefixSuffixCallback = () => true,
        } = options;

        if (showPrefixSuffixCallback(row)) {
          return formatNumber(row.original[columnKey], format, {
            prefix: formatPrefix,
            suffix: formatSuffix,
          });
        } else {
          return formatNumber(row.original[columnKey], format);
        }
      });
    }
  }
}
