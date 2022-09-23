import { useMemo } from 'react';

import { CheckBoxCell } from '../../elements/CheckBoxCell';
import ReactTable from '../../elements/ReactTable/ReactTable';
import { CustomColumn } from '../../elements/ReactTable/utility/addCustomColumn';

interface ListItem {
  label: string;
  name: string;
}
const LIST: ListItem[] = [
  {
    label: 'Zoom in',
    name: 'toolBarButtons.zoom',
  },
  {
    label: 'Zoom out',
    name: 'toolBarButtons.zoomOut',
  },
  {
    label: 'Import',
    name: 'toolBarButtons.import',
  },
  {
    label: 'Export As',
    name: 'toolBarButtons.exportAs',
  },
  {
    label: 'Stack Alignments',
    name: 'toolBarButtons.spectraStackAlignments',
  },
  {
    label: 'Center Alignments',
    name: 'toolBarButtons.spectraCenterAlignments',
  },
  {
    label: 'Real/Imaginary ',
    name: 'toolBarButtons.realImaginary',
  },
  {
    label: 'Peak picking',
    name: 'toolBarButtons.peakPicking',
  },
  {
    label: 'Integral',
    name: 'toolBarButtons.integral',
  },
  {
    label: 'Zone Picking',
    name: 'toolBarButtons.zonePicking',
  },
  {
    label: 'Range picking',
    name: 'toolBarButtons.rangePicking',
  },
  {
    label: 'Slicing',
    name: 'toolBarButtons.slicing',
  },
  {
    label: 'Apodization',
    name: 'toolBarButtons.apodization',
  },
  {
    label: 'Zero filling',
    name: 'toolBarButtons.zeroFilling',
  },
  {
    label: 'Fourier transform',
    name: 'toolBarButtons.fastFourierTransform',
  },
  {
    label: 'Phase correction',
    name: 'toolBarButtons.phaseCorrection',
  },
  {
    label: 'Baseline correction',
    name: 'toolBarButtons.baselineCorrection',
  },
  {
    label: 'Exclusion zones',
    name: 'toolBarButtons.exclusionZones',
  },
  {
    label: 'Multiple spectra analysis',
    name: 'toolBarButtons.multipleSpectraAnalysis',
  },
];

function ToolsTabContent() {
  const COLUMNS: CustomColumn[] = useMemo(
    () => [
      {
        index: 1,
        Header: '#',
        Cell: ({ row }) => row.index + 1,
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
        Cell: ({ row }) => (
          <CheckBoxCell
            name={`display.${row.original.name}`}
            defaultValue={false}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <ReactTable columns={COLUMNS} data={LIST} />
    </div>
  );
}

export default ToolsTabContent;
