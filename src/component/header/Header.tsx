import { memo, useMemo } from 'react';
import {
  FaFilm,
  FaQuestionCircle,
  FaRegSave,
  FaRegWindowMaximize,
} from 'react-icons/fa';
import { Toolbar, useFullscreen } from 'react-science/ui';

import { docsBaseUrl } from '../../constants.js';
import { useChartData } from '../context/ChartContext.js';
import {
  usePreferences,
  useWorkspacesList,
} from '../context/PreferencesContext.js';
import Button from '../elements/Button.js';
import { ContainerQueryWrapper } from '../elements/ContainerQueryWrapper.js';
import { HeaderContainer } from '../elements/HeaderContainer.js';
import type { LabelStyle } from '../elements/Label.js';
import type { DropDownListItem } from '../elements/dropDownButton/DropDownButton.js';
import DropDownButton from '../elements/dropDownButton/DropDownButton.js';
import { useSaveSettings } from '../hooks/useSaveSettings.js';
import { useWorkspaceAction } from '../hooks/useWorkspaceAction.js';
import { LogsHistoryModal } from '../modal/LogsHistoryModal.js';
import AboutUsModal from '../modal/aboutUs/AboutUsModal.js';
import GeneralSettingsModal from '../modal/setting/GeneralSettings.js';
import WorkspaceItem from '../modal/setting/WorkspaceItem.js';
import { options } from '../toolbar/ToolTypes.js';

import { AutoPeakPickingOptionPanel } from './AutoPeakPickingOptionPanel.js';
import { HeaderWrapper } from './HeaderWrapper.js';
import RangesPickingOptionPanel from './RangesPickingOptionPanel.js';
import { SimpleApodizationDimensionOneOptionsPanel } from './SimpleApodizationDimensionOneOptionsPanel.js';
import { SimpleApodizationDimensionTwoOptionsPanel } from './SimpleApodizationDimensionTwoOptionsPanel.js';
import { SimpleApodizationOptionsPanel } from './SimpleApodizationOptionsPanel.js';
import { SimpleBaseLineCorrectionOptionsPanel } from './SimpleBaseLineCorrectionOptionsPanel.js';
import { SimplePhaseCorrectionOptionsPanel } from './SimplePhaseCorrectionOptionsPanel.js';
import { SimplePhaseCorrectionTwoDimensionsPanel } from './SimplePhaseCorrectionTwoDimensionsPanel.js';
import { SimpleZeroFillingDimensionOneOptionsPanel } from './SimpleZeroFillingDimensionOneOptionsPanel.js';
import { SimpleZeroFillingDimensionTwoOptionsPanel } from './SimpleZeroFillingDimensionTwoOptionsPanel.js';
import { SimpleZeroFillingOptionsPanel } from './SimpleZeroFillingOptionsPanel.js';
import Zones2DOptionPanel from './Zones2DOptionPanel.js';

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
        return <SimpleApodizationOptionsPanel />;
      case options.apodizationDimension1.id:
        return <SimpleApodizationDimensionOneOptionsPanel />;
      case options.apodizationDimension2.id:
        return <SimpleApodizationDimensionTwoOptionsPanel />;
      case options.zeroFilling.id:
        return <SimpleZeroFillingOptionsPanel />;
      case options.zeroFillingDimension1.id:
        return <SimpleZeroFillingDimensionOneOptionsPanel />;
      case options.zeroFillingDimension2.id:
        return <SimpleZeroFillingDimensionTwoOptionsPanel />;
      case options.phaseCorrection.id:
        return <SimplePhaseCorrectionOptionsPanel />;
      case options.phaseCorrectionTwoDimensions.id:
        return <SimplePhaseCorrectionTwoDimensionsPanel />;
      case options.baselineCorrection.id:
        return <SimpleBaseLineCorrectionOptionsPanel />;
      case options.peakPicking.id:
        return <AutoPeakPickingOptionPanel />;
      case options.rangePicking.id:
        return <RangesPickingOptionPanel />;
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
    <ContainerQueryWrapper
      widthThreshold={1200}
      narrowClassName="small-label"
      wideClassName="large-label"
    >
      <HeaderContainer
        style={{ leftStyle: { flex: 1 }, containerStyle: { padding: '2px' } }}
      >
        <HeaderWrapper
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
        </HeaderWrapper>
        <HeaderWrapper
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
                  icon={<FaRegWindowMaximize />}
                />
              )}
            </Toolbar>
          </div>
        </HeaderWrapper>
      </HeaderContainer>
    </ContainerQueryWrapper>
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

export function Header() {
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
