/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormContext, useWatch } from 'react-hook-form';

import DefaultPathLengths from '../../../data/constants/DefaultPathLengths';
import Label from '../../elements/Label';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';

const tabStylesAddition = css`
  color: red;
`;
const tabStyles = css`
  display: inline-grid;
  list-style: none;
  padding: 0.5rem 1.5rem;
`;

export function SignalsForm() {
  const {
    setValue,
    formState: { errors },
  } = useFormContext();
  const { signals = [], activeTab, experimentType } = useWatch();

  function handleTapChange({ tabid }) {
    setValue('activeTab', tabid);
  }

  function handleDeleteSignal({ tabid }) {
    const filteredSignals = signals.filter((_signal, i) => i !== Number(tabid));
    setValue('signals', filteredSignals);
  }

  return (
    <div>
      <Tabs
        activeTab={activeTab}
        onClick={handleTapChange}
        onDelete={handleDeleteSignal}
      >
        {signals.map((signal, index) => {
          return (
            <Tab
              // eslint-disable-next-line react/no-array-index-key
              key={`zone-signal-${index}`}
              tabid={`${index}`}
              tabstyles={
                errors?.signals?.[index] ? tabStylesAddition : tabStyles
              }
              render={() => <TabTitle signal={signal} />}
            >
              <SignalTab index={index} experimentType={experimentType} />
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
          />
        </Label>
        <Label title="Max:" style={{ container: { paddingLeft: '5px' } }}>
          <NumberInput2Controller
            name={`signals[${index}].j.pathLength.to`}
            control={control}
            defaultValue={to}
            min={from}
          />
        </Label>
      </div>
    </div>
  );
}

function TabTitle({ signal }) {
  return (
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
  );
}
