/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Formik, FormikProps } from 'formik';
import { useCallback, useState, useRef, useMemo } from 'react';

import {
  SpectrumSimulationOptions,
  defaultSimulationOptions,
} from '../../../data/data1d/spectrumSimulation';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import AboutSpectrumSimulationModal from '../../modal/AboutSpectrumSimulationModal';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import SpectrumSimulationPreferences, {
  SpectrumSimulationPreferencesRefProps,
} from './SpectrumSimulationPreferences';
import SpectrumSimulationSimpleOptions from './SpectrumSimulationSimpleOptions';
import { SpinSystemTable } from './SpinSystemTable';

export default function SpectrumSimulation() {
  const dispatch = useDispatch();
  const [isFlipped, setFlipStatus] = useState(false);
  const [spinSystem, setSpinSystem] = useState('AB');
  const spinSystemRef = useRef('AB');

  const formRef = useRef<FormikProps<SpectrumSimulationOptions>>(null);
  const settingRef = useRef<SpectrumSimulationPreferencesRefProps>(null);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current?.saveSetting();
    setFlipStatus(false);
  }, []);

  function spinSystemChangeHandler(system) {
    spinSystemRef.current = system;
    setSpinSystem(system);
  }

  const data = useMemo(() => {
    const rows: Array<Array<number | null>> = [];
    const spinLength = spinSystem.length;

    for (let i = 1; i <= spinLength; i++) {
      const columns: Array<number | null> = [];
      for (let j = 0; j < spinLength; j++) {
        if (j < i && i !== 1) {
          columns.push(0);
        } else {
          columns.push(null);
        }
      }

      columns[0] = i;
      rows.push(columns);
    }
    return rows;
  }, [spinSystem]);

  function simulateHandler(
    values: SpectrumSimulationOptions,
    keepSpectrum = false,
  ) {
    dispatch({
      type: 'SIMULATE_SPECTRUM',
      payload: { ...values, spinSystem: spinSystemRef.current, keepSpectrum },
    });
  }

  function addSpectrumHandler() {
    const values = formRef.current?.values;
    if (values) {
      simulateHandler(values, true);
    }
  }

  function saveSettingsHandler(values) {
    simulateHandler(values);
    void formRef.current?.setValues(values);
  }

  return (
    <Formik
      initialValues={{ ...defaultSimulationOptions, data }}
      enableReinitialize
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onSubmit={() => {}}
      innerRef={formRef}
    >
      {({ values }) => (
        <>
          <div
            css={[
              tablePanelStyle,
              isFlipped &&
                css`
                  .table-container {
                    table,
                    th {
                      position: relative !important;
                    }
                  }
                `,
            ]}
          >
            {!isFlipped && (
              <DefaultPanelHeader
                showSettingButton
                onSettingClick={settingsPanelHandler}
                canDelete={false}
              >
                <AboutSpectrumSimulationModal />
                <SpectrumSimulationSimpleOptions
                  onSpinSystemChange={spinSystemChangeHandler}
                  spinSystem={spinSystem}
                />
              </DefaultPanelHeader>
            )}
            {isFlipped && (
              <PreferencesHeader
                onSave={saveSettingHandler}
                onClose={settingsPanelHandler}
              />
            )}

            <div className="inner-container">
              {!isFlipped ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'auto',
                  }}
                >
                  <SpinSystemTable spinSystem={spinSystem} />
                  <div style={{ padding: '5px' }}>
                    <Button.Done onClick={addSpectrumHandler}>
                      Add Spectrum
                    </Button.Done>
                  </div>
                </div>
              ) : (
                <SpectrumSimulationPreferences
                  ref={settingRef}
                  options={values}
                  onSave={saveSettingsHandler}
                />
              )}
            </div>
          </div>
          <FormikOnChange
            key={Boolean(isFlipped).toString()}
            onChange={(values) => simulateHandler(values)}
          />
        </>
      )}
    </Formik>
  );
}
