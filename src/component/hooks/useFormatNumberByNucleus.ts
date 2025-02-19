import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext.js';
import { formatNumber } from '../utility/formatNumber.js';

export type ReturnFunction = (
  value?: number | string,
  formatKey?: 'ppmFormat' | 'hzFormat' | (string & {}),
  prefix?: string,
  suffix?: string,
) => string;

const defaultNuclei = [];

export function useFormatNumberByNucleus(nucleus?: string[]): ReturnFunction[];
export function useFormatNumberByNucleus(nucleus?: string): ReturnFunction;
export function useFormatNumberByNucleus(nucleus?: string | string[]) {
  const preferences = usePreferences();
  // TODO: make sure preferences are not a lie and remove the optional chaining.
  const nucleiPreferences = preferences?.current?.nuclei ?? defaultNuclei;

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
