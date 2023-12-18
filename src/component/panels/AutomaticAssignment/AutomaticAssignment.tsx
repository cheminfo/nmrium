/** @jsxImportSource @emotion/react */
import { SvgNmrAssignment2 } from 'cheminfo-font';
import { FaBolt } from 'react-icons/fa';
import { Toolbar } from 'react-science/ui';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/isSpectrum1D';
import { useChartData } from '../../context/ChartContext';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import { SpectraAutomaticPickingButton } from '../header/SpectraAutomaticPickingButton';

import AutomaticAssignmentTable from './AutomaticAssignmentTable';
import { useAutoAssignments } from './useAutoAssignments';

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
    <div css={tablePanelStyle}>
      <DefaultPanelHeader showSettingButton={false} canDelete={false}>
        <Toolbar>
          <SpectraAutomaticPickingButton />
        </Toolbar>
        <Toolbar disabled={!enabled}>
          <Toolbar.Item
            icon={<SvgNmrAssignment2 />}
            title="Automatic assignment"
            onClick={getAssignments}
          />
        </Toolbar>
        <Toolbar>
          <Toolbar.Item
            icon={<FaBolt />}
            title="Reset assignment"
            onClick={restAssignments}
          />
        </Toolbar>
      </DefaultPanelHeader>

      <div className="inner-container">
        <AutomaticAssignmentTable data={assignments} />
      </div>
    </div>
  );
}

export default AutomaticAssignment;
