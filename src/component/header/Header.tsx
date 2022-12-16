import { SvgLogoNmrium } from 'cheminfo-font';
import { useMemo, useCallback, memo } from 'react';
import {
  FaRegWindowMaximize,
  FaWrench,
  FaQuestionCircle,
  FaRegSave,
} from 'react-icons/fa';
import { Header, Toolbar } from 'react-science/ui';

import { docsBaseUrl } from '../../constants';
import { useChartData } from '../context/ChartContext';
import {
  usePreferences,
  useWorkspacesList,
} from '../context/PreferencesContext';
import Button from '../elements/Button';
import { LabelStyle } from '../elements/Label';
import DropDownButton, {
  DropDownListItem,
} from '../elements/dropDownButton/DropDownButton';
import { useModal, positions } from '../elements/popup/Modal';
import { useSaveSettings } from '../hooks/useSaveSettings';
import AboutUsModal from '../modal/AboutUsModal';
import GeneralSettings from '../modal/setting/GeneralSettings';
import WorkspaceItem from '../modal/setting/WorkspaceItem';
import { options } from '../toolbar/ToolTypes';

import ApodizationOptionsPanel from './ApodizationOptionsPanel';
import AutoPeakPickingOptionPanel from './AutoPeakPickingOptionPanel';
import BaseLineCorrectionPanel from './BaseLineCorrectionPanel';
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

  const modal = useModal();
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

  const openGeneralSettingsHandler = useCallback(() => {
    modal.show(<GeneralSettings />, {
      position: positions.MIDDLE,
      enableResizing: true,
      width: 600,
      height: height / 2,
    });
  }, [height, modal]);

  const openAboutUs = useCallback(() => {
    modal.show(<AboutUsModal />, {
      isBackgroundBlur: false,
      position: positions.MIDDLE,
      width: 500,
      height: 480,
    });
  }, [modal]);

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
    <Header>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <div>
          <Toolbar orientation="horizontal">
            <Toolbar.Item
              onClick={openAboutUs}
              titleOrientation="horizontal"
              id="logo"
              title="About NMRium"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SvgLogoNmrium />
              </div>
            </Toolbar.Item>
          </Toolbar>
        </div>
        <div className="toolOptionsPanel">{selectedPanel}</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
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
              <Toolbar.Item
                id="general-settings"
                onClick={openGeneralSettingsHandler}
                title="General settings"
              >
                <FaWrench />
              </Toolbar.Item>
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
      </div>
    </Header>
  );
}

function SaveButton() {
  const { workspace, workspaces, originalWorkspaces } = usePreferences();
  const saveWorkspace = useSaveSettings();
  const isWorkspaceHasSettingNotSaved =
    JSON.stringify(workspaces[workspace.current]) !==
    JSON.stringify(originalWorkspaces[workspace.current]);

  function handleSave() {
    saveWorkspace();
  }

  return (
    <Button.Done
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
