import lodashGet from 'lodash/get';

import FormatNumber from '../../../utility/FormatNumber';

export default function useFormat(preferences) {
  return (value, keysPath, prefix = '', suffix = '') => {
    const format = lodashGet(preferences, keysPath, '0.000');
    return FormatNumber(value, format, prefix, suffix);
  };
}
