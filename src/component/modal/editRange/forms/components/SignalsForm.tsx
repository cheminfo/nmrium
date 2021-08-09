/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import { useCallback, useMemo, memo, useEffect, useState, useRef } from 'react';

import { useChartData } from '../../../../context/ChartContext';
import Tab from '../../../../elements/Tab/Tab';
import Tabs from '../../../../elements/Tab/Tabs';
import useSpectrum from '../../../../hooks/useSpectrum';
import Events from '../../../../utility/Events';
import { useFormatNumberByNucleus } from '../../../../utility/FormatNumber';

import AddSignalFormTab from './AddSignalFormTab';
import DeltaInput from './DeltaInput';
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

interface SignalsFormProps {
  range: number;
}

function SignalsForm({ range }: SignalsFormProps) {
  const newSignalFormRef = useRef<any>();
  const [activeField, setActiveField] = useState<string | null>(null);

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

  const { activeTab } = useChartData();
  const { info }: { info: any } = useSpectrum({ info: {} });
  const format = useFormatNumberByNucleus(activeTab);

  useEffect(() => {
    function handle(event) {
      if (info?.originFrequency && activeField) {
        if (values.activeTab === 'addSignalTab') {
          newSignalFormRef.current.setValues({
            [activeField]:
              (event.range[1] - event.range[0]) / 2 + event.range[0],
          });
        } else if (activeField.includes('delta')) {
          setFieldValue(
            activeField,
            (event.range[1] - event.range[0]) / 2 + event.range[0],
          );
        } else {
          const value = Number(
            format(
              Math.abs(event.range[0] - event.range[1]) * info.originFrequency,
            ),
          );
          setFieldValue(activeField, value);
        }
      }

      setActiveField(null);
    }

    Events.on('brushEnd', handle);

    return () => {
      Events.off('brushEnd', handle);
    };
  }, [activeField, setFieldValue, values.activeTab, format, info]);

  useEffect(() => {
    function handle(event) {
      if (activeField) {
        if (values.activeTab === 'addSignalTab') {
          newSignalFormRef.current.setValues({ [activeField]: event.xPPM });
        } else if (activeField.includes('delta')) {
          setFieldValue(activeField, event.xPPM);
        }
      }
      setActiveField(null);
    }

    Events.on('mouseClick', handle);

    return () => {
      Events.off('mouseClick', handle);
    };
  }, [values.activeTab, activeField, setFieldValue]);

  const handleOnFocus = useCallback(
    (event) => {
      setActiveField(event.target.name);
    },
    [setActiveField],
  );

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

  useEffect(() => {
    setFieldValue(
      'activeTab',
      values.signals.length > 0
        ? (values.signals.length - 1).toString()
        : 'addSignalTab',
    );
  }, [setFieldValue, values.signals.length]);

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
              key={`signalForm${i}`}
              tabid={`${i}`}
              tabstyles={tabContainsErrors(i) ? tabStylesAddition : tabStyles}
              canDelete
              render={() => (
                <DeltaInput signal={signal} index={i} onFocus={handleOnFocus} />
              )}
            >
              <SignalFormTab onFocus={handleOnFocus} />
            </Tab>
          ))
        : [];

    const addSignalTab = (
      <Tab
        tablabel="+"
        tabid="addSignalTab"
        canDelete={false}
        key="addSignalTab"
        className="add-signal-tab"
      >
        <AddSignalFormTab
          onFocus={handleOnFocus}
          range={range}
          ref={newSignalFormRef}
        />
      </Tab>
    );

    return signalTabs.concat(addSignalTab);
  }, [handleOnFocus, range, tabContainsErrors, values.signals]);

  const editSignalInfoText = (
    <p className="infoText">
      Focus on an input field and press Shift + Drag &#38; Drop to draw a
      coupling constant in spectrum view.
    </p>
  );

  const addSignalInfoText = (
    <p className="infoText">
      Focus on the input field and press Shift + Left mouse click to select new
      signal delta value in spectrum view.
    </p>
  );

  return (
    <div>
      <div css={textStyles}>
        {errors.signals &&
        (errors.signals.noSignals || errors.signals.noCouplings) ? (
          <div>
            <p className="errorText">
              {errors.signals.noSignals ||
                errors.signals.noCouplings[0].message}
            </p>
            {errors.signals.noSignals ? addSignalInfoText : null}
          </div>
        ) : values.activeTab === 'addSignalTab' ? (
          addSignalInfoText
        ) : (
          editSignalInfoText
        )}
      </div>
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

export default memo(SignalsForm);
