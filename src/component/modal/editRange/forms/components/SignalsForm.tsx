/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import { useCallback, useMemo, memo, useEffect, useState, useRef } from 'react';
import { FaPlus } from 'react-icons/fa';

import { Range } from '../../../../../data/types/data1d';
import Tab from '../../../../elements/Tab/Tab';
import Tabs from '../../../../elements/Tab/Tabs';
import useSpectrum from '../../../../hooks/useSpectrum';
import Events from '../../../../utility/Events';
import { formatNumber } from '../../../../utility/formatNumber';
import { WorkSpacePanelPreferences } from '../../../../workspaces/Workspace';

import AddSignalFormTab from './AddSignalFormTab';
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
  preferences: WorkSpacePanelPreferences['ranges'];
}

function SignalsForm({ range, preferences }: SignalsFormProps) {
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

  const { info }: { info: any } = useSpectrum({ info: {} });

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
            formatNumber(
              Math.abs(event.range[0] - event.range[1]) * info.originFrequency,
              preferences.deltaHz.format,
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
  }, [
    activeField,
    setFieldValue,
    values.activeTab,
    info,
    preferences?.deltaHz?.format,
  ]);

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
      return !!(errors?.signals && errors?.signals[i]);
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
        tabid="addSignalTab"
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
            }}
          >
            <FaPlus style={{ display: 'inline-block' }} />
            <span style={{ display: 'inline-block' }}>New Signal</span>
          </div>
        )}
      >
        <AddSignalFormTab
          onFocus={handleOnFocus}
          range={range}
          ref={newSignalFormRef}
          preferences={preferences}
        />
      </Tab>
    );

    return [...signalTabs, addSignalTab];
  }, [handleOnFocus, preferences, range, tabContainsErrors, values.signals]);

  return (
    <div>
      <SignalFormInfo />
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
