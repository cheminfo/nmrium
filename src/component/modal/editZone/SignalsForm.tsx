import { Tab, Tabs } from '@blueprintjs/core';
import { useFormContext, useWatch } from 'react-hook-form';

import DefaultPathLengths from '../../../data/constants/DefaultPathLengths.js';
import IsotopesViewer from '../../elements/IsotopesViewer.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { TabTitle } from '../../elements/TabTitle.js';

export function SignalsForm() {
  const {
    setValue,
    formState: { errors },
  } = useFormContext();
  const { signals = [], activeTab, experimentType } = useWatch();

  function handleTapChange(tabID) {
    setValue('activeTab', tabID);
  }

  function handleDeleteSignal(index) {
    const filteredSignals = signals.filter((_signal, i) => i !== index);
    setValue('signals', filteredSignals);
  }

  return (
    <div>
      <Tabs selectedTabId={activeTab} onChange={handleTapChange}>
        {signals.map((signal, index) => {
          return (
            <Tab
              // eslint-disable-next-line react/no-array-index-key
              key={`zone-signal-${index}`}
              id={`${index}`}
              style={{ ...(errors?.signals?.[index] && { color: 'red' }) }}
              panel={
                <SignalTab index={index} experimentType={experimentType} />
              }
            >
              <TabTitle onDelete={() => handleDeleteSignal(index)}>
                <Title signal={signal} />
              </TabTitle>
            </Tab>
          );
        })}
      </Tabs>
    </div>
  );
}

interface SignalTabProps {
  index: number;
  experimentType: string;
}

function SignalTab(props: SignalTabProps) {
  const { index, experimentType } = props;
  const { control } = useFormContext();
  const { from = 1, to = 1 } = DefaultPathLengths?.[experimentType] || {};
  return (
    <div>
      <p>Setting of the minimum and maximum path length (J coupling).</p>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Label title="Min:">
          <NumberInput2Controller
            name={`signals[${index}].j.pathLength.from`}
            control={control}
            defaultValue={from}
            min={1}
            max={to}
            step={1}
            majorStepSize={1}
            minorStepSize={1}
          />
        </Label>
        <Label title="Max:" style={{ container: { paddingLeft: '5px' } }}>
          <NumberInput2Controller
            name={`signals[${index}].j.pathLength.to`}
            control={control}
            defaultValue={to}
            min={from}
            step={1}
            majorStepSize={1}
            minorStepSize={1}
          />
        </Label>
      </div>
    </div>
  );
}

function Title({ signal }) {
  const { x, y } = signal;

  return (
    <>
      𝛅
      <IsotopesViewer value={x.nucleus} style={{ display: 'inline-block' }} />:
      {x.delta.toFixed(2)} , 𝛅
      <IsotopesViewer value={y.nucleus} style={{ display: 'inline-block' }} />:
      {y.delta.toFixed(2)}
    </>
  );
}
