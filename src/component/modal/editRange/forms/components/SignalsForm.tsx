/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import { Range } from 'nmr-processing';
import { useCallback, useMemo, memo, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';

import Tab from '../../../../elements/Tab/Tab';
import Tabs from '../../../../elements/Tab/Tabs';

import { AddSignalFormTab } from './AddSignalFormTab';
import DeltaInput from './DeltaInput';
import { SignalFormInfo } from './SignalFormInfo';
import SignalFormTab from './SignalFormTab';

const tabStylesAddition = css`
  color: red;
`;
const tabStyles = css`
  padding: 0 1.5rem !important;
  height: 40px;
`;
const newTabStyles = css`
  padding: 0 !important;
  height: 40px;
`;

interface SignalsFormProps {
  range: Range;
}

function SignalsForm({ range }: SignalsFormProps) {
  const {
    values,
    setFieldValue,
    errors,
  }: {
    values: any;
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean | undefined,
    ) => void;
    errors: any;
  } = useFormikContext<any>();

  const tapClickHandler = useCallback(
    ({ tabid }) => {
      setFieldValue('signalIndex', tabid);
    },
    [setFieldValue],
  );

  const handleDeleteSignal = useCallback(
    ({ tabid }) => {
      const _signals = values.signals.filter(
        (_signal, i) => i !== Number(tabid),
      );
      setFieldValue('signals', _signals);
    },
    [setFieldValue, values.signals],
  );

  useEffect(() => {
    setFieldValue(
      'signalIndex',
      values.signals.length > 0 ? (values.signals.length - 1).toString() : '-1',
    );
  }, [setFieldValue, values.signals.length]);

  const tabContainsErrors = useCallback(
    (i) => {
      return !!errors?.signals?.[i];
    },
    [errors],
  );

  const signalFormTabs = useMemo(() => {
    const signalTabs: any[] =
      values.signals.length > 0
        ? values.signals.map((signal, i) => (
            <Tab
              // eslint-disable-next-line react/no-array-index-key
              key={`signalForm${i}`}
              tabid={`${i}`}
              tabstyles={tabContainsErrors(i) ? tabStylesAddition : tabStyles}
              canDelete
              render={() => <DeltaInput signal={signal} index={i} />}
            >
              <SignalFormTab index={i} />
            </Tab>
          ))
        : [];

    const addSignalTab = (
      <Tab
        tabid="-1"
        canDelete={false}
        key="addSignalTab"
        tabstyles={newTabStyles}
        render={() => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 1.5rem',
              fontSize: '12px',
              color: '#28ba62',
              textWrap: 'nowrap',
            }}
          >
            <FaPlus style={{ display: 'inline-block' }} />
            <span style={{ display: 'inline-block' }}>New Signal</span>
          </div>
        )}
      >
        <AddSignalFormTab range={range} />
      </Tab>
    );

    return [...signalTabs, addSignalTab];
  }, [range, tabContainsErrors, values.signals]);

  return (
    <div>
      <SignalFormInfo />
      <Tabs
        activeTab={values.signalIndex}
        onClick={tapClickHandler}
        onDelete={handleDeleteSignal}
      >
        {signalFormTabs}
      </Tabs>
    </div>
  );
}

export default memo(SignalsForm);
