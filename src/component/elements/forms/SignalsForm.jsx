import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { useCallback, useMemo, memo } from 'react';

import detectSignal from '../../../data/data1d/detectSignal';
import { Tabs } from '../Tab';

import AddSignalFormTab from './AddSignalFormTab';
import SignalFormTab from './SignalFormTab';

const SignalsForm = memo(() => {
  const { values, setFieldValue } = useFormikContext();

  const deleteSignal = useCallback(() => {
    const _signals = values.signals.filter(
      (signal, i) => i !== values.selectedSignalIndex,
    );
    setFieldValue('signals', _signals);
    setFieldValue('selectedSignalIndex', _signals.length - 1);
  }, [setFieldValue, values.selectedSignalIndex, values.signals]);

  const addSignal = useCallback(async () => {
    const newSignal = detectSignal(
      values.spectrumData.x,
      values.spectrumData.re,
      values.newSignalFrom,
      values.newSignalTo,
      values.spectrumData.info.frequency,
    );
    const _signals = values.signals.slice();
    setFieldValue('signals', _signals.concat(newSignal));
    setFieldValue('selectedSignalIndex', _signals.length - 1);
  }, [
    setFieldValue,
    values.newSignalFrom,
    values.newSignalTo,
    values.signals,
    values.spectrumData.info.frequency,
    values.spectrumData.re,
    values.spectrumData.x,
  ]);

  const onTapClickHandler = useCallback(
    ({ identifier }) => {
      if (identifier !== undefined && typeof identifier === 'number') {
        setFieldValue('selectedSignalIndex', identifier);
      }
    },
    [setFieldValue],
  );

  const signalFormTabs = useMemo(() => {
    return values.signals
      .map((signal, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={`signalForm${i}`}
          identifier={i}
          label={`${'\u0394'}: ${signal.delta.toFixed(3)} (${
            signal.multiplicity
          })`}
        >
          <SignalFormTab signal={signal} onDeleteSignal={deleteSignal} />
        </div>
      ))
      .concat(
        <div label={'\u002B'} key="addSignalTab">
          <AddSignalFormTab onAddSignal={addSignal} />
        </div>,
      );
  }, [addSignal, deleteSignal, values.signals]);

  return (
    <Tabs defaultTabID={values.selectedSignalIndex} onClick={onTapClickHandler}>
      {signalFormTabs}
    </Tabs>
  );
});

export default SignalsForm;
