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
  onFocus: (element: any) => void;
  onBlur?: () => void;
}

function SignalFormTab({ onFocus, onBlur }: SignalFormTabProps) {
  const { values } = useFormikContext<{ activeTab: string }>();

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
              name={`signals.${values.activeTab}.js`}
              render={({ push, remove }) => (
                <CouplingsTable
                  push={push}
                  remove={remove}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              )}
            />
          }
        />
        <Tab id="peaks" title="Peaks" panel={<PeaksTable />} />
      </Tabs>
    </div>
  );
}

export default memo(SignalFormTab);
