/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import { useCallback, useMemo } from 'react';

import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';

import SignalFormTab from './SignalFormTab';

const textStyles = css`
  text-align: center;
  width: 100%;

  .errorText {
    color: red;
  }

  .infoText {
    padding: 10px;
    margin: 10px 0;
    font-size: 14px;
    text-align: left;
    color: white;
    background-color: #5f5f5f;
    border-radius: 5px;
  }
`;

const tabStylesAddition = css`
  color: red;
`;
const tabStyles = css`
  display: inline-grid;
  list-style: none;
  padding: 0.5rem 1.5rem;
`;

function SignalsForm() {
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

  const tabContainsErrors = useCallback(
    (i) => {
      return errors?.signals && errors?.signals[i] ? true : false;
    },
    [errors],
  );

  const signalFormTabs = useMemo(() => {
    const signalTabs =
      values.signals.length > 0
        ? values.signals.map((signal, i) => (
            <Tab
              // eslint-disable-next-line react/no-array-index-key
              key={`signalForm_zone${i}`}
              tabid={`${i}`}
              tabstyles={tabContainsErrors(i) ? tabStylesAddition : tabStyles}
              render={() => (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontSize: '11px',
                  }}
                >
                  <span>
                    𝛅<sub>{signal.x.nucleus}</sub>: {signal.x.delta.toFixed(2)}
                  </span>
                  <span>
                    𝛅<sub>{signal.y.nucleus}</sub>: {signal.y.delta.toFixed(2)}
                  </span>
                </div>
              )}
            >
              <SignalFormTab signalIndex={i} />
            </Tab>
          ))
        : [];

    return signalTabs;
  }, [tabContainsErrors, values.signals]);

  const tapClickHandler = useCallback(
    ({ tabid }) => {
      setFieldValue('activeTab', tabid);
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

  return (
    <div>
      <div css={textStyles} />
      <Tabs
        activeTab={values.activeTab}
        onClick={tapClickHandler}
        onDelete={handleDeleteSignal}
      >
        {signalFormTabs}
      </Tabs>
    </div>
  );
}

export default SignalsForm;
