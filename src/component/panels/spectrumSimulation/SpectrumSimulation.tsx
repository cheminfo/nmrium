/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';

import type { SpectrumSimulationOptions } from '../../../data/data1d/spectrumSimulation.js';
import { defaultSimulationOptions } from '../../../data/data1d/spectrumSimulation.js';
import { useDispatch } from '../../context/DispatchContext.js';
import Button from '../../elements/Button.js';
import AboutSpectrumSimulationModal from '../../modal/AboutSpectrumSimulationModal.js';
import { tablePanelStyle } from '../extra/BasicPanelStyle.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';
import PreferencesHeader from '../header/PreferencesHeader.js';

import SpectrumSimulationPreferences from './SpectrumSimulationPreferences.js';
import SpectrumSimulationSimpleOptions from './SpectrumSimulationSimpleOptions.js';
import { SpinSystemTable } from './SpinSystemTable.js';

const validationSchema = Yup.object({
  data: Yup.array().of(
    Yup.array().of(
      Yup.lazy((value) => {
        if (value === null) {
          return Yup.mixed().nullable();
        }

        return Yup.string()
          .matches(/^-?\d+(\.\d+)?$/, 'Invalid number format')
          .required();
      }),
    ),
  ),
});

function getSpinSystemData(spinSystem: string) {
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
}

export default function SpectrumSimulation() {
  const dispatch = useDispatch();
  const [isFlipped, setFlipStatus] = useState(false);
  const [spinSystem, setSpinSystem] = useState('AB');
  const spinSystemRef = useRef('AB');

  const settingRef = useRef<SettingsRef | null>(null);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(async () => {
    const isSettingValid = await settingRef.current?.saveSetting();
    if (isSettingValid) {
      setFlipStatus(false);
    }
  }, []);

  function spinSystemChangeHandler(system) {
    spinSystemRef.current = system;
    reset({ ...defaultSimulationOptions, data: getSpinSystemData(system) });
    setSpinSystem(system);
  }

  const methods = useForm({
    defaultValues: {
      ...defaultSimulationOptions,
      data: getSpinSystemData(spinSystem),
    },
    mode: 'onChange',
  });
  const { reset, watch, handleSubmit } = methods;

  const simulateHandler = useCallback(
    async (values: SpectrumSimulationOptions, keepSpectrum = false) => {
      dispatch({
        type: 'SIMULATE_SPECTRUM',
        payload: { ...values, spinSystem: spinSystemRef.current, keepSpectrum },
      });
    },
    [dispatch],
  );

  function addSpectrumHandler() {
    void handleSubmit((values) => simulateHandler(values, true))();
  }

  function saveSettingsHandler(values) {
    void simulateHandler(values);
    reset(values);
  }

  useEffect(() => {
    const { unsubscribe } = watch(async (values) => {
      const isValid = await validationSchema.isValid(values);
      if (!isValid) return;

      void simulateHandler(values as any);
    });
    return () => unsubscribe();
  }, [simulateHandler, watch]);

  return (
    <FormProvider {...methods}>
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
            onSettingClick={settingsPanelHandler}
            leftButtons={[
              {
                component: <AboutSpectrumSimulationModal />,
              },
            ]}
          >
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
              onSave={saveSettingsHandler}
            />
          )}
        </div>
      </div>
    </FormProvider>
  );
}
