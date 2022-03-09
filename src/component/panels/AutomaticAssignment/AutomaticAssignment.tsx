/** @jsxImportSource @emotion/react */
import { SvgNmrAssignment2 } from 'cheminfo-font';
import { useCallback } from 'react';

import Button from '../../elements/ButtonToolTip';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

function AutomaticAssignment() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const automaticAssignmentHandler = useCallback(() => {}, []);

  return (
    <div css={tablePanelStyle}>
      {
        <DefaultPanelHeader showSettingButton={false} canDelete={false}>
          <Button
            popupTitle="automatic assignment"
            onClick={automaticAssignmentHandler}
          >
            <SvgNmrAssignment2 style={{ fontSize: '18px' }} />
          </Button>
        </DefaultPanelHeader>
      }

      <div className="inner-container" />
    </div>
  );
}

export default AutomaticAssignment;
