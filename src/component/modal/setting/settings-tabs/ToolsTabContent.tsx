import { Checkbox } from '@blueprintjs/core';
import type { NMRiumToolBarPreferences } from '@zakodium/nmrium-core';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import type { CellProps } from 'react-table';

import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import type { CustomColumn } from '../../../elements/ReactTable/utility/addCustomColumn.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';

interface ListItem {
  label: string;
  name: keyof NMRiumToolBarPreferences;
}

type ToolPathType = `display.toolBarButtons.${keyof NMRiumToolBarPreferences}`;

const LIST: ListItem[] = [
  {
    label: 'Zoom in',
    name: 'zoom',
  },
  {
    label: 'Zoom out',
    name: 'zoomOut',
  },
  {
    label: 'Import',
    name: 'import',
  },
  {
    label: 'Export As',
    name: 'exportAs',
  },
  {
    label: 'Stack Alignments',
    name: 'spectraStackAlignments',
  },
  {
    label: 'Center Alignments',
    name: 'spectraCenterAlignments',
  },
  {
    label: 'Real/Imaginary ',
    name: 'realImaginary',
  },
  {
    label: 'Peak picking',
    name: 'peakPicking',
  },
  {
    label: 'Integral',
    name: 'integral',
  },
  {
    label: 'Zone Picking',
    name: 'zonePicking',
  },
  {
    label: 'Range picking',
    name: 'rangePicking',
  },
  {
    label: 'Slicing',
    name: 'slicing',
  },
  {
    label: 'Apodization / Window functions',
    name: 'apodization',
  },
  {
    label: 'Apodization / Window functions dimension one',
    name: 'apodizationDimension1',
  },
  {
    label: 'Apodization / Window functions dimension two',
    name: 'apodizationDimension2',
  },
  {
    label: 'Zero filling',
    name: 'zeroFilling',
  },
  {
    label: 'Zero filling dimension one',
    name: 'zeroFillingDimension1',
  },
  {
    label: 'Zero filling dimension two',
    name: 'zeroFillingDimension2',
  },
  {
    label: 'Fourier transform',
    name: 'fft',
  },
  {
    label: 'Phase correction',
    name: 'phaseCorrection',
  },
  {
    label: 'Baseline correction',
    name: 'baselineCorrection',
  },
  {
    label: 'Exclusion zones',
    name: 'exclusionZones',
  },
  {
    label: 'Multiple spectra analysis',
    name: 'multipleSpectraAnalysis',
  },
  {
    label: 'Auto range and zone picking',
    name: 'autoRangeAndZonePicking',
  },
];

export default function ToolsTabContent() {
  const { register } = useFormContext<WorkspaceWithSource>();

  const COLUMNS = useMemo<Array<CustomColumn<ListItem>>>(
    () => [
      {
        index: 1,
        Header: '#',
        accessor: (_, index) => index + 1,
      },
      {
        index: 1,
        Header: 'Tool',
        accessor: 'label',
        style: { width: '60%' },
      },
      {
        index: 2,
        Header: 'Active',
        style: { textAlign: 'center' },
        Cell: ({ row }: CellProps<ListItem>) => {
          const name: ToolPathType = `display.toolBarButtons.${row.original.name}`;

          return (
            <Checkbox
              style={{ margin: 0 }}
              {...register(name)}
              defaultChecked={false}
            />
          );
        },
      },
    ],
    [register],
  );

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <ReactTable
        columns={COLUMNS}
        data={LIST}
        rowStyle={{
          hover: { backgroundColor: '#f7f7f7' },
          active: { backgroundColor: '#f5f5f5' },
        }}
      />
    </div>
  );
}
