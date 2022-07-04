import lodashGet from 'lodash/get';
import { useMemo } from 'react';

import { NMRiumPreferences } from '../../NMRium';
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
    name: 'toolBarButtons.zoomTool',
  },
  {
    label: 'Zoom out',
    name: 'toolBarButtons.zoomOutTool',
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
    name: 'toolBarButtons.peakTool',
  },
  {
    label: 'Integral',
    name: 'toolBarButtons.integralTool',
  },
  {
    label: 'Zoon Picking',
    name: 'toolBarButtons.zonePickingTool',
  },
  {
    label: 'Range picking',
    name: 'toolBarButtons.rangePickingTool',
  },
  {
    label: 'Slicing',
    name: 'toolBarButtons.slicingTool',
  },
  {
    label: 'Zero filling',
    name: 'toolBarButtons.zeroFillingTool',
  },
  {
    label: 'Fourier transform',
    name: 'toolBarButtons.FFTTool',
  },
  {
    label: 'Phase correction',
    name: 'toolBarButtons.phaseCorrectionTool',
  },
  {
    label: 'Exclusion zoon',
    name: 'toolBarButtons.exclusionZonesTool',
  },
  {
    label: 'Multiple spectra analysis',
    name: 'toolBarButtons.multipleSpectraAnalysisTool',
  },
];

interface ToolsTabContentProps {
  preferences: NMRiumPreferences;
}

function ToolsTabContent({ preferences }: ToolsTabContentProps) {
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
          <CheckBoxCell name={`display.${row.original.name}`} />
        ),
      },
    ],
    [],
  );

  const data = useMemo(() => {
    return LIST.filter(
      (item) => lodashGet(preferences, `${item.name}.hidden`) !== true,
    );
  }, [preferences]);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <ReactTable columns={COLUMNS} data={data} />
    </div>
  );
}

export default ToolsTabContent;
