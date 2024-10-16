/** @jsxImportSource @emotion/react */
import { Tab, Tabs } from '@blueprintjs/core';
import { css } from '@emotion/react';
import type { CSSProperties } from 'react';
import { memo } from 'react';

import { SignalJCouplingsTable } from './signal-tabs/SignalJCouplingsTable.js';
import { SignalPeaksTable } from './signal-tabs/SignalPeaksTable.js';

const style: CSSProperties = {
  borderSpacing: '0',
  width: '100%',
  fontSize: '12px',
  height: '100%',
  margin: '0',
  padding: '0.4rem',
  textAlign: 'center',
};

interface SignalTabProps {
  index: number;
}

function SignalTab({ index }: SignalTabProps) {
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
          panel={<SignalJCouplingsTable index={index} />}
        />
        <Tab
          id="peaks"
          title="Peaks"
          panel={<SignalPeaksTable index={index} />}
        />
      </Tabs>
    </div>
  );
}

export default memo(SignalTab);
