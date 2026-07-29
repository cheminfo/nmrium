import { Tab, Tabs } from '@blueprintjs/core';
import { memo } from 'react';

import { DeltaInput } from './DeltaInput.tsx';
import { SignalJCouplingsTable } from './signal-tabs/SignalJCouplingsTable.js';
import { SignalPeaksTable } from './signal-tabs/SignalPeaksTable.js';

interface SignalTabProps {
  index: number;
}

function SignalTab({ index }: SignalTabProps) {
  return (
    <div>
      <DeltaInput index={index} />
      <Tabs renderActiveTabPanelOnly animate={false}>
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
