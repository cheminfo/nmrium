import { Tab, Tabs as BPTabs } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { withForm } from 'react-science/ui';

import { StyledDialogBody } from '../../../elements/StyledDialogBody.tsx';

import { ExportTab } from './tabs/export_tab.tsx';
import { GeneralTab } from './tabs/general_tab.tsx';
import { NucleiTab } from './tabs/nuclei_tab.tsx';
import { defaultGeneralSettingsFormValues } from './validation.ts';

const Tabs = styled(BPTabs)`
  height: 100%;

  div[role='tablist'] {
    gap: 0;
  }

  div[role='tabpanel'] {
    max-height: 100%;
    overflow: auto;
    padding: 0 0.8rem 0.8rem;
    width: 100%;
  }
`;

const Div = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? `${height}px` : 'auto')};
`;

export const GeneralSettingsDialogBody = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  props: {
    height: undefined as number | undefined,
  },
  render: ({ height, form }) => {
    return (
      <StyledDialogBody>
        <Div height={height}>
          <Tabs vertical>
            <Tab
              title="General"
              id="general"
              panel={<GeneralTab form={form} />}
            />

            <Tab title="Nuclei" id="nuclei" panel={<NucleiTab form={form} />} />

            <Tab id="export" title="Export" panel={<ExportTab form={form} />} />
          </Tabs>
        </Div>
      </StyledDialogBody>
    );
  },
});
