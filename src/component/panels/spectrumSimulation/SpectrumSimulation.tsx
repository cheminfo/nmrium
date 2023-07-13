/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-empty-function */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Formik } from 'formik';
import { useCallback, useState, useRef, useMemo } from 'react';

import {
  defaultSimulationOptions,
  getSpinSystems,
  mapSpinSystem,
} from '../../../data/data1d/spectrumSimulation';
import Label, { LabelStyle } from '../../elements/Label';
import Select from '../../elements/Select';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import SpectrumSimulationOptions from './SpectrumSimulationOptions';
import SpectrumSimulationPreferences from './SpectrumSimulationPreferences';
import { SpinSystemTable } from './SpinSystemTable';

const SPIN_SYSTEMS = getSpinSystems().map((key) => ({
  label: key,
  value: key,
}));

const selectStyles = { width: '100%', minWidth: '100px', fontSize: '10px' };

const labelStyle: LabelStyle = {
  label: { fontSize: '10px' },
  wrapper: { display: 'flex', alignItems: 'center', height: '100%' },
  container: { padding: '0 5px', height: '100%' },
};

export default function SpectrumSimulation() {
  const [isFlipped, setFlipStatus] = useState(false);
  const [spinSystem, setSpinSystem] = useState('AB');
  const spinSystemRef = useRef('AB');

  const settingRef = useRef<any>();

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  function spinSystemChangeHandler(system) {
    spinSystemRef.current = system;
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

  return (
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
          <Label title="Spin system" style={labelStyle}>
            <Select
              items={SPIN_SYSTEMS}
              style={selectStyles}
              onChange={spinSystemChangeHandler}
            />
          </Label>
        </DefaultPanelHeader>
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}
      <Formik
        initialValues={{ ...defaultSimulationOptions, data }}
        enableReinitialize
        onSubmit={function submit() {}}
      >
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
              <SpectrumSimulationOptions />
            </div>
          ) : (
            <SpectrumSimulationPreferences />
          )}
          <FormikOnChange
            onChange={(d) =>
              console.log(mapSpinSystem(spinSystemRef.current, d.data))
            }
          />
        </div>
      </Formik>
    </div>
  );
}
