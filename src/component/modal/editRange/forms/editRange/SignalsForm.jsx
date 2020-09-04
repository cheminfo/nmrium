import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { useCallback, useMemo, memo } from 'react';

import { Tabs } from '../../../../elements/Tab';

import AddSignalFormTab from './AddSignalFormTab';
import SignalFormTab from './SignalFormTab';

const SignalsForm = memo(() => {
  const { values, setFieldValue, getFieldMeta } = useFormikContext();
  // const dispatch = useDispatch();

  const tapClickHandler = useCallback(
    ({ tabid }) => {
      if (tabid !== undefined) {
        if (typeof tabid === 'number') {
          setFieldValue('selectedSignalIndex', tabid);
        }
        //  else if (
        //   typeof identifier === 'string' &&
        //   identifier === 'addSignalTab'
        // ) {
        // dispatch({
        //   type: SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED,
        //   isEnabled: true,
        // });
        // }
      }
    },
    [setFieldValue],
  );

  const onDeleteSignal = useCallback(() => {
    const _signals = values.signals.filter(
      (signal, i) => i !== values.selectedSignalIndex,
    );
    setFieldValue('signals', _signals);
    setFieldValue('selectedSignalIndex', _signals.length - 1);
  }, [setFieldValue, values.selectedSignalIndex, values.signals]);

  const signalFormTabs = useMemo(() => {
    return values.signals
      .map((signal, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={`signalForm${i}`}
          tabid={i}
          tablabel={`${'\u0394'}: ${signal.delta.toFixed(5)} (${
            signal.multiplicity
          })`}
        >
          <SignalFormTab />
        </div>
      ))
      .concat(
        <div
          tablabel={'\u002B'}
          tabid="addSignalTab"
          candelete="false"
          key="addSignalTab"
        >
          <AddSignalFormTab />
        </div>,
      );
  }, [values.signals]);

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
        onClick={tapClickHandler}
        canDelete={true}
        onDelete={onDeleteSignal}
      >
        {signalFormTabs}
      </Tabs>
    </div>
  );
});

export default SignalsForm;
