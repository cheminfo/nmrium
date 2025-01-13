import { Checkbox } from '@blueprintjs/core';
import type { NMRiumPanelPreferences } from 'nmr-load-save';
import { useCallback, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import type { CustomColumn } from '../../../elements/ReactTable/utility/addCustomColumn.js';
import { Select2 } from '../../../elements/Select2.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';
import Label from '../../../elements/Label.js';
import { GroupPane } from '../../../elements/GroupPane.js';

const basePath = 'display.panels';
interface ListItem {
  label: string;
  name: keyof NMRiumPanelPreferences;
  hideOpenOption?: boolean;
}

type PanelStatus = 'hidden' | 'available' | 'active';
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
    label: 'Processings panel',
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

      if (status === 'available') {
        visible = true;
      }

      if (status === 'active') {
        visible = true;
        display = true;
      }

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
        Cell: ({ row }) => (
          <Controller
            control={control}
            name={`${basePath}.${row.original.name}`}
            render={({ field }) => {
              const { value: state } = field;
              const { visible = false, display = false } = state || {};
              let value: PanelStatus = 'hidden';

              if (visible && display) {
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
      {
        index: 4,
        Header: 'Open on load',
        style: { textAlign: 'center' },
        Cell: ({ row }) => (
          <Checkbox
            style={{ margin: 0 }}
            {...register(`${basePath}.${row.original.name}.open`)}
          />
        ),
      },
    ],
    [control, onChange, register],
  );

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <Label
        title="Hide panels bar "
        style={{ wrapper: { padding: '10px 0' } }}
      >
        <Checkbox
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
