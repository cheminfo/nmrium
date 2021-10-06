declare module 'smart-array-filter' {
  /**
   *
   * @param {Array} array
   * @param {object} [options={}]
   * @param {number} [options.limit=Infinity]
   * @param {boolean} [options.caseSensitive=false]
   * @param {string|Array} [options.keywords=[]]
   * @param {boolean} [options.index=false] Returns the indices in the array that match
   * @param {boolean} [options.predicate='AND'] Could be either AND or OR
   */

  interface filterOptions {
    limit?: number;
    caseSensitive?: boolean;
    keywords?: string[];
    index?: boolean;
    predicate?: 'AMD' | 'OR';
  }
  declare function filter(array, options: filterOptions = {});
}
