import lodashGet from 'lodash/get';
import numeral from 'numeral';
import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext';

export type ReturnFunction = (
  value?: number | string,
  formatKey?: string,
  prefix?: string,
  suffix?: string,
) => string;

export function useFormatNumberByNucleus(
  nucleus?: Array<string>,
): Array<ReturnFunction>;
export function useFormatNumberByNucleus(nucleus?: string): ReturnFunction;
export function useFormatNumberByNucleus(nucleus?: string | Array<string>) {
  const preferences = usePreferences();
  const nucleusByKey = lodashGet(preferences.current, `formatting.nuclei`, {
    ppm: '0.0',
    hz: '0.0',
  });

  return useMemo(() => {
    function formatFun(n: string) {
      return (value: any, formatKey = 'ppm', prefix = '', suffix = '') => {
        const formattedNumber = numeral(Number(value)).format(
          lodashGet(nucleusByKey, `${n.toLowerCase()}.${formatKey}`, '0.0'),
        );
        return `${prefix}${formattedNumber}${suffix}`;
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
  }, [nucleus, nucleusByKey]);
}
