import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { useCallback, useMemo, memo } from 'react';

import { Tabs } from '../Tab';

import AddSignalFormTab from './AddSignalFormTab';
import SignalFormTab from './SignalFormTab';

const SignalsForm = memo(({ checkMultiplicity, translateMultiplicity }) => {
  const { values, setFieldValue, getFieldMeta } = useFormikContext();

  const deleteSignal = useCallback(() => {
    const _signals = values.signals.filter(
      (signal, i) => i !== values.selectedSignalIndex,
    );
    setFieldValue('signals', _signals);
    setFieldValue('selectedSignalIndex', _signals.length - 1);
  }, [setFieldValue, values.selectedSignalIndex, values.signals]);

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
          <SignalFormTab
            onDeleteSignal={deleteSignal}
            checkMultiplicity={checkMultiplicity}
            translateMultiplicity={translateMultiplicity}
          />
        </div>
      ))
      .concat(
        <div label={'\u002B'} key="addSignalTab">
          {/* <AddSignalFormTab checkMultiplicity={checkMultiplicity} /> */}
          <AddSignalFormTab />
        </div>,
      );
  }, [checkMultiplicity, deleteSignal, translateMultiplicity, values.signals]);

  const metaDataSignals = getFieldMeta('signals');

  return (
    <div>
      {metaDataSignals.error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>
          {metaDataSignals.error}
        </p>
      ) : null}
      <Tabs
        defaultTabID={values.selectedSignalIndex}
        onClick={onTapClickHandler}
      >
        {signalFormTabs}
      </Tabs>
    </div>
  );
});

export default SignalsForm;
