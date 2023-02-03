/** @jsxImportSource @emotion/react */
import { SvgNmrAssignment2 } from 'cheminfo-font';
import { FaBolt } from 'react-icons/fa';

import Button from '../../elements/Button';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import { SpectraAutomaticPickingButton } from '../header/SpectraAutomaticPickingButton';

import AutomaticAssignmentTable from './AutomaticAssignmentTable';
import { useAutoAssignments } from './useAutoAssignments';

function AutomaticAssignment() {
  const { getAssignments, assignments, restAssignments } = useAutoAssignments();

  return (
    <div css={tablePanelStyle}>
      <DefaultPanelHeader showSettingButton={false} canDelete={false}>
        <SpectraAutomaticPickingButton />
        <Button.BarButton
          tooltipOrientation="horizontal"
          toolTip="automatic assignment"
          onClick={getAssignments}
        >
          <SvgNmrAssignment2 />
        </Button.BarButton>
        <Button.BarButton
          tooltipOrientation="horizontal"
          toolTip="reset assignment"
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
