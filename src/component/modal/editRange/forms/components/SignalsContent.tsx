import { Tab, Tabs } from '@blueprintjs/core';
import type { Range } from 'nmr-processing';
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';

import { TabTitle } from '../../../../elements/TabTitle.js';

import { DeltaInput } from './DeltaInput.js';
import { InfoBlock } from './InfoBlock.js';
import { NewSignalTab } from './NewSignalTab.js';
import SignalTab from './SignalTab.js';

interface SignalsFormProps {
  range: Range;
}

type FocusSource = 'peak' | 'coupling' | 'delta' | null;
interface FocusInputContextState {
  focusSource: 'peak' | 'coupling' | 'delta' | null;
  setFocusSource: (source: FocusSource) => void;
}

const FocusInputContext = createContext<FocusInputContextState | null>(null);

export function useEventFocusInput() {
  const context = useContext(FocusInputContext);

  if (!context) {
    throw new Error('FocusInputContext was not found.');
  }

  return context;
}

function FocusInputProvider({ children }) {
  const [focusSource, setFocusSource] = useState<FocusSource>(null);

  const state = useMemo(() => {
    return { focusSource, setFocusSource };
  }, [focusSource]);

  return (
    <FocusInputContext.Provider value={state}>
      {children}
    </FocusInputContext.Provider>
  );
}

function SignalsContent({ range }: SignalsFormProps) {
  const { setValue } = useFormContext();
  const { signals, signalIndex } = useWatch();

  const tapClickHandler = useCallback(
    (id) => {
      setValue('signalIndex', id);
    },
    [setValue],
  );

  const handleDeleteSignal = useCallback(
    (index) => {
      const _signals = signals.filter((_signal, i) => i !== index);
      setValue('signals', _signals);
    },
    [setValue, signals],
  );

  useEffect(() => {
    setValue('signalIndex', signals.length > 0 ? signals.length - 1 : -1);
  }, [setValue, signals.length]);

  const signalFormTabs = useMemo(() => {
    const signalTabs: any[] =
      signals.length > 0
        ? signals.map((signal, i) => (
            <Tab
              // eslint-disable-next-line react/no-array-index-key
              key={`signalForm${i}`}
              id={i}
              panel={<SignalTab index={i} />}
            >
              <TabTitle onDelete={() => handleDeleteSignal(i)}>
                <DeltaInput signal={signal} index={i} />
              </TabTitle>
            </Tab>
          ))
        : [];

    const addSignalTab = (
      <Tab id={-1} key="addSignalTab" panel={<NewSignalTab range={range} />}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#28ba62',
            textWrap: 'nowrap',
          }}
        >
          <FaPlus style={{ display: 'inline-block' }} />
          <span style={{ display: 'inline-block' }}>New Signal</span>
        </div>
      </Tab>
    );

    return [...signalTabs, addSignalTab];
  }, [handleDeleteSignal, range, signals]);

  return (
    <div>
      <InfoBlock />
      <FocusInputProvider>
        <Tabs
          renderActiveTabPanelOnly
          selectedTabId={signalIndex}
          onChange={(id) => tapClickHandler(id)}
          animate={false}
        >
          {signalFormTabs}
        </Tabs>
      </FocusInputProvider>
    </div>
  );
}

export default memo(SignalsContent);
