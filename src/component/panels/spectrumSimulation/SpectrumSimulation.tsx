/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useState, useRef } from 'react';

import { getSpinSystem } from '../../../data/data1d/spectrumSimulation';
import Label, { LabelStyle } from '../../elements/Label';
import Select from '../../elements/Select';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import SpectrumSimulationPreferences from './SpectrumSimulationPreferences';
import { SpinSystemTable } from './SpinSystemTable';

const SPIN_SYSTEMS = getSpinSystem().map((key) => ({ label: key, value: key }));

const selectStyles = { width: '100%', minWidth: '100px', fontSize: '10px' };

const labelStyle: LabelStyle = {
  label: { fontSize: '10px' },
  wrapper: { display: 'flex', alignItems: 'center', height: '100%' },
  container: { padding: '0 5px', height: '100%' },
};

export default function SpectrumSimulation() {
  const [isFlipped, setFlipStatus] = useState(false);
  const [spinSystem, setSpinSystem] = useState('AB');

  const settingRef = useRef<any>();

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  function spinSystemChangeHandler(system) {
    setSpinSystem(system);
  }

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
      <div className="inner-container">
        {!isFlipped ? (
          <SpinSystemTable spinSystem={spinSystem} />
        ) : (
          <SpectrumSimulationPreferences />
        )}
      </div>
    </div>
  );
}
