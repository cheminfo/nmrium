import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import lodash from 'lodash';
import { useCallback, useMemo, memo, useEffect, useState } from 'react';

import { useChartData } from '../../../../context/ChartContext';
import { Tabs } from '../../../../elements/Tab';
import { translateMultiplet } from '../../../../panels/extra/utilities/MultiplicityUtilities';
import Events from '../../../../utility/Events';

import AddSignalFormTab from './AddSignalFormTab';
import SignalFormTab from './SignalFormTab';

const textStyles = css`
  text-align: center;
  width: 100%;

  .errorText {
    color: red;
  }

  .infoText {
    margin-bottom: 20px;
    font-size: 11px;
  }
`;

const tabStylesAddition = css`
  color: red;
`;

const SignalsForm = memo(() => {
  const { values, setFieldValue, errors } = useFormikContext();

  const { data: spectraData, activeSpectrum } = useChartData();
  const [activeField, setActiveField] = useState(null);
  const [frequency, setFrequency] = useState(null);

  useEffect(() => {
    if (
      spectraData &&
      activeSpectrum &&
      lodash.get(
        spectraData,
        `[${activeSpectrum.index}].info.originFrequency`,
        undefined,
      )
    ) {
      setFrequency(spectraData[activeSpectrum.index].info.originFrequency);
    } else {
      setFrequency(null);
    }
  }, [activeSpectrum, spectraData]);

  useEffect(() => {
    const unsubscribe = Events.subscribe('brushEnd', (event) => {
      if (values.activeTab !== 'addSignalTab' && activeField && frequency) {
        setFieldValue(
          activeField,
          Math.abs(event.range[0] - event.range[1]) * frequency,
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeField, setFieldValue, frequency, values.activeTab]);

  useEffect(() => {
    const unsubscribe = Events.subscribe('mouseClick', (event) => {
      if (values.activeTab === 'addSignalTab' && activeField) {
        setFieldValue(activeField, event.xPPM);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [values.activeTab, activeField, setFieldValue]);

  const handleOnFocus = useCallback(
    (name) => {
      setActiveField(name);
    },
    [setActiveField],
  );

  const handleOnBlur = useCallback(() => {
    setActiveField(null);
  }, []);

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
      return (
        errors.signals &&
        (lodash
          .get(errors, 'signals.noCouplings', [])
          .some((_error) => _error.index === i) ||
          lodash.get(errors, `signals[${i}].missingCouplings`, []).length > 0)
      );
    },
    [errors],
  );

  const signalFormTabs = useMemo(() => {
    const signalTabs =
      values.signals.length > 0
        ? values.signals.map((signal, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`signalForm${i}`}
              tabid={`${i}`}
              tablabel={`${'\u0394'}: ${signal.delta.toFixed(
                5,
              )} (${signal.j
                .map((_coupling) => translateMultiplet(_coupling.multiplicity))
                .join('')})`}
              tabstyles={tabContainsErrors(i) ? tabStylesAddition : null}
            >
              <SignalFormTab onFocus={handleOnFocus} onBlur={handleOnBlur} />
            </div>
          ))
        : [];

    const addSignalTab = (
      <div
        tablabel={'\u002B'}
        tabid="addSignalTab"
        candelete="false"
        key="addSignalTab"
      >
        <AddSignalFormTab onFocus={handleOnFocus} onBlur={handleOnBlur} />
      </div>
    );

    return signalTabs.concat(addSignalTab);
  }, [handleOnBlur, handleOnFocus, tabContainsErrors, values.signals]);

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
        defaultTabID={values.activeTab}
        onClick={tapClickHandler}
        canDelete={true}
        onDelete={handleDeleteSignal}
      >
        {signalFormTabs}
      </Tabs>
    </div>
  );
});

export default SignalsForm;
