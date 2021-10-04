/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrSum } from 'cheminfo-font';
import { useCallback, useState, useRef, memo } from 'react';
import ReactCardFlip from 'react-card-flip';

// import { useChartData } from '../../context/ChartContext';
import ToolTip from '../../elements/ToolTip/ToolTip';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import DatabasePreferences from './DatabasePreferences';

const styles = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .sum-button {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export interface DatabaseInnerProps {
  database: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DatabasePanelInner({ database }: DatabaseInnerProps) {
  //   const dispatch = useDispatch();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
    if (!isFlipped) {
      settingRef.current.cancelSetting();
    }
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  return (
    <div css={styles}>
      {!isFlipped && (
        <DefaultPanelHeader
          showSettingButton
          onSettingClick={settingsPanelHandler}
          canDelete={false}
        >
          <ToolTip title="test" popupPlacement="right">
            <button className="test-button" type="button" onClick={() => null}>
              <SvgNmrSum />
            </button>
          </ToolTip>
        </DefaultPanelHeader>
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <ReactCardFlip
          isFlipped={isFlipped}
          infinite
          containerStyle={{ overflow: 'hidden', height: '100%' }}
        >
          <div style={{ overflow: 'auto', height: '100%', display: 'block' }}>
            <p>Database Panel</p>
          </div>
          <DatabasePreferences ref={settingRef} />
        </ReactCardFlip>
      </div>
    </div>
  );
}

const MemoizedDatabasePanel = memo(DatabasePanelInner);

export default function DatabasePanel() {
  //   const { database = {} } = useChartData();

  return (
    <MemoizedDatabasePanel
      {...{
        database: {},
      }}
    />
  );
}
