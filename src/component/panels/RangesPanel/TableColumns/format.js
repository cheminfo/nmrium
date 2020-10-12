import lodash from 'lodash';

import FormatNumber from '../../../utility/FormatNumber';

export default function useFormat(preferences) {
  return (value, keysPath, prefix = '', suffix = '') => {
    const format = lodash.get(preferences, keysPath, '0.000');
    return FormatNumber(value, format, prefix, suffix);
  };
}
