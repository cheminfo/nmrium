/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo, useCallback, memo } from 'react';
import {
  FaRegWindowMaximize,
  FaQuestionCircle,
  FaRegSave,
} from 'react-icons/fa';
import { Toolbar } from 'react-science/ui';

import { docsBaseUrl } from '../../constants';
import { useChartData } from '../context/ChartContext';
import {
  usePreferences,
  useWorkspacesList,
} from '../context/PreferencesContext';
import Button from '../elements/Button';
import { Header } from '../elements/Header';
import { LabelStyle } from '../elements/Label';
import DropDownButton, {
  DropDownListItem,
} from '../elements/dropDownButton/DropDownButton';
import { useSaveSettings } from '../hooks/useSaveSettings';
import AboutUsModal from '../modal/AboutUsModal';
import GeneralSettingsModal from '../modal/setting/GeneralSettings';
import WorkspaceItem from '../modal/setting/WorkspaceItem';
import { options } from '../toolbar/ToolTypes';

import ApodizationOptionsPanel from './ApodizationOptionsPanel';
import AutoPeakPickingOptionPanel from './AutoPeakPickingOptionPanel';
import BaseLineCorrectionPanel from './BaseLineCorrectionPanel';
import { HeaderContainer } from './HeaderContainer';
import { LogsHistory } from './LogsHistory';
import ManualPhaseCorrectionPanel from './ManualPhaseCorrectionPanel';
import RangesPickingOptionPanel from './RangesPickingOptionPanel';
import ZeroFillingOptionsPanel from './ZeroFillingOptionsPanel';
import Zones2DOptionPanel from './Zones2DOptionPanel';

export const headerLabelStyle: LabelStyle = {
  label: {
    fontWeight: 'normal',
    fontSize: '12px',
  },
  wrapper: {
    paddingRight: '5px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
};

const styles = css`
  container-type: inline-size;
  z-index: 1;

  @container (max-width:1200px) {
    .small-label {
      display: block;
    }

    .large-label {
      display: none !important;
    }
  }

  @container (min-width:1200px) {
    .small-label {
      display: none;
    }

    .large-label {
      display: block;
    }
  }
`;

interface HeaderInnerProps {
  onMaximize?: () => void;
  isFullscreen: boolean;
  selectedOptionPanel: string | null;
  height: number;
}

function HeaderInner(props: HeaderInnerProps) {
  const {
    isFullscreen,
    onMaximize = () => null,
    selectedOptionPanel,
    height,
  } = props;

  const {
    current: {
      display: { general },
    },
    workspace,
    dispatch,
  } = usePreferences();

  const workspacesList = useWorkspacesList();
  const hideGeneralSettings = !!(
    general?.hideGeneralSettings && workspace.base
  );

  const selectedPanel = useMemo(() => {
    switch (selectedOptionPanel) {
      case options.apodization.id:
        return <ApodizationOptionsPanel />;
      case options.zeroFilling.id:
        return <ZeroFillingOptionsPanel />;
      case options.phaseCorrection.id:
        return <ManualPhaseCorrectionPanel />;
      case options.peakPicking.id:
        return <AutoPeakPickingOptionPanel />;
      case options.rangePicking.id:
        return <RangesPickingOptionPanel />;
      case options.baselineCorrection.id:
        return <BaseLineCorrectionPanel />;
      case options.zonePicking.id:
        return <Zones2DOptionPanel />;
      default:
        break;
    }
  }, [selectedOptionPanel]);

  const changeWorkspaceHandler = useCallback(
    (option: DropDownListItem) => {
      dispatch({
        type: 'SET_ACTIVE_WORKSPACE',
        payload: {
          workspace: option.key,
        },
      });
    },
    [dispatch],
  );

  function renderItem(item) {
    return <WorkspaceItem item={item} />;
  }

  return (
    <div css={styles}>
      <Header style={{ leftStyle: { flex: 1 } }}>
        <HeaderContainer
          style={{
            alignItems: 'center',
          }}
        >
          <div>
            <Toolbar orientation="horizontal">
              <AboutUsModal />
            </Toolbar>
          </div>
          <div className="toolOptionsPanel" style={{ flex: 1 }}>
            {selectedPanel}
          </div>
        </HeaderContainer>
        <HeaderContainer
          style={{
            alignItems: 'center',
          }}
        >
          {!hideGeneralSettings && (
            <DropDownButton
              data={workspacesList}
              selectedKey={workspace.current}
              onSelect={changeWorkspaceHandler}
              renderItem={renderItem}
            />
          )}
          <SaveButton />
          <LogsHistory />

          <div>
            <Toolbar orientation="horizontal">
              <Toolbar.Item
                id="user-manual"
                title="User manual"
                onClick={() => window.open(docsBaseUrl, '_blank')}
              >
                <FaQuestionCircle />
              </Toolbar.Item>
              {!hideGeneralSettings && (
                <GeneralSettingsModal height={height / 2} />
              )}

              {!isFullscreen && (
                <Toolbar.Item
                  id="full-screen"
                  onClick={onMaximize}
                  title="Full Screen"
                  className="windowButton"
                >
                  <FaRegWindowMaximize />
                </Toolbar.Item>
              )}
            </Toolbar>
          </div>
        </HeaderContainer>
      </Header>
    </div>
  );
}

function SaveButton() {
  const { workspace, workspaces, originalWorkspaces } = usePreferences();
  const { saveSettings, SaveSettingsModal } = useSaveSettings();
  const isWorkspaceHasSettingNotSaved =
    JSON.stringify(workspaces[workspace.current]) !==
    JSON.stringify(originalWorkspaces[workspace.current]);

  function handleSave() {
    saveSettings();
  }

  return (
    <>
      <Button.Done
        wrapperClassName="small-width-none"
        onClick={handleSave}
        fill="clear"
        style={{ fontSize: '1.4em', marginLeft: '5px' }}
        {...(!isWorkspaceHasSettingNotSaved && {
          color: { base: 'gray', hover: 'gray' },
          backgroundColor: { base: 'gray', hover: 'lightgray' },
          disabled: true,
        })}
        toolTip="Save workspace locally in the browser"
      >
        <FaRegSave />
      </Button.Done>
      <SaveSettingsModal />
    </>
  );
}

const MemoizedHeader = memo(HeaderInner);

export default function HeaderWrapper({ isFullscreen, onMaximize }) {
  const {
    toolOptions: { selectedOptionPanel },
    height,
  } = useChartData();
  return (
    <MemoizedHeader
      {...{
        selectedOptionPanel,
        isFullscreen,
        onMaximize,
        height,
      }}
    />
  );
}
