import lodashGet from 'lodash/get';

import { formatNumber } from '../../../utility/formatNumber';

export default function useFormat(preferences) {
  return (value, keysPath, prefix = '', suffix = '') => {
    const format = lodashGet(preferences, keysPath, '0.000');
    return formatNumber(value, format, prefix, suffix);
  };
}
