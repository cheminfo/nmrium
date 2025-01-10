import { Tab, Tabs } from '@blueprintjs/core';
import styled from '@emotion/styled';
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

const Container = styled.div`
  div[role='tabpanel'] {
    width: 100%;
  }
`;

function SignalTab({ index }: SignalTabProps) {
  return (
    <Container style={style}>
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
    </Container>
  );
}

export default memo(SignalTab);
