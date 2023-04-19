/** @jsxImportSource @emotion/react */
import { SvgNmrAssignment2 } from 'cheminfo-font';
import { FaBolt } from 'react-icons/fa';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/isSpectrum1D';
import { useChartData } from '../../context/ChartContext';
import Button from '../../elements/Button';
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
        <SpectraAutomaticPickingButton />
        <Button.BarButton
          tooltipOrientation="horizontal"
          toolTip="Automatic assignment"
          onClick={getAssignments}
          disabled={!enabled}
        >
          <SvgNmrAssignment2 />
        </Button.BarButton>
        <Button.BarButton
          tooltipOrientation="horizontal"
          toolTip="Reset assignment"
          onClick={restAssignments}
        >
          <FaBolt />
        </Button.BarButton>
      </DefaultPanelHeader>

      <div className="inner-container">
        <AutomaticAssignmentTable data={assignments} />
      </div>
    </div>
  );
}

export default AutomaticAssignment;
