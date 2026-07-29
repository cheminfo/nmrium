import { FormGroup } from '@blueprintjs/core';
import { useFormContext } from 'react-hook-form';

import { NumberInput2Controller } from '../../../../elements/NumberInput2Controller.js';
import { useTabsController } from '../../../../elements/TabsProvider.js';
import { useActiveNucleusTab } from '../../../../hooks/useActiveNucleusTab.ts';
import { usePanelPreferences } from '../../../../hooks/usePanelPreferences.ts';
import { useEvent } from '../../../../utility/Events.js';
import { formatNumber } from '../../../../utility/formatNumber.ts';

import { useEventFocusInput } from './SignalsContent.js';

interface DeltaInputProps {
  index: number;
}

export function DeltaInput({ index }: DeltaInputProps) {
  const { control, setValue } = useFormContext();
  const { selectedTabId: signalIndex } = useTabsController();
  const { focusSource, setFocusSource } = useEventFocusInput();
  const activeTab = useActiveNucleusTab();
  const { tablePreferences } = usePanelPreferences('ranges', activeTab);

  useEvent({
    onClick: ({ xPPM, shiftKey }) => {
      if (index === signalIndex && shiftKey && focusSource === 'delta') {
        setValue(`signals.${index}.delta`, xPPM);
      }
    },
    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;
      if (index === signalIndex && shiftKey && focusSource === 'delta') {
        const delta = (to - from) / 2 + from;
        setValue(`signals.${index}.delta`, delta);
      }
    },
  });

  return (
    <FormGroup
      label="Chemical shift"
      style={{ padding: '10px 0', borderBottom: '1px solid #f8f8f8' }}
    >
      <NumberInput2Controller
        formatOnBlur={(value) =>
          formatNumber(value, tablePreferences.deltaPPM.format)
        }
        control={control}
        name={`signals.${index}.delta`}
        placeholder="e.g. 7.25 ppm"
        size="medium"
        fill
        buttonPosition="none"
        debounceTime={250}
        onClick={() => {
          setFocusSource('delta');
        }}
      />
    </FormGroup>
  );
}
