import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { useCallback, useMemo, memo } from 'react';

import { useDispatch } from '../../../context/DispatchContext';
import {
  SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED,
  UNSET_SELECTED_NEW_SIGNAL_DELTA,
} from '../../../reducer/types/Types';
import { Tabs } from '../../Tab';

import AddSignalFormTab from './AddSignalFormTab';
import SignalFormTab from './SignalFormTab';

const SignalsForm = memo(() => {
  const { values, setFieldValue, getFieldMeta } = useFormikContext();
  const dispatch = useDispatch();

  const onTapClickHandler = useCallback(
    ({ identifier }) => {
      if (identifier !== undefined) {
        if (typeof identifier === 'number') {
          setFieldValue('selectedSignalIndex', identifier);
          dispatch({
            type: SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED,
            isEnabled: false,
          });
          dispatch({
            type: UNSET_SELECTED_NEW_SIGNAL_DELTA,
          });
        } else if (
          typeof identifier === 'string' &&
          identifier === 'addSignalTab'
        ) {
          dispatch({
            type: SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED,
            isEnabled: true,
          });
        }
      }
    },
    [dispatch, setFieldValue],
  );

  const signalFormTabs = useMemo(() => {
    return values.signals
      .map((signal, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={`signalForm${i}`}
          identifier={i}
          label={`${'\u0394'}: ${signal.delta.toFixed(5)} (${
            signal.multiplicity
          })`}
        >
          <SignalFormTab />
        </div>
      ))
      .concat(
        <div label={'\u002B'} identifier="addSignalTab" key="addSignalTab">
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
        onClick={onTapClickHandler}
      >
        {signalFormTabs}
      </Tabs>
    </div>
  );
});

export default SignalsForm;
