import { SvgNmrAssignment2 } from 'cheminfo-font';
import { FaBolt } from 'react-icons/fa';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import { useChartData } from '../../context/ChartContext.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';
import { SpectraAutomaticPickingButton } from '../header/SpectraAutomaticPickingButton.js';

import AutomaticAssignmentTable from './AutomaticAssignmentTable.js';
import { useAutoAssignments } from './useAutoAssignments.js';

function useCheckEnableAutomaticAssignments() {
  const { data } = useChartData();
  return data.some((spectrum) => {
    if (isSpectrum1D(spectrum)) {
      return spectrum?.ranges?.values.length > 0;
    }
    return spectrum?.zones?.values.length > 0;
  });
}

function AutomaticAssignment() {
  const { getAssignments, assignments, restAssignments } = useAutoAssignments();
  const enabled = useCheckEnableAutomaticAssignments();

  return (
    <TablePanel>
      <DefaultPanelHeader
        leftButtons={[
          {
            component: <SpectraAutomaticPickingButton />,
          },
          {
            icon: <SvgNmrAssignment2 />,
            tooltip: 'Automatic assignment',
            onClick: getAssignments,
            disabled: !enabled,
          },
          {
            icon: <FaBolt />,
            tooltip: 'Reset assignment',
            onClick: restAssignments,
          },
        ]}
      />

      <div className="inner-container">
        <AutomaticAssignmentTable data={assignments} />
      </div>
    </TablePanel>
  );
}

export default AutomaticAssignment;
