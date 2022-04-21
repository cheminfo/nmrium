/** @jsxImportSource @emotion/react */
import { SvgNmrAssignment2 } from 'cheminfo-font';

import Button from '../../elements/ButtonToolTip';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import { SpectraAutomaticPickingButton } from '../header/SpectraAutomaticPickingButton';

import AutomaticAssignmentTable from './AutomaticAssignmentTable';
import { useGetAssignments } from './useGetAssignments';

function AutomaticAssignment() {
  const { getAssignments, assignments } = useGetAssignments();
  return (
    <div css={tablePanelStyle}>
      {
        <DefaultPanelHeader showSettingButton={false} canDelete={false}>
          <SpectraAutomaticPickingButton />
          <Button popupTitle="automatic assignment" onClick={getAssignments}>
            <SvgNmrAssignment2 style={{ fontSize: '18px' }} />
          </Button>
        </DefaultPanelHeader>
      }

      <div className="inner-container">
        <AutomaticAssignmentTable data={assignments} />
      </div>
    </div>
  );
}

export default AutomaticAssignment;
