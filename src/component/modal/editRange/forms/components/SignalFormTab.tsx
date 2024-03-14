/** @jsxImportSource @emotion/react */
import { Tab, Tabs } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { useFormikContext, FieldArray } from 'formik';
import { CSSProperties, memo } from 'react';

import CouplingsTable from './CouplingsTable';
import PeaksTable from './PeaksTable';

const style: CSSProperties = {
  borderSpacing: '0',
  width: '100%',
  fontSize: '12px',
  height: '100%',
  margin: '0',
  padding: '0.4rem',
  textAlign: 'center',
};

interface SignalFormTabProps {
  index: number;
}

function SignalFormTab({ index }: SignalFormTabProps) {
  const { values } = useFormikContext<{ signalIndex: string }>();

  return (
    <div
      style={style}
      css={css`
        div[role='tabpanel'] {
          width: 100%;
        }
      `}
    >
      <Tabs vertical fill>
        <Tab
          id="couplings"
          title="Couplings"
          panel={
            <FieldArray
              name={`signals.${values.signalIndex}.js`}
              render={({ push, remove }) => (
                <CouplingsTable push={push} remove={remove} index={index} />
              )}
            />
          }
        />
        <Tab id="peaks" title="Peaks" panel={<PeaksTable index={index} />} />
      </Tabs>
    </div>
  );
}

export default memo(SignalFormTab);
