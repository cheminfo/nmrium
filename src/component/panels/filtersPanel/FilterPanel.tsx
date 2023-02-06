/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { tablePanelStyle } from '../extra/BasicPanelStyle';

import FiltersTable from './FiltersTable';

export default function FiltersPanel() {
  return (
    <div css={tablePanelStyle}>
      <div className="inner-container">
        <FiltersTable />
      </div>
    </div>
  );
}
