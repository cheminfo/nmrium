/* eslint-disable no-console */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Formik, FormikProps } from 'formik';
import { useCallback, useState, useRef, useMemo } from 'react';

import {
  defaultSimulationOptions,
  mapSpinSystem,
} from '../../../data/data1d/spectrumSimulation';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import AboutSpectrumSimulationModal from '../../modal/AboutSpectrumSimulationModal';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import SpectrumSimulationPreferences from './SpectrumSimulationPreferences';
import SpectrumSimulationSimpleOptions from './SpectrumSimulationSimpleOptions';
import { SpinSystemTable } from './SpinSystemTable';

export default function SpectrumSimulation() {
  const [isFlipped, setFlipStatus] = useState(false);
  const [spinSystem, setSpinSystem] = useState('AB');

  const optionsFormRef = useRef<FormikProps<any>>(null);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    void optionsFormRef.current?.submitForm();
    setFlipStatus(false);
  }, []);

  function spinSystemChangeHandler(system) {
    setSpinSystem(system);
  }

  const data = useMemo(() => {
    const rows: (number | null)[][] = [];
    const spinLength = spinSystem.length;

    for (let i = 1; i <= spinLength; i++) {
      const columns: (number | null)[] = [];
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

  console.log(isFlipped);

  function simulateHandler(values, source: 'onChange' | 'submit' = 'submit') {
    console.log(source, spinSystem, isFlipped);
    if ((source === 'onChange' && !isFlipped) || source === 'submit') {
      console.log(mapSpinSystem(spinSystem, values.data));
    }
  }

  return (
    <Formik
      initialValues={{ ...defaultSimulationOptions, data }}
      enableReinitialize
      onSubmit={(values) => simulateHandler(values)}
      innerRef={optionsFormRef}
    >
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
              </div>
            ) : (
              <SpectrumSimulationPreferences />
            )}
          </div>
        </div>
        <FormikOnChange
          key={Boolean(isFlipped).toString()}
          onChange={(values) => simulateHandler(values, 'onChange')}
        />
      </>
    </Formik>
  );
}
