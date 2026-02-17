import { Classes, Tab, Tabs as BPTabs } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { withForm } from 'react-science/ui';

import { StyledDialogBody } from '../../../elements/StyledDialogBody.js';

import { DatabaseTab } from './tabs/database_tab.js';
import { ExportTab } from './tabs/export_tab.js';
import { GeneralTab } from './tabs/general_tab.js';
import { ImportFiltersTab } from './tabs/import_filters_tab.js';
import { NucleiTab } from './tabs/nuclei_tab.js';
import { PanelsTab } from './tabs/panels_tab.js';
import { TitleBlockTab } from './tabs/title_block_tab.js';
import { defaultGeneralSettingsFormValues } from './validation.js';

const Tabs = styled(BPTabs)`
  height: 100%;

  div[role='tablist'] {
    gap: 0;
  }

  &.${Classes.TABS}.${Classes.VERTICAL} > .${Classes.TAB_PANEL} {
    /* Remove top margin of first form.Section */
    margin-top: -15px;

    /* Configure positioning and sizing */
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

            <Tab id="panels" title="Panels" panel={<PanelsTab form={form} />} />

            <Tab
              id="import-filters"
              title="Import filters"
              panel={<ImportFiltersTab form={form} />}
            />

            <Tab
              id="title-block"
              title="Title block"
              panel={<TitleBlockTab form={form} />}
            />

            <Tab id="export" title="Export" panel={<ExportTab form={form} />} />

            <Tab
              title="Databases"
              id="databases"
              panel={<DatabaseTab form={form} />}
            />
          </Tabs>
        </Div>
      </StyledDialogBody>
    );
  },
});
