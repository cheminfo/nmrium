/** @jsxImportSource @emotion/react */
import { Tab, Tabs } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { CSSProperties, memo } from 'react';

import JCouplingsTable from './JCouplingsTable';
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
  return (
    <div
      style={style}
      css={css`
        div[role='tabpanel'] {
          width: 100%;
        }
      `}
    >
      <Tabs vertical fill renderActiveTabPanelOnly>
        <Tab
          id="couplings"
          title="Couplings"
          panel={<JCouplingsTable index={index} />}
        />
        <Tab id="peaks" title="Peaks" panel={<PeaksTable index={index} />} />
      </Tabs>
    </div>
  );
}

export default memo(SignalFormTab);
