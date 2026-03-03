import type { NmriumState } from '@zakodium/nmrium-core';
import { useCallback } from 'react';

import { toJSON } from '../../data/SpectraManager.ts';
import { useChartData } from '../context/ChartContext.tsx';
import { useCore } from '../context/CoreContext.tsx';
import { usePreferences } from '../context/PreferencesContext.tsx';

import type { SaveIncludeOptions } from './useExport.tsx';

export function useCreateNmriumZip() {
  const state = useChartData();
  const preferencesState = usePreferences();
  const core = useCore();

  return useCallback(
    async (include: SaveIncludeOptions): Promise<Blob> => {
      const nmriumState = toJSON(core, state, preferencesState, {
        serialize: false,
        exportTarget: 'nmrium',
      }) as NmriumState;
      const archive = await core.serializeNmriumArchive({
        state: nmriumState,
        aggregator: state.aggregator,
        includeData: include.dataType !== 'NO_DATA',
        externalData:
          include.dataType === 'SELF_CONTAINED' ? 'embedded' : 'linked',
        includeSettings: include.settings,
        includeView: include.view,
      });
      return new Blob([archive], {
        type: 'chemical/x-nmrium+zip',
      });
    },
    [core, preferencesState, state],
  );
}
