import { Switch } from '@blueprintjs/core';
import type { NMRiumPanelPreferences } from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { CellProps } from 'react-table';

import { GroupPane } from '../../../elements/GroupPane.js';
import Label from '../../../elements/Label.js';
import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import type { CustomColumn } from '../../../elements/ReactTable/utility/addCustomColumn.js';
import { Select2 } from '../../../elements/Select2.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';
import { settingLabelStyle } from '../general_settings.tsx';

const basePath = 'display.panels';
interface ListItem {
  label: string;
  name: keyof NMRiumPanelPreferences;
  hideOpenOption?: boolean;
}

type PanelStatus = 'hidden' | 'available' | 'active' | 'open';
interface PanelStatusItem {
  label: string;
  value: PanelStatus;
}

const PANEL_STATUS: PanelStatusItem[] = [
  {
    label: 'Hidden',
    value: 'hidden',
  },
  {
    label: 'Available',
    value: 'available',
  },
  {
    label: 'Open',
    value: 'open',
  },
  {
    label: 'Active',
    value: 'active',
  },
];
const LIST: ListItem[] = [
  {
    label: 'Spectra selection panel',
    name: 'spectraPanel',
  },
  {
    label: 'Spectra information panel',
    name: 'informationPanel',
  },
  {
    label: 'Peaks and peak picking',
    name: 'peaksPanel',
  },
  {
    label: 'Integration and integrals',
    name: 'integralsPanel',
  },
  {
    label: '1D ranges peak picking',
    name: 'rangesPanel',
  },
  {
    label: 'Chemical structures panel',
    name: 'structuresPanel',
  },
  {
    label: 'Processing panel',
    name: 'processingsPanel',
  },
  {
    label: '2D zones peak picking',
    name: 'zonesPanel',
  },
  {
    label: 'Assignment summary panel',
    name: 'summaryPanel',
  },
  {
    label: 'Multiple spectra analysis panel',
    name: 'multipleSpectraAnalysisPanel',
  },
  {
    label: 'Databases panel',
    name: 'databasePanel',
  },
  {
    label: 'Prediction panel',
    name: 'predictionPanel',
  },
  {
    label: 'Automatic assignment panel',
    name: 'automaticAssignmentPanel',
  },
  {
    label: 'Matrix generation Panel',
    name: 'matrixGenerationPanel',
  },
  {
    label: 'Simulation panel',
    name: 'simulationPanel',
  },
];

function DisplayTabContent() {
  const { register, control, setValue } = useFormContext<WorkspaceWithSource>();

  const onChange = useCallback(
    (panelName: keyof NMRiumPanelPreferences, status: PanelStatus) => {
      let visible = false;
      let display = false;
      let open = false;

      if (status === 'available') {
        visible = true;
      }

      if (status === 'active') {
        visible = true;
        display = true;
      }
      if (status === 'open') {
        visible = true;
        display = true;
        open = true;
      }

      setValue(`${basePath}.${panelName}.open`, open);
      setValue(`${basePath}.${panelName}.display`, display);
      setValue(`${basePath}.${panelName}.visible`, visible);
    },
    [setValue],
  );

  const COLUMNS: Array<CustomColumn<ListItem>> = useMemo(
    () => [
      {
        index: 1,
        Header: '#',
        accessor: (_, index) => index + 1,
      },
      {
        index: 2,
        Header: 'Feature',
        accessor: 'label',
        style: { width: '60%' },
      },
      {
        index: 3,
        Header: 'Status',
        style: { textAlign: 'center' },
        Cell: ({ row }: CellProps<ListItem>) => (
          <Controller
            control={control}
            name={`${basePath}.${row.original.name}`}
            render={({ field }) => {
              const { value: state } = field;
              const {
                visible = false,
                display = false,
                open = false,
              } = state || {};
              let value: PanelStatus = 'hidden';
              const isActive = visible && display;

              if (isActive && open) {
                value = 'open';
              } else if (isActive) {
                value = 'active';
              } else if (visible) {
                value = 'available';
              }

              return (
                <Select2<PanelStatusItem>
                  fill
                  items={PANEL_STATUS}
                  itemTextKey="label"
                  itemValueKey="value"
                  selectedItemValue={value}
                  onItemSelect={(item) =>
                    onChange(row.original.name, item.value)
                  }
                />
              );
            }}
          />
        ),
      },
    ],
    [control, onChange],
  );

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <Label title="Hide panels bar " style={settingLabelStyle}>
        <Switch
          style={{ margin: 0 }}
          {...register('display.general.hidePanelsBar')}
        />
      </Label>

      <GroupPane text="Panels settings">
        <ReactTable<ListItem>
          columns={COLUMNS}
          data={LIST}
          rowStyle={{
            hover: { backgroundColor: '#f7f7f7' },
            active: { backgroundColor: '#f5f5f5' },
          }}
        />
      </GroupPane>
    </div>
  );
}

export default DisplayTabContent;
