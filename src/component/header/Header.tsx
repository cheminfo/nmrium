/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo, memo } from 'react';
import {
  FaRegWindowMaximize,
  FaQuestionCircle,
  FaRegSave,
  FaFilm,
} from 'react-icons/fa';
import { Toolbar, useFullscreen } from 'react-science/ui';

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
import { useWorkspaceAction } from '../hooks/useWorkspaceAction';
import { LogsHistoryModal } from '../modal/LogsHistoryModal';
import AboutUsModal from '../modal/aboutUs/AboutUsModal';
import GeneralSettingsModal from '../modal/setting/GeneralSettings';
import WorkspaceItem from '../modal/setting/WorkspaceItem';
import { options } from '../toolbar/ToolTypes';

import ApodizationOptionsPanel from './ApodizationOptionsPanel';
import AutoPeakPickingOptionPanel from './AutoPeakPickingOptionPanel';
import BaseLineCorrectionPanel from './BaseLineCorrectionPanel';
import { HeaderContainer } from './HeaderContainer';
import PhaseCorrectionPanel from './PhaseCorrectionPanel';
import PhaseCorrectionTwoDimensionsPanel from './PhaseCorrectionTwoDimensionsPanel';
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
  selectedOptionPanel: string | null;
  height: number;
}

function HeaderInner(props: HeaderInnerProps) {
  const { selectedOptionPanel, height } = props;

  const {
    current: {
      display: { general },
    },
    workspace,
  } = usePreferences();
  const { setActiveWorkspace } = useWorkspaceAction();
  const fullscreen = useFullscreen();

  const workspacesList = useWorkspacesList();

  const hideGeneralSettings = !!(
    general?.hideGeneralSettings && workspace.base
  );
  const hideWorkspaces = !!(general?.hideWorkspaces && workspace.base);

  const selectedPanel = useMemo(() => {
    switch (selectedOptionPanel) {
      case options.apodization.id:
        return <ApodizationOptionsPanel />;
      case options.zeroFilling.id:
        return <ZeroFillingOptionsPanel />;
      case options.phaseCorrection.id:
        return <PhaseCorrectionPanel />;
      case options.phaseCorrectionTwoDimensions.id:
        return <PhaseCorrectionTwoDimensionsPanel />;
      case options.peakPicking.id:
        return <AutoPeakPickingOptionPanel />;
      case options.rangePicking.id:
        return <RangesPickingOptionPanel />;
      case options.baselineCorrection.id:
        return <BaseLineCorrectionPanel />;
      case options.zonePicking.id:
        return <Zones2DOptionPanel />;
      default:
        return null;
    }
  }, [selectedOptionPanel]);

  function changeWorkspaceHandler(option: DropDownListItem) {
    setActiveWorkspace(option.key);
  }

  function renderItem(item) {
    return <WorkspaceItem item={item} />;
  }

  return (
    <div css={styles}>
      <Header
        style={{ leftStyle: { flex: 1 }, containerStyle: { padding: '2px' } }}
      >
        <HeaderContainer
          style={{
            alignItems: 'center',
          }}
        >
          <div>
            <Toolbar>
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
          {!hideWorkspaces && (
            <DropDownButton
              data={workspacesList}
              selectedKey={workspace.current}
              onSelect={changeWorkspaceHandler}
              renderItem={renderItem}
            />
          )}
          {!hideGeneralSettings && <SaveButton />}
          {!general?.hideLogs && <LogsHistoryModal />}

          <div>
            <Toolbar>
              {!general?.hideHelp && (
                <Toolbar.Item
                  id="user-manual"
                  tooltip="User manual"
                  onClick={() => window.open(docsBaseUrl, '_blank')}
                  icon={<FaQuestionCircle />}
                />
              )}
              <Toolbar.Item
                id="user-manual"
                tooltip="NMRium channel"
                onClick={() =>
                  window.open('https://www.youtube.com/@nmrium', '_blank')
                }
                icon={<FaFilm />}
              />

              {!hideGeneralSettings && (
                <GeneralSettingsModal height={height / 2} />
              )}

              {!fullscreen.isFullScreen && !general?.hideMaximize && (
                <Toolbar.Item
                  id="full-screen"
                  onClick={fullscreen.toggle}
                  tooltip="Full screen"
                  className="windowButton"
                  icon={<FaRegWindowMaximize />}
                />
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

export default function HeaderWrapper() {
  const {
    toolOptions: { selectedOptionPanel },
    height,
  } = useChartData();
  return (
    <MemoizedHeader
      {...{
        selectedOptionPanel,
        height,
      }}
    />
  );
}
