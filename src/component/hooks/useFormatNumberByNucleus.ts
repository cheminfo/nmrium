import lodashGet from 'lodash/get';
import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext';
import { formatNumber } from '../utility/formatNumber';

export type ReturnFunction = (
  value?: number | string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  formatKey?: 'ppmFormat' | 'hzFormat' | (string & {}),
  prefix?: string,
  suffix?: string,
) => string;

export function useFormatNumberByNucleus(nucleus?: string[]): ReturnFunction[];
export function useFormatNumberByNucleus(nucleus?: string): ReturnFunction;
export function useFormatNumberByNucleus(nucleus?: string | string[]) {
  const preferences = usePreferences();
  const nucleiPreferences = lodashGet(preferences.current, `nuclei`, []);

  return useMemo(() => {
    function formatFun(n: string) {
      const preferences = nucleiPreferences?.find(
        ({ nucleus }) => nucleus.toLowerCase() === n.toLowerCase(),
      ) || {
        ppmFormat: '0.0',
        hzFormat: '0.0',
      };
      return (
        value: any,
        formatKey = 'ppmFormat',
        prefix = '',
        suffix = '',
      ) => {
        return formatNumber(value, preferences[formatKey], {
          prefix,
          suffix,
        });
      };
    }

    if (!nucleus) {
      return () => undefined;
    }

    if (typeof nucleus === 'string') {
      return formatFun(nucleus);
    } else if (Array.isArray(nucleus)) {
      return nucleus.map((n) => formatFun(n));
    } else {
      throw new Error('nuclus must be string or array of string');
    }
  }, [nucleiPreferences, nucleus]);
}
